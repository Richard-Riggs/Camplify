//======================= MODULES =======================

const express          = require("express"),
      bodyParser       = require("body-parser"),
      methodOverride   = require("method-override"),
      flash            = require("connect-flash"),
      secrets          = require("./lib/secrets"),
      middleware       = require("./middleware"),
      moment           = require("moment"),

// MongoDB & Models
      mongoose         = require("mongoose"),
      User             = require("./models/user"),
      seedDB           = require("./lib/seeds"),

// Authentication
      passport         = require("passport"),
      LocalStrategy    = require("passport-local"),
      expressSession   = require("express-session"),

// Routes
      campgroundRoutes = require("./routes/campgrounds"),
      reviewRoutes    = require("./routes/reviews"),
      userRoutes       = require("./routes/users"),
      indexRoutes      = require("./routes/index"),
      favorites        = require("./routes/favorites"),
      testRoutes       = require("./routes/test"); //###############################

//===================== EXPRESS SETUP ====================

const app = express();
app.use(bodyParser.urlencoded({extended: true}))
   .use(bodyParser.json())
   .use(express.static(`${__dirname}/public`))
   .use(methodOverride('_method'))
   .set("view engine", "ejs");

app.locals.moment = require('moment');

//==================== AUTHENTICATION ====================

app.use(expressSession({
        secret: secrets.secret,
        resave: false,
        saveUninitialized: false }))
   .use(passport.initialize())
   .use(passport.session())
   .use(middleware.passUserObjectToTemplate);

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//==================== FLASH MESSAGES ====================

app.use(flash())
   .use(middleware.passFlashMessageToTemplate);


//======================= DATABASE =======================

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
// seedDB();


//======================= ROUTING =======================

app.use(campgroundRoutes)
   .use(reviewRoutes)
   .use(indexRoutes)
   .use(userRoutes)
   .use(testRoutes) //##########################################
   .use(favorites);

// Error handler - must be last middleware used
app.use(middleware.handleErrors);

//===================== START SERVER ====================

app.listen(process.env.PORT || 3000, function () {
    console.log("The YelpCamp server has started");
});
