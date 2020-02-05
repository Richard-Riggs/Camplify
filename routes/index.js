//======================= MODULES =======================
const express = require("express"),
      router = express.Router(),
      User = require("../models/user"),
      passport = require("passport"),
      middleware = require("../middleware"),
      async      = require("async"),
      nodemailer = require("nodemailer"),
      crypto     = require("crypto"),
      secrets    = require("../lib/secrets");


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

    // LOGIN USER
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
                return res.redirect(`/users/${user.username}`);
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


// REQUEST PASSWORD RESET FORM
router.get('/reset', middleware.isLoggedOut, (req, res) => {res.render('reset-password')});


// REQUEST PASSWORD RESET
router.post('/reset', middleware.isLoggedOut, (req, res, next) => {
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, (err, buf) => {
                let token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            User.findOne({ email: req.body.email }, (err, user) => {
                if (!user) {
                    req.flash('warning', 'No account with that email address exists.');
                    return res.redirect('/reset');
                }
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000;
                user.save(function(err) {
                    done(err, token, user);
                });
            });
        },
        function(token, user, done) {
            let smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'camplify.reset@gmail.com',
                    pass: secrets.GMAIL_PASSWORD
                }
            });
            let mailOptions = {
                to: user.email,
                from: 'camplify.reset@gmail.com',
                subject: 'Camplify Password Reset',
                text: 
                    `Hello ${user.username}!\n\n` +
                    `Someone has requested to reset the password for this account.\n\n` +
                    `To reset your password, please click the link below:\n\n` +
                    `http://${req.headers.host}/reset/${token}\n\n` + 
                    `If you didn't request this, please ignore this email.`
            };
            smtpTransport.sendMail(mailOptions, function(err){
                req.flash('success', `An email has been sent to ${user.email} with further instructions.`);
                done(err, 'done');
            });
        }
    ], function(err) {
        if (err) return next(err);
        res.redirect('/reset');
    });
});


// RESET PASSWORD FORM
router.get('/reset/:token', (req, res, next) => {
    User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() } },
        (err, user) => {
            if (err) return next(err);
            if (!user) {
                req.flash('warning', 'Password reset token is invalid or expired.');
                return res.redirect('/reset');
            }
            res.render('reset-password-confirm', {token: req.params.token});
        });
});


// RESET PASSWORD
router.post('/reset/:token', (req, res, next) => {
    async.waterfall([
        function(done) {
            User.findOne({
                resetPasswordToken: req.params.token,
                resetPasswordExpires: { $gt: Date.now() } },
                (err, user) => {
                    if (!user) {
                        req.flash('warning', 'Password reset token is invalid or expired.');
                        return res.redirect('/reset');
                    }
                    if (req.body.password === req.body.confirm) {
                        user.setPassword(req.body.password, (err) => {
                            user.passwordChangeDate = Date();
                            user.resetPasswordToken = undefined;
                            user.resetPasswordExpires = undefined;
                            user.save((err) => {
                                req.login(user, (err) => {
                                    done(err, user);
                                })
                            })
                        })
                    } else {
                        req.flash('warning', 'Passwords do not match.');
                        return res.redirect('back');
                    }
                });            
        },
        
        function(user, done) {
            let smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'camplify.reset@gmail.com',
                    pass: secrets.GMAIL_PASSWORD
                }
            });
            let mailOptions = {
                to: user.email,
                from: 'camplify.reset@gmail.com',
                subject: 'Your password has been reset',
                text: 
                    `Hello ${user.username}!\n\n` +
                    `This is a confirmation that your account's password has been reset.`
            };
            smtpTransport.sendMail(mailOptions, (err) => {
                req.flash('success', `Your password has been reset.`);
                done(err);
            });
        }
    ], (err) => {
        if (err) return next(err);
        res.redirect('/campgrounds');
    });
});


module.exports = router;