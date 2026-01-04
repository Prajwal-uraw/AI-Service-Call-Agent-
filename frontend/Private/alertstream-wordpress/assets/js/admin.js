jQuery(document).ready(function($) {
    
    // Test connection button
    $('#test-connection').on('click', function(e) {
        e.preventDefault();
        
        var $button = $(this);
        var originalText = $button.text();
        
        $button.text('Testing...').prop('disabled', true);
        
        $.ajax({
            url: alertstream_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'alertstream_test_connection',
                nonce: alertstream_ajax.nonce
            },
            success: function(response) {
                if (response.success) {
                    $('#alertstream-status').html(
                        '<div class="notice notice-success inline"><p>' + 
                        response.data.message + 
                        '</p></div>'
                    );
                } else {
                    $('#alertstream-status').html(
                        '<div class="notice notice-error inline"><p>' + 
                        response.data.message + 
                        '</p></div>'
                    );
                }
            },
            error: function() {
                $('#alertstream-status').html(
                    '<div class="notice notice-error inline"><p>' + 
                    'Connection test failed. Please check your API key and try again.' + 
                    '</p></div>'
                );
            },
            complete: function() {
                $button.text(originalText).prop('disabled', false);
            }
        });
    });
    
    // Auto-test on settings save
    $('form').on('submit', function() {
        var apiKey = $('#api_key').val();
        if (apiKey) {
            setTimeout(function() {
                $('#test-connection').trigger('click');
            }, 1000);
        }
    });
    
    // Load initial status
    $('#test-connection').trigger('click');
});
