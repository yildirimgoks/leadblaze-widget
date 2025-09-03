<?php
/**
 * Plugin Name: Chatbot Widget
 * Plugin URI: https://chatbotbackend.com
 * Description: Embeddable chatbot widget for WordPress sites
 * Version: 1.0.0
 * Author: Your Company
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: chatbot-widget
 * Domain Path: /languages
 */

if (!defined('ABSPATH')) {
    exit;
}

define('CHATBOT_WIDGET_VERSION', '1.0.0');
define('CHATBOT_WIDGET_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('CHATBOT_WIDGET_PLUGIN_URL', plugin_dir_url(__FILE__));

class ChatbotWidget {
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
        $saved_options = get_option('chatbot_widget_settings', array());
        $this->options = array_merge($this->get_default_options(), $saved_options);
        $this->init_hooks();
    }

    private function init_hooks() {
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
        add_shortcode('chatbot_widget', array($this, 'render_shortcode'));
        add_action('wp_footer', array($this, 'maybe_render_floating'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
    }

    private function maybe_upgrade() {
        $current_version = get_option('chatbot_widget_version', '0.0.0');
        
        if (version_compare($current_version, CHATBOT_WIDGET_VERSION, '<')) {
            // Upgrade needed
            $saved_options = get_option('chatbot_widget_settings', array());
            $default_options = $this->get_default_options();
            
            // Merge any missing keys from defaults
            $updated_options = array_merge($default_options, $saved_options);
            update_option('chatbot_widget_settings', $updated_options);
            
            // Update version
            update_option('chatbot_widget_version', CHATBOT_WIDGET_VERSION);
        }
    }

    public function get_default_options() {
        return array(
            'site_key' => '',
            'client_id' => '',
            'theme_color' => '#eb4034',
            'theme' => 'light',
            'greeting_message' => '',
            'locale' => 'en',
            'position' => 'bottom-right',
            'enable_floating' => false,
            'floating_default_state' => 'expanded',
            'enable_pages' => 'all',
            'specific_pages' => '',
            'container_selector' => ''
        );
    }

    public function enqueue_scripts() {
        if (!$this->should_load_widget()) {
            return;
        }

        $widget_js = file_exists(CHATBOT_WIDGET_PLUGIN_DIR . 'assets/chatbot-widget.js')
            ? CHATBOT_WIDGET_PLUGIN_URL . 'assets/chatbot-widget.js'
            : CHATBOT_WIDGET_PLUGIN_URL . '../dist/chatbot-widget.js';

        wp_enqueue_script(
            'chatbot-widget',
            $widget_js,
            array(),
            CHATBOT_WIDGET_VERSION,
            true
        );
        
        // Add site-key attribute to the script tag
        add_filter('script_loader_tag', function($tag, $handle) {
            if ('chatbot-widget' === $handle) {
                $site_key = $this->options['site_key'];
                if (!empty($site_key)) {
                    $tag = str_replace(' src=', ' site-key="' . esc_attr($site_key) . '" src=', $tag);
                }
            }
            return $tag;
        }, 10, 2);

        wp_add_inline_script(
            'chatbot-widget',
            $this->get_initialization_script(),
            'after'
        );
    }

    public function enqueue_admin_scripts($hook) {
        if ('settings_page_chatbot-widget' !== $hook) {
            return;
        }

        // Enqueue WordPress color picker
        wp_enqueue_style('wp-color-picker');
        wp_enqueue_script('wp-color-picker');
        
        wp_enqueue_style(
            'chatbot-widget-admin',
            CHATBOT_WIDGET_PLUGIN_URL . 'admin/admin.css',
            array('wp-color-picker'),
            CHATBOT_WIDGET_VERSION
        );
        
        wp_enqueue_script(
            'chatbot-widget-admin',
            CHATBOT_WIDGET_PLUGIN_URL . 'admin/admin.js',
            array('jquery', 'wp-color-picker'),
            CHATBOT_WIDGET_VERSION,
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
            'locale' => $this->options['locale']
            // Note: siteKey will be extracted from script tag attribute by the widget
        );
        
        // Add greeting message if set
        if (!empty($this->options['greeting_message'])) {
            $config['greetingMessage'] = $this->options['greeting_message'];
        }

        if ($this->options['enable_floating']) {
            $config['container'] = '#chatbot-widget-container';
            $config['floatingDefaultState'] = $this->options['floating_default_state'];
        } elseif (!empty($this->options['container_selector'])) {
            $config['container'] = $this->options['container_selector'];
        }

        $session_id = $this->get_or_create_session_id();
        if ($session_id) {
            $config['sessionId'] = $session_id;
        }

        return sprintf(
            'document.addEventListener("DOMContentLoaded", function() {
                if (typeof ChatbotWidget !== "undefined") {
                    ChatbotWidget.init(%s);
                }
            });',
            wp_json_encode($config)
        );
    }

    private function get_or_create_session_id() {
        // Check if session can be started safely
        if (session_status() === PHP_SESSION_NONE && !headers_sent()) {
            session_start();
        }
        
        // Use WordPress transients as fallback if sessions aren't available
        if (session_status() === PHP_SESSION_ACTIVE) {
            if (!isset($_SESSION['chatbot_session_id'])) {
                $_SESSION['chatbot_session_id'] = wp_generate_uuid4();
            }
            return $_SESSION['chatbot_session_id'];
        } else {
            // Fallback to user-specific transient
            $user_id = get_current_user_id();
            $transient_key = 'chatbot_session_' . ($user_id ?: 'anon_' . $_SERVER['REMOTE_ADDR']);
            $session_id = get_transient($transient_key);
            
            if (!$session_id) {
                $session_id = wp_generate_uuid4();
                set_transient($transient_key, $session_id, DAY_IN_SECONDS);
            }
            
            return $session_id;
        }
    }

    public function maybe_render_floating() {
        if (!$this->should_load_widget() || !$this->options['enable_floating']) {
            return;
        }

        $position_class = 'chatbot-widget-' . $this->options['position'];
        $default_state = $this->options['floating_default_state'];
        $site_key = $this->options['site_key'];
        ?>
        <!-- Determine initial state from localStorage or default -->
        <?php
        // We'll use JavaScript to determine the state but apply it via PHP attributes
        ?>
        <script>
            // Determine initial state before rendering
            (function() {
                var siteKey = '<?php echo esc_js($site_key); ?>' || 'default';
                var domain = window.location.hostname;
                var stateKey = 'chatbot-widget-state-' + siteKey + '-' + domain;
                
                var storedState = null;
                try {
                    storedState = localStorage.getItem(stateKey);
                } catch(e) {}
                
                var defaultState = '<?php echo esc_js($default_state); ?>';
                window.__chatbotInitialState = storedState || defaultState || 'expanded';
            })();
        </script>
        
        <div id="chatbot-widget-container" class="chatbot-widget-floating <?php echo esc_attr($position_class); ?>" data-default-state="<?php echo esc_attr($default_state); ?>" style="display: none;"></div>
        <div id="chatbot-widget-collapsed" class="chatbot-widget-collapsed <?php echo esc_attr($position_class); ?>" style="display: none;">
            <button class="chatbot-collapsed-button" title="<?php esc_attr_e('Open Chat', 'chatbot-widget'); ?>">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" fill="currentColor"/>
                    <circle cx="7" cy="9" r="1" fill="currentColor"/>
                    <circle cx="12" cy="9" r="1" fill="currentColor"/>
                    <circle cx="17" cy="9" r="1" fill="currentColor"/>
                </svg>
                <span class="chatbot-collapsed-text"><?php _e('Chat', 'chatbot-widget'); ?></span>
            </button>
            <button class="chatbot-close-button" title="<?php esc_attr_e('Close', 'chatbot-widget'); ?>">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" fill="currentColor"/>
                </svg>
            </button>
        </div>
        
        <script>
            // Apply initial state after DOM elements are created
            (function() {
                var finalState = window.__chatbotInitialState || 'expanded';
                var container = document.getElementById('chatbot-widget-container');
                var collapsed = document.getElementById('chatbot-widget-collapsed');
                
                if (container && collapsed) {
                    if (finalState === 'collapsed') {
                        container.style.display = 'none';
                        collapsed.style.display = 'flex';
                    } else if (finalState === 'closed') {
                        container.style.display = 'none';
                        collapsed.style.display = 'none';
                    } else {
                        container.style.display = 'block';
                        collapsed.style.display = 'none';
                    }
                }
            })();
        </script>
        
        <style>
            .chatbot-widget-floating {
                position: fixed;
                z-index: 9999;
                width: 380px;
                height: 600px;
                max-width: calc(100vw - 48px); /* Increased for better margins */
                max-height: calc(100vh - 48px);
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 
                           0 2px 8px rgba(0, 0, 0, 0.08);
                overflow: hidden;
                backdrop-filter: blur(10px);
                transition: opacity 0.3s ease, transform 0.3s ease;
            }
            
            .chatbot-widget-collapsed {
                position: fixed;
                z-index: 9998;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .chatbot-collapsed-button {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px 16px;
                background: #ffffff;
                color: #374151;
                border: 1px solid rgba(0, 0, 0, 0.1);
                border-radius: 50px; /* Pill shape */
                cursor: pointer;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                font-weight: 500;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                transition: all 0.2s ease;
            }
            
            .chatbot-collapsed-button:hover {
                background: #f9fafb;
                transform: translateY(-1px);
                box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
            }
            
            .chatbot-close-button {
                width: 28px;
                height: 28px;
                background: rgba(0, 0, 0, 0.6);
                color: white;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }
            
            .chatbot-close-button:hover {
                background: rgba(0, 0, 0, 0.8);
                transform: scale(1.1);
            }
            .chatbot-widget-bottom-right {
                bottom: 24px; /* Increased margin */
                right: 24px;
            }
            .chatbot-widget-bottom-left {
                bottom: 24px;
                left: 24px;
            }
            .chatbot-widget-top-right {
                top: 24px;
                right: 24px;
            }
            .chatbot-widget-top-left {
                top: 24px;
                left: 24px;
            }
            @media (max-width: 600px) {
                .chatbot-widget-floating {
                    width: calc(100vw - 32px); /* Better mobile margins */
                    height: calc(100vh - 120px);
                    max-width: none;
                    bottom: 16px !important;
                    right: 16px !important;
                    left: 16px !important;
                    top: auto !important;
                    border-radius: 8px; /* Smaller radius on mobile */
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                }
            }
            
            /* Enhance shadow on dark backgrounds */
            @media (prefers-color-scheme: dark) {
                .chatbot-widget-floating {
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25), 
                               0 2px 8px rgba(0, 0, 0, 0.15),
                               0 0 0 1px rgba(255, 255, 255, 0.05);
                }
            }
        </style>
        <?php
    }

    public function render_shortcode($atts) {
        if (empty($this->options['site_key'])) {
            return '<p>' . esc_html__('Please configure the Chatbot Widget in Settings.', 'chatbot-widget') . '</p>';
        }

        $atts = shortcode_atts(array(
            'container' => 'chatbot-widget-shortcode-' . uniqid(),
            'height' => '600px',
            'width' => '100%',
            'theme' => $this->options['theme_color'], // Use theme color for shortcode too
            'locale' => $this->options['locale']
        ), $atts);

        $container_id = esc_attr($atts['container']);
        
        ob_start();
        ?>
        <div id="<?php echo $container_id; ?>" style="width: <?php echo esc_attr($atts['width']); ?>; height: <?php echo esc_attr($atts['height']); ?>;"></div>
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                if (typeof ChatbotWidget !== 'undefined') {
                    ChatbotWidget.init({
                        clientId: <?php echo wp_json_encode($this->options['client_id']); ?>,
                        siteKey: <?php echo wp_json_encode($this->options['site_key']); ?>,
                        container: '#<?php echo $container_id; ?>',
                        theme: <?php echo wp_json_encode($atts['theme']); ?>,
                        themeMode: <?php echo wp_json_encode($this->options['theme']); ?>,
                        locale: <?php echo wp_json_encode($atts['locale']); ?>,
                        <?php if (!empty($this->options['greeting_message'])): ?>
                        greetingMessage: <?php echo wp_json_encode($this->options['greeting_message']); ?>,
                        <?php endif; ?>
                        sessionId: <?php echo wp_json_encode($this->get_or_create_session_id()); ?>
                    });
                }
            });
        </script>
        <?php
        return ob_get_clean();
    }

    public function add_admin_menu() {
        add_options_page(
            __('Chatbot Widget Settings', 'chatbot-widget'),
            __('Chatbot Widget', 'chatbot-widget'),
            'manage_options',
            'chatbot-widget',
            array($this, 'render_admin_page')
        );
    }

    public function register_settings() {
        register_setting(
            'chatbot_widget_settings_group', 
            'chatbot_widget_settings',
            array($this, 'sanitize_settings')
        );
    }
    
    public function sanitize_settings($input) {
        $sanitized = array();
        
        // Text fields
        $sanitized['site_key'] = sanitize_text_field($input['site_key'] ?? '');
        $sanitized['client_id'] = sanitize_text_field($input['client_id'] ?? '');
        $sanitized['theme'] = sanitize_text_field($input['theme'] ?? 'light');
        $sanitized['locale'] = sanitize_text_field($input['locale'] ?? 'en');
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
                'chatbot_widget_settings',
                'greeting_message_too_long',
                __('Greeting message was truncated to 150 characters.', 'chatbot-widget'),
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
                'chatbot_widget_settings',
                'invalid_theme_color',
                __('Invalid theme color format. Please use a valid hex color (e.g., #eb4034).', 'chatbot-widget'),
                'error'
            );
        }
        
        // Checkbox - will be missing from $input if unchecked
        $sanitized['enable_floating'] = isset($input['enable_floating']) ? 1 : 0;
        
        return $sanitized;
    }

    public function render_admin_page() {
        require_once CHATBOT_WIDGET_PLUGIN_DIR . 'admin/settings-page.php';
    }
}

function chatbot_widget_activate() {
    if (!get_option('chatbot_widget_settings')) {
        $widget = ChatbotWidget::get_instance();
        add_option('chatbot_widget_settings', $widget->get_default_options());
        add_option('chatbot_widget_version', CHATBOT_WIDGET_VERSION);
    }
}
register_activation_hook(__FILE__, 'chatbot_widget_activate');

ChatbotWidget::get_instance();