const mongoose = require("mongoose"),
      Comment  = require("./comment");


const campgroundSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String,
    location: String,
    lat: Number,
    long: Number,
    price: String,
    createdAt: {type: Date},
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],

    userFavs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],

    // userFavCount, commentCount, and averageRating are used to make sorting more efficient
    userFavCount: Number,
    commentCount: Number,
    averageRating: Number
});


campgroundSchema.pre('remove', function(next) {
    Comment.deleteMany({_id: {$in: this.comments}}, function(error) {
        if (error) {
            console.log(error);
        }
        next();
    });
});


module.exports = mongoose.model("Campground", campgroundSchema);
