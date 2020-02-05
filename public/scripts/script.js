// All scripts go inside this function
$(function () {

    // Sends post request for favorite button without refreshing page
    $('body').on("submit", ".favorite-form", function(event) {
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
        });
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
    
    
    // ----------------- USER SETTINGS VALIDATION & FEEDBACK -------------------
    
    // Tracks the validity of input fields
    let validInputs = {
        profilePicture: true,
        profileVisibility: true,
        email: true,
        password: true
    };
    
    // Determines if user is allowed to submit settings depending on validation
    // of input fields (tracked in validInputs object)
    const allowSubmit = function(validInputs) {
        if (
            validInputs.profilePicture &&
            validInputs.profileVisibility &&
            validInputs.email &&
            validInputs.password
        ) return true;
        else return false;
    };

    
    // Clears image URL input field (and makes it unrequired) if image file field is nonempty
    // and vice versa.
    $('body').on('change', 'input[name=image], input[name=imageURL]', function(event) {
        let $inputs = $('input[name=image],input[name=imageURL]'),
            fileRef = $(this)[0].files,
            fileTypes = ['image/png', 'image/gif', 'image/jpeg', 'image/jpg'],
            submitBtn = $('#settings-submit'),
            validFileExists = (fileRef && fileRef[0] && fileRef[0].type && fileTypes.includes(fileRef[0].type)) ? true : false;
        

        if ($(this).parents(".new-form").length) {
            $inputs.not(this).prop('required', !this.value.length);            
        }
        $inputs.not(this).prop('disabled', this.value.length);
        $inputs.not(this).val('');

        if ($(this).val() && fileRef && !validFileExists){
            $(this).addClass('is-invalid');
            if (submitBtn.length) {
                validInputs.profilePicture = false;
                submitBtn.prop('disabled', !allowSubmit(validInputs));                
            }
        } else {
            $(this).removeClass('is-invalid');
            if (submitBtn.length) {
                validInputs.profilePicture = true;
                submitBtn.prop('disabled', !allowSubmit(validInputs));   
            }
        }
    });
    
    // Update custom file label when file input changes
    $('body').on('change', 'input[name=image]', function(event) {
        let customLabel = $(this).siblings('.custom-file-label');        
        if (this.value) {
            customLabel.html(($(this)[0].files[0].name));
        } else {
            customLabel.html('Choose file');
        }
    });
    
    // Ensure value change triggers on reset
    $('body').on('click', 'button[type=reset]', function(event) {
        $('input[type=password]').val('');
        $('input[type=email]').val('');
        $('input').not('input[type=radio]').change();
        $('input[checked]').change();
    });
    
    // Update setting status for profileVisibility setting
    $('#settings-content').on('change', 'input[name=profileVisibility]', function(event) {
        let settingStatus = $(this).parents(".card").find(".setting-status");
        let label = $(this).siblings("label");
        let defaultVal = $('input[name=profileVisibility][checked]')[0].value;
        if ($(this).val() !== defaultVal) settingStatus.addClass("text-success");
        else settingStatus.removeClass("text-success");
        settingStatus.html(label.html());
    });

    
    // Ensures that all password fields are required if any is nonempty
    $('#settings-content').on('change', 'input[type=password]', function(event) {
        let passwords = $('#settings-content input[type=password]');
        let settingStatus = $(this).parents(".card").find(".setting-status");
        let submitBtn = $('#settings-submit');
        let allRequired = false;
        let allValued = true;

        passwords.each(function() {
            if ($(this).val().length) {
                allRequired = true;
                passwords.prop('required', true);
            } else { allValued = false }
        });
        if (!allRequired) {
            passwords.prop('required', false);
        }
        
        if (allValued) {settingStatus.html('Change password now')}
        else {settingStatus.html(settingStatus.attr("data-default"))}
        
        if (
            $('#current-password').val() &&
            $('#current-password').val() === $('#new-password').val()
            ) {
                settingStatus.removeClass('text-success').addClass('text-danger');
                $("#new-password").addClass('is-invalid');
                passwords.not("#new-password").removeClass('is-invalid');
                validInputs.password = false;
                submitBtn.prop('disabled', !allowSubmit(validInputs));
        } else if (allValued && ($('#new-password').val() === $('#confirm-password').val())) {
            settingStatus.addClass('text-success').removeClass('text-danger');
            passwords.removeClass('is-invalid');
            validInputs.password = true;
            submitBtn.prop('disabled', !allowSubmit(validInputs));
        } else if (allValued) {
            settingStatus.removeClass('text-success').addClass('text-danger');
            $("#confirm-password").addClass('is-invalid');
            passwords.not("#confirm-password").removeClass('is-invalid');
            validInputs.password = false;
            submitBtn.prop('disabled', !allowSubmit(validInputs));
        } else {
            settingStatus.removeClass('text-danger text-success');
            passwords.removeClass('is-invalid');
            validInputs.password = true;
            submitBtn.prop('disabled', !allowSubmit(validInputs));
        }
    });

    // Handles validation and feedback for user EMAIL input
    $('#settings-content').on('change', 'input[type=email]', function(event) {
        let emails = $('#settings-content input[type=email]'),
            settingStatus = $(this).parents(".card").find(".setting-status"),
            submitBtn = $('#settings-submit'),
            allRequired = false,
            allValued = true;
            
        // Ensures that all email fields are required if any is nonempty
        emails.each(function() {
            if ($(this).val().length) {
                allRequired = true;
                emails.prop('required', true);
            } else {
                allValued = false;
            }
        });
        if (!allRequired) {
            emails.prop('required', false);
        }
        
        if (allValued) {settingStatus.html(emails.get(0).value)}
        else {settingStatus.html(settingStatus.attr("data-default"))}
        
        if (allValued && (emails.get(0).value !== emails.get(1).value)) {
            emails.addClass('is-invalid');
            settingStatus.removeClass('text-success').addClass('text-danger');
            validInputs.email = false;
            submitBtn.prop('disabled', !allowSubmit(validInputs));
        } else if (allValued) {
            emails.removeClass('is-invalid');
            settingStatus.removeClass('text-danger').addClass('text-success');
            validInputs.email = true;
            submitBtn.prop('disabled', !allowSubmit(validInputs));
        } else {
            emails.removeClass('is-invalid');
            settingStatus.removeClass('text-success text-danger');
            validInputs.email = true;
            submitBtn.prop('disabled', !allowSubmit(validInputs));
        }
    });

    // Handles user-settings form submission
    $('#settings-content').on('submit', '#settings-form', function(event) {
        event.preventDefault();        
        let actionURL = $(this).attr("action");
        $.post(actionURL, $(this).serialize(), function(data) {
            if (data.errorField && data.errorField === 'password') {
                $("#current-password").addClass('is-invalid');
                $("#password-settings-header .setting-status")
                    .removeClass("text-success")
                    .addClass("text-danger");
                validInputs.password = false;
                $('#settings-submit').prop('disabled', !allowSubmit(validInputs));
            } else {
                $('#settings-content').html($.parseHTML(data));
                $('#settings-success').removeClass('d-none');
            }
        });
    });
});
