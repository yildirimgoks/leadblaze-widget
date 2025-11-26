<?php
if (!defined('ABSPATH')) {
    exit;
}

// Get options with proper defaults merged
$leadch_widget_instance = Leadch_Chatbot_Widget::get_instance();
$leadch_default_options = $leadch_widget_instance->get_default_options();
$leadch_saved_options = get_option('leadch_settings', array());
$leadch_options = array_merge($leadch_default_options, $leadch_saved_options);
?>

<div class="wrap">
    <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
    
    <form method="post" action="options.php">
        <?php settings_fields('leadch_settings_group'); ?>
        
        <table class="form-table" role="presentation">
            <tr>
                <th scope="row">
                    <label for="site_key"><?php esc_html_e('Site Key', 'leadblaze-chat'); ?></label>
                </th>
                <td>
                    <input type="text"
                           id="site_key"
                           name="leadch_settings[site_key]"
                           value="<?php echo esc_attr($leadch_options['site_key']); ?>"
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
                           name="leadch_settings[client_id]" 
                           value="<?php echo esc_attr($leadch_options['client_id']); ?>" 
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
                           name="leadch_settings[theme_color]" 
                           value="<?php echo esc_attr($leadch_options['theme_color']); ?>" 
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
                    <select id="theme" name="leadch_settings[theme]">
                        <option value="light" <?php selected($leadch_options['theme'], 'light'); ?>>
                            <?php esc_html_e('Light', 'leadblaze-chat'); ?>
                        </option>
                        <option value="dark" <?php selected($leadch_options['theme'], 'dark'); ?>>
                            <?php esc_html_e('Dark', 'leadblaze-chat'); ?>
                        </option>
                        <option value="auto" <?php selected($leadch_options['theme'], 'auto'); ?>>
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
                           name="leadch_settings[greeting_message]" 
                           value="<?php echo esc_attr($leadch_options['greeting_message']); ?>" 
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
                                   name="leadch_settings[enable_floating]" 
                                   value="1" 
                                   <?php checked(!empty($leadch_options['enable_floating']), 1); ?> />
                            <?php esc_html_e('Enable floating widget', 'leadblaze-chat'); ?>
                        </label>
                        <p class="description">
                            <?php esc_html_e('Shows a floating chat widget on your site. Otherwise, use shortcode [leadch_widget] to place it manually.', 'leadblaze-chat'); ?>
                        </p>
                    </fieldset>
                </td>
            </tr>
            
            <tr>
                <th scope="row">
                    <label for="position"><?php esc_html_e('Floating Position', 'leadblaze-chat'); ?></label>
                </th>
                <td>
                    <select id="position" name="leadch_settings[position]">
                        <option value="bottom-right" <?php selected($leadch_options['position'], 'bottom-right'); ?>>
                            <?php esc_html_e('Bottom Right', 'leadblaze-chat'); ?>
                        </option>
                        <option value="bottom-left" <?php selected($leadch_options['position'], 'bottom-left'); ?>>
                            <?php esc_html_e('Bottom Left', 'leadblaze-chat'); ?>
                        </option>
                        <option value="top-right" <?php selected($leadch_options['position'], 'top-right'); ?>>
                            <?php esc_html_e('Top Right', 'leadblaze-chat'); ?>
                        </option>
                        <option value="top-left" <?php selected($leadch_options['position'], 'top-left'); ?>>
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
                    <select id="floating_default_state" name="leadch_settings[floating_default_state]">
                        <option value="expanded" <?php selected($leadch_options['floating_default_state'], 'expanded'); ?>>
                            <?php esc_html_e('Expanded (Full Chat)', 'leadblaze-chat'); ?>
                        </option>
                        <option value="collapsed" <?php selected($leadch_options['floating_default_state'], 'collapsed'); ?>>
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
                                   name="leadch_settings[enable_pages]" 
                                   value="all" 
                                   <?php checked($leadch_options['enable_pages'], 'all'); ?> />
                            <?php esc_html_e('All Pages', 'leadblaze-chat'); ?>
                        </label><br>
                        
                        <label>
                            <input type="radio" 
                                   name="leadch_settings[enable_pages]" 
                                   value="home" 
                                   <?php checked($leadch_options['enable_pages'], 'home'); ?> />
                            <?php esc_html_e('Home Page Only', 'leadblaze-chat'); ?>
                        </label><br>
                        
                        <label>
                            <input type="radio" 
                                   name="leadch_settings[enable_pages]" 
                                   value="specific" 
                                   <?php checked($leadch_options['enable_pages'], 'specific'); ?> />
                            <?php esc_html_e('Specific Pages', 'leadblaze-chat'); ?>
                        </label>
                    </fieldset>
                </td>
            </tr>
            
            <tr class="specific-pages" <?php echo $leadch_options['enable_pages'] === 'specific' ? '' : 'style="display:none;"'; ?>>
                <th scope="row">
                    <label for="specific_pages"><?php esc_html_e('Page IDs', 'leadblaze-chat'); ?></label>
                </th>
                <td>
                    <input type="text" 
                           id="specific_pages" 
                           name="leadch_settings[specific_pages]" 
                           value="<?php echo esc_attr($leadch_options['specific_pages']); ?>" 
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
                           name="leadch_settings[container_selector]" 
                           value="<?php echo esc_attr($leadch_options['container_selector']); ?>" 
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
        <code>[leadch_widget]</code>
        
        <p><?php esc_html_e('With custom parameters:', 'leadblaze-chat'); ?></p>
        <code>[leadch_widget height="500px" width="400px" theme="dark"]</code>
        
        <h3><?php esc_html_e('PHP Function', 'leadblaze-chat'); ?></h3>
        <p><?php esc_html_e('For theme developers:', 'leadblaze-chat'); ?></p>
        <code>&lt;?php echo do_shortcode('[leadch_widget]'); ?&gt;</code>
        
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

