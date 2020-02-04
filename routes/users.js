//======================= MODULES =======================
const express = require("express"),
      router = express.Router(),
      User = require("../models/user"),
      Campground = require("../models/campground"),
      Comment = require("../models/comment"),
      passport = require("passport"),
      multer   = require("multer"),
      cloudinary = require("cloudinary"),
      secrets = require("../lib/secrets"),
      middleware = require("../middleware");



// ----------------- Image Upload Config ------------------

const storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});

const imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: imageFilter});

cloudinary.config({ 
  cloud_name: secrets.CLOUDINARY_CLOUDNAME, 
  api_key: secrets.CLOUDINARY_API_KEY, 
  api_secret: secrets.CLOUDINARY_API_SECRET
});

//------------------------------------------------------


// NEW USER ROUTE
router.get('/users/new', middleware.isLoggedOut, (req, res) => {res.render('users/new')});

// CREATE USER ROUTE
router.post('/users', [middleware.isLoggedOut, upload.single('image')], async (req, res, next) => {
    try {
        let image, imageID;
        if (req.file) {
            let result = await cloudinary.uploader.upload(req.file.path);
            image = result.secure_url;
            imageID = result.public_id;            
        } else {
            image = req.body.imageURL;
            imageID = null;
        }
        let newUser = new User({
            username: req.body.username,
            email: req.body.email,
            image: image,
            imageID: imageID
        });
        let user = await User.register(newUser, req.body.password);
        passport.authenticate('local')(req, res, () => {
            req.flash('success', `Welcome to YelpCamp, ${user.username}!`);
            return res.redirect(`/users/${user.username}`);             
        });
    } catch(error) {return next(error)}
});


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
    middleware.checkProfileOwnership,
    upload.single('image')],
    
    function(req, res, next) {
        if (req.body.password) {
            console.log('password change')
            req.body.username = req.params.username;
            passport.authenticate('local', function(err, user, info) {
                if (err) { return next(err); }
                if (!user) {
                    console.log('bad pass');
                    req.flash('bad pass');
                    res.redirect('/campgrounds');
    
                }
                else {
                    console.log('good pass');
                    next();
                }
            })(req, res, next);    
        } else {
            next()
        }
    },

    async function(req, res, next) {

        
        try {
            let user = await User.findOne({ username: req.params.username });
            if (req.file) {
              if (user.imageID) await cloudinary.uploader.destroy(user.imageID);
              let result = await cloudinary.uploader.upload(req.file.path);
              user.image = result.secure_url;
              user.imageID = result.public_id;
            } else if (req.body.imageURL) {
              if (user.imageID) await cloudinary.uploader.destroy(user.imageID);
              user.image = req.body.imageURL;
              user.imageID = null;                
            }
            user.settings.profileVisibility = req.body.profileVisibility;
            user.save();                    
            req.flash('success', 'Profile settings saved');
            return res.redirect(`/users/${req.params.username}`);
        } catch(err) {return next(err)}
});

module.exports = router;