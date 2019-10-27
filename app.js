//======================= MODULES =======================

const express    = require("express"),
      bodyParser = require("body-parser"),
      mongoose   = require("mongoose"),
      Campground = require("./models/campground");
      

//=================== EXPRESS CONFIG ====================

const app = express();
app.use(bodyParser.urlencoded({extended: true}))
   .use(express.static("public"))
   .set("view engine", "ejs");


//======================= DATABASE =======================

// enter the following arguments when starting app.js:
// $ node app.js <atlas username> <atlas password>

// Connect to MongoDB Atlas
const atlasUsername = process.argv[2],
      atlasPassword = process.argv[3],
      database = 'yelpCamp',
      connectionString = `mongodb+srv://${atlasUsername}:${atlasPassword}@cluster0-pekd8.mongodb.net/${database}?retryWrites=true&w=majority`;
      
mongoose.set('useUnifiedTopology', true)
        .set('useFindAndModify', false)
        .connect(connectionString, { useNewUrlParser: true });


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
                res.render("index", {campgrounds: campgrounds});
            }
        })
    })
    .post((req, res) => {
        Campground.create(
            {
                name: req.body.name,
                image: req.body.image,
                description: req.body.description
                
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

app.route('/campgrounds/new')
    .get((req, res) => {
        res.render("new")
    });

app.route('/campgrounds/:id')
    .get((req, res) => {
        Campground.findById(req.params.id, (error, campground) => {
            if (error) {
                console.log(error);
            }
            else {
                res.render('show', {campground: campground});    
            }
        });
    });


//================== START SERVER ======================

//          LOCAL ENVIRONMENT
// const hostname = '127.0.0.1';
// const port = 3000;
// Access local website here:   http://127.0.0.1:3000/

//          AWS Cloud9 ENVIRONMENT
const hostname = '0.0.0.0',
      port = 8080;

app.listen(port, hostname, function () {
    console.log("The YelpCamp server has started")
});

//  Access Cloud9 website here:   
//  https://63dcbade7414481f8c2640d0eca49682.vfs.cloud9.us-east-1.amazonaws.com/

// TODO: City/state for each site (present as subtitle for cards)