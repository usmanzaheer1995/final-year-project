const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const rp = require('request-promise');
const request = require('request');
const hbs = require('hbs');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var NodeGeocoder = require('node-geocoder');
var { meetup } = require('./utils/meetup');
var YouTube = require('youtube-node');
var striptags = require('striptags');
var cheerio = require('cheerio'); // Basically jQuery for node.js 

var app = express();
app.set('view engine', 'hbs');
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));
//console.log(port);

io.on(`connection`, (socket) => {

    console.log('new user connection');

    socket.on('scrapeWiki', (address) => {

        console.log('scraping wiki');

        var addr = address.address;
        console.log(addr);
        var newAddress = encodeURI(addr);
        console.log(newAddress);
        let options3 = {
            uri: `https://en.wikipedia.org/wiki/${newAddress}`,
            transform: function (body) {
                return cheerio.load(body);
            }
        };
        console.log(options3.uri);
        rp(options3)
            .then(function ($) {
                // Process html like you would with jQuery... 
                console.log('WIKI');
                var json1 = {};

                $("table.infobox tr").each(function (tr_index, tr) {
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

    socket.on('videos', (address) => {
        console.log('videos');
        let newAddress = address.address;
        console.log(newAddress)
        var youTube = new YouTube();
        youTube.setKey('AIzaSyAhYlzJrh5hdjCLLIg3-OWnsrccBziPfDQ');
        youTube.addParam("type", 'video');
        youTube.search(newAddress + " facts", 2, function (error, result) {
            if (error) {
                console.log(error);
            }
            else {
                // console.log(JSON.stringify(result.items[i].id.videoId, null, 2));
                // console.log(JSON.stringify(result.items[i].snippet.title, null, 2));
                socket.emit('videosData', result);
            }
        });
        youTube.search(newAddress + " documentary", 2, function (error, result) {
            console.log('documentary')
            if (error) {
                console.log(error);
            }
            else {
                socket.emit('videosData', result);
            }
        });

        youTube.search(newAddress + " best resturants", 2, function (error, result) {
            console.log('documentary')
            if (error) {
                console.log(error);
            }
            else {
                socket.emit('videosData', result);
            }
        });
    });

    socket.on('landmarks', (address) => {
        let newAddress = encodeURI(address.address);
        console.log(newAddress);
        var phrases = [];
        var jsonLandmark = {};
        var landmarkName = 'landmark', landmarkLat = 'lat', landmarkLng = 'lng';
        var options = {
            uri: `http://pakistani.pk/category/things-to-do/${newAddress}-attractions/tag/attractions/landmarks/`,
            transform: function (body) {
                return cheerio.load(body);
            }
        };
        console.log(options.uri);

        var options1 = {
            provider: 'google',

            // Optional depending on the providers 
            httpAdapter: 'https', // Default 
            apiKey: 'AIzaSyAhYlzJrh5hdjCLLIg3-OWnsrccBziPfDQ', // for Mapquest, OpenCage, Google Premier 
            formatter: null         // 'gpx', 'string', ... 
        };
        var geocoder = NodeGeocoder(options1);
        rp(options)
            .then(function ($) {
                console.log('hi');
                //landmarkName = 'landmark', landmarkLat = 'lat', landmarkLng = 'lng';
                $('.jrTableGrid.jrDataList.jrResults').find('.jrRow').each(function () {
                    //console.log($(this).find('.jr-listing-outer').find('.jrContentTitle').find('a').text());
                    phrases.push($(this).find('.jr-listing-outer').find('.jrContentTitle').find('a').text());
                });
            }).then(() => {
                for (let i = 0; i < phrases.length; ++i) {
                    geocoder.geocode(phrases[i]).then(function (res) {
                        if (res[0] && res.statusCode !== 400) {
                            //console.log(phrases[i]);
                            //console.log(res[0].latitude, res[0].longitude)
                            jsonLandmark[landmarkName] = phrases[i];
                            jsonLandmark[landmarkLat] = res[0].latitude;
                            jsonLandmark[landmarkLng] = res[0].longitude;
                            socket.emit('landmark-data', { jsonLandmark });
                            //console.log(typeof json['lat'])
                            // json['landmark-position'] = { lat: res[0].latitude, lng: res[0].longitude };
                        }



                    });
                    //console.log(phrases[i]);
                }
            })
            .catch(function (err) {
                // Crawling failed or Cheerio choked... 
                console.log(err);
            });
    });

    socket.on('scrapeBlogs', (address) => {
        console.log('BLOGS');
        let blogs = {}
        let options = {
            uri: `http://blogs.tribune.com.pk/tag/${address.address}/`,
            transform: function (body) {
                return cheerio.load(body);
            }
        };
        rp(options)
            .then(function ($) {
                var abc = $('.page-content').find('.story').find('.title').find('a')
                for (let i = 0; i < abc.length; ++i) {

                    blogs['title'] = abc[i].attribs.title;
                    blogs['link'] = abc[i].attribs.href;

                    //console.log(blogs['title']);
                    //console.log(blogs['link']);
                    socket.emit('blogsData', blogs);
                }
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

                        socket.emit('meetupData', json);
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
app.get('/youtube/:id', (request, response) => {
    var id = request.params.id;
    //console.log(id);
    response.render('youtube.hbs', {   //render checks for templates you have made, in this case about.hbs and home.hbs
        src: id,
        //currentYear: new Date().getFullYear(),
    });
});

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
