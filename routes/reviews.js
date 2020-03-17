//======================= MODULES =======================

const express = require("express"),
  router = express.Router(),
  Campground = require("../models/campground"),
  Review = require("../models/review"),
  middleware = require("../middleware"),
  database = require("../lib/database"),
  ejsFunctions = require("../lib/ejsFunctions");

// ------------------ Reviews Routes --------------------

// INDEX ROUTE
router.get("/campgrounds/:id/reviews", (req, res) => {
  //let campground = await Campground.findById(req.params.id);
  Campground.findById(req.params.id, function(error, campground) {
    if (error) {
      req.flash("error", `Error: ${error.message}.`);
      res.redirect("/campgrounds");
    } else {
      let perPage = 8;
      let pageQuery = parseInt(req.query.page);
      let pageNumber = pageQuery ? pageQuery : 1;

      Review.find({ _id: { $in: campground.reviews } })
        .sort({ createdAt: "descending" })
        .skip(perPage * pageNumber - perPage)
        .limit(perPage)
        .populate("author.id")
        .exec(function(error, reviews) {
          Review.countDocuments({ _id: { $in: campground.reviews } }).exec(
            function(error, count) {
              if (error) {
                req.flash("error", `Error: ${error.message}.`);
                res.redirect("/");
              } else {
                res.render("reviews/index", {
                  campground: campground,
                  reviews: reviews,
                  current: pageNumber,
                  pages: Math.ceil(count / perPage),
                  queryString: ejsFunctions.queryString
                });
              }
            }
          );
        });
    }
  });
});

// NEW COMMENT ROUTE
router
  .route("/campgrounds/:id/reviews/new")
  .get([middleware.isLoggedIn, middleware.userAlreadyReviewed], (req, res) => {
    Campground.findById(req.params.id, (error, campground) => {
      if (error) {
        req.flash("error", `Error: ${error.message}.`);
        res.redirect(`/campgrounds`);
      } else {
        res.render("reviews/new", { campground: campground });
      }
    });
  });

// CREATE COMMENT ROUTE
router
  .route("/campgrounds/:id/reviews")
  .post([middleware.isLoggedIn, middleware.userAlreadyReviewed], (req, res) => {
    // Lookup campground using ID
    Campground.findById(req.params.id, (error, campground) => {
      if (error) {
        req.flash("error", `Error: ${error.message}.`);
        res.redirect("/campgrounds");
      } else {
        // Create new review document
        Review.create(req.body.review, (error, review) => {
          if (error) {
            req.flash("error", `Error: ${error.message}.`);
            res.redirect("back");
          } else {
            // Add username and ID to review
            review.author.id = req.user._id;
            review.author.username = req.user.username;
            review.createdAt = Date();
            review.campground = campground._id;
            review.save();

            // Associate new review with campground
            campground.reviews.push(review);
            campground.averageRating = database.addRating(campground, review);
            campground.reviewCount = campground.reviews.length;
            campground.save();

            // Redirect to campground show page
            res.redirect(`/campgrounds/${campground._id}`);
          }
        });
      }
    });
  });

// EDIT COMMENT ROUTE
router.get(
  "/campgrounds/:id/reviews/:review_id/edit",
  [middleware.isLoggedIn, middleware.checkReviewOwnership],
  function(req, res) {
    // Lookup Campground by ID
    Campground.findById(req.params.id, function(error, campground) {
      // Handle errors
      if (error) {
        req.flash("error", `Error: ${error.message}.`);
        res.redirect("/campgrounds/");
      } else {
        // Lookup Review by ID
        Review.findById(req.params.review_id, function(error, review) {
          if (error) {
            req.flash("error", `Error: ${error.message}.`);
            res.redirect(`/campgrounds/${req.params.id}`);
          } else {
            // Send campground and review document data to template
            res.render("reviews/edit", {
              campground: campground,
              review: review
            });
          }
        });
      }
    });
  }
);

// UPDATE COMMENT ROUTE
router.put(
  "/campgrounds/:id/reviews/:review_id",
  [middleware.isLoggedIn, middleware.checkReviewOwnership],
  function(req, res) {
    Campground.findById(req.params.id, function(error, campground) {
      if (error) {
        req.flash("error", `Error: ${error.message}.`);
        res.redirect("/campgrounds/");
      } else {
        Review.findById(req.params.review_id, function(error, review) {
          if (error) {
            req.flash("error", `Error: ${error.message}.`);
            res.redirect("back");
          } else {
            campground.averageRating = database.updateRating(
              campground,
              review,
              Number(req.body.review.rating)
            );
            campground.save();
            review.text = req.body.review.text;
            review.rating = req.body.review.rating;
            review.save();
            res.redirect(`/campgrounds/${req.params.id}`);
          }
        });
      }
    });
  }
);

// DESTROY COMMENT ROUTE
router.delete(
  "/campgrounds/:id/reviews/:review_id",
  [middleware.isLoggedIn, middleware.checkReviewOwnership],
  function(req, res) {
    // Lookup associated campground by ID
    Campground.findById(req.params.id, function(error, campground) {
      if (error) {
        req.flash("error", `Error: ${error.message}.`);
        res.redirect("/campgrounds");
      } else {
        // Lookup review by ID and delete
        Review.findByIdAndDelete(req.params.review_id, function(error, review) {
          if (error) {
            req.flash("error", `Error: ${error.message}.`);
          } else {
            campground.averageRating = database.removeRating(
              campground,
              review
            );
            campground.reviews.pull(req.params.review_id);
            campground.reviewCount = campground.reviews.length;
            campground.save();
            req.flash("success", "Review has been deleted");
          }
          res.redirect(`/campgrounds/${req.params.id}`);
        });
      }
    });
  }
);

module.exports = router;
