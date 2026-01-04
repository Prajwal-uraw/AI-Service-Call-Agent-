<?php
namespace AlertStream;

class Events {
    
    private $api;
    private $settings;
    
    public function __construct() {
        $this->api = new API();
        $this->settings = new Settings();
    }
    
    public function handle_cf7_submission($contact_form) {
        $submission = \WPCF7_Submission::get_instance();
        
        if (!$submission) {
            return;
        }
        
        $posted_data = $submission->get_posted_data();
        $form_id = $contact_form->id();
        $form_title = $contact_form->title();
        
        // Prepare metadata
        $metadata = [
            'form_id' => $form_id,
            'form_title' => $form_title,
            'fields' => $this->sanitize_form_data($posted_data),
            'page_url' => $this->get_current_url(),
            'submission_time' => current_time('mysql')
        ];
        
        $this->send_event('form_submit', $metadata);
        
        $this->log_event('Contact Form 7 submission', $form_id);
    }
    
    public function handle_wpforms_submission($fields, $entry, $form_data, $entry_id) {
        // Prepare metadata
        $metadata = [
            'form_id' => $form_data['id'],
            'form_title' => $form_data['settings']['form_title'],
            'fields' => $this->sanitize_wpforms_fields($fields),
            'page_url' => $this->get_current_url(),
            'entry_id' => $entry_id
        ];
        
        $this->send_event('form_submit', $metadata);
        
        $this->log_event('WPForms submission', $form_data['id']);
    }
    
    public function handle_woocommerce_order($order_id, $order) {
        // Prepare metadata
        $metadata = [
            'order_id' => $order_id,
            'total' => $order->get_total(),
            'currency' => $order->get_currency(),
            'item_count' => $order->get_item_count(),
            'customer_email' => $order->get_billing_email(),
            'customer_name' => $order->get_billing_first_name() . ' ' . $order->get_billing_last_name(),
            'payment_method' => $order->get_payment_method_title()
        ];
        
        $this->send_event('order_created', $metadata);
        
        $this->log_event('WooCommerce order', $order_id);
    }
    
    public function handle_user_registration($user_id) {
        $user = get_userdata($user_id);
        
        if (!$user) {
            return;
        }
        
        // Prepare metadata
        $metadata = [
            'user_id' => $user_id,
            'email' => $user->user_email,
            'username' => $user->user_login,
            'display_name' => $user->display_name,
            'registration_date' => $user->user_registered,
            'roles' => $user->roles
        ];
        
        $this->send_event('user_signup', $metadata);
        
        $this->log_event('User registration', $user_id);
    }
    
    private function send_event($event_type, $metadata) {
        $payload = [
            'event_type' => $event_type,
            'site_id' => $this->settings->get_site_id(),
            'timestamp' => current_time('c'), // ISO 8601
            'metadata' => $metadata
        ];
        
        // Send asynchronously to avoid blocking
        $this->api->send_async($payload);
    }
    
    private function sanitize_form_data($data) {
        $sanitized = [];
        
        foreach ($data as $key => $value) {
            // Skip CF7 internal fields
            if (strpos($key, '_wpcf7') === 0) {
                continue;
            }
            
            // Sanitize field name
            $field_name = sanitize_key(str_replace(['your-', 'cf7-'], '', $key));
            
            // Sanitize field value
            if (is_array($value)) {
                $sanitized[$field_name] = array_map('sanitize_text_field', $value);
            } else {
                $sanitized[$field_name] = sanitize_text_field($value);
            }
        }
        
        return $sanitized;
    }
    
    private function sanitize_wpforms_fields($fields) {
        $sanitized = [];
        
        foreach ($fields as $field) {
            if (empty($field['name'])) {
                continue;
            }
            
            $field_name = sanitize_key($field['name']);
            $sanitized[$field_name] = sanitize_text_field($field['value']);
        }
        
        return $sanitized;
    }
    
    private function get_current_url() {
        return (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") 
               . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
    }
    
    private function log_event($event_name, $id) {
        if ($this->settings->get_option('debug_mode') === '1') {
            error_log(sprintf(
                '[AlertStream] %s: %s (ID: %d)',
                $event_name,
                current_time('mysql'),
                $id
            ));
        }
    }
}
