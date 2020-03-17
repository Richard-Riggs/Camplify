// MODULES
const Campground = require("../models/campground"),
  Review = require("../models/review"),
  User = require("../models/user");

// Pass user object to response templates
module.exports.passUserObjectToTemplate = function(req, res, next) {
  res.locals.currentUser = req.user;
  next();
};

// Pass flash messages to response templates
module.exports.passFlashMessageToTemplate = function(req, res, next) {
  res.locals.error = req.flash("error");
  res.locals.warning = req.flash("warning");
  res.locals.success = req.flash("success");
  next();
};

// Check if user is logged in
module.exports.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("warning", "Please log in to continue");
  res.redirect("/login");
};

// Check if user is logged out (required for login and register routes)
module.exports.isLoggedOut = function(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  req.flash("warning", "Please log out to register or log in another user.");
  res.redirect("/campgrounds");
};

// Check if user is authorized to modify campground
module.exports.checkCampgroundOwnership = function(req, res, next) {
  Campground.findById(req.params.id, function(error, campground) {
    if (error) {
      req.flash("error", `Error: ${error.message}.`);
      res.redirect("/campgrounds");
    } else {
      if (campground.author.id.equals(req.user._id)) {
        next();
      } else {
        req.flash(
          "error",
          "Error: you are not authorized to modify this campground."
        );
        res.redirect(`/campgrounds/${req.params.id}`);
      }
    }
  });
};

// Check if user is authorized to modify review
module.exports.checkReviewOwnership = function(req, res, next) {
  // Lookup review by id
  Review.findById(req.params.review_id, function(error, review) {
    // Redirect to campgrounds page if there's an error
    if (error) {
      req.flash("error", `Error: ${error.message}.`);
      res.redirect("/campgrounds");
    } else {
      // Continue routing if user's id matches the review author's id
      if (review.author.id.equals(req.user._id)) {
        next();
      }

      // Redirect back if there's no match
      else {
        req.flash(
          "error",
          "Error: you are not authorized to modify this review."
        );
        res.redirect(`/campgrounds/${req.params.id}`);
      }
    }
  });
};

// Check if user has already posted a review on the given campground
module.exports.userAlreadyReviewed = function(req, res, next) {
  // Lookup campground that user seeks to review
  Campground.findById(req.params.id, function(error, campground) {
    if (error) {
      req.flash("error", `Error: ${error.message}.`);
      res.redirect("/campgrounds");
    } else {
      // Lookup reviews associated with campground
      Review.find({ _id: { $in: campground.reviews } }, function(
        error,
        reviews
      ) {
        if (error) {
          req.flash("error", `Error: ${error.message}.`);
          res.redirect("/campgrounds");
        } else {
          // Compare current user against reviews
          for (let i = 0; i < reviews.length; i++) {
            if (reviews[i].author.id.equals(req.user._id)) {
              req.flash(
                "warning",
                "You have already posted a review for this campground."
              );
              return res.redirect(`/campgrounds/${req.params.id}`);
            }
          }
          // Continue if there's no association between the user and any of the campground's reviews
          return next();
        }
      });
    }
  });
};

// Standard error handler for majority of errors
module.exports.handleErrors = function(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error.message && error.name)
    req.flash("error", `${error.name}: ${error.message}.`);
  else req.flash("error", error);
  res.redirect("back");
};

// Check if user profile belongs to the current user
module.exports.checkProfileOwnership = function(req, res, next) {
  User.findOne({ username: req.params.username }, function(error, user) {
    if (error) return next(error);
    else {
      if (user._id.equals(req.user._id)) {
        return next();
      } else {
        req.flash(
          "warning",
          "You are not authorized to access this user's settings."
        );
        return res.redirect("back");
      }
    }
  });
};
