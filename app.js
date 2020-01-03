//======================= MODULES =======================

const express        = require("express"),
      bodyParser     = require("body-parser"),
      methodOverride = require("method-override"),
      flash          = require("connect-flash"),
      secrets        = require("./secrets"),
      middleware     = require("./middleware"),
      moment         = require("moment"),
      
// MongoDB & Models
      mongoose       = require("mongoose"),
      User           = require("./models/user"),
      seedDB         = require("./seeds"),

// Authentication
      passport       = require("passport"),
      LocalStrategy  = require("passport-local"),
      expressSession = require("express-session"),

// Routes
      campgroundRoutes = require("./routes/campgrounds"),
      commentRoutes = require("./routes/comments"),
      indexRoutes = require("./routes/index"),

      testRoutes = require("./routes/test"); //###############################

//===================== EXPRESS SETUP ====================

const app = express();
app.use(bodyParser.urlencoded({extended: true}))
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
   .use(commentRoutes)
   .use(indexRoutes)
   .use(testRoutes);


//===================== START SERVER ====================

//          AWS Cloud9 ENVIRONMENT
// const hostname = '0.0.0.0',
//       port = 8080;

//          LOCAL ENVIRONMENT
const hostname = '127.0.0.1';
const port = 3000;
// Access local website here:   http://127.0.0.1:3000/

app.listen(port, hostname, function () {
    console.log("The YelpCamp server has started");
});

//  Access Cloud9 website here:   
//  https://63dcbade7414481f8c2640d0eca49682.vfs.cloud9.us-east-1.amazonaws.com/





// TODO: City/state for each site (present as subtitle for cards)
// TODO: Consistent use of anonymous function OR arrow notation
// TODO: Consistent use of var OR let