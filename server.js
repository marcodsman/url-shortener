'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var validUrl = require('valid-url');

var cors = require('cors');
var bodyParser = require('body-parser');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGOLAB_URI);
var Schema = mongoose.Schema;

var UrlSchema = new Schema({
  name: String,
  urls: [String]
});

var Url = mongoose.model("Url", UrlSchema);

app.use(cors());
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false })

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

// My code
/*
// Seed the database
Url.create({name: "test1", urls: ["https://www.freecodecamp.org"]}, function(err, data){
    if(err){
      console.log(err);
    } else {
      console.log(data);
    }
});
*/

// Database id that I'm woking with
const id = "5c88d4e0ac691d3a1414d489"

app.post("/api/shorturl/new", urlencodedParser, function(req, res){
  const urlEntered = req.body.url; // Data submitted by the form
  // Add new url to the urls array
  var findEditSave = function(done){
    Url.findOneAndUpdate(
      {_id: id},
      {$push: {urls: urlEntered}},
      {new: true},
      function(err,data){
        if(err){
          console.log(err);
        } else {
          console.log("updated");
          const shortUrl = data.urls.length;
          res.json({"original_url": urlEntered, "short_url":shortUrl});
        }
      }, done
    );
  }
  // Check if the entered URL is valid
  if(validUrl.isWebUri(urlEntered)){
    console.log("seems valid");
    findEditSave();
  } else {
    console.log("invalid URL entered");
  }
});

app.get("/api/shorturl/:shortUrl", function(req, res){
  const shortUrl = req.params.shortUrl;
  var findAndRedirect = function(done){
    Url.find(
      {_id: id},
      function(err,data){
        if(err){
          console.log(err);
        } else {
          // Redirects based on the index of the URL in the array
          const redirectTo = data[0].urls[shortUrl-1];
          console.log("redirect to",redirectTo);
          res.redirect(redirectTo);
        }
      }
    );
  }
  findAndRedirect();
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});
