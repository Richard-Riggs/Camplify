//======================= MODULES =======================

const express = require("express"),
      router  = express.Router(),
      Campground = require("../models/campground"),
      Comment = require("../models/comment"),
      middleware = require("../middleware"),
      database = require("../lib/database"),
      ejsFunctions = require("../lib/ejsFunctions");

// ------------------ Comments Routes --------------------

// INDEX ROUTE
router.get('/campgrounds/:id/comments', (req, res) => {

    //let campground = await Campground.findById(req.params.id);
    Campground.findById(req.params.id, function(error, campground) {
        if (error) {
            req.flash('error', `Error: ${error.message}.`);
            res.redirect('/campgrounds');            
        } else {
            
            let perPage = 8;
            let pageQuery = parseInt(req.query.page);
            let pageNumber = pageQuery ? pageQuery : 1;            
            
            Comment
                .find({_id: {$in: campground.comments}})
                .sort({ createdAt: 'descending'})
                .skip((perPage * pageNumber) - perPage)
                .limit(perPage)
                .populate("author.id")
                .exec(function (error, comments) {
                    Comment.countDocuments({_id: {$in: campground.comments}}).exec(function (error, count) {
                        if (error) {
                            req.flash('error', `Error: ${error.message}.`);
                            res.redirect('/');
                        } else {
                            res.render("comments/index", {
                                campground: campground,
                                comments: comments,
                                current: pageNumber,
                                pages: Math.ceil(count / perPage),
                                queryString: ejsFunctions.queryString,
                            });
                        }
                    });
            });
        }
    });
});

// NEW COMMENT ROUTE
router.route('/campgrounds/:id/comments/new')
    .get([middleware.isLoggedIn, middleware.userAlreadyReviewed], (req, res) => {
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

// CREATE COMMENT ROUTE
router.route('/campgrounds/:id/comments')
    .post([middleware.isLoggedIn, middleware.userAlreadyReviewed], (req, res) => {
        
        // Lookup campground using ID
        Campground.findById(req.params.id, (error, campground) => {
            if (error) {
                req.flash('error', `Error: ${error.message}.`);
                res.redirect('/campgrounds');
            } else {
                
                // Create new comment document
                Comment.create(req.body.comment, (error, comment) => {
                    if (error) {
                        req.flash('error', `Error: ${error.message}.`);
                        res.redirect('back');
                    } else {

                        // Add username and ID to comment
                        comment.author.id = req.user._id;
                        comment.author.username = req.user.username;
                        comment.createdAt = Date();
                        comment.campground = campground._id;
                        comment.save();

                        // Associate new comment with campground                    
                        campground.comments.push(comment);
                        campground.averageRating = database.addRating(campground, comment);
                        campground.commentCount = campground.comments.length;
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
               
    Campground.findById(req.params.id, function(error, campground) {
        if (error) {
            req.flash('error', `Error: ${error.message}.`);
            res.redirect('/campgrounds/');
        } else {
            
            Comment.findById(req.params.comment_id, function(error, comment) {
                if (error) {
                    req.flash('error', `Error: ${error.message}.`);
                    res.redirect('back');
                } else {
                    campground.averageRating = database.updateRating(campground, comment, Number(req.body.comment.rating));
                    campground.save();
                    comment.text = req.body.comment.text;
                    comment.rating = req.body.comment.rating;
                    comment.save();
                    res.redirect(`/campgrounds/${req.params.id}`);
                }
            });
        }
    });
});


// DESTROY COMMENT ROUTE
router.delete('/campgrounds/:id/comments/:comment_id',
              [middleware.isLoggedIn, middleware.checkCommentOwnership],
              function(req, res) {

    // Lookup associated campground by ID
    Campground.findById(req.params.id, function (error, campground) {
        if (error) {
            req.flash('error', `Error: ${error.message}.`);
            res.redirect('/campgrounds');
        } else {

            // Lookup comment by ID and delete
            Comment.findByIdAndDelete(req.params.comment_id, function(error, comment) {
                if (error) {req.flash('error', `Error: ${error.message}.`);}
                else {
                    campground.averageRating = database.removeRating(campground, comment);
                    campground.comments.pull(req.params.comment_id);
                    campground.commentCount = campground.comments.length;
                    campground.save();
                    req.flash('success', 'Comment has been deleted');
                }
                res.redirect(`/campgrounds/${req.params.id}`);
            });
        }
    });
});


module.exports = router;