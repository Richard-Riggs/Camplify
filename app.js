//======================= PACKAGES =======================

const express    = require("express");
const bodyParser = require("body-parser");
const mongoose   = require("mongoose");


//=================== EXPRESS CONFIG ====================

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");


//======================= DATABASE =======================

// enter the following arguments when starting app.js:
// $ node app.js --username=<atlas username> --password=<atlas password>

//Connect to MongoDB Atlas
const atlasUsername = process.argv[2].split("=")[1];
const atlasPassword = process.argv[3].split("=")[1];
const connectionString = `mongodb+srv://${atlasUsername}:${atlasPassword}@cluster0-pekd8.mongodb.net/yelpCamp?retryWrites=true&w=majority`;
mongoose.set('useUnifiedTopology', true);
mongoose.connect(connectionString, { useNewUrlParser: true });


//Campground schema & model
const campgroundSchema = new mongoose.Schema({
    name: String,
    image: String
});
const Campground = mongoose.model("Campground", campgroundSchema);


//===================== ROUTES =========================

app.route('/')
    .get((req, res) => {
        res.render("landing");
    });

app.route('/campgrounds')
    .get((req, res) => {
        Campground.find({}, (error, campgrounds) => {
            if (error) {
                console.log(error);
            }
            else {
                res.render("campgrounds", {campgrounds: campgrounds});
            }
        })
    })
    .post((req, res) => {
        Campground.create(
            {
                name: req.body.name,
                image: req.body.image
                
            }, function(error, campground) {
                if (error) {
                    console.log(error);
                }
                else {
                    console.log("Created new campground document:");
                    console.log(campground);
                }
            });
        res.redirect("/campgrounds");        
    });


app.route('/campground/new')
    .get((req, res) => {
        res.render("new")
    });

//================== START SERVER ======================

//          LOCAL ENVIRONMENT
// const hostname = '127.0.0.1';
// const port = 3000;
// Access local website here:   http://127.0.0.1:3000/

//          AWS Cloud9 ENVIRONMENT
const hostname = '0.0.0.0'
const port = 8080;

app.listen(port, hostname, function () {
    console.log("The YelpCamp server has started")
});

//Access Cloud9 website here:   https://63dcbade7414481f8c2640d0eca49682.vfs.cloud9.us-east-1.amazonaws.com/