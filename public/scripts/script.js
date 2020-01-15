$(function () {
    // All scripts go inside this function
    $('.favorite-form').submit(function(event) {
        event.preventDefault();
        let $form = $(this),
            url = $form.attr( "action" );
        alert("Would post " + url);
    });

});
