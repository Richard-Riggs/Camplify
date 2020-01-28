//======================= MODULES =======================
const express = require("express"),
      router = express.Router(),
      User = require("../models/user"),
      Campground = require("../models/campground"),
      Comment = require("../models/comment"),
      passport = require("passport"),
      middleware = require("../middleware");


// SHOW USER ROUTE
router.get('/users/:username', (req, res, next) => {
    // Find user by username
    User.findOne({ username: req.params.username }).populate('campFavs.campID').exec( function (error, user) {
        if (error) return next(error);
        else if (!user) return next({name: 'Error', message: 'User does not exist'});
        else {
            // If the GET request is an update, send only the requested data
            // If the GET request is not an update, render the page and include update request
            let userTab = req.query.tab ? String(req.query.tab) : 'list-recent';
            let update = req.query.update;
            let currentPage = req.query.currentPage ? Number(req.query.currentPage) : 1;
            let perPage = 10;
            let firstItem = (currentPage - 1) * perPage; // Index floor - included in array slices
            let lastItem = currentPage * perPage;        // Index ceiling - NOT included in array slices
            // let userTabs = ['list-activity-list', 'list-campgrounds-list', 'list-reviews-list', 'list-favorites-list'];
            if (!update) {
                return res.render('users/show', {
                    user: user,
                    userTab: userTab
                });
            } else {
                switch (userTab) {
                    
                    case 'list-recent':
                        Campground.find({ "author.id": user._id }, function(error, campgrounds) {
                            if (error) return next(error);
                            else {
                                Comment.find({ "author.id": user._id }).populate('campground').exec(function(error, comments) {
                                    if (error) return next(error);
                                    else {
                                        let recentActivities = user.campFavs.concat(campgrounds).concat(comments);
                                        recentActivities.sort((a, b) => {
                                            return Date.parse(b.createdAt) - Date.parse(a.createdAt);
                                        });
                                        return res.render('partials/user-recent', {
                                            user: user,
                                            currentPage: currentPage,
                                            maxPage: Math.ceil(recentActivities.length / perPage),
                                            recentActivities: recentActivities.slice(firstItem, lastItem)
                                        });
                                    }                                    
                                });
                            }
                        });
                        break;
                    
                    case 'list-campgrounds':
                        Campground
                            .find({ "author.id": user._id })
                            .sort({ createdAt: 'descending'})
                            .skip((perPage * currentPage) - perPage)
                            .limit(perPage)
                            .exec(function (error, campgrounds) {
                                if (error) return next(error);
                                else {
                                    Campground.countDocuments().exec(function (error, count) {
                                        if (error) return next(error);
                                        else {
                                            return res.render('partials/user-campgrounds', {
                                                campgrounds: campgrounds,
                                                currentPage: currentPage,
                                                maxPage: Math.ceil(count / perPage)
                                            });                                            
                                        }
                                    });
                                }
                            });
                        break;

                    case 'list-reviews':
                        Comment
                            .find({ "author.id": user._id })
                            .sort({ createdAt: 'descending'})
                            .skip((perPage * currentPage) - perPage)
                            .limit(perPage)
                            .populate("campground")
                            .exec( function(error, comments) {
                                if (error) return next(error);
                                else {
                                    Comment.countDocuments().exec(function (error, count) {
                                        if (error) return next(error);
                                        else {
                                            return res.render('partials/user-reviews', {
                                                user: user,
                                                comments: comments,
                                                currentPage: currentPage,
                                                maxPage: Math.ceil(count / perPage)
                                            });                                            
                                        }
                                    });
                                }
                            });
                        break;

                    case 'list-favorites':
                        let favs = user.campFavs;
                        favs.sort((a, b) => {
                            return Date.parse(b.createdAt) - Date.parse(a.createdAt);
                        });
                        return res.render('partials/user-favorites', {
                            user: user,
                            favs: favs.slice(firstItem, lastItem),
                            currentPage: currentPage,
                            maxPage: Math.ceil(favs.length / perPage)
                        });
                        break;
                    
                    case 'list-settings':
                        if (req.user._id.equals(user._id)) {
                            res.render('partials/user-settings', {user: user});
                        } else {
                            req.flash('warning', "You are not authorized to access this user's settings");
                            res.redirect('back');
                        }
                    
                    default:
                        break;
                        // code
                }
            }
        }
    });
});

// UPDATE USER ROUTE
router.put('/users/:username', [
    middleware.isLoggedIn,
    middleware.checkProfileOwnership ],
    function(req, res, next) {
        User.findOneAndUpdate({ username: req.params.username }, {
            settings: {
                profileVisibility: req.body.profileVisibility
            }
        }, function(error, updatedUser){
            if (error) return next(error);
            else {
                req.flash('success', 'Settings saved')
                res.redirect('back');
            }
        });
});

module.exports = router;