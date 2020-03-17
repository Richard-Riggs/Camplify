// Provides object with sorting parameters for campground queries
module.exports.dbSortQuery = function(sortQuery) {
  switch (sortQuery) {
    case "recent":
      return { createdAt: "descending" };
    case "reviews":
      return { reviewCount: "descending", averageRating: "descending" };
    case "rating":
      return { averageRating: "descending", userFavCount: "descending" };
    case "favorited":
      return { userFavCount: "descending", averageRating: "descending" };
    default:
      return { averageRating: "descending", userFavCount: "descending" };
  }
};

// Updates campground document to include new rating value
module.exports.addRating = (campground, review) => {
  let oldTotalRatingVal = campground.reviewCount * campground.averageRating;
  let newTotalRatingVal = oldTotalRatingVal + review.rating;
  return newTotalRatingVal / (campground.reviewCount + 1);
};

// Updates campground document to remove deleted rating value
module.exports.removeRating = (campground, review) => {
  let oldTotalRatingVal = campground.reviewCount * campground.averageRating;
  let newTotalRatingVal = oldTotalRatingVal - review.rating;
  if (!newTotalRatingVal) {
    return 0;
  } else {
    return newTotalRatingVal / (campground.reviewCount - 1);
  }
};

// Updates campground document to modify a rating value
module.exports.updateRating = (campground, review, newRating) => {
  let oldTotalRatingVal = campground.reviewCount * campground.averageRating;
  let newTotalRatingVal = oldTotalRatingVal - review.rating + newRating;
  return newTotalRatingVal / campground.reviewCount;
};
