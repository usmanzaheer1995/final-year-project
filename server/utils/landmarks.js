const rp = require('request-promise');
const request = require('request');
const axios = require('axios');

var NodeGeocoder = require('node-geocoder');
var cheerio = require('cheerio'); // Basically jQuery for node.js 


var scrapeLandmarks = ((apiKey, address, callback) => {
    let newAddress = encodeURI(address);
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
        apiKey: `${apiKey}`, // for Mapquest, OpenCage, Google Premier 
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

                //------------------NODE-GEOCODER------------------//

                geocoder.geocode(phrases[i]).then(function (res) {
                    if (res[0] && res.statusCode !== 400) {
                        //console.log(phrases[i]);
                        //console.log(res[0].latitude, res[0].longitude)
                        jsonLandmark[landmarkName] = phrases[i];
                        jsonLandmark[landmarkLat] = res[0].latitude;
                        jsonLandmark[landmarkLng] = res[0].longitude;
                        callback(jsonLandmark);
                    }})

                //------------------END OF NODE-GEOCODER------------------//

                //-------------------------AXIOS ------------------------//

                // let abc = encodeURI(phrases[i])
                // let geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${abc}`;
                // //console.log(geocodeUrl);
                // axios.get(geocodeUrl).then((response) => {
                //     if (response.data.results.length > 0 && response.statusCode !== 400) {

                //         //console.log('hi')
                //         let latitude = response.data.results[0].geometry.location.lat;
                //         let longitude = response.data.results[0].geometry.location.lng;

                //         //console.log(longitude, latitude);
                //         jsonLandmark[landmarkName] = phrases[i];
                //         jsonLandmark[landmarkLat] = latitude;
                //         jsonLandmark[landmarkLng] = longitude;
                //         // socket.emit('landmark-data', { jsonLandmark });
                //         callback(jsonLandmark);
                //     }
                // });

                //-------------------------END OF AXIOS--------------------------//

            }
        })
        .catch(function (err) {
            // Crawling failed or Cheerio choked... 
            console.log(err);
        });

});

module.exports = {
    scrapeLandmarks,
}
