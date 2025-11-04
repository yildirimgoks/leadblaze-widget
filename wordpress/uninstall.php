<?php
// If uninstall not called from WordPress, exit.
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Options created by this plugin
$options = array(
    // Legacy keys (pre-prefix)
    'chatbot_widget_settings',
    'chatbot_widget_version',
    // Current prefixed keys
    'leadch_settings',
    'leadch_version',
);

foreach ($options as $opt) {
    // Delete per-site option
    delete_option($opt);
    // Delete network option (in case it was added on a network install)
    if (function_exists('delete_site_option')) {
        delete_site_option($opt);
    }
}

// No custom tables or CPTs to remove.
// Transients (if any) are short-lived and not tracked by this plugin.
// Client-side localStorage is cleared by the widget logic at runtime.
