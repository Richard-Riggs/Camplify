//======================= MODULES =======================

const express        = require("express"),
      router         = express.Router(),
      Campground     = require("../models/campground"),
      middleware     = require("../middleware"),
      dbSortQuery    = require("../lib/database").dbSortQuery,
      ejsFunctions   = require("../lib/ejsFunctions"),
      secrets        = require("../lib/secrets"),
      multer         = require("multer"),
      cloudinary     = require("cloudinary"),
      geocoder       = require('node-geocoder')({
                            provider: 'google',
                            httpAdapter: 'https',
                            apiKey: secrets.geocoderAPIkey,
                            formatter: null
      });

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

// ------------------ Campgrounds Routes --------------------

router.route("/campgrounds")

// INDEX ROUTE
.get(function (req, res) {
    let perPage = 6;
    let pageQuery = parseInt(req.query.page);
    let pageNumber = pageQuery ? pageQuery : 1;
    let sorts = ['recent', 'reviews', 'rating', 'favorited'];
    let sortQuery = (sorts.includes(req.query.sort)) ? req.query.sort : 'rating';

    Campground
        .find({})
        .sort(dbSortQuery(sortQuery))
        .skip((perPage * pageNumber) - perPage)
        .limit(perPage)
        .exec(function (error, campgrounds) {
            Campground.countDocuments().exec(function (error, count) {
                if (error) {
                    req.flash('error', `Error: ${error.message}.`);
                    res.redirect('/');
                } else {
                    res.render("campgrounds/index", {
                        campgrounds: campgrounds,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        queryString: ejsFunctions.queryString,
                        sortQuery: sortQuery,
                        sortName: {
                            recent: 'Most Recent',
                            reviews: 'Most Reviewed',
                            rating: 'Highest Rated',
                            favorited: 'Most Favorited'
                        }
                    });
                }
            });
    });
})

    // CREATE ROUTE
    .post([middleware.isLoggedIn, upload.single('image')], (req, res) => {
        geocoder.geocode(req.body.location, function (error, data) {
            if (error || !data.length) {
                req.flash('error', 'Failed to find location.');
                res.redirect('/campgrounds/new');
            } else {
                cloudinary.uploader.upload(req.file.path, function(result) {
                    Campground.create({
                        name: req.body.name,
                        image: result.secure_url,
                        description: req.body.description,
                        price: req.body.price,
                        createdAt: Date(),
                        author: {
                            id: req.user._id,
                            username: req.user.username
                        },
                        location: data[0].formattedAddress,
                        lat: data[0].latitude,
                        long: data[0].longitude,
                        commentCount: 0,
                        userFavCount: 0,
                        averageRating: 0
                    }, function(error, campground) {
                        if (error) {
                            req.flash('error', `Error: ${error.message}.`);
                            res.redirect('/campgrounds');
                        }
                        else {
                            req.flash('success', 'Successfully created campground!');
                            res.redirect(`/campgrounds/${campground._id}`);
                        }
                    });                    
                });

            }

        });

    });


router.route('/campgrounds/new')
    
    // NEW ROUTE
    .get(middleware.isLoggedIn, (req, res) => {
        res.render("campgrounds/new");
    });


router.route('/campgrounds/:id')

    // SHOW ROUTE
    .get((req, res, next) => {
        Campground.findById(req.params.id).populate("comments").exec((error, campground) => {
            if (error) {
                return next(error);
            }
            else {
                res.render('campgrounds/show', {campground: campground});    
            }
        });
    })

    // UPDATE ROUTE
    .put([middleware.isLoggedIn, middleware.checkCampgroundOwnership], function(req, res) {
        geocoder.geocode(req.body.location, function (error, data) {
            if (error || !data.length) {
                req.flash('error', 'Failed to find location.');
                res.redirect(`/campgrounds/${req.params.id}/edit`);
            } else {
                Campground.findByIdAndUpdate(req.params.id, {
                    name: req.body.name,
                    image: req.body.image,
                    description: req.body.description,
                    price: req.body.price,
                    location: data[0].formattedAddress,
                    lat: data[0].latitude,
                    long: data[0].longitude,
                }, function(error, updatedCampground) {
                    if (error) {
                        req.flash('error', `Error: ${error.message}.`);
                        res.redirect('/campgrounds');
                    }
                    else {
                        req.flash('success', 'Successfully updated campground.');
                        res.redirect(`/campgrounds/${req.params.id}`);
                    }
                });
            }
        });
    })

    // DESTROY ROUTE
    .delete([middleware.isLoggedIn, middleware.checkCampgroundOwnership], function(req, res) {
        
        // Find campground by ID
        Campground.findById(req.params.id, function(error, campground) {
            if (error) {
                req.flash('error', `Error: ${error.message}.`);
            }
            else {
                
                // Remove campground
                // NOTE: Using campground.remove() allows the pre hook middleware in the Campground model
                //       to be used as document middleware. If findByIdAndDelete() is used instead, the
                //       pre hook middleware is used as query middleware (which affects the value of 'this').
                //       For more details, see https://mongoosejs.com/docs/middleware.html
                campground.remove();
                req.flash('success', `${campground.name} has been deleted.`)
            }
            res.redirect('/campgrounds');
        });
    });


router.route('/campgrounds/:id/edit')

    // EDIT ROUTE
    .get([middleware.isLoggedIn, middleware.checkCampgroundOwnership], function(req, res) {
        Campground.findById(req.params.id, function(error, foundCampground) {
            if (error) {
                req.flash('error', `Error: ${error.message}.`);
                res.redirect('/campgrounds');
            }
            else {
                res.render('campgrounds/edit', {campground: foundCampground});
            }
        });
    });


module.exports = router;