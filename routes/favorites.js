//======================= MODULES =======================

const express = require("express"),
  router = express.Router(),
  Campground = require("../models/campground"),
  Review = require("../models/review"),
  User = require("../models/user"),
  middleware = require("../middleware"),
  database = require("../lib/database"),
  ejsFunctions = require("../lib/ejsFunctions");

// TOGGLE (CREATE / DESTROY) FAVORITE
router.post("/campgrounds/:id/favorites", middleware.isLoggedIn, (req, res) => {
  User.findById(req.user._id, (error, user) => {
    if (error) {
      req.flash("error", `Error: ${error.message}.`);
      return res.redirect("back");
    } else {
      Campground.findById(req.params.id, (error, campground) => {
        if (error) {
          req.flash("error", `Error: ${error.message}.`);
          return res.redirect("back");
        } else {
          // Remove favorite if user has already favorited the campground
          let foundFav = user.campFavs.find(campFav =>
            campFav.campID.equals(campground._id)
          );
          if (foundFav) {
            user.campFavs.pull(foundFav);
            user.save();
            campground.userFavs.pull(user._id);
            campground.userFavCount = campground.userFavs.length;
            campground.save();
            return res.send({ result: "unfavorited" });

            // Add favorite if user has not favorited the campground
          } else {
            let campFav = {
              campID: campground._id,
              createdAt: Date()
            };
            user.campFavs.push(campFav);
            user.save();
            campground.userFavs.push(user._id);
            campground.userFavCount = campground.userFavs.length;
            campground.save();
            return res.send({ result: "favorited" });
          }
        }
      });
    }
  });
});

module.exports = router;
