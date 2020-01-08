const mongoose   = require("mongoose"),
      Campground = require("../models/campground"),
      Comment    = require("../models/comment");

const data = [
    {
        name: "Granite Hill",
        image: "https://cdn.pixabay.com/photo/2018/12/24/22/19/camping-3893587_960_720.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Pretium lectus quam id leo in vitae turpis. Nam at lectus urna duis convallis convallis tellus id. Morbi tempus iaculis urna id volutpat lacus. Viverra nam libero justo laoreet sit amet cursus sit amet. Placerat orci nulla pellentesque dignissim enim sit. Sed augue lacus viverra vitae congue. Semper auctor neque vitae tempus."
    },
    {
        name: "Mountain Goat's Rest",
        image: "https://cdn.pixabay.com/photo/2016/02/18/22/16/tent-1208201_960_720.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Pretium lectus quam id leo in vitae turpis. Nam at lectus urna duis convallis convallis tellus id. Morbi tempus iaculis urna id volutpat lacus. Viverra nam libero justo laoreet sit amet cursus sit amet. Placerat orci nulla pellentesque dignissim enim sit. Sed augue lacus viverra vitae congue. Semper auctor neque vitae tempus."
    },
    {
        name: "Blue Meadows",
        image: "https://cdn.pixabay.com/photo/2017/08/17/08/08/camp-2650359_960_720.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Pretium lectus quam id leo in vitae turpis. Nam at lectus urna duis convallis convallis tellus id. Morbi tempus iaculis urna id volutpat lacus. Viverra nam libero justo laoreet sit amet cursus sit amet. Placerat orci nulla pellentesque dignissim enim sit. Sed augue lacus viverra vitae congue. Semper auctor neque vitae tempus."
    },
    {
        name: "Icy Peaks",
        image: "https://cdn.pixabay.com/photo/2018/05/16/15/49/camper-3406137_960_720.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Pretium lectus quam id leo in vitae turpis. Nam at lectus urna duis convallis convallis tellus id. Morbi tempus iaculis urna id volutpat lacus. Viverra nam libero justo laoreet sit amet cursus sit amet. Placerat orci nulla pellentesque dignissim enim sit. Sed augue lacus viverra vitae congue. Semper auctor neque vitae tempus."
    },
    {
        name: "Salmon Creek",
        image: "https://cdn.pixabay.com/photo/2016/11/22/23/08/adventure-1851092_960_720.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Pretium lectus quam id leo in vitae turpis. Nam at lectus urna duis convallis convallis tellus id. Morbi tempus iaculis urna id volutpat lacus. Viverra nam libero justo laoreet sit amet cursus sit amet. Placerat orci nulla pellentesque dignissim enim sit. Sed augue lacus viverra vitae congue. Semper auctor neque vitae tempus."
    }
]

function seedDB() {
    Campground.deleteMany({}, (error) => {
        if (error) {
            console.log(error);
        }
        console.log('Removed all campgrounds from DB')
        data.forEach((seed) => {
            Campground.create(seed, (error, campground) => {
                if (error) {
                    console.log(error);
                }
                else {
                    console.log('Added a campground to DB')
                    Comment.create({
                        text: "Blah blah whatever man",
                        author: "The Dude"
                    }, (error, comment) => {
                        if (error) {
                            console.log(error);
                        }
                        else {
                            campground.comments.push(comment);
                            campground.save();
                            console.log('Created new comment');
                        }
                    });
                }
            })
        })
    })
}

module.exports = seedDB;
