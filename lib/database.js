
module.exports.dbSortQuery = function(sortQuery) {
    switch (sortQuery) {
        case 'recent': return { createdAt: 'descending'};
        case 'reviews': return { commentCount: 'descending' };
        default: return { createdAt: 'descending'};
    }
};


module.exports.addRating = (campground, comment) => {
    let oldTotalRatingVal = campground.commentCount * campground.averageRating;
    let newTotalRatingVal = oldTotalRatingVal + comment.rating;
    return newTotalRatingVal / (campground.commentCount + 1);
};


module.exports.removeRating = (campground, comment) => {
    let oldTotalRatingVal = campground.commentCount * campground.averageRating;
    let newTotalRatingVal = oldTotalRatingVal - comment.rating;
    return newTotalRatingVal / (campground.commentCount - 1);
};

module.exports.updateRating = (campground, comment, newRating) => {
    let oldTotalRatingVal = campground.commentCount * campground.averageRating;
    let newTotalRatingVal = oldTotalRatingVal - comment.rating + newRating;
    return newTotalRatingVal / (campground.commentCount);
};