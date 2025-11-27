<?php
/**
 * Plugin Name: LeadBlaze Chat
 * Plugin URI: https://leadblaze.ai
 * Description: Embeddable chatbot widget for WordPress sites
 * Version: 1.0.0
 * Author: LeadBlaze
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: leadblaze-chat
 * Domain Path: /languages
 */

if (!defined('ABSPATH')) {
    exit;
}

// Prefixed constants to avoid collisions
define('LEADCH_PLUGIN_VERSION', '1.0.0');
define('LEADCH_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('LEADCH_PLUGIN_URL', plugin_dir_url(__FILE__));

// Prefixed class name to avoid collisions
class Leadch_Chatbot_Widget {
    private static $instance = null;
    private $options;

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        // Check for upgrades and merge options properly
        $this->maybe_upgrade();
        
        // Properly merge saved options with defaults to ensure all keys exist
        $saved_options = get_option('leadch_settings', array());
        $this->options = array_merge($this->get_default_options(), $saved_options);
        $this->init_hooks();
    }

    private function init_hooks() {
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
        // Prefixed shortcode tag
        add_shortcode('leadch_widget', array($this, 'render_shortcode'));
        add_action('wp_footer', array($this, 'maybe_render_floating'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
    }

    private function maybe_upgrade() {
        // Migrate legacy unprefixed option names if present
        $legacy_opts = get_option('chatbot_widget_settings', null);
        $legacy_ver  = get_option('chatbot_widget_version', null);

        if (!is_null($legacy_opts) || !is_null($legacy_ver)) {
            $default_options = $this->get_default_options();
            $merged = array_merge($default_options, is_array($legacy_opts) ? $legacy_opts : array());
            update_option('leadch_settings', $merged);
            update_option('leadch_version', LEADCH_PLUGIN_VERSION);
            // Remove legacy options to avoid name collisions
            delete_option('chatbot_widget_settings');
            delete_option('chatbot_widget_version');
        }

        // Normal upgrade path using new prefixed names
        $current_version = get_option('leadch_version', '0.0.0');
        if (version_compare($current_version, LEADCH_PLUGIN_VERSION, '<')) {
            $saved_options = get_option('leadch_settings', array());
            $default_options = $this->get_default_options();
            $updated_options = array_merge($default_options, $saved_options);
            update_option('leadch_settings', $updated_options);
            update_option('leadch_version', LEADCH_PLUGIN_VERSION);
        }
    }

    public function get_default_options() {
        return array(
            'site_key' => '',
            'client_id' => '',
            'theme_color' => '#eb4034',
            'theme' => 'light',
            'greeting_message' => '',
            'position' => 'bottom-right',
            'enable_floating' => false,
            'floating_default_state' => 'expanded',
            // When true, show the X close next to the collapsed floating button
            // Allow site owners to disable closing the button entirely
            'allow_floating_button_close' => true,
            'enable_pages' => 'all',
            'specific_pages' => '',
            'container_selector' => ''
        );
    }

    public function enqueue_scripts() {
        if (!$this->should_load_widget()) {
            return;
        }

        // Choose correct bundle based on "enable_floating"
        $use_floating = !empty($this->options['enable_floating']);
        $script_filename = $use_floating ? 'chatbot-widget-floating.js' : 'chatbot-widget.js';
        $widget_js = file_exists(LEADCH_PLUGIN_DIR . 'assets/' . $script_filename)
            ? LEADCH_PLUGIN_URL . 'assets/' . $script_filename
            : LEADCH_PLUGIN_URL . '../dist/' . $script_filename;

        wp_enqueue_script(
            'leadch-widget',
            $widget_js,
            array(),
            LEADCH_PLUGIN_VERSION,
            true
        );
        
        // Add site-key attribute to the script tag
        add_filter('script_loader_tag', function($tag, $handle) {
            if ('leadch-widget' === $handle) {
                $site_key = $this->options['site_key'];
                if (!empty($site_key)) {
                    $tag = str_replace(' src=', ' site-key="' . esc_attr($site_key) . '" src=', $tag);
                }
            }
            return $tag;
        }, 10, 2);

        wp_add_inline_script(
            'leadch-widget',
            $this->get_initialization_script(),
            'after'
        );

        // When using the floating bundle, its JS injects styles and manages state.
        // Do not inject PHP inline CSS or state scripts here to avoid conflicts.
    }

    public function enqueue_admin_scripts($hook) {
        if ('settings_page_leadblaze-chat' !== $hook) {
            return;
        }

        // Enqueue WordPress color picker
        wp_enqueue_style('wp-color-picker');
        wp_enqueue_script('wp-color-picker');
        
        wp_enqueue_style(
            'leadch-widget-admin',
            LEADCH_PLUGIN_URL . 'admin/admin.css',
            array('wp-color-picker'),
            LEADCH_PLUGIN_VERSION
        );
        
        wp_enqueue_script(
            'leadch-widget-admin',
            LEADCH_PLUGIN_URL . 'admin/admin.js',
            array('jquery', 'wp-color-picker'),
            LEADCH_PLUGIN_VERSION,
            true
        );
    }

    private function should_load_widget() {
        if (empty($this->options['site_key'])) {
            return false;
        }

        $enable_pages = $this->options['enable_pages'];
        
        if ('all' === $enable_pages) {
            return true;
        }

        if ('specific' === $enable_pages) {
            $specific_pages = array_map('trim', explode(',', $this->options['specific_pages']));
            $current_id = get_the_ID();
            return in_array($current_id, $specific_pages);
        }

        if ('home' === $enable_pages && is_front_page()) {
            return true;
        }

        return false;
    }

    private function get_initialization_script() {
        $config = array(
            'clientId' => $this->options['client_id'],
            'theme' => $this->options['theme_color'], // Pass hex color as theme
            'themeMode' => $this->options['theme'], // Pass light/dark/auto as themeMode
            'skipGreeting' => true // Skip greeting, we'll inject history or show greeting based on history result
            // Note: siteKey will be extracted from script tag attribute by the widget
        );
        
        // Add greeting message if set (for fallback use in history injection)
        if (!empty($this->options['greeting_message'])) {
            $config['greetingMessage'] = $this->options['greeting_message'];
        }

        if ($this->options['enable_floating']) {
            // Signal to the widget that this is a floating instance so it renders
            // the minimize button in the header and wires collapse/expand correctly
            $config['container'] = '#chatbot-widget-container';
            $config['isFloating'] = true;
            $config['floatingDefaultState'] = $this->options['floating_default_state'];
            // Control whether users can close the collapsed floating button (X)
            $config['allowFloatingButtonClose'] = !empty($this->options['allow_floating_button_close']);
            // Pass position to floating bundle if present
            if (!empty($this->options['position'])) {
                $config['position'] = $this->options['position'];
            }
        } elseif (!empty($this->options['container_selector'])) {
            $config['container'] = $this->options['container_selector'];
        }

        // History + persistence helpers (client-side; uses widget's own sessionId)
        $greeting_message = !empty($this->options['greeting_message']) ? $this->options['greeting_message'] : '';
        $history_script = $this->get_history_injection_script($greeting_message);

        return sprintf(
            '%s
            (function initChatbotWP() {
                var __cfg = %s;
                function tryInit() {
                    if (typeof ChatbotWidget !== "undefined") {
                        ChatbotWidget.init(__cfg);
                        // Resolve underlying chat widget instance for both floating and embedded builds
                        var container = __cfg.container || "#chatbot-widget-container";
                        var instance = null;
                        if (ChatbotWidget.getFloatingChatWidget) {
                          instance = ChatbotWidget.getFloatingChatWidget();
                        }
                        if (!instance && ChatbotWidget.getInstance) {
                          instance = ChatbotWidget.getInstance(container);
                        }
                        if (instance) {
                          wirePersistence(instance);
                          fetchAndInjectHistory(instance, { greetingMessage: %s });
                        }
                        return true;
                    }
                    return false;
                }
                if (tryInit()) return;
                if (document.readyState === "loading") {
                    document.addEventListener("DOMContentLoaded", function() {
                        if (tryInit()) return;
                        var attempts = 0;
                        var interval = setInterval(function() {
                            attempts++;
                            if (tryInit() || attempts > 50) { clearInterval(interval); }
                        }, 100);
                    });
                } else {
                    var attempts = 0;
                    var interval = setInterval(function() {
                        attempts++;
                        if (tryInit() || attempts > 50) { clearInterval(interval); }
                    }, 100);
                }
            })();',
            $history_script,
            wp_json_encode($config),
            wp_json_encode($greeting_message)
        );
    }

    // Note: No PHP sessions are used; session handling is managed client-side by the widget.

    private function get_history_injection_script($greeting_message = '') {
        return "
            // Local persistence helpers (per siteKey + sessionId)
            function __chatbotHistoryKey(instance) {
                try {
                    var siteKey = (instance && instance.config && instance.config.siteKey) || 'default';
                    var sessionId = (instance && instance.config && instance.config.sessionId) || 'anon';
                    var domain = window.location.hostname;
                    return 'chatbot-history-' + siteKey + '-' + sessionId + '-' + domain;
                } catch (e) { return 'chatbot-history-fallback'; }
            }
            function loadLocalHistory(instance) {
                try {
                    var key = __chatbotHistoryKey(instance);
                    var raw = localStorage.getItem(key);
                    if (!raw) return null;
                    var parsed = JSON.parse(raw);
                    return Array.isArray(parsed) ? parsed : null;
                } catch (e) { return null; }
            }
            function saveLocalHistory(instance, history) {
                try {
                    var key = __chatbotHistoryKey(instance);
                    localStorage.setItem(key, JSON.stringify(history || []));
                } catch (e) {}
            }
            function persistFromInstance(instance) {
                try {
                    var ui = instance && instance.chatUI;
                    if (!ui || !Array.isArray(ui.messages)) return;
                    var history = ui.messages.map(function(m) {
                        var sender = (m.type === 'bot') ? 'ai' : 'user';
                        return { sender: sender, content: m.content };
                    });
                    saveLocalHistory(instance, history);
                } catch (e) {}
            }
            function wirePersistence(instance) {
                try {
                    var ui = instance && instance.chatUI;
                    if (!ui || typeof ui.addMessageToUI !== 'function') return;
                    var originalAdd = ui.addMessageToUI.bind(ui);
                    ui.addMessageToUI = function(message) {
                        // Persist after any message is added to UI (user or bot/loading)
                        originalAdd(message);
                        // Patch this message's updateContent to persist after bot response arrives
                        try {
                            if (message && typeof message.updateContent === 'function' && !message.__wpPersistPatched) {
                                var origUpdate = message.updateContent.bind(message);
                                message.updateContent = function(newContent) {
                                    origUpdate(newContent);
                                    persistFromInstance(instance);
                                };
                                message.__wpPersistPatched = true;
                            }
                        } catch (_) {}
                        persistFromInstance(instance);
                    };
                } catch (e) {}
            }
            // Fetch from backend if no local history
            function fetchAndInjectHistory(instance, opts) {
                opts = opts || {};
                var greeting = opts.greetingMessage || '';
                try {
                    var local = loadLocalHistory(instance);
                    if (local && local.length > 0) {
                        instance.injectHistory(local);
                        return;
                    }
                } catch (e) {}
                try {
                    var cfg = instance && instance.config ? instance.config : {};
                    var endpoint = (cfg.apiEndpoint || 'https://leadgate-backend-production.up.railway.app/chat').replace('/chat','/get-session-history');
                    var siteKey = cfg.siteKey || '';
                    var body = { sessionId: cfg.sessionId, clientId: cfg.clientId };
                    fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'x-site-key': siteKey
                        },
                        body: JSON.stringify(body)
                    })
                    .then(function(response){
                        if (response.ok) return response.json();
                        if (response.status === 404) return [];
                        throw new Error('HTTP ' + response.status + ': ' + response.statusText);
                    })
                    .then(function(history){
                        if (Array.isArray(history) && history.length > 0) {
                            instance.injectHistory(history);
                            saveLocalHistory(instance, history);
                        } else if (greeting) {
                            instance.injectHistory([{ sender: 'ai', content: greeting }]);
                            saveLocalHistory(instance, [{ sender: 'ai', content: greeting }]);
                        }
                    })
                    .catch(function(error){
                        if (greeting) {
                            instance.injectHistory([{ sender: 'ai', content: greeting }]);
                        }
                    });
                } catch (e) {
                    if (greeting) {
                        try { instance.injectHistory([{ sender: 'ai', content: greeting }]); } catch (_) {}
                    }
                }
            }
        ";
    }

    private function get_history_api_endpoint() {
        // Use the same API endpoint as the widget but for get-session-history
        $api_endpoint = 'https://leadgate-backend-production.up.railway.app/chat';
        return str_replace('/chat', '/get-session-history', $api_endpoint);
    }

    // Inline styles for floating container, added via wp_add_inline_style
    // Legacy CSS injector retained for backward compatibility (unused for floating bundle)
    private function get_floating_styles() { return ''; }

    // Inline script for initial floating state, added via wp_add_inline_script
    private function get_floating_state_script($site_key, $default_state) { return ''; }

    public function maybe_render_floating() {
        if (!$this->should_load_widget() || !$this->options['enable_floating']) {
            return;
        }

        // With the floating bundle, JS creates and styles the container and trigger.
        // No server-rendered markup is needed here.
        return;
    }

    public function render_shortcode($atts) {
        if (empty($this->options['site_key'])) {
            return '<p>' . esc_html__('Please configure the LeadBlaze Chat in Settings.', 'leadblaze-chat') . '</p>';
        }

        $atts = shortcode_atts(array(
            'container' => 'chatbot-widget-shortcode-' . uniqid(),
            'height' => '600px',
            'width' => '100%',
            'theme' => $this->options['theme_color'] // Use theme color for shortcode too
        ), $atts);

        $container_id = esc_attr($atts['container']);

        // Ensure the public script is enqueued on shortcode render
        wp_enqueue_script('leadch-widget');

        // Build per-shortcode inline init using the WP API
        $greeting_message = !empty($this->options['greeting_message']) ? $this->options['greeting_message'] : '';
        $history_script = $this->get_history_injection_script($greeting_message);
        $cfg = array(
            'clientId' => $this->options['client_id'],
            'siteKey' => $this->options['site_key'],
            'container' => '#' . $container_id,
            'theme' => $atts['theme'],
            'themeMode' => $this->options['theme'],
            'skipGreeting' => true,
        );
        if (!empty($this->options['greeting_message'])) {
            $cfg['greetingMessage'] = $this->options['greeting_message'];
        }
        $cfg_json = wp_json_encode($cfg);
        $greet_json = wp_json_encode($this->options['greeting_message']);
        $init_script = $history_script . "\n(function initChatWidget(){\n  var __cfg = " . $cfg_json . ";\n  function tryInit(){\n    if (typeof ChatbotWidget !== 'undefined'){\n      ChatbotWidget.init(__cfg);\n      var instance = ChatbotWidget.getInstance(__cfg.container);\n      if (instance){ wirePersistence(instance); fetchAndInjectHistory(instance, { greetingMessage: " . $greet_json . " }); }\n      return true;\n    }\n    return false;\n  }\n  if (tryInit()) return;\n  if (document.readyState === 'loading'){\n    document.addEventListener('DOMContentLoaded', function(){\n      if (tryInit()) return;\n      var attempts=0;\n      var interval=setInterval(function(){ attempts++; if (tryInit() || attempts > 50){ clearInterval(interval);} }, 100);\n    });\n  } else {\n    var attempts=0;\n    var interval=setInterval(function(){ attempts++; if (tryInit() || attempts > 50){ clearInterval(interval);} }, 100);\n  }\n})();";
        wp_add_inline_script('leadch-widget', $init_script, 'after');

        // Output only the container markup
        return sprintf(
            '<div id="%s" style="width: %s; height: %s;"></div>',
            esc_attr($container_id),
            esc_attr($atts['width']),
            esc_attr($atts['height'])
        );
    }

    public function add_admin_menu() {
        add_options_page(
            __('LeadBlaze Chat Settings', 'leadblaze-chat'),
            __('LeadBlaze Chat', 'leadblaze-chat'),
            'manage_options',
            'leadblaze-chat',
            array($this, 'render_admin_page')
        );
    }

    public function register_settings() {
        register_setting(
            'leadch_settings_group', 
            'leadch_settings',
            array($this, 'sanitize_settings')
        );
    }
    
    public function sanitize_settings($input) {
        $sanitized = array();
        
        // Text fields
        $sanitized['site_key'] = sanitize_text_field($input['site_key'] ?? '');
        $sanitized['client_id'] = sanitize_text_field($input['client_id'] ?? '');
        $sanitized['theme'] = sanitize_text_field($input['theme'] ?? 'light');
        $sanitized['position'] = sanitize_text_field($input['position'] ?? 'bottom-right');
        $sanitized['floating_default_state'] = sanitize_text_field($input['floating_default_state'] ?? 'expanded');
        $sanitized['enable_pages'] = sanitize_text_field($input['enable_pages'] ?? 'all');
        $sanitized['specific_pages'] = sanitize_text_field($input['specific_pages'] ?? '');
        $sanitized['container_selector'] = sanitize_text_field($input['container_selector'] ?? '');
        
        // Greeting message - validate length
        $greeting_message = sanitize_text_field($input['greeting_message'] ?? '');
        if (strlen($greeting_message) > 150) {
            $sanitized['greeting_message'] = substr($greeting_message, 0, 150);
            add_settings_error(
                'leadch_settings',
                'greeting_message_too_long',
                __('Greeting message was truncated to 150 characters.', 'leadblaze-chat'),
                'updated'
            );
        } else {
            $sanitized['greeting_message'] = $greeting_message;
        }
        
        // Theme color - validate hex color
        $theme_color = sanitize_text_field($input['theme_color'] ?? '#eb4034');
        if (preg_match('/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/', $theme_color)) {
            $sanitized['theme_color'] = $theme_color;
        } else {
            $sanitized['theme_color'] = '#eb4034'; // Fallback to default
            add_settings_error(
                'leadch_settings',
                'invalid_theme_color',
                __('Invalid theme color format. Please use a valid hex color (e.g., #eb4034).', 'leadblaze-chat'),
                'error'
            );
        }
        
        // Checkbox - will be missing from $input if unchecked
        $sanitized['enable_floating'] = isset($input['enable_floating']) ? 1 : 0;
        // Allow close (X) on collapsed floating button
        $sanitized['allow_floating_button_close'] = isset($input['allow_floating_button_close']) ? 1 : 0;
        
        return $sanitized;
    }

    public function render_admin_page() {
        require_once LEADCH_PLUGIN_DIR . 'admin/settings-page.php';
    }
}

// Prefixed activation hook
function leadch_activate() {
    if (!get_option('leadch_settings')) {
        $widget = Leadch_Chatbot_Widget::get_instance();
        add_option('leadch_settings', $widget->get_default_options());
        add_option('leadch_version', LEADCH_PLUGIN_VERSION);
    }
}
register_activation_hook(__FILE__, 'leadch_activate');

// Load plugin text domain for translations
// Note: WordPress automatically loads translations for plugins hosted on WordPress.org since version 4.6
// The load_plugin_textdomain() call is no longer needed

// Bootstrap
Leadch_Chatbot_Widget::get_instance();
