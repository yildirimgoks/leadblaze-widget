<?php
/**
 * Plugin Name: LeadBlaze Chat (Minimal Test)
 * Description: Minimal version for testing activation
 * Version: 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

// Test with minimal functionality
add_action('init', function() {
    // Just a simple test to ensure plugin loads
    if (is_admin()) {
        add_action('admin_notices', function() {
            echo '<div class="notice notice-info"><p>LeadBlaze Chat Minimal is active!</p></div>';
        });
    }
});

// Simple activation test
register_activation_hook(__FILE__, function() {
    update_option('chatbot_widget_minimal_activated', true);
});