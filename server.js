// Dependencies
var express = require("express");
var exphbs = require('express-handlebars');
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// Scraper Tools
var request = require("request");
var cheerio = require("cheerio");

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

// Initialize Express
var app = express();

// Morgan and Body Parser init
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
    extended: false
}));

// Public Static Dir
app.use(express.static("public"));

// Set Handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Import routes and give the server access to them.
require("./controllers/controllers.js")(app);


// Database Configuration with Mongoose
// ---------------------------------------------------------------------------------------------------------------
// For Production Environment
if(process.env.NODE_ENV == 'production'){
  mongoose.connect('mongodb://heroku_s23ms2fb:erq1g8uvbjo3hg7epe4lbcjbsr@ds125262.mlab.com:25262/heroku_s23ms2fb');
}
// For Local Environment
else{
  mongoose.connect('mongodb://localhost/week18day3mongoose');
}
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
    console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
    console.log("Mongoose connection successful.");
});


// Models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

// Launch App
var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log('Running on port: ' + port);
});
