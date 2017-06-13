// Dependencies
var express = require("express");
var exphbs = require('express-handlebars');
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// Models
var Note = require("../models/Note.js");
var Article = require("../models/Article.js");

// Scraper Tools
var request = require("request");
var cheerio = require("cheerio");


module.exports = function(app) {


  // Routes
  // ======


  // Index
	app.get('/', function (req, res){

	  // Scrape data
	  res.redirect('/scrape');

	});




  // A GET request to scrape the echojs website
  app.get("/scrape", function(req, res) {
      // First, we grab the body of the html with request
      request("http://www.echojs.com/", function(error, response, html) {
          // Then, we load that into cheerio and save it to $ for a shorthand selector
          var $ = cheerio.load(html);
          // Now, we grab every h2 within an article tag, and do the following:
          $("article h2").each(function(i, element) {

              // Save an empty result object
              var result = {};

              // Add the text and href of every link, and save them as properties of the result object
              result.title = $(this).children("a").text();
              result.link = $(this).children("a").attr("href");
              result.toSave = false

              Article.count({ title: result.title}, function (err, test){

                if (test == 0) {

              var entry = new Article(result);

              // Now, save that entry to the db
              entry.save(function(err, doc) {
                  // Log any errors
                  if (err) {
                      console.log(err);
                  }
                  // Or log the doc
                  else {
                      console.log(doc);
                  }
              });



                }
              })

          });
      });
      // Tell the browser that we finished scraping the text
      // res.send("Scrape Complete");
      res.redirect('/articles');

  });

  // This will get the articles we scraped from the mongoDB
  app.get("/articles", function(req, res) {

      // Find all notes in the note collection with our Note model
      Article.find().sort({_id: -1})
      .populate('comments')
      .exec(function(error, doc) {
      	if (error) {
      		console.log(error)
      	}
      	else {
      		var hbsObject = {articles: doc}
      		res.render('index', hbsObject)
      	}
      })
  });

  // This will get the articles we scraped from the mongoDB
  app.get("/saved", function(req, res) {

      // Find all notes in the note collection with our Note model
      Article.find({toSave: true})
      .populate('comments')
      .exec(function(error, doc) {
        if (error) {
          console.log(error)
        }
        else {
          var hbsObject = {savedarticles: doc}
          res.render('index', hbsObject)
        }
      })
  });

  // This will grab an article by it's ObjectId
  app.get("/articles/:id", function(req, res) {


      // TODO
      // ====

      // Finish the route so it finds one article using the req.params.id,

      // and run the populate method with "note",

      // then responds with the article with the note included

      Article.findOne({ _id: [req.params.id] })
          .populate("note")
          .exec(function(error, doc) {
              if (error) {
                  res.send(error);
              } else {
                  res.json(doc);
              }
          })
  });

  // Create a new note or replace an existing note
  app.post("/articles/:id", function(req, res) {


      // TODO
      // ====

      // save the new note that gets posted to the Notes collection

      // then find an article from the req.params.id

      // and update it's "note" property with the _id of the new note
      var newNote = new Note(req.body);

      newNote.save(function(error, doc) {
          if (error) {
              console.log(error)
          } else {
              Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
                  .exec(function(err, doc) {
                      if (error) {
                          console.log(error);
                      } else {
                          res.send(doc);
                      }
                  })
            }
        })
    });
}
