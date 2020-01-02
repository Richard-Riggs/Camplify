// MODULES
const Campground = require("../models/campground"),
      Comment    = require("../models/comment");

// Pass user object to response templates
module.exports.passUserObjectToTemplate = function(req, res, next){
    res.locals.currentUser = req.user;
    next();
};


// Pass flash messages to response templates
module.exports.passFlashMessageToTemplate = function(req, res, next){
    res.locals.error   = req.flash('error');
    res.locals.warning = req.flash('warning');
    res.locals.success = req.flash('success');
    next();
};

// Check if user is logged in
module.exports.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('warning', 'Please log in to continue')
    res.redirect('/login');
};


// Check if user is logged out (required for login and register routes)
module.exports.isLoggedOut = function(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    req.flash('warning', 'Please log out to register or log in another user.');
    res.redirect('/campgrounds');
};


// Check if user is authorized to modify campground
module.exports.checkCampgroundOwnership = function(req, res, next) {
    Campground.findById(req.params.id, function(error, campground) {
        if (error) {
            req.flash('error', `Error: ${error.message}.`);
            res.redirect('/campgrounds');
        }
        else {
            if (campground.author.id.equals(req.user._id)) {
                next();
            }
            else {
                req.flash('error', 'Error: you are not authorized to modify this campground.');
                res.redirect(`/campgrounds/${req.params.id}`);
            }
        }
    });
};


// Check if user is authorized to modify comment
module.exports.checkCommentOwnership = function(req, res, next) {
    
    // Lookup comment by id
    Comment.findById(req.params.comment_id, function(error, comment) {
        
        // Redirect to campgrounds page if there's an error
        if (error) {
            req.flash('error', `Error: ${error.message}.`);
            res.redirect('/campgrounds');
        }
        else {
            
            // Continue routing if user's id matches the comment author's id
            if (comment.author.id.equals(req.user._id)) {
                next();
            }

            // Redirect back if there's no match
            else {
                req.flash('error', 'Error: you are not authorized to modify this comment.');
                res.redirect(`/campgrounds/${req.params.id}`);
            }
        }
    });
};
