const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const rp = require('request-promise');
const request = require('request');
const axios = require('axios');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var NodeGeocoder = require('node-geocoder');
var { meetup } = require('./utils/meetup');
var striptags = require('striptags');
var cheerio = require('cheerio'); // Basically jQuery for node.js 

var app = express();

var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));


io.on(`connection`, (socket) => {

    console.log('new user connection');

    socket.on('scrapeWiki', (address) => {


        console.log('scraping wiki');

        var addr = address.address;
        var newAddress = encodeURI(addr);

        let options3 = {
            uri: `https://en.wikipedia.org/wiki/${newAddress}`,
            transform: function (body) {
                return cheerio.load(body);
            }
        };
        // console.log(options.uri);
        rp(options3)
            .then(function ($) {
                // Process html like you would with jQuery... 
                console.log('WIKI');
                var json1 = {};

                $("table.vcard tr").each(function (tr_index, tr) {
                    var th_text = $(this).find("th").text();
                    var prop_name = th_text.trim().toLowerCase().replace(/[^a-z]/g, " ");

                    json1[prop_name] = $(this).find("td").text();

                    // if ({ "capital": 1 }[prop_name]) {
                    //     //console.log('Capital: ');
                    //     capital = $(this).find("td").text();
                });
                // console.log('scrapping done');
                socket.emit('returnWikiData', json1);
            })
            .catch(function (err) {
                // Crawling failed or Cheerio choked... 
            });

    });

    socket.on('myEvents', (address) => {
        var detailsArray = [];
        var json = {};
        var eventName = "name", eventLocation = "location", eventTime = "time", eventLatLng = "latlng", eventDetails = "details";

        var addr = address.address;
        var newAddress = encodeURI(addr);

        var options = {
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

                /* var json = {};
                 var eventName = "name", eventLocation = "location", eventTime = "time", eventLatLng = "latlng", eventDetails = "details"
                     , details = "e_details";*/
                console.log("HERE");
                $('#cat-listing-holder .listing-container').each(function () {
                    var name = ($(this).find('.listing-container-block-title').children('a').text());
                    // console.log(json[eventName]);
                    //var location = ($(this).find('.listing-container-block-title .listing-container-tagline').clone().children().remove().end().text().replace(/\s+/g, ' ')));
                    var location = ($(this).find('.listing-container-block-title .listing-container-tagline').clone().children().remove().end().text().replace(/\s+/g, ' '))
                    //console.log(location);
                    var time = ($(this).find('.listing-container-rating').find('span').text() + "\n");

                    var details = ($(this).find('.listing-container-block-title').children('a').attr('href'));

                    var options = {
                        provider: 'google',

                        // Optional depending on the providers 
                        httpAdapter: 'https', // Default 
                        apiKey: 'AIzaSyAhYlzJrh5hdjCLLIg3-OWnsrccBziPfDQ', // for Mapquest, OpenCage, Google Premier 
                        formatter: null         // 'gpx', 'string', ... 
                    };
                    var geocoder = NodeGeocoder(options);

                    geocoder.geocode(location).then(function (res) {
                        if (res[0]) {
                            json[eventLocation] = location;
                            //json[eventLocation].push(location);
                            json[eventName] = name;
                            //json[eventName].push(name);
                            json[eventTime] = time;
                            json[eventDetails] = details;

                            var lat = res[0].latitude;
                            var lng = res[0].longitude;
                            json[eventLatLng] = { lat: lat, lng: lng };

                            detailsArray.push(json[eventDetails]);
                            //console.log('hi');
                            // console.log(json[eventName]);
                            // console.log("--------------")

                        }
                     })//.then(() => {
                    //     //let i = 0;
                        
                    //     request(json[eventDetails], function (error, response, html) {
                    //         if (!error && response.statusCode == 200) {
                    //             var $ = cheerio.load(html);
                    //             console.log(json[eventDetails]);
                    //             console.log($('.item-block-content').find('p').eq(1).text());
                    //         }
                    //     });
                    /*})*/.then(() => {
                        // console.log(json[eventName]);
                        socket.emit("eventsData", json);
                        // console.log(name + " emitted");
                    })
                        .catch(function (err) {
                            console.log(err);
                        });
                });
            });
    });
    socket.on('meetup', (address) => {
        var thisFlag = true;
        //var detailsArray = [];
        var json = {};
        var eventName = "name", eventLocation = "location", eventTime = "time", eventLatLng = "latlng", eventDetails = "details";

        //console.log('meetup')
        var addressCoordinates;
        var options1 = {
            provider: 'google',

            // Optional depending on the providers 
            httpAdapter: 'https', // Default 
            apiKey: 'AIzaSyAhYlzJrh5hdjCLLIg3-OWnsrccBziPfDQ', // for Mapquest, OpenCage, Google Premier 
            formatter: null         // 'gpx', 'string', ... 
        };
        var geocoder = NodeGeocoder(options1);

        geocoder.geocode(address.address).then(function (res) {

            var lat = res[0].latitude;
            var lng = res[0].longitude;
            addressCoordinates = { lat: lat, lng: lng };

        }).then(() => {
            //console.log('hello');
            meetup().get({
                //topic: 'photo',
                //city: 'nyc',
                lat: String(addressCoordinates.lat),
                lon: String(addressCoordinates.lng),
            }, function (results) {
                //console.log(results);

                if (thisFlag === true) {
                    console.log('meetup');
                    var meetupList = meetup().parseEvents(results);
                    for (var i = 0; i < results.length; ++i) {
                        if (results[i].venue) {
                            var lat = results[i].venue.lat;
                            var lng = results[i].venue.lon;
                            json[eventLatLng] = { lat: lat, lng: lng };
                            json[eventLocation] = results[i].venue.name + ', ' + results[i].venue.address_1 + ', ' + results[i].venue.city;
                        }
                        json[eventName] = results[i].name;

                        json['description'] = striptags(results[i].description);
                        json[eventDetails] = results[i].event_url;

                        //console.log(json[eventDetails]);

                        socket.emit('eventsData', json);
                        thisFlag = false;
                    }
                }
                // console.log(JSON.stringify(meetupList, undefined, 2));
            });
        });//.then(() => {
        //     console.log(json);
        // });
    });


});
server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
