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
    User.findOne({ username: req.params.username }, function (error, user) {
        if (error) return next(error);
        else if (!user) return next({name: 'Error', message: 'User does not exist'});
        else {
            // Find campgrounds associated with user
            Campground.find({ "author.id": user._id }, function (error, campgrounds) {
                if (error) return next(error);
                else {
                    // Find comments associated with user
                    Comment.find({ "author.id": user._id }).populate("campground").exec( function(error, comments) {
                        if (error) return next(error);
                        else {
                            let arr = [];
                            arr += campgrounds;
                            arr += comments;
                            console.log(arr);
                            return res.render('users/show', {
                                user: user,
                                campgrounds: campgrounds,
                                comments: comments
                            });
                        }
                    });
                }
            });
        }
    });
});

module.exports = router;