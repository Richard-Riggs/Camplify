YelpCamp is a web application for viewing, posting, and reviewing campgrounds. The campgrounds page presents visitors with a grid
of cards containing the posted campgrounds. Visitors can click the "more info" link on the cards to visit the campground's show page,
which presents additional information about the campground. Authenticated users are able to post new campgrounds and submit campground
reviews. Authorized users are able to edit and delete their own campgrounds and reviews.

YelpCamp is the final project in Colt Steele's Web Developer Bootcamp course on Udemy. In this project, I've been able to implement
the various technologies I've learned throughout this course. YelpCamp employs the following technologies:
  - Node.js
  - Express
  - MongoDB / MongoDB Atlas
  - EJS Templating for generating HTML
  - CSS / Bootstrap
  - jQuery
  - Passport
For a full list of the Node packages used by YelpCamp, please view the package.json file.

Running YelpCamp is simple. In the app.js file, edit the following constants at the end of the file:

  const hostname = '...'; // String
  
  const port = ####;      // Integer
  
Simply supply the server's hostname and port number in the respective constants. In addition, the secrets.js file (not included on GitHub)
must be present in the projects root folder to start the application. Once these tasks have been completed simply enter the following
command in the command line:
  node app.js
  
  
======== TODO ========

GENERAL FEATURES
- Add footer to all pages
- Consistent use of var vs let
- Consistent use of anonymous function OR arrow notation
- X - Implement user ratings (1-5 stars) --------------------------------[Completed 1/5/2020]
- X - Implement campground locations-------------------------------------[Completed 1/12/2020]
- X - Implement pagination features -------------------------------------[Completed 1/5/2020]
- Sanitize all inputs
- Generate campgrounds & reviews

LANDING PAGE
- Add section(s) for features
- Change images on background slideshow
- Add page footer

INDEX PAGE
- Abbreviate card description
- X - Include average rating on card ------------------------------------[Completed 1/9/2020]
- Include city/state for each card
- X - Add pagination (show 12 campground cards/page) [Completed 1/5/2020]
- X - Include sort-by feature (newest, most reviewed, highest reviewed)  [Completed 1/7/2020]
- Update index header
- Add page footer

SHOW PAGE
- X - Include GPS/map info in sidebar -----------------------------------[Completed 1/12/2020]
- Show city/state (perhaps as card subtitle)
- Update/remove unused sidebar tabs
- X - Display rating (1-5 stars) for each campground --------------------[Completed 1/9/2020]
- Update review display
- X - Include review pagination -----------------------------------------[Completed 1/9/2020]
- Add page footer
  
CAMPGROUND NEW/EDIT FORM
- Update form styling
- Set all form fields as required
- Set max limit for campground name + description length
- Verify that image URL is valid

COMMENT NEW/EDIT
- X - Include and require 1-5 star rating -------------------------------[Completed 1/9/2020]
- Set all form fields as required
- Set max limit for comment length
  
LOGIN/REGISTER FORMS
- Update form styling
