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
            let userTab = String(req.query.tabID);
            let update = req.query.update;
            let perPage = 10;
            // let userTabs = ['list-activity-list', 'list-campgrounds-list', 'list-reviews-list', 'list-favorites-list'];
            if (!update) {
                return res.render('users/show', {user: user, userTab: userTab});
            } else {
                switch (userTab) {
                    case 'list-recent':
                        break;
                    
                    case 'list-campgrounds':
                        Campground
                            .find({ "author.id": user._id })
                            .sort({ createdAt: 'descending'})
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
                        return res.render('partials/user-favorites', {favs: user.campFavs});
                        break;
                        
                    default:
                        // code
                }
            }
            

            
            // Find campgrounds associated with user
            // Campground.find({ "author.id": user._id }, function (error, campgrounds) {
            //     if (error) return next(error);
            //     else {
            //         // Find comments associated with user
            //         Comment.find({ "author.id": user._id }).populate("campground").exec( function(error, comments) {
            //             if (error) return next(error);
            //             else {

            //                 return res.render('users/show', {
            //                     user: user,
            //                     campgrounds: campgrounds,
            //                     comments: comments
            //                 });
            //             }
            //         });
            //     }
            // });
        }
    });
});

module.exports = router;