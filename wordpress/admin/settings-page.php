<?php
if (!defined('ABSPATH')) {
    exit;
}

// Get options with proper defaults merged
$widget_instance = ChatbotWidget::get_instance();
$default_options = $widget_instance->get_default_options();
$saved_options = get_option('chatbot_widget_settings', array());
$options = array_merge($default_options, $saved_options);
?>

<div class="wrap">
    <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
    
    <form method="post" action="options.php">
        <?php settings_fields('chatbot_widget_settings_group'); ?>
        
        <table class="form-table" role="presentation">
            <tr>
                <th scope="row">
                    <label for="site_key"><?php esc_html_e('Site Key', 'leadblaze-chat'); ?></label>
                </th>
                <td>
                    <input type="text" 
                           id="site_key" 
                           name="chatbot_widget_settings[site_key]" 
                           value="<?php echo esc_attr($options['site_key']); ?>" 
                           class="regular-text" 
                           required />
                    <p class="description">
                        <?php esc_html_e('Your unique site key provided by LeadBlaze.', 'leadblaze-chat'); ?>
                    </p>
                </td>
            </tr>
            
            <tr>
                <th scope="row">
                    <label for="client_id"><?php esc_html_e('Client ID', 'leadblaze-chat'); ?></label>
                </th>
                <td>
                    <input type="text" 
                           id="client_id" 
                           name="chatbot_widget_settings[client_id]" 
                           value="<?php echo esc_attr($options['client_id']); ?>" 
                           class="regular-text" />
                    <p class="description">
                        <?php esc_html_e('Optional client identifier for tracking purposes.', 'leadblaze-chat'); ?>
                    </p>
                </td>
            </tr>
            
            <tr>
                <th scope="row">
                    <label for="theme_color"><?php esc_html_e('Theme Color', 'leadblaze-chat'); ?></label>
                </th>
                <td>
                    <input type="text" 
                           id="theme_color" 
                           name="chatbot_widget_settings[theme_color]" 
                           value="<?php echo esc_attr($options['theme_color']); ?>" 
                           class="chatbot-color-picker" 
                           data-default-color="#eb4034" />
                    <p class="description">
                        <?php esc_html_e('Choose the primary color for the chatbot widget. You can pick from the color picker or enter a hex code manually.', 'leadblaze-chat'); ?>
                    </p>
                </td>
            </tr>
            
            <tr>
                <th scope="row">
                    <label for="theme"><?php esc_html_e('Theme Mode', 'leadblaze-chat'); ?></label>
                </th>
                <td>
                    <select id="theme" name="chatbot_widget_settings[theme]">
                        <option value="light" <?php selected($options['theme'], 'light'); ?>>
                            <?php esc_html_e('Light', 'leadblaze-chat'); ?>
                        </option>
                        <option value="dark" <?php selected($options['theme'], 'dark'); ?>>
                            <?php esc_html_e('Dark', 'leadblaze-chat'); ?>
                        </option>
                        <option value="auto" <?php selected($options['theme'], 'auto'); ?>>
                            <?php esc_html_e('Auto (System)', 'leadblaze-chat'); ?>
                        </option>
                    </select>
                    <p class="description">
                        <?php esc_html_e('Choose between light or dark appearance mode.', 'leadblaze-chat'); ?>
                    </p>
                </td>
            </tr>
            
            <tr>
                <th scope="row">
                    <label for="greeting_message"><?php esc_html_e('Greeting Message', 'leadblaze-chat'); ?></label>
                </th>
                <td>
                    <input type="text" 
                           id="greeting_message" 
                           name="chatbot_widget_settings[greeting_message]" 
                           value="<?php echo esc_attr($options['greeting_message']); ?>" 
                           class="regular-text" 
                           maxlength="150"
                           placeholder="<?php esc_attr_e('Hello! How can I help you today?', 'leadblaze-chat'); ?>" />
                    <p class="description">
                        <?php esc_html_e('First message that will be shown on the chatbot. Maximum 150 characters.', 'leadblaze-chat'); ?>
                        <span id="greeting-char-count" class="char-counter">0/150</span>
                    </p>
                </td>
            </tr>
            
            
            <tr>
                <th scope="row"><?php esc_html_e('Display Mode', 'leadblaze-chat'); ?></th>
                <td>
                    <fieldset>
                        <label>
                            <input type="checkbox" 
                                   name="chatbot_widget_settings[enable_floating]" 
                                   value="1" 
                                   <?php checked(isset($options['enable_floating']) ? $options['enable_floating'] : false, 1); ?> />
                            <?php esc_html_e('Enable floating widget', 'leadblaze-chat'); ?>
                        </label>
                        <p class="description">
                            <?php esc_html_e('Shows a floating chat widget on your site. Otherwise, use shortcode [chatbot_widget] to place it manually.', 'leadblaze-chat'); ?>
                        </p>
                    </fieldset>
                </td>
            </tr>
            
            <tr>
                <th scope="row">
                    <label for="position"><?php esc_html_e('Floating Position', 'leadblaze-chat'); ?></label>
                </th>
                <td>
                    <select id="position" name="chatbot_widget_settings[position]">
                        <option value="bottom-right" <?php selected($options['position'], 'bottom-right'); ?>>
                            <?php esc_html_e('Bottom Right', 'leadblaze-chat'); ?>
                        </option>
                        <option value="bottom-left" <?php selected($options['position'], 'bottom-left'); ?>>
                            <?php esc_html_e('Bottom Left', 'leadblaze-chat'); ?>
                        </option>
                        <option value="top-right" <?php selected($options['position'], 'top-right'); ?>>
                            <?php esc_html_e('Top Right', 'leadblaze-chat'); ?>
                        </option>
                        <option value="top-left" <?php selected($options['position'], 'top-left'); ?>>
                            <?php esc_html_e('Top Left', 'leadblaze-chat'); ?>
                        </option>
                    </select>
                    <p class="description">
                        <?php esc_html_e('Position of the floating widget on the screen. (Only effective if floating widget is enabled)', 'leadblaze-chat'); ?>
                    </p>
                </td>
            </tr>
            
            <tr>
                <th scope="row">
                    <label for="floating_default_state"><?php esc_html_e('Default State', 'leadblaze-chat'); ?></label>
                </th>
                <td>
                    <select id="floating_default_state" name="chatbot_widget_settings[floating_default_state]">
                        <option value="expanded" <?php selected($options['floating_default_state'], 'expanded'); ?>>
                            <?php esc_html_e('Expanded (Full Chat)', 'leadblaze-chat'); ?>
                        </option>
                        <option value="collapsed" <?php selected($options['floating_default_state'], 'collapsed'); ?>>
                            <?php esc_html_e('Collapsed (Button Only)', 'leadblaze-chat'); ?>
                        </option>
                    </select>
                    <p class="description">
                        <?php esc_html_e('Choose whether the floating chat appears fully expanded or as a compact button when visitors first load your site. (Only effective if floating widget is enabled)', 'leadblaze-chat'); ?>
                    </p>
                </td>
            </tr>
            
            <tr>
                <th scope="row"><?php esc_html_e('Display On', 'leadblaze-chat'); ?></th>
                <td>
                    <fieldset>
                        <label>
                            <input type="radio" 
                                   name="chatbot_widget_settings[enable_pages]" 
                                   value="all" 
                                   <?php checked($options['enable_pages'], 'all'); ?> />
                            <?php esc_html_e('All Pages', 'leadblaze-chat'); ?>
                        </label><br>
                        
                        <label>
                            <input type="radio" 
                                   name="chatbot_widget_settings[enable_pages]" 
                                   value="home" 
                                   <?php checked($options['enable_pages'], 'home'); ?> />
                            <?php esc_html_e('Home Page Only', 'leadblaze-chat'); ?>
                        </label><br>
                        
                        <label>
                            <input type="radio" 
                                   name="chatbot_widget_settings[enable_pages]" 
                                   value="specific" 
                                   <?php checked($options['enable_pages'], 'specific'); ?> />
                            <?php esc_html_e('Specific Pages', 'leadblaze-chat'); ?>
                        </label>
                    </fieldset>
                </td>
            </tr>
            
            <tr class="specific-pages" <?php echo $options['enable_pages'] === 'specific' ? '' : 'style="display:none;"'; ?>>
                <th scope="row">
                    <label for="specific_pages"><?php esc_html_e('Page IDs', 'leadblaze-chat'); ?></label>
                </th>
                <td>
                    <input type="text" 
                           id="specific_pages" 
                           name="chatbot_widget_settings[specific_pages]" 
                           value="<?php echo esc_attr($options['specific_pages']); ?>" 
                           class="regular-text" />
                    <p class="description">
                        <?php esc_html_e('Comma-separated list of page IDs (e.g., 1,2,3)', 'leadblaze-chat'); ?>
                    </p>
                </td>
            </tr>
            
            <tr>
                <th scope="row">
                    <label for="container_selector"><?php esc_html_e('Custom Container', 'leadblaze-chat'); ?></label>
                </th>
                <td>
                    <input type="text" 
                           id="container_selector" 
                           name="chatbot_widget_settings[container_selector]" 
                           value="<?php echo esc_attr($options['container_selector']); ?>" 
                           class="regular-text" 
                           placeholder="#my-chat-container" />
                    <p class="description">
                        <?php esc_html_e('CSS selector for custom widget placement (overrides floating mode).', 'leadblaze-chat'); ?>
                    </p>
                </td>
            </tr>
        </table>
        
        <?php submit_button(); ?>
    </form>
    
    <div class="chatbot-widget-help">
        <h2><?php esc_html_e('Usage', 'leadblaze-chat'); ?></h2>
        
        <h3><?php esc_html_e('Shortcode', 'leadblaze-chat'); ?></h3>
        <p><?php esc_html_e('Place the chatbot anywhere in your content:', 'leadblaze-chat'); ?></p>
        <code>[chatbot_widget]</code>
        
        <p><?php esc_html_e('With custom parameters:', 'leadblaze-chat'); ?></p>
        <code>[chatbot_widget height="500px" width="400px" theme="dark"]</code>
        
        <h3><?php esc_html_e('PHP Function', 'leadblaze-chat'); ?></h3>
        <p><?php esc_html_e('For theme developers:', 'leadblaze-chat'); ?></p>
        <code>&lt;?php echo do_shortcode('[chatbot_widget]'); ?&gt;</code>
        
        <h3><?php esc_html_e('JavaScript API', 'leadblaze-chat'); ?></h3>
        <p><?php esc_html_e('Programmatic control:', 'leadblaze-chat'); ?></p>
        <pre><code>// Send a message
ChatbotWidget.send('Hello!');

// Unmount the widget
ChatbotWidget.unmount();

// Re-initialize with new config
ChatbotWidget.init({
    theme: 'dark'
});</code></pre>
    </div>
</div>


<style>
.chatbot-widget-help {
    margin-top: 40px;
    padding: 20px;
    background: #fff;
    border: 1px solid #ccd0d4;
    box-shadow: 0 1px 1px rgba(0,0,0,.04);
}
.chatbot-widget-help h2 {
    margin-top: 0;
}
.chatbot-widget-help h3 {
    margin-top: 20px;
    margin-bottom: 10px;
}
.chatbot-widget-help code,
.chatbot-widget-help pre {
    background: #f0f0f1;
    padding: 5px 10px;
    border-radius: 3px;
}
.chatbot-widget-help pre {
    padding: 15px;
    overflow-x: auto;
}
</style>