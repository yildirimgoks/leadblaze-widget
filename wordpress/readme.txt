=== LeadBlaze Chat ===
Contributors: leadblaze
Tags: chatbot, chat, widget, customer support, ai, live chat
Requires at least: 5.0
Tested up to: 6.4
Stable tag: 1.0.0
Requires PHP: 7.2
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Embeddable chatbot widget for WordPress sites. Lightweight, responsive, and easy to integrate.

== Description ==

The LeadBlaze Chat plugin allows you to easily add an AI-powered chat interface to your WordPress site. Perfect for customer support, lead generation, and user engagement.

= Features =

* **Lightweight**: Only ~25KB gzipped
* **Fully Responsive**: Works seamlessly on desktop and mobile
* **Multiple Display Modes**: Floating widget or embedded via shortcode
* **Customizable Themes**: Light, dark, or auto (system preference)
* **Flexible Positioning**: Place the widget anywhere on your site
* **Page-specific Display**: Show on all pages, home only, or specific pages
* **Shadow DOM Isolation**: Prevents CSS conflicts with your theme
* **Accessibility Compliant**: WCAG AA standards
* **Session Management**: Maintains conversation history

= Usage =

**Floating Widget**
Enable the floating widget in settings to display it automatically on your chosen pages.

**Shortcode**
Place the chatbot anywhere in your content:
`[chatbot_widget]`

With custom parameters:
`[chatbot_widget height="500px" width="400px" theme="dark"]`

**PHP Template Tag**
For theme developers:
`<?php echo do_shortcode('[chatbot_widget]'); ?>`

= Requirements =

* WordPress 5.0 or higher
* PHP 7.2 or higher
* Valid site key from LeadBlaze

== Installation ==

1. Upload the `chatbot-widget` folder to the `/wp-content/plugins/` directory
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Go to Settings > LeadBlaze Chat to configure your settings
4. Enter your site key and customize the appearance
5. Choose whether to use floating mode or place via shortcode

= Manual Installation =

1. Download the plugin zip file
2. Login to your WordPress admin panel
3. Go to Plugins > Add New > Upload Plugin
4. Select the zip file and click 'Install Now'
5. Activate the plugin after installation

== Frequently Asked Questions ==

= How do I get a site key? =

Contact LeadBlaze support to obtain a site key for your domain.

= Can I customize the widget appearance? =

Yes! The plugin supports light and dark themes, and you can further customize it with CSS variables.

= Does it work with page builders? =

Yes, the shortcode works with all major page builders including Elementor, Divi, and Gutenberg.

= Is the widget mobile-friendly? =

Absolutely! The widget is fully responsive and adapts to all screen sizes.

= Can I show the widget only on specific pages? =

Yes, you can configure it to show on all pages, home page only, or specific pages by ID.


= Will it slow down my site? =

No, the widget is optimized for performance at only ~25KB gzipped and loads asynchronously.

= Can I have multiple widgets on the same page? =

Yes, you can use multiple shortcodes with different configurations on the same page.

== Screenshots ==

1. Chatbot widget in action on a website
2. WordPress admin settings page
3. Floating widget on mobile view
4. Shortcode implementation example
5. Light and dark theme options

== Changelog ==

= 1.0.0 =
* Initial release
* Core chat functionality
* WordPress admin interface
* Shortcode support
* Floating widget mode
* Light/dark themes

== Upgrade Notice ==

= 1.0.0 =
Initial release of the LeadBlaze Chat plugin.

== Privacy Policy ==

This plugin communicates with an external chatbot service at https://leadblaze.ai. Data transmitted includes:
* User messages
* Session identifiers
* Client identifiers (if configured)
* Site key for authentication

Please ensure you have appropriate privacy policies in place and user consent where required.

== Support ==

For support, feature requests, or bug reports, please visit our support forum or contact us at support@leadblaze.ai

== Developer Resources ==

= JavaScript API =

The widget exposes a global API for programmatic control:

`ChatbotWidget.init(config)` - Initialize the widget
`ChatbotWidget.unmount()` - Remove the widget
`ChatbotWidget.send(message)` - Send a message programmatically

= Hooks and Filters =

`chatbot_widget_before_init` - Modify configuration before initialization
`chatbot_widget_after_init` - Run code after widget initialization
`chatbot_widget_should_load` - Control widget loading conditions