require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const url = require('url');


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({extended: false}));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

//Array to store original_url and short_url key/value pairs. Array index will be used to asign new short_url ID's
const urlMap = [];

//URL Shortner middleware Functions

function urlValidator (req, res, next) {
  //Send Error if you cannot create a new URL or if the protocol is not http: or https:
  try {
    const myURL = new URL(req.body.url)
    if(myURL.protocol === 'http:' || myURL.protocol === 'https:') return next(); 
        //this is a little clunky but I wasnt able to get the dns.lookup(err, cb) function to throw errors correctly
    throw {error: 'invalid protocol'};
  } catch{
    res.send({ error: 'invalid url' })
  }
}

function createShortURL (req, res) {
  const myURL = new URL(req.body.url); //create new URL object to parse the submitted url
  const originalURL = myURL.href;
  const shortURL = urlMap.length;  //Assigns the next available index in urlMap as the shortURL ID
  urlMap.push( {
    original_url: originalURL,
    short_url: shortURL
  })
  res.send(urlMap[shortURL])
}

function routeToShortURL (req, res) {
  const shorturlID = parseInt(req.params.shorturlID)
  const originalURL = urlMap[shorturlID].original_url
  try {
    res.redirect(originalURL)
  } catch {
    res.send({error: 'invalid ShortURL'});
  }  
}

//API Endpoints for URL Shortener Service

app.post(
  '/api/shorturl/:shorturlID?',
  urlValidator,
  createShortURL
)

app.get(
  '/api/shorturl/:shorturlID?',
  routeToShortURL
)
