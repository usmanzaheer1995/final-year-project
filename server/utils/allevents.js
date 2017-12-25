const rp = require('request-promise');

var NodeGeocoder = require('node-geocoder');
var cheerio = require('cheerio'); // Basically jQuery for node.js

var allEvents = (apiKey, address, callback) => {
  var json = {};
  var eventName = 'name',
    eventLocation = 'location',
    eventTime = 'time',
    eventLatLng = 'latlng',
    eventDetails = 'details';

  var newAddress = encodeURI(address);
  var options = {
    uri: `https://allevents.in/${newAddress}/all`,
    transform: function(body) {
      return cheerio.load(body);
    }
  };
  console.log(options.uri);
  rp(options).then(function($) {
    // Process html like you would with jQuery...

    console.log('ALLEVENTS');
    $('.event-item').each(function() {
      // name
      const name = $(this)
        .find('.event-body .left h3')
        .children('a')
        .text();

      // location
      const span1 = $(this)
        .find('.event-body .left p span')
        .first()
        .text()
        .trim();
      const span2 = $(this)
        .find('.event-body .left p')
        .children('span')
        .next()
        .text()
        .trim();
      const location = span1 + ', ' + span2;

      // time
      const time = $(this)
        .find('.event-body .right span')
        .text()
        .trim();

      // url
      const details = $(this)
        .find('.event-body .left h3')
        .children('a')
        .attr('href');

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
            json[eventName] = name;
            json[eventTime] = time;
            json[eventDetails] = details;

            var lat = res[0].latitude;
            var lng = res[0].longitude;
            json[eventLatLng] = { lat: lat, lng: lng };
          }
        })
        .then(() => {
          callback(json);
        })
        .catch(function(err) {
          console.log(err);
        });
    });
    callback(null);
  });
};

module.exports = {
  allEvents
};
