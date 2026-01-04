<?php
namespace AlertStream;

class Settings {
    
    private $options;
    private $page_slug = 'alertstream-settings';
    
    public function __construct() {
        $this->options = get_option('alertstream_settings', []);
    }
    
    public static function activate() {
        // Generate a unique site ID if not exists
        if (!get_option('alertstream_site_id')) {
            $site_id = wp_generate_uuid4();
            update_option('alertstream_site_id', $site_id);
        }
        
        // Default settings
        $defaults = [
            'api_key' => '',
            'enable_cf7' => '1',
            'enable_wpforms' => '1',
            'enable_woocommerce' => '1',
            'enable_user_registration' => '1',
            'debug_mode' => '0'
        ];
        
        if (!get_option('alertstream_settings')) {
            add_option('alertstream_settings', $defaults);
        }
    }
    
    public function add_admin_menu() {
        add_options_page(
            __('AlertStream Settings', 'alertstream-connector'),
            __('AlertStream', 'alertstream-connector'),
            'manage_options',
            $this->page_slug,
            [$this, 'render_settings_page']
        );
    }
    
    public function init_settings() {
        register_setting(
            'alertstream_settings_group',
            'alertstream_settings',
            [$this, 'sanitize_settings']
        );
        
        // API Settings Section
        add_settings_section(
            'alertstream_api_section',
            __('API Configuration', 'alertstream-connector'),
            [$this, 'render_api_section'],
            $this->page_slug
        );
        
        add_settings_field(
            'api_key',
            __('API Key', 'alertstream-connector'),
            [$this, 'render_api_key_field'],
            $this->page_slug,
            'alertstream_api_section'
        );
        
        // Event Types Section
        add_settings_section(
            'alertstream_events_section',
            __('Event Types to Monitor', 'alertstream-connector'),
            [$this, 'render_events_section'],
            $this->page_slug
        );
        
        $event_fields = [
            'enable_cf7' => __('Contact Form 7 Submissions', 'alertstream-connector'),
            'enable_wpforms' => __('WPForms Submissions', 'alertstream-connector'),
            'enable_woocommerce' => __('WooCommerce New Orders', 'alertstream-connector'),
            'enable_user_registration' => __('New User Registrations', 'alertstream-connector')
        ];
        
        foreach ($event_fields as $key => $label) {
            add_settings_field(
                $key,
                $label,
                [$this, 'render_checkbox_field'],
                $this->page_slug,
                'alertstream_events_section',
                ['key' => $key, 'label' => $label]
            );
        }
        
        // Debug Section
        add_settings_section(
            'alertstream_debug_section',
            __('Debug & Testing', 'alertstream-connector'),
            [$this, 'render_debug_section'],
            $this->page_slug
        );
        
        add_settings_field(
            'debug_mode',
            __('Enable Debug Logging', 'alertstream-connector'),
            [$this, 'render_checkbox_field'],
            $this->page_slug,
            'alertstream_debug_section',
            ['key' => 'debug_mode', 'label' => __('Log all events to WordPress debug log', 'alertstream-connector')]
        );
    }
    
    public function render_settings_page() {
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to access this page.'));
        }
        
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            
            <div class="card">
                <h2><?php _e('Connection Status', 'alertstream-connector'); ?></h2>
                <div id="alertstream-status">
                    <p><?php _e('Checking connection...', 'alertstream-connector'); ?></p>
                </div>
                <p>
                    <button type="button" id="test-connection" class="button button-secondary">
                        <?php _e('Test Connection', 'alertstream-connector'); ?>
                    </button>
                </p>
            </div>
            
            <form action="options.php" method="post">
                <?php
                settings_fields('alertstream_settings_group');
                do_settings_sections($this->page_slug);
                submit_button(__('Save Settings', 'alertstream-connector'));
                ?>
            </form>
            
            <div class="card">
                <h2><?php _e('Site Information', 'alertstream-connector'); ?></h2>
                <table class="form-table">
                    <tr>
                        <th scope="row"><?php _e('Site ID', 'alertstream-connector'); ?></th>
                        <td>
                            <code><?php echo esc_html(get_option('alertstream_site_id')); ?></code>
                            <p class="description">
                                <?php _e('This unique identifier is used to associate events from your site.', 'alertstream-connector'); ?>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php _e('Site URL', 'alertstream-connector'); ?></th>
                        <td>
                            <code><?php echo esc_url(home_url()); ?></code>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
        <?php
    }
    
    public function render_api_section() {
        echo '<p>' . __('Enter your AlertStream API credentials below.', 'alertstream-connector') . '</p>';
    }
    
    public function render_api_key_field() {
        $api_key = isset($this->options['api_key']) ? $this->options['api_key'] : '';
        ?>
        <input type="password" 
               id="api_key" 
               name="alertstream_settings[api_key]" 
               value="<?php echo esc_attr($api_key); ?>" 
               class="regular-text"
               placeholder="<?php _e('Enter your API key', 'alertstream-connector'); ?>">
        <p class="description">
            <?php _e('Get your API key from your AlertStream dashboard.', 'alertstream-connector'); ?>
        </p>
        <?php
    }
    
    public function render_events_section() {
        echo '<p>' . __('Select which events should trigger SMS notifications.', 'alertstream-connector') . '</p>';
    }
    
    public function render_checkbox_field($args) {
        $key = $args['key'];
        $label = $args['label'];
        $checked = isset($this->options[$key]) ? $this->options[$key] : '0';
        ?>
        <label>
            <input type="checkbox" 
                   name="alertstream_settings[<?php echo esc_attr($key); ?>]" 
                   value="1" 
                   <?php checked('1', $checked); ?>>
            <?php echo esc_html($label); ?>
        </label>
        <?php
    }
    
    public function render_debug_section() {
        echo '<p>' . __('Debugging options for troubleshooting.', 'alertstream-connector') . '</p>';
    }
    
    public function sanitize_settings($input) {
        $sanitized = [];
        
        // Sanitize API key (alphanumeric only)
        if (isset($input['api_key'])) {
            $sanitized['api_key'] = sanitize_text_field($input['api_key']);
        }
        
        // Sanitize checkboxes
        $checkboxes = ['enable_cf7', 'enable_wpforms', 'enable_woocommerce', 'enable_user_registration', 'debug_mode'];
        foreach ($checkboxes as $checkbox) {
            $sanitized[$checkbox] = isset($input[$checkbox]) ? '1' : '0';
        }
        
        return $sanitized;
    }
    
    public function get_option($key, $default = '') {
        return isset($this->options[$key]) ? $this->options[$key] : $default;
    }
    
    public function get_site_id() {
        return get_option('alertstream_site_id');
    }
}
