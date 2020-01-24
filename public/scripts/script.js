// All scripts go inside this function
$(function () {

    // Sends post request for favorite button without refreshing page
    $('.favorite-form').submit(function(event) {
        event.preventDefault();
        let form = $(this),
            url = form.attr( "action" ),
            button = form.children('.favorite-btn'),
            count = form.find('.count'),
            countVal = Number(count.text()),
            statusRequest;
        if (button.hasClass('unfavorited')) {
            statusRequest = 'favorite';
        } else if (button.hasClass('favorited')) {
            statusRequest = 'unfavorite';
        }
        $.post(url, {statusRequest: statusRequest})
            .done(function(data) {
                if (data['result'] === "favorited") {
                    button.removeClass('unfavorited');
                    button.addClass('favorited');
                    count.text(countVal + 1);
                } else if (data['result'] === "unfavorited") {
                    button.removeClass('favorited');
                    button.addClass('unfavorited');
                    count.text(countVal - 1);
                } else {
                    $('#login-modal').modal('show');
                }
        })
    });
    
    // Handles logins through the login modal
    // Shows an error message if there's an error, refreshes page if login is successful
    $('#login-modal').find('form').submit(function (event) {
        event.preventDefault();
        $('#login-modal-error-msg').html('');
        let form = $(this),
            url = form.attr("action");
        $.post(url, form.serialize(), function(data) {
            if (data['errorMsg']) {
                $('#login-modal-error-msg').html(data['errorMsg']);
            } 
            else {
                window.location.href = window.location['href'];
            }
        });
    });
    
    // Removes error message from login modal when closed
    $('#login-modal').on('hidden.bs.modal', function(event) {
        $('#login-modal-error-msg').html('');
        return true;
    });

    // USER PROFILE
    
    const URLpath = window.location.pathname;
    
    // Populate content for active tab on page load
    let currentTab = $('#user-tabs-list .active')[0];
    console.log(currentTab.id);
    if (currentTab) {
        $.get(URLpath, {tabID: currentTab.id, update: true}).done(function(htmlData) {
            $(currentTab.hash).html($.parseHTML(htmlData));
        });
    }

    // Populate content for clicked tab
    $('#user-tabs-list a').on('click', function (event) {
        let tabID = event.target.id;
        let contentID = event.target.hash;
        $.get(URLpath, {tabID: tabID, update: true}).done(function(htmlData) {
            $(contentID).html(htmlData);
        });
        return true;
    });
});
