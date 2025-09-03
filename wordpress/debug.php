<?php
/**
 * Debug helper for Chatbot Widget
 * 
 * Add this to your wp-config.php to enable debugging:
 * define('WP_DEBUG', true);
 * define('WP_DEBUG_LOG', true);
 * define('WP_DEBUG_DISPLAY', true);
 */

// This file can be included to test basic plugin functionality
if (!defined('ABSPATH')) {
    exit;
}

// Test if the plugin can be loaded
add_action('plugins_loaded', function() {
    if (class_exists('ChatbotWidget')) {
        error_log('Chatbot Widget: Class loaded successfully');
    } else {
        error_log('Chatbot Widget: Class NOT loaded');
    }
});

// Log any PHP errors during activation
register_activation_hook(dirname(__FILE__) . '/chatbot-widget.php', function() {
    error_log('Chatbot Widget: Activation hook triggered');
    
    // Check PHP version
    if (version_compare(PHP_VERSION, '7.2', '<')) {
        error_log('Chatbot Widget: PHP version too old: ' . PHP_VERSION);
        wp_die('Chatbot Widget requires PHP 7.2 or higher');
    }
    
    // Check WordPress version
    global $wp_version;
    if (version_compare($wp_version, '5.0', '<')) {
        error_log('Chatbot Widget: WordPress version too old: ' . $wp_version);
        wp_die('Chatbot Widget requires WordPress 5.0 or higher');
    }
    
    error_log('Chatbot Widget: All checks passed');
});