//======================= MODULES =======================
const express = require("express"),
      router = express.Router(),
      User = require("../models/user"),
      passport = require("passport"),
      middleware = require("../middleware"),
      async      = require("async"),
      nodemailer = require("nodemailer"),
      crypto     = require("crypto");


// ------------------ Landing Page Routes ----------------------

router.route('/')
    .get((req, res) => {
        res.render("landing");
    });


// ------------------ Authentication Routes --------------------


router.route('/login')

    .get(middleware.isLoggedOut, function(req, res) {              // Show login form
        res.render('login');
    })

    // .post([middleware.isLoggedOut, middleware.validateLogin,
    //     passport.authenticate("local", {                          // Log in user
    //     successRedirect: '/campgrounds',
    //     failureRedirect: 'back',
    //     failureFlash: 'Invalid username or password.'
    // })], function(req, res){});
    
    .post([middleware.isLoggedOut, function(req, res, next) {
      passport.authenticate('local', function(error, user, info) {
        let relPath = req.headers.referer.replace(req.headers.origin, "");
        if (error) {
            req.flash('error', error);
            res.redirect('back');
        }
        if (!user) {
            if (relPath === '/login') {
                req.flash('error', 'Error: Invalid credentials');
                return res.redirect('back');
            } else { return res.send({errorMsg: 'Invalid credentials'}) }
        }
        req.logIn(user, function(error) {
            if (error) {
                if (relPath === '/login') {
                    req.flash('error', 'Error: There was a problem logging in.');
                    return res.redirect('back');
                } else { return res.send({errorMsg: 'Error: There was a problem logging in'}) }                
            }
            if (relPath === '/login') {
                return res.redirect('/campgrounds');
            } else {
                return res.send({login: 'success'});
            }
        });
      })(req, res, next);
    }], function(req, res){});
    

router.route('/logout')                                          // Log user out
    .get(function(req, res) {
        req.logout();
        res.redirect('/campgrounds');
    });

// RESET PASSWORD FORM
router.get('/reset', (req, res) => {res.render('reset-password')});

// RESET PASSWORD

router.post('/forgot', (req, res, next) => {
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, (err, buf) => {
                let token = buf.toString('hex');
                done(err, token);
            });
        },
        function (token, done) {
            User.findOne({ email: req.body.email }, (err, user) => {
                if (!user) {
                    req.flash('warning', 'No account with that email address exists.');
                    return res.redirect('/forgot');
                }
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000;
                user.save(function(err) {
                    done(err, token, user);
                });
            });
        }
    ])
});

module.exports = router;