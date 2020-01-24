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
            let userTab = req.query.tabID ? String(req.query.tabID) : 'list-recent';
            let update = req.query.update;
            let pageNum = 1;
            let perPage = 10;
            let firstItem = (pageNum - 1) * perPage; // Index floor - included in array slices
            let lastItem = pageNum * perPage;        // Index ceiling - NOT included in array slices
            // let userTabs = ['list-activity-list', 'list-campgrounds-list', 'list-reviews-list', 'list-favorites-list'];
            if (!update) {
                return res.render('users/show', {user: user, userTab: userTab});
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
                            .skip((perPage * pageNum) - perPage)
                            .limit(perPage)
                            .exec(function (error, campgrounds) {
                                if (error) return next(error);
                                else {
                                    return res.render('partials/user-campgrounds', {campgrounds: campgrounds});
                                }
                            });
                        break;

                    case 'list-reviews':
                        Comment
                            .find({ "author.id": user._id })
                            .sort({ createdAt: 'descending'})
                            .skip((perPage * pageNum) - perPage)
                            .limit(perPage)
                            .populate("campground")
                            .exec( function(error, comments) {
                                if (error) return next(error);
                                else {
                                    return res.render('partials/user-reviews', {
                                        user: user,
                                        comments: comments
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
                            favs: favs.slice(firstItem, lastItem)
                        });
                        break;
                        
                    default:
                        break;
                        // code
                }
            }
        }
    });
});

module.exports = router;