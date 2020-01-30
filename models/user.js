const mongoose              = require("mongoose"),
      passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema({
    docType: { type: String, default: 'user' },
    username: {type: String, unique: true, required: true},
    firstName: String,
    lastName: String,
    password: String,
    image: String,
    imageID: String,
    email: {type: String, unique: true, required: true},
    campFavs: [{
        docType: { type: String, default: 'campFav' },
        campID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Campground"
        },
        createdAt: Date
    }],
    settings: {
        profileVisibility: {type: String, default: 'public'}
    }
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);