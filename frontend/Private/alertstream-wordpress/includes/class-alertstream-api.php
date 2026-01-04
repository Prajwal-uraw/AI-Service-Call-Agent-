<?php
namespace AlertStream;

class API {
    
    private $api_url;
    private $settings;
    private $logger;
    
    public function __construct() {
        $this->api_url = defined('ALERTSTREAM_API_URL') ? ALERTSTREAM_API_URL : 'https://engine.alertstream.com/api/v1/ingest';
        $this->settings = new Settings();
        $this->logger = new Logger();
    }
    
    public function send($payload) {
        $api_key = $this->settings->get_option('api_key');
        
        if (empty($api_key)) {
            $this->logger->log('API key not configured');
            return false;
        }
        
        // Generate HMAC signature
        $timestamp = time();
        $message = json_encode($payload) . ':' . $timestamp;
        $signature = hash_hmac('sha256', $message, $api_key);
        
        // Prepare headers
        $headers = [
            'Content-Type' => 'application/json',
            'X-API-Key' => $api_key,
            'X-Signature' => $signature,
            'X-Timestamp' => $timestamp,
            'User-Agent' => 'AlertStream-WordPress/' . ALERTSTREAM_VERSION
        ];
        
        // Make request
        $response = wp_remote_post($this->api_url, [
            'method' => 'POST',
            'timeout' => 5,
            'redirection' => 5,
            'httpversion' => '1.1',
            'blocking' => true,
            'headers' => $headers,
            'body' => json_encode($payload),
            'data_format' => 'body'
        ]);
        
        // Handle response
        if (is_wp_error($response)) {
            $this->logger->log('API request failed: ' . $response->get_error_message());
            return false;
        }
        
        $status_code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        
        if ($status_code >= 200 && $status_code < 300) {
            $this->logger->log('Event sent successfully: ' . $payload['event_type']);
            return true;
        } else {
            $this->logger->log('API error ' . $status_code . ': ' . $body);
            return false;
        }
    }
    
    public function send_async($payload) {
        // Schedule async send to avoid blocking
        $job_id = wp_schedule_single_event(
            time() + 1, // 1 second delay
            'alertstream_send_async_event',
            [$payload]
        );
        
        if ($job_id === false) {
            // Fallback to immediate send if scheduling fails
            return $this->send($payload);
        }
        
        return true;
    }
    
    public function test_connection() {
        $test_payload = [
            'event_type' => 'test',
            'site_id' => $this->settings->get_site_id(),
            'timestamp' => current_time('c'),
            'metadata' => [
                'test' => true,
                'site_url' => home_url(),
                'wordpress_version' => get_bloginfo('version')
            ]
        ];
        
        return $this->send($test_payload);
    }
    
    public function get_api_url() {
        return $this->api_url;
    }
}

// Handle async sends
add_action('alertstream_send_async_event', function($payload) {
    $api = new API();
    $api->send($payload);
});
