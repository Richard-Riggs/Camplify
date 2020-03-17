const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema({
  docType: { type: String, default: "review" },
  text: String,
  createdAt: { type: Date },
  rating: Number,
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  },
  campground: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Campground"
  }
});

module.exports = mongoose.model("Review", reviewSchema);
