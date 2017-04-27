const rp = require("request-promise");
const axios = require('axios');
var NodeGeocoder = require('node-geocoder');
var cheerio = require('cheerio'); // Basically jQuery for node.js 



// var NodeGeocoder = require('node-geocoder');
// var options = {
//     provider: 'google',

//     // Optional depending on the providers 
//     httpAdapter: 'https', // Default 
//     apiKey: 'AIzaSyAhYlzJrh5hdjCLLIg3-OWnsrccBziPfDQ', // for Mapquest, OpenCage, Google Premier 
//     formatter: null         // 'gpx', 'string', ... 
// };
// var geocoder = NodeGeocoder(options);

// // Using callback 
// geocoder.geocode('Sector H-10، Islamabad 44000, Pakistan', function (err, res) {
//     console.log(res[0].latitude);
// });

// var encodedAddress = encodeURIComponent('Dreamland Hotel Islamabad - 04 islamabad club road islamabad, Islamabad, Pakistan');
// var geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}`;
// axios.get(geocodeUrl).then((response) => {
//     if (response.data.status == 'ZERO_RESULTS') {
//         throw new Error('Unable to find that address.');    // move to catch block
//     }

//     var latitude = response.data.results[0].geometry.location.lat;
//     var longitude = response.data.results[0].geometry.location.lng;
//     console.log(latitude, " and " , longitude);


// }).catch((e) => {
//     if (e.code == 'ENOTFOUND') {
//         console.log('Unable to connect to API servers.');
//     }
//     else {
//         console.log(e.message);
//     }
// });

var options = {
    uri: 'http://www.myevents.pk/event_loc/islamabad-events/',
    transform: function (body) {
        return cheerio.load(body);
    }
};

rp(options)
    .then(function ($) {
        // Process html like you would with jQuery... 

        $('#cat-listing-holder .listing-container').each(function () {
            var location = ($(this).find('.listing-container-block-title .listing-container-tagline').clone().children().remove().end().text().replace(/\s+/g, ' '));
            // console.log($(this).find('.listing-container-block-title').children('span').text().replace(/\s+/g, ' '));
            // console.log($(this).find('.listing-container-rating').find('span').text() + "\n");
            var name = ($(this).find('.listing-container-block-title').children('a').text());
           // console.log(location);

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
                    console.log(location);
                    console.log(name);
                    // json[eventLocation] = res[0].formattedAddress;
                    // json[eventName] = name;
                    // json[eventTime] = time;

                    // var lat = res[0].latitude;
                    // var lng = res[0].longitude;
                    // json[eventLatLng] = { lat: lat, lng: lng };


                    //console.log(res[0].formattedAddress);
                    // console.log(json[eventLocation]);
                }
            });
        });


    })
    .catch(function (err) {
        // Crawling failed or Cheerio choked... 
    });