//======================= MODULES =======================
const express = require("express"),
      router = express.Router(),
      User = require("../models/user"),
      passport = require("passport"),
      middleware = require("../middleware");


// ------------------ Landing Page Routes ----------------------

router.route('/')
    .get((req, res) => {
        res.render("landing");
    });


// ------------------ Authentication Routes --------------------

router.route('/register')
    .get(middleware.isLoggedOut, function(req, res) {                              // Show register form
        res.render('register');
    })
    .post(middleware.isLoggedOut, function(req, res) {                              // Register new user
        let newUser = new User({username: req.body.username});
        User.register(newUser, req.body.password, function(error, user) {
            if (error) {
                req.flash('error', `Error: ${error.message}.`);
                return res.redirect('/register');
            }
            passport.authenticate('local')(req, res, function() {
                req.flash('success', `Welcome to YelpCamp, ${user.username}!`)
                res.redirect('/campgrounds');
            });
        });
    });

router.route('/login')

    .get(middleware.isLoggedOut, function(req, res) {                                 // Show login form
        res.render('login');
    })
    
    .post([middleware.isLoggedOut,
        passport.authenticate("local", {                        // Log in user
        successRedirect: '/campgrounds',
        failureRedirect: '/login',
        failureFlash: 'Invalid username or password.'
    })], function(req, res){});

router.route('/logout')                                          // Log user out
    .get(function(req, res) {
        req.logout();
        res.redirect('/campgrounds');
    });


module.exports = router;