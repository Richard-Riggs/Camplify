//======================= MODULES =======================
const express = require("express"),
      router = express.Router(),
      User = require("../models/user"),
      Campground = require("../models/campground"),
      passport = require("passport"),
      middleware = require("../middleware");


// SHOW USER ROUTE

router.get('/users/:username', (req, res) => {

    // Find user by username
    User.findOne({ username: req.params.username }, function (error, user) {
        if (error) {
            req.flash('error', `Error: ${error.message}.`);
            return res.redirect('back');
        } else if (!user) {
            req.flash('error', 'Error: User does not exist.');
            return res.redirect('/campgrounds');
        } else {

            // Find campgrounds associated with user
            Campground.find({ "author.id": user._id }, function (error, campgrounds) {
                console.log(campgrounds.length);
                res.render('users/show', {user: user, campgrounds: campgrounds});
            });


        }
    })
});

module.exports = router;