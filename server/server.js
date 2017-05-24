/*  Google Maps API keys

    Usman: AIzaSyAhYlzJrh5hdjCLLIg3-OWnsrccBziPfDQ
    Sheikh: AIzaSyCBE2UkT6mcn3qxK6ip9IEaHQs26EsyKTg

*/
const apiKey = 'AIzaSyCBE2UkT6mcn3qxK6ip9IEaHQs26EsyKTg';

const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const hbs = require('hbs');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

// const axios = require('axios');
// const rp = require('request-promise');
// const request = require('request');
// var NodeGeocoder = require('node-geocoder');
// var YouTube = require('youtube-node');
// var striptags = require('striptags');
// var cheerio = require('cheerio'); // Basically jQuery for node.js 

var { scrapeMeetup } = require('./utils/scrapeMeetup');
var { scrapeLandmarks } = require('../server/utils/landmarks');
var { scrapeBlogs } = require('../server/utils/blogs');
var { scrapeWiki } = require('../server/utils/wiki');
var { scrapeVideos } = require('../server/utils/youtube');
var { myEvents } = require('../server/utils/myevents');

var app = express();
app.set('view engine', 'hbs');
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));
//console.log(port);

io.on(`connection`, (socket) => {

    console.log('new user connection');

    socket.on('scrapeWiki', (address) => {

        scrapeWiki(address.address, function (json1) {
            //console.log(json1);
            socket.emit('returnWikiData', json1);
        });

    });

    socket.on('videos', (address) => {
        scrapeVideos(address.address, function (result) {
            //console.log(json1);
            socket.emit('videosData', result);
        });
    });

    socket.on('landmarks', (address) => {
        scrapeLandmarks(address.address, function (jsonLandmark) {
            socket.emit('landmark-data', { jsonLandmark });
        });
    });

    socket.on('scrapeBlogs', (address) => {
        scrapeBlogs(address.address, function (blogs) {
            socket.emit('blogsData', blogs);
        });
    });

    socket.on('myEvents', (address) => {
        myEvents(address.address, function (json) {
            //console.log(json);
            socket.emit("eventsData", json);
        });
    });
    socket.on('meetup', (address) => {
        scrapeMeetup(apiKey ,address.address, function (json) {
            //console.log(json);
            socket.emit('meetupData', json);
        });
    });

});
// app.get('/youtube/:id', (request, response) => {
//     var id = request.params.id;
//     //console.log(id);
//     response.render('youtube.hbs', {   //render checks for templates you have made, in this case about.hbs and home.hbs
//         src: id,
//         //currentYear: new Date().getFullYear(),
//     });
// });

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
