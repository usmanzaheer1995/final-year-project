const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const rp = require('request-promise');
const axios = require('axios');
var NodeGeocoder = require('node-geocoder');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var app = express();

var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));

io.on(`connection`, (socket) => {

    console.log('new user connection');

    socket.on('scrapeWiki', (address) => {
        var cheerio = require('cheerio'); // Basically jQuery for node.js 

        console.log('scraping wiki');

        var addr = address.address;
        var newAddress = encodeURI(addr);

        var options = {
            uri: `https://en.wikipedia.org/wiki/${newAddress}`,
            transform: function (body) {
                return cheerio.load(body);
            }
        };
        // console.log(options.uri);
        rp(options)
            .then(function ($) {
                // Process html like you would with jQuery... 
                var json = {};

                $("table.vcard tr").each(function (tr_index, tr) {
                    var th_text = $(this).find("th").text();
                    var prop_name = th_text.trim().toLowerCase().replace(/[^a-z]/g, " ");

                    json[prop_name] = $(this).find("td").text();

                    // if ({ "capital": 1 }[prop_name]) {
                    //     //console.log('Capital: ');
                    //     capital = $(this).find("td").text();
                });
                console.log('scrapping done');
                socket.emit('returnWikiData', json);
            })
            .catch(function (err) {
                // Crawling failed or Cheerio choked... 
            });

        options = {
            uri: `http://www.myevents.pk/event_loc/${newAddress}-events/`,
            transform: function (body) {
                return cheerio.load(body);
            }
        };
        console.log(addr);
        if (addr.toLowerCase() !== 'islamabad' && addr.toLowerCase() !== 'karachi' && addr.toLowerCase() !== 'lahore') {
            addr = 'other-cities';
            options.uri = `http://www.myevents.pk/event_loc/${addr}/`;
        }

        console.log(options.uri);
        rp(options)
            .then(function ($) {
                // Process html like you would with jQuery... 

                var json = {};
                var eventName = "name", eventLocation = "location", eventTime = "time", eventLatLng = "latlng";
                console.log("HERE");
                $('#cat-listing-holder .listing-container').each(function () {
                    var name = ($(this).find('.listing-container-block-title').children('a').text());
                    // console.log(json[eventName]);
                    //var location = ($(this).find('.listing-container-block-title .listing-container-tagline').clone().children().remove().end().text().replace(/\s+/g, ' ')));
                    var location = ($(this).find('.listing-container-block-title .listing-container-tagline').clone().children().remove().end().text().replace(/\s+/g, ' '))
                    //console.log(location);
                    var time = ($(this).find('.listing-container-rating').find('span').text() + "\n");

                    var options = {
                        provider: 'google',

                        // Optional depending on the providers 
                        httpAdapter: 'https', // Default 
                        apiKey: 'AIzaSyAhYlzJrh5hdjCLLIg3-OWnsrccBziPfDQ', // for Mapquest, OpenCage, Google Premier 
                        formatter: null         // 'gpx', 'string', ... 
                    };
                    var geocoder = NodeGeocoder(options);

                    // Using callback 
                    geocoder.geocode(location).then(function (res) {
                        if (res[0]) {
                            json[eventLocation] = location;
                            json[eventName] = name;
                            json[eventTime] = time;

                            var lat = res[0].latitude;
                            var lng = res[0].longitude;
                            json[eventLatLng] = { lat: lat, lng: lng };


                            //console.log(json[eventName]);
                            //console.log(json[eventLocation]);
                        }
                    }).then(() => {

                        socket.emit("eventsData", json);
                    })
                        .catch(function (err) {
                            console.log(err);
                        });

                });

            })
            .catch(function (err) {
                // Crawling failed or Cheerio choked... 
            });

    });

});

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});