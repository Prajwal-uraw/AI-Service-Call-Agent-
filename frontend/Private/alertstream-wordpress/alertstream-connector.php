<?php
/**
 * Plugin Name: AlertStream Connector
 * Plugin URI: https://alertstream.com
 * Description: Send WordPress events to AlertStream for SMS notifications
 * Version: 1.0.0
 * Author: AlertStream
 * License: GPL v2 or later
 * Text Domain: alertstream-connector
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('ALERTSTREAM_VERSION', '1.0.0');
define('ALERTSTREAM_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('ALERTSTREAM_PLUGIN_URL', plugin_dir_url(__FILE__));
define('ALERTSTREAM_API_URL', 'https://engine.alertstream.com/api/v1/ingest');

// Auto-loader for classes
spl_autoload_register(function ($class) {
    $prefix = 'AlertStream\\';
    $base_dir = ALERTSTREAM_PLUGIN_DIR . 'includes/';
    
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }
    
    $relative_class = substr($class, $len);
    $file = $base_dir . 'class-' . str_replace('_', '-', strtolower($relative_class)) . '.php';
    
    if (file_exists($file)) {
        require $file;
    }
});

// Initialize plugin
class AlertStreamConnector {
    
    private static $instance = null;
    private $settings;
    private $events;
    private $api;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        $this->includes();
        $this->init();
    }
    
    private function includes() {
        require_once ALERTSTREAM_PLUGIN_DIR . 'includes/class-alertstream-settings.php';
        require_once ALERTSTREAM_PLUGIN_DIR . 'includes/class-alertstream-events.php';
        require_once ALERTSTREAM_PLUGIN_DIR . 'includes/class-alertstream-api.php';
        require_once ALERTSTREAM_PLUGIN_DIR . 'includes/class-alertstream-logger.php';
    }
    
    private function init() {
        $this->settings = new AlertStream\Settings();
        $this->events = new AlertStream\Events();
        $this->api = new AlertStream\API();
        
        // Register hooks
        add_action('plugins_loaded', [$this, 'load_textdomain']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_scripts']);
        add_action('admin_menu', [$this->settings, 'add_admin_menu']);
        add_action('admin_init', [$this->settings, 'init_settings']);
        
        // Register event hooks
        $this->register_event_hooks();
    }
    
    public function load_textdomain() {
        load_plugin_textdomain(
            'alertstream-connector',
            false,
            dirname(plugin_basename(__FILE__)) . '/languages'
        );
    }
    
    public function enqueue_admin_scripts($hook) {
        if ('settings_page_alertstream-settings' !== $hook) {
            return;
        }
        
        wp_enqueue_script(
            'alertstream-admin',
            ALERTSTREAM_PLUGIN_URL . 'assets/js/admin.js',
            ['jquery'],
            ALERTSTREAM_VERSION,
            true
        );
        
        wp_localize_script('alertstream-admin', 'alertstream_ajax', [
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('alertstream_ajax_nonce')
        ]);
    }
    
    private function register_event_hooks() {
        // Contact Form 7
        if ($this->settings->get_option('enable_cf7')) {
            add_action('wpcf7_mail_sent', [$this->events, 'handle_cf7_submission']);
        }
        
        // WPForms
        if ($this->settings->get_option('enable_wpforms')) {
            add_action('wpforms_process_complete', [$this->events, 'handle_wpforms_submission'], 10, 4);
        }
        
        // WooCommerce
        if ($this->settings->get_option('enable_woocommerce') && class_exists('WooCommerce')) {
            add_action('woocommerce_new_order', [$this->events, 'handle_woocommerce_order'], 10, 2);
        }
        
        // User Registration
        if ($this->settings->get_option('enable_user_registration')) {
            add_action('user_register', [$this->events, 'handle_user_registration'], 10, 1);
        }
    }
    
    public function test_connection() {
        return $this->api->test_connection();
    }
}

// Initialize plugin
function alertstream_connector() {
    return AlertStreamConnector::get_instance();
}

// Start the plugin
add_action('plugins_loaded', 'alertstream_connector');

// Activation hook
register_activation_hook(__FILE__, function() {
    require_once ALERTSTREAM_PLUGIN_DIR . 'includes/class-alertstream-settings.php';
    AlertStream\Settings::activate();
});

// Deactivation hook
register_deactivation_hook(__FILE__, function() {
    // Clear any scheduled tasks
    wp_clear_scheduled_hook('alertstream_send_queued_events');
});

// Add AJAX handler for test connection
add_action('wp_ajax_alertstream_test_connection', function() {
    check_ajax_referer('alertstream_ajax_nonce', 'nonce');
    
    if (!current_user_can('manage_options')) {
        wp_die('Unauthorized');
    }
    
    $alertstream = alertstream_connector();
    $result = $alertstream->test_connection();
    
    if ($result) {
        wp_send_json_success([
            'message' => __('✅ Connection successful! Your AlertStream integration is working.', 'alertstream-connector')
        ]);
    } else {
        wp_send_json_error([
            'message' => __('❌ Connection failed. Please check your API key and try again.', 'alertstream-connector')
        ]);
    }
});
