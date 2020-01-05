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
- Implement user ratings (1-5 stars)
- Implement campground locations
- Implement pagination features
- Sanitize all inputs
- Generate campgrounds & reviews

LANDING PAGE
- Add section(s) for features
- Change images on background slideshow
- Add page footer

INDEX PAGE
- Abbreviate card description
- Include average rating on card
- Include city/state for each card
- Add pagination (show 18 campground cards/page)
- Include sort-by feature (newest, most reviewed, highest reviewed)
- Update index header
- Add page footer (all pages)

SHOW PAGE
- Include GPS/map info in sidebar
- Show city/state (perhaps as card subtitle)
- Update/remove unused sidebar tabs
- Display rating (1-5 stars) for each campground
- Update review display
- Include review pagination
- Add page footer
  
CAMPGROUND NEW/EDIT FORM
- Update form styling
- Set all form fields as required
- Set max limit for campground name + description length
- Verify that image URL is valid

COMMENT NEW/EDIT
- Include and require 1-5 star rating
- Set all form fields as required
- Set max limit for comment length
  
LOGIN/REGISTER FORMS
- Update form styling
