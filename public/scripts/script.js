// All scripts go inside this function
$(function () {

    // Sends post request for favorite button without refreshing page
    $('body').on("submit", ".favorite-form", function(event) {
        console.log('reached');
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
    
    // Adds functionality for back button
    $('body').on('click', '.back-button', function(event) {
        window.history.back();
    });
    
    // Clears image URL input field (and makes it unrequired) if image file field is nonempty
    // and vice versa.
    $('body').on('change', 'input[name=image], input[name=imageURL]', function(event) {
        let $inputs = $('input[name=image],input[name=imageURL]');
        if ($(this).parents(".new-form").length) {
            $inputs.not(this).prop('required', !this.value.length);            
        }
        $inputs.not(this).prop('disabled', this.value.length);
        $inputs.not(this).val('');
    });

    // USER PROFILE
    
    const URLpath = window.location.pathname;

    // Activates user profile functionality if user-tabs-list element exists
    if ($('#user-tabs-list .active').length) {
        let currentTab = $('#user-tabs-list .active')[0].id,
            currentContent = $(`#${currentTab}`)[0].hash,
            currentPage = 1;
            
        // Populate content for active tab on page load
        $.get(URLpath, {tab: currentTab, update: true}).done(function(htmlData) {
            $(currentContent).html($.parseHTML(htmlData));
        });
                
        // Populate content for clicked tab, set page to 1
        $('#user-tabs-list a').on('click', function (event) {
            currentTab = event.target.id,
            currentContent = event.target.hash,
            currentPage = 1;
            $.get(URLpath, {
                currentPage: currentPage,
                tab: currentTab,
                update: true
            }).done(function(htmlData) {
                $(currentContent).html(htmlData);
            });
            return true;
        });
        
        // Handles pagination for user profile tabs
        $('body').on("click", ".page-navigation li:not(.disabled):not(.active) a", function(event) {
            console.log(event.target.attributes["data-page-number"].value);
            currentPage = Number(event.target.attributes["data-page-number"].value);
            $.get(URLpath, {
                currentPage: currentPage,
                tab: currentTab.id,
                update: true
            }).done(function(htmlData) {
                    $(currentContent).html(htmlData);
            });
            return true;
        });            
    }




});
