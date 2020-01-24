const mongoose              = require("mongoose"),
      passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    campFavs: [{
        campID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Campground"
        },
        createdAt: Date
    }]
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);