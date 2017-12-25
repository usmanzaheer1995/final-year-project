require('./config/config');

const apiKey = process.env.GOOGLE_API_KEY;

const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const hbs = require('hbs');

var { scrapeMeetup } = require('./utils/scrapeMeetup');
var { scrapeLandmarks } = require('../server/utils/landmarks');
var { scrapeBlogs } = require('../server/utils/blogs');
var { scrapeWiki, landmarksWiki } = require('../server/utils/wiki');
var { scrapeVideos } = require('../server/utils/youtube');
var { myEvents } = require('../server/utils/myevents');
var { allEvents } = require('../server/utils/allevents');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

var app = express();
app.set('view engine', 'hbs');
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));

io.on(`connection`, socket => {
  console.log('new user connection');

  socket.on('landmarks-wiki', address => {
    landmarksWiki(address.address, function(json1) {
      if (json1) socket.emit('returnWikiData', json1);
    });
  });

  socket.on('scrapeWiki', address => {
    scrapeWiki(address.address, function(json1) {
      if (json1) socket.emit('returnWikiData', json1);
    });
  });

  socket.on('videos', address => {
    scrapeVideos(address.address, function(result) {
      socket.emit('videosData', result);
    });
  });

  socket.on('landmarks', address => {
    scrapeLandmarks(apiKey, address.address, function(jsonLandmark) {
      if (jsonLandmark) {
        socket.emit('landmark-data', { jsonLandmark });
      }
    });
  });

  socket.on('scrapeBlogs', address => {
    scrapeBlogs(address.address, function(blogs) {
      socket.emit('blogsData', blogs);
    });
  });

  socket.on('myEvents', address => {
    myEvents(apiKey, address.address, function(json) {
      if (json) socket.emit('eventsData', json);
    });
  });

  function checkIfNameExists(arr, newName) {
    return arr.some(function(e) {
      return e.name === newName;
    });
  }
  socket.on('allEvents', address => {
    console.log('allevents emit');
    allEvents(apiKey, address.address, function(json) {
      if (json) {
        socket.emit('allEventsData', json);
      }
    });
  });

  socket.on('meetup', address => {
    scrapeMeetup(apiKey, address.address, function(json) {
      if (json) socket.emit('meetupData', json);
    });
  });
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
