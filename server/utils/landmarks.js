const rp = require('request-promise');
const request = require('request');
const axios = require('axios');

var NodeGeocoder = require('node-geocoder');
var cheerio = require('cheerio'); // Basically jQuery for node.js

var scrapeLandmarks = (apiKey, address, callback) => {
  let newAddress = encodeURI(address);
  console.log(newAddress);
  var phrases = [];
  var jsonLandmark = {};
  var landmarkName = 'landmark',
    landmarkLat = 'lat',
    landmarkLng = 'lng';
  var options = {
    uri: `http://pakistani.pk/category/things-to-do/${newAddress}-attractions/tag/attractions/landmarks/`,
    transform: function(body) {
      return cheerio.load(body);
    }
  };

  var options1 = {
    provider: 'google',

    // Optional depending on the providers
    httpAdapter: 'https', // Default
    apiKey: `${apiKey}`, // for Mapquest, OpenCage, Google Premier
    formatter: null // 'gpx', 'string', ...
  };
  var geocoder = NodeGeocoder(options1);

  rp(options)
    .then(function($) {
      console.log('landmarks');
      $('.jrTableGrid.jrDataList.jrResults')
        .find('.jrRow')
        .each(function() {
          phrases.push(
            $(this)
              .find('.jr-listing-outer')
              .find('.jrContentTitle')
              .find('a')
              .text()
          );
        });
    })
    .then(() => {
      for (let i = 0; i < phrases.length; ++i) {
        geocoder
          .geocode(phrases[i] + newAddress)
          .then(function(res) {
            if (res[0] && res.statusCode !== 400) {
              jsonLandmark[landmarkName] = phrases[i];
              jsonLandmark[landmarkLat] = res[0].latitude;
              jsonLandmark[landmarkLng] = res[0].longitude;
              callback(jsonLandmark);
            }
          })
          .catch(err => console.log(err.message));
      }
    })
    .catch(function(err) {
      // Crawling failed or Cheerio choked...
      console.log(err);
    });
  callback(null);
};

module.exports = {
  scrapeLandmarks
};
