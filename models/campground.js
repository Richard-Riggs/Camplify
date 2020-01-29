const mongoose = require("mongoose"),
      cloudinary = require("cloudinary"),
      secrets  = require("../lib/secrets"),
      Comment  = require("./comment");

cloudinary.config({ 
  cloud_name: secrets.CLOUDINARY_CLOUDNAME, 
  api_key: secrets.CLOUDINARY_API_KEY, 
  api_secret: secrets.CLOUDINARY_API_SECRET
});

const campgroundSchema = new mongoose.Schema({
    docType: { type: String, default: 'campground' },
    name: String,
    image: String,
    imageID: String,
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
    userFavCount: Number,
    commentCount: Number,
    averageRating: Number
});


campgroundSchema.pre('remove', async function(next) {
    try {
        await Comment.deleteMany({_id: {$in: this.comments}});
        if (this.imageID) await cloudinary.uploader.destroy(this.imageID);
    } catch(error) {return next(error)}
    return next();
});


module.exports = mongoose.model("Campground", campgroundSchema);
