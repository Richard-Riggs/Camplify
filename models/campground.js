const mongoose = require("mongoose"),
  cloudinary = require("cloudinary"),
  Review = require("./review");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUDNAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const campgroundSchema = new mongoose.Schema({
  docType: { type: String, default: "campground" },
  name: String,
  image: String,
  imageID: String,
  description: String,
  location: String,
  lat: Number,
  long: Number,
  price: String,
  createdAt: { type: Date },
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  },

  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review"
    }
  ],

  userFavs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  userFavCount: Number,
  reviewCount: Number,
  averageRating: Number
});

campgroundSchema.pre("remove", async function(next) {
  try {
    await Review.deleteMany({ _id: { $in: this.reviews } });
    if (this.imageID) await cloudinary.uploader.destroy(this.imageID);
  } catch (error) {
    return next(error);
  }
  return next();
});

module.exports = mongoose.model("Campground", campgroundSchema);
