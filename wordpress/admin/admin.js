jQuery(document).ready(function($) {
    // Initialize WordPress color picker
    $('.chatbot-color-picker').wpColorPicker({
        change: function(event, ui) {
            // Optional: Add any change handlers here
        },
        clear: function() {
            // Reset to default when cleared
            $(this).val('#eb4034').trigger('change');
        }
    });
    
    // Floating widget options are now always visible with disclaimers
    
    // Handle specific pages option visibility
    $('input[name="chatbot_widget_settings[enable_pages]"]').change(function() {
        if ($(this).val() === 'specific') {
            $('.specific-pages').show();
        } else {
            $('.specific-pages').hide();
        }
    });
    
    // Validate hex color input
    $('#theme_color').on('input', function() {
        var color = $(this).val();
        var isValidHex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
        
        if (color && !isValidHex) {
            $(this).addClass('invalid-color');
        } else {
            $(this).removeClass('invalid-color');
        }
    });
    
    // Character counter for greeting message
    function updateGreetingCharCount() {
        var text = $('#greeting_message').val();
        var length = text.length;
        var counter = $('#greeting-char-count');
        
        counter.text(length + '/150');
        
        if (length > 150) {
            counter.addClass('over-limit');
            $('#greeting_message').addClass('over-limit');
        } else if (length > 130) {
            counter.removeClass('over-limit').addClass('near-limit');
            $('#greeting_message').removeClass('over-limit');
        } else {
            counter.removeClass('over-limit near-limit');
            $('#greeting_message').removeClass('over-limit');
        }
    }
    
    // Initialize character count on page load
    updateGreetingCharCount();
    
    // Update character count on input
    $('#greeting_message').on('input keyup paste', updateGreetingCharCount);
});