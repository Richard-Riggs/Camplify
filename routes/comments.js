//======================= MODULES =======================

const express = require("express"),
      router  = express.Router(),
      Campground = require("../models/campground"),
      Comment = require("../models/comment"),
      middleware = require("../middleware");

// ------------------ Comments Routes --------------------

router.route('/campgrounds/:id/comments/new')                             // New
    .get(middleware.isLoggedIn, (req, res) => {
        Campground.findById(req.params.id, (error, campground) => {
            if (error) {
                req.flash('error', `Error: ${error.message}.`);
                res.redirect(`/campgrounds`);
            }
            else {
                res.render('comments/new', {campground: campground});
            }
        });
    });


router.route('/campgrounds/:id/comments')
    .post(middleware.isLoggedIn, (req, res) => {                                  // Create
        
        // Lookup campground using ID
        Campground.findById(req.params.id, (error, campground) => {
            if (error) {
                req.flash('error', `Error: ${error.message}.`);
                res.redirect('/campgrounds');
            }
            else {
                
                // Create new comment document
                Comment.create(req.body.comment, (error, comment) => {
                    if (error) {
                        req.flash('error', `Error: ${error.message}.`);
                        res.redirect('back');
                    }
                    else {
                        
                        // Add username and ID to comment
                        comment.author.id = req.user._id;
                        comment.author.username = req.user.username;
                        comment.save();
                        
                        // Associate new comment with campground                    
                        campground.comments.push(comment);
                        campground.save();
                        
                        // Redirect to campground show page                        
                        res.redirect(`/campgrounds/${campground._id}`);
                    }
                });
            }
        });
    });


// EDIT COMMENT ROUTE
router.get("/campgrounds/:id/comments/:comment_id/edit",
           [middleware.isLoggedIn, middleware.checkCommentOwnership],
           function(req, res) {
    
    // Lookup Campground by ID
    Campground.findById(req.params.id, function(error, campground) {
        
        // Handle errors
        if (error) {
            req.flash('error', `Error: ${error.message}.`);
            res.redirect('/campgrounds/');
        }
        else {
            
            // Lookup Comment by ID
            Comment.findById(req.params.comment_id, function(error, comment) {
                if (error) {
                    req.flash('error', `Error: ${error.message}.`);
                    res.redirect(`/campgrounds/${req.params.id}`);
                }
                else {
                    
                    // Send campground and comment document data to template
                    res.render('comments/edit', {
                        campground: campground,
                        comment: comment
                    });
                }
            });
        }
    });
});


// UPDATE COMMENT ROUTE
router.put("/campgrounds/:id/comments/:comment_id",
           [middleware.isLoggedIn, middleware.checkCommentOwnership],
           function(req, res) {
    
    // Lookup comment by ID and update with data from request
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(error, comment) {
        
        // Redirect back to form if there's an error updating comment
        if (error) {
            req.flash('error', `Error: ${error.message}.`);
            res.redirect('back');
        }
        else {
            
            // Redirect to campground show page after successful comment update
            res.redirect(`/campgrounds/${req.params.id}`);
        }
    });
});


// DESTROY COMMENT ROUTE
router.delete('/campgrounds/:id/comments/:comment_id',
              [middleware.isLoggedIn, middleware.checkCommentOwnership],
              function(req, res) {
    
    // Lookup comment by ID and delete
    Comment.findByIdAndDelete(req.params.comment_id, function(error) {
        if (error) {
            req.flash('error', `Error: ${error.message}.`);
        }
        else {
            req.flash('success', 'Comment has been deleted')
        }
        
        // Redirect to campground show page after successful comment deletion
        res.redirect(`/campgrounds/${req.params.id}`);
    });
});


module.exports = router;