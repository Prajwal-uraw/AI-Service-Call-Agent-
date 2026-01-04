<?php
namespace AlertStream;

class Logger {
    
    private $log_file;
    private $enabled;
    
    public function __construct() {
        $this->log_file = WP_CONTENT_DIR . '/alertstream.log';
        $this->enabled = defined('WP_DEBUG') && WP_DEBUG;
    }
    
    public function log($message, $data = null) {
        if (!$this->enabled) {
            return;
        }
        
        $timestamp = current_time('mysql');
        $log_entry = sprintf(
            "[%s] %s",
            $timestamp,
            $message
        );
        
        if ($data) {
            $log_entry .= PHP_EOL . 'Data: ' . print_r($data, true);
        }
        
        $log_entry .= PHP_EOL . str_repeat('-', 80) . PHP_EOL;
        
        // Write to file
        error_log($log_entry, 3, $this->log_file);
    }
    
    public function enable() {
        $this->enabled = true;
    }
    
    public function disable() {
        $this->enabled = false;
    }
}
