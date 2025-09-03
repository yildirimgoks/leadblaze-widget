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
                    <label for="site_key"><?php _e('Site Key', 'chatbot-widget'); ?></label>
                </th>
                <td>
                    <input type="text" 
                           id="site_key" 
                           name="chatbot_widget_settings[site_key]" 
                           value="<?php echo esc_attr($options['site_key']); ?>" 
                           class="regular-text" 
                           required />
                    <p class="description">
                        <?php _e('Your unique site key provided by the chatbot service.', 'chatbot-widget'); ?>
                    </p>
                </td>
            </tr>
            
            <tr>
                <th scope="row">
                    <label for="client_id"><?php _e('Client ID', 'chatbot-widget'); ?></label>
                </th>
                <td>
                    <input type="text" 
                           id="client_id" 
                           name="chatbot_widget_settings[client_id]" 
                           value="<?php echo esc_attr($options['client_id']); ?>" 
                           class="regular-text" />
                    <p class="description">
                        <?php _e('Optional client identifier for tracking purposes.', 'chatbot-widget'); ?>
                    </p>
                </td>
            </tr>
            
            <tr>
                <th scope="row">
                    <label for="theme_color"><?php _e('Theme Color', 'chatbot-widget'); ?></label>
                </th>
                <td>
                    <input type="text" 
                           id="theme_color" 
                           name="chatbot_widget_settings[theme_color]" 
                           value="<?php echo esc_attr($options['theme_color']); ?>" 
                           class="chatbot-color-picker" 
                           data-default-color="#eb4034" />
                    <p class="description">
                        <?php _e('Choose the primary color for the chatbot widget. You can pick from the color picker or enter a hex code manually.', 'chatbot-widget'); ?>
                    </p>
                </td>
            </tr>
            
            <tr>
                <th scope="row">
                    <label for="theme"><?php _e('Theme Mode', 'chatbot-widget'); ?></label>
                </th>
                <td>
                    <select id="theme" name="chatbot_widget_settings[theme]">
                        <option value="light" <?php selected($options['theme'], 'light'); ?>>
                            <?php _e('Light', 'chatbot-widget'); ?>
                        </option>
                        <option value="dark" <?php selected($options['theme'], 'dark'); ?>>
                            <?php _e('Dark', 'chatbot-widget'); ?>
                        </option>
                        <option value="auto" <?php selected($options['theme'], 'auto'); ?>>
                            <?php _e('Auto (System)', 'chatbot-widget'); ?>
                        </option>
                    </select>
                    <p class="description">
                        <?php _e('Choose between light or dark appearance mode.', 'chatbot-widget'); ?>
                    </p>
                </td>
            </tr>
            
            <tr>
                <th scope="row">
                    <label for="greeting_message"><?php _e('Greeting Message', 'chatbot-widget'); ?></label>
                </th>
                <td>
                    <input type="text" 
                           id="greeting_message" 
                           name="chatbot_widget_settings[greeting_message]" 
                           value="<?php echo esc_attr($options['greeting_message']); ?>" 
                           class="regular-text" 
                           maxlength="150"
                           placeholder="<?php _e('Hello! How can I help you today?', 'chatbot-widget'); ?>" />
                    <p class="description">
                        <?php _e('First message that will be shown on the chatbot. Maximum 150 characters.', 'chatbot-widget'); ?>
                        <span id="greeting-char-count" class="char-counter">0/150</span>
                    </p>
                </td>
            </tr>
            
            <tr>
                <th scope="row">
                    <label for="locale"><?php _e('Language', 'chatbot-widget'); ?></label>
                </th>
                <td>
                    <select id="locale" name="chatbot_widget_settings[locale]">
                        <option value="en" <?php selected($options['locale'], 'en'); ?>>English</option>
                        <option value="es" <?php selected($options['locale'], 'es'); ?>>Español</option>
                        <option value="fr" <?php selected($options['locale'], 'fr'); ?>>Français</option>
                        <option value="de" <?php selected($options['locale'], 'de'); ?>>Deutsch</option>
                        <option value="it" <?php selected($options['locale'], 'it'); ?>>Italiano</option>
                        <option value="pt" <?php selected($options['locale'], 'pt'); ?>>Português</option>
                        <option value="ru" <?php selected($options['locale'], 'ru'); ?>>Русский</option>
                        <option value="zh" <?php selected($options['locale'], 'zh'); ?>>中文</option>
                        <option value="ja" <?php selected($options['locale'], 'ja'); ?>>日本語</option>
                        <option value="ko" <?php selected($options['locale'], 'ko'); ?>>한국어</option>
                    </select>
                </td>
            </tr>
            
            <tr>
                <th scope="row"><?php _e('Display Mode', 'chatbot-widget'); ?></th>
                <td>
                    <fieldset>
                        <label>
                            <input type="checkbox" 
                                   name="chatbot_widget_settings[enable_floating]" 
                                   value="1" 
                                   <?php checked(isset($options['enable_floating']) ? $options['enable_floating'] : false, 1); ?> />
                            <?php _e('Enable floating widget', 'chatbot-widget'); ?>
                        </label>
                        <p class="description">
                            <?php _e('Shows a floating chat widget on your site. Otherwise, use shortcode [chatbot_widget] to place it manually.', 'chatbot-widget'); ?>
                        </p>
                    </fieldset>
                </td>
            </tr>
            
            <tr>
                <th scope="row">
                    <label for="position"><?php _e('Floating Position', 'chatbot-widget'); ?></label>
                </th>
                <td>
                    <select id="position" name="chatbot_widget_settings[position]">
                        <option value="bottom-right" <?php selected($options['position'], 'bottom-right'); ?>>
                            <?php _e('Bottom Right', 'chatbot-widget'); ?>
                        </option>
                        <option value="bottom-left" <?php selected($options['position'], 'bottom-left'); ?>>
                            <?php _e('Bottom Left', 'chatbot-widget'); ?>
                        </option>
                        <option value="top-right" <?php selected($options['position'], 'top-right'); ?>>
                            <?php _e('Top Right', 'chatbot-widget'); ?>
                        </option>
                        <option value="top-left" <?php selected($options['position'], 'top-left'); ?>>
                            <?php _e('Top Left', 'chatbot-widget'); ?>
                        </option>
                    </select>
                    <p class="description">
                        <?php _e('Position of the floating widget on the screen. (Only effective if floating widget is enabled)', 'chatbot-widget'); ?>
                    </p>
                </td>
            </tr>
            
            <tr>
                <th scope="row">
                    <label for="floating_default_state"><?php _e('Default State', 'chatbot-widget'); ?></label>
                </th>
                <td>
                    <select id="floating_default_state" name="chatbot_widget_settings[floating_default_state]">
                        <option value="expanded" <?php selected($options['floating_default_state'], 'expanded'); ?>>
                            <?php _e('Expanded (Full Chat)', 'chatbot-widget'); ?>
                        </option>
                        <option value="collapsed" <?php selected($options['floating_default_state'], 'collapsed'); ?>>
                            <?php _e('Collapsed (Button Only)', 'chatbot-widget'); ?>
                        </option>
                    </select>
                    <p class="description">
                        <?php _e('Choose whether the floating chat appears fully expanded or as a compact button when visitors first load your site. (Only effective if floating widget is enabled)', 'chatbot-widget'); ?>
                    </p>
                </td>
            </tr>
            
            <tr>
                <th scope="row"><?php _e('Display On', 'chatbot-widget'); ?></th>
                <td>
                    <fieldset>
                        <label>
                            <input type="radio" 
                                   name="chatbot_widget_settings[enable_pages]" 
                                   value="all" 
                                   <?php checked($options['enable_pages'], 'all'); ?> />
                            <?php _e('All Pages', 'chatbot-widget'); ?>
                        </label><br>
                        
                        <label>
                            <input type="radio" 
                                   name="chatbot_widget_settings[enable_pages]" 
                                   value="home" 
                                   <?php checked($options['enable_pages'], 'home'); ?> />
                            <?php _e('Home Page Only', 'chatbot-widget'); ?>
                        </label><br>
                        
                        <label>
                            <input type="radio" 
                                   name="chatbot_widget_settings[enable_pages]" 
                                   value="specific" 
                                   <?php checked($options['enable_pages'], 'specific'); ?> />
                            <?php _e('Specific Pages', 'chatbot-widget'); ?>
                        </label>
                    </fieldset>
                </td>
            </tr>
            
            <tr class="specific-pages" <?php echo $options['enable_pages'] === 'specific' ? '' : 'style="display:none;"'; ?>>
                <th scope="row">
                    <label for="specific_pages"><?php _e('Page IDs', 'chatbot-widget'); ?></label>
                </th>
                <td>
                    <input type="text" 
                           id="specific_pages" 
                           name="chatbot_widget_settings[specific_pages]" 
                           value="<?php echo esc_attr($options['specific_pages']); ?>" 
                           class="regular-text" />
                    <p class="description">
                        <?php _e('Comma-separated list of page IDs (e.g., 1,2,3)', 'chatbot-widget'); ?>
                    </p>
                </td>
            </tr>
            
            <tr>
                <th scope="row">
                    <label for="container_selector"><?php _e('Custom Container', 'chatbot-widget'); ?></label>
                </th>
                <td>
                    <input type="text" 
                           id="container_selector" 
                           name="chatbot_widget_settings[container_selector]" 
                           value="<?php echo esc_attr($options['container_selector']); ?>" 
                           class="regular-text" 
                           placeholder="#my-chat-container" />
                    <p class="description">
                        <?php _e('CSS selector for custom widget placement (overrides floating mode).', 'chatbot-widget'); ?>
                    </p>
                </td>
            </tr>
        </table>
        
        <?php submit_button(); ?>
    </form>
    
    <div class="chatbot-widget-help">
        <h2><?php _e('Usage', 'chatbot-widget'); ?></h2>
        
        <h3><?php _e('Shortcode', 'chatbot-widget'); ?></h3>
        <p><?php _e('Place the chatbot anywhere in your content:', 'chatbot-widget'); ?></p>
        <code>[chatbot_widget]</code>
        
        <p><?php _e('With custom parameters:', 'chatbot-widget'); ?></p>
        <code>[chatbot_widget height="500px" width="400px" theme="dark" locale="es"]</code>
        
        <h3><?php _e('PHP Function', 'chatbot-widget'); ?></h3>
        <p><?php _e('For theme developers:', 'chatbot-widget'); ?></p>
        <code>&lt;?php echo do_shortcode('[chatbot_widget]'); ?&gt;</code>
        
        <h3><?php _e('JavaScript API', 'chatbot-widget'); ?></h3>
        <p><?php _e('Programmatic control:', 'chatbot-widget'); ?></p>
        <pre><code>// Send a message
ChatbotWidget.send('Hello!');

// Unmount the widget
ChatbotWidget.unmount();

// Re-initialize with new config
ChatbotWidget.init({
    theme: 'dark',
    locale: 'fr'
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