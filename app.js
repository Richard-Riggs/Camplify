//===================== PACKAGES ========================
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

const hostname = '127.0.0.1';
const port = 3000;

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

var campgrounds = [
    {name: "Salmon Creek", image:"https://cdn.pixabay.com/photo/2016/11/22/23/08/adventure-1851092_960_720.jpg"},
    {name: "Granite Hill", image:"https://cdn.pixabay.com/photo/2018/12/24/22/19/camping-3893587_960_720.jpg"},
    {name: "Mountain Goat's Rest", image:"https://cdn.pixabay.com/photo/2016/02/18/22/16/tent-1208201_960_720.jpg"}
];

//===================== ROUTES =========================

app.get("/", function (req, res) {
    res.render("landing");
});

app.get("/campgrounds", function (req, res) {
    res.render("campgrounds", {campgrounds: campgrounds});
});

//Push new campground object to campgrounds array
//Redirect to campgrounds page
app.post("/campgrounds", function (req, res) {
    campgrounds.push({name: req.body.name, image: req.body.image});
    res.redirect("/campgrounds")
});

app.get("/campgrounds/new", function (req, res) {
    res.render("new")
});

//================== START SERVER ======================

app.listen(port, hostname, function () {
    console.log("The YelpCamp server has started")
});

// Access website at 'http://127.0.0.1:3000/'