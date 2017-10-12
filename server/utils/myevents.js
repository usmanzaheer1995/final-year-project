const rp = require('request-promise');
const request = require('request');
const axios = require('axios');

var NodeGeocoder = require('node-geocoder');
var cheerio = require('cheerio'); // Basically jQuery for node.js

var myEvents = (apiKey, address, callback) => {
  var detailsArray = [];
  var json = {};
  var eventName = 'name',
    eventLocation = 'location',
    eventTime = 'time',
    eventLatLng = 'latlng',
    eventDetails = 'details';

  var addr = address;
  var newAddress = encodeURI(addr);

  var options = {
    uri: `http://www.myevents.pk/event_loc/${newAddress}-events/`,
    transform: function(body) {
      return cheerio.load(body);
    }
  };
  console.log(addr);
  if (
    addr.toLowerCase() !== 'islamabad' &&
    addr.toLowerCase() !== 'karachi' &&
    addr.toLowerCase() !== 'lahore'
  ) {
    addr = 'other-cities';
    options.uri = `http://www.myevents.pk/event_loc/${addr}/`;
  }

  console.log(options.uri);
  rp(options).then(function($) {
    // Process html like you would with jQuery...

    console.log('MY-EVENTS');
    $('#cat-listing-holder .listing-container').each(function() {
      var name = $(this)
        .find('.listing-container-block-title')
        .children('a')
        .text();
      //console.log(name);
      // console.log(json[eventName]);
      //var location = ($(this).find('.listing-container-block-title .listing-container-tagline').clone().children().remove().end().text().replace(/\s+/g, ' ')));
      var location = $(this)
        .find('.listing-container-block-title .listing-container-tagline')
        .clone()
        .children()
        .remove()
        .end()
        .text()
        .replace(/\s+/g, ' ');
      //console.log(location);
      var time =
        $(this)
          .find('.listing-container-rating')
          .find('span')
          .text() + '\n';

      var details = $(this)
        .find('.listing-container-block-title')
        .children('a')
        .attr('href');

      // --------------------AXIOS----------------------------- //

      // let abc = encodeURI(location)
      // let geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${abc}`;
      // axios.get(geocodeUrl).then((response) => {
      //     if (response.data.status == 'ZERO_RESULTS') {
      //         throw new Error('Unable to find that address.');    // move to catch block
      //     }

      //     if (response.data.results.length > 0 && response.statusCode !== 400) {
      //         var latitude = response.data.results[0].geometry.location.lat;
      //         var longitude = response.data.results[0].geometry.location.lng;

      //         // console.log(geocodeUrl);
      //         // console.log(longitude, latitude);
      //         json[eventLocation] = location;
      //         //json[eventLocation].push(location);
      //         json[eventName] = name;
      //         //json[eventName].push(name);
      //         json[eventTime] = time;
      //         json[eventDetails] = details;
      //         json[eventLatLng] = { lat: latitude, lng: longitude };
      //         detailsArray.push(json[eventDetails]);
      //     }
      // });
      // --------------------END OF AXIOS----------------------------- //

      // --------------------NODE-GEOCODER---------------------------- //

      var options = {
        provider: 'google',

        // Optional depending on the providers
        httpAdapter: 'https', // Default
        apiKey: `${apiKey}`, // for Mapquest, OpenCage, Google Premier
        formatter: null // 'gpx', 'string', ...
      };
      var geocoder = NodeGeocoder(options);

      geocoder
        .geocode(location)
        .then(function(res) {
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
            // console.log(json[eventName]);
            // console.log("--------------")
          }
        }) //.then(() => {
        //     //let i = 0;

        //     request(json[eventDetails], function (error, response, html) {
        //         if (!error && response.statusCode == 200) {
        //             var $ = cheerio.load(html);
        //             console.log(json[eventDetails]);
        //             console.log($('.item-block-content').find('p').eq(1).text());
        //         }
        //     });
        /*})*/
        // --------------------END OFNODE-GEOCODER---------------------------- //

        .then(() => {
          //console.log(json);
          callback(json);
          // console.log(name + " emitted");
        })
        .catch(function(err) {
          console.log(err);
        });
    });
    callback(null);
  });
};

module.exports = {
  myEvents
};
