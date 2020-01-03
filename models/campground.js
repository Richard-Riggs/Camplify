const mongoose = require("mongoose"),
      Comment  = require("./comment");


const campgroundSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String,
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
    ]
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
