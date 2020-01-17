//======================= MODULES =======================

const express = require("express"),
      router  = express.Router(),
      Campground = require("../models/campground"),
      Comment = require("../models/comment"),
      User    = require("../models/user"),
      middleware = require("../middleware"),
      database = require("../lib/database"),
      ejsFunctions = require("../lib/ejsFunctions");


// TOGGLE (CREATE / DESTROY) FAVORITE
router.post('/campgrounds/:id/favorites', middleware.isLoggedIn, (req, res) => {

    User.findById(req.user._id, (error, user) => {
        if (error) {
            req.flash('error', `Error: ${error.message}.`);
            return res.redirect('back');
        } else {

            Campground.findById(req.params.id, (error, campground) => {
                if (error) {
                    req.flash('error', `Error: ${error.message}.`);
                    return res.redirect('back');
                } else {
                    
                    // Remove favorite if user has already favorited the campground
                    if (campground.userFavs.includes(user._id)) {
                        campground.userFavs.pull(user._id);
                        campground.userFavCount = campground.userFavs.length;
                        campground.save();
                        user.campFavs.pull(campground._id);
                        user.save();
                        return res.send({result: "unfavorited"})
                    
                    // Add favorite if user has not favorited the campground
                    } else {
                        campground.userFavs.push(user._id);
                        campground.userFavCount = campground.userFavs.length;
                        campground.save();
                        user.campFavs.push(campground._id);
                        user.save();
                        return res.send({result: "favorited"})
                    }
                }
            })
        }
    });
    
});


module.exports = router;