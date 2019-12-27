//======================= MODULES =======================

const express        = require("express"),
      bodyParser     = require("body-parser"),
      secrets        = require("./secrets"),
      
// MongoDB & Models
      mongoose       = require("mongoose"),
      Campground     = require("./models/campground"),
      Comment        = require("./models/comment"),
      User           = require("./models/user"),
      seedDB         = require("./seeds"),

// Authentication
      passport       = require("passport"),
      LocalStrategy  = require("passport-local"),
      expressSession = require("express-session");

//=================== EXPRESS CONFIG ====================

const app = express();
app.use(bodyParser.urlencoded({extended: true}))
   .use(express.static(`${__dirname}/public`))
   .set("view engine", "ejs");


//==================== AUTHENTICATION ====================

app.use(expressSession({
    secret: secrets.secret,
    resave: false,
    saveUninitialized: false
   }))
   .use(passport.initialize())
   .use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//======================= DATABASE =======================

// enter the following arguments when starting app.js:
// $ node app.js <atlas username> <atlas password>

// Create connection string
const atlasUsername = secrets.atlasUsername,
      atlasPassword = secrets.atlasPassword,
      database = 'yelpCamp',
      connectionString = `mongodb+srv://${atlasUsername}:${atlasPassword}@cluster0-pekd8.mongodb.net/${database}?retryWrites=true&w=majority`;

// Connect to MongoDB Atlas with connection string
mongoose.set('useUnifiedTopology', true)
        .set('useFindAndModify', false)
        .connect(connectionString, { useNewUrlParser: true });

// Seed the database
seedDB();


//================ ROUTING MIDDLEWARE ==================

// Pass user object to every response template
app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    next();
});

// Check if user is authenticated and proceed if true
// Redirect to login if false
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}


//===================== ROUTES =========================

app.route('/')
    .get((req, res) => {
        res.render("landing");
    });

// ------------------ Campgrounds Routes --------------------

app.route('/campgrounds')
    .get((req, res) => {                                        // Index
        Campground.find({}, (error, campgrounds) => {
            if (error) {
                console.log(error);
            }
            else {
                res.render("campgrounds/index", {campgrounds: campgrounds});
            }
        })
    })
    .post((req, res) => {                                       // Create
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

app.route('/campgrounds/new')                                   // New
    .get((req, res) => {
        res.render("campgrounds/new")
    });

app.route('/campgrounds/:id')                                   // Show
    .get((req, res) => {
        Campground.findById(req.params.id).populate("comments").exec((error, campground) => {
            if (error) {
                console.log(error);
            }
            else {
                res.render('campgrounds/show', {campground: campground});    
            }
        });
    });

// ------------------ Comments Routes --------------------

app.route('/campgrounds/:id/comments/new')                      // New
    .get(isLoggedIn, (req, res) => {
        Campground.findById(req.params.id, (error, campground) => {
            if (error) {
                console.log(error);
            }
            else {
                res.render('comments/new', {campground: campground})
            }
        })
    });

app.route('/campgrounds/:id/comments')
    .post(isLoggedIn, (req, res) => {                                       // Create
        // Lookup campground using ID
        Campground.findById(req.params.id, (error, campground) => {
            if (error) {
                console.log(error);
                res.redirect('/campgrounds');
            }
            else {
                // Create new comment document
                Comment.create(req.body.comment, (error, comment) => {
                    if (error) {
                        console.log(error);
                    }
                    else {
                        // Associate new comment with campground                    
                        campground.comments.push(comment);
                        campground.save();
                        // Redirect to campground show page                        
                        res.redirect(`/campgrounds/${campground._id}`);
                    }
                });
            }
        });
    });

// ------------------ Authentication Routes --------------------

app.route('/register')
    .get(function(req, res) {                              // Show register form
        res.render('register');
    })
    .post(function(req, res) {                              // Register new user
        let newUser = new User({username: req.body.username});
        User.register(newUser, req.body.password, function(error, user) {
            if (error) {
                console.log(error);
                return res.redirect('/register');
            }
            passport.authenticate('local')(req, res, function() {
                res.redirect('/campgrounds');
            });
        });
    });

app.route('/login')
    .get(function(req, res) {                                 // Show login form
        res.render('login');
    })
    .post(passport.authenticate("local", {                        // Log in user
        successRedirect: '/campgrounds',
        failureRedirect: '/login'
    }));

app.route('/logout')                                             // Log user out
    .get(function(req, res) {
        req.logout();
        res.redirect('/campgrounds');
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
// TODO: Consistent use of anonymous function OR arrow notation
// TODO: Consistent use of var OR let