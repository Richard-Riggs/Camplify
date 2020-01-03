//======================= MODULES =======================

const express        = require("express"),
      router         = express.Router(),
      Campground     = require("../models/campground"),
      middleware     = require("../middleware");


// ------------------ Campgrounds Routes --------------------

router.route('/campgrounds')

    // INDEX ROUTE
    .get((req, res) => {
        Campground.find({}, (error, campgrounds) => {
            if (error) {
                req.flash('error', `Error: ${error.message}.`);
                res.redirect('/');
            }
            else {
                res.render("campgrounds/index", {campgrounds: campgrounds});
            }
        });
    })

    // CREATE ROUTE
    .post(middleware.isLoggedIn, (req, res) => {
        Campground.create(
            {
                name: req.body.name,
                price: req.body.price,
                image: req.body.image,
                description: req.body.description,
                createdAt: Date(),
                author: {
                    id: req.user._id,
                    username: req.user.username
                }
                
            }, function(error, campground) {
                if (error) {
                    req.flash('error', `Error: ${error.message}.`);
                }
                else {
                    req.flash('success', 'Successfully created campground!');
                }
                res.redirect("/campgrounds");
            });
    });


router.route('/campgrounds/new')
    
    // NEW ROUTE
    .get(middleware.isLoggedIn, (req, res) => {
        res.render("campgrounds/new");
    });


router.route('/campgrounds/:id')

    // SHOW ROUTE
    .get((req, res) => {
        Campground.findById(req.params.id).populate("comments").exec((error, campground) => {
            if (error) {
                req.flash('error', `Error: ${error.message}.`);
                res.redirect('/campgrounds');
            }
            else {
                res.render('campgrounds/show', {campground: campground});    
            }
        });
    })

    // UPDATE ROUTE
    .put([middleware.isLoggedIn, middleware.checkCampgroundOwnership], function(req, res) {
        Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(error, updatedCampground) {
            if (error) {
                req.flash('error', `Error: ${error.message}.`);
                res.redirect('/campgrounds');
            }
            else {
                req.flash('success', 'Successfully updated campground.')
                res.redirect(`/campgrounds/${req.params.id}`);
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