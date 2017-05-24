const rp = require('request-promise');

var NodeGeocoder = require('node-geocoder');
var striptags = require('striptags');
var { meetup } = require('./meetup');

var scrapeMeetup = ((apiKey,address, callback) => {
    var thisFlag = true;
    //var detailsArray = [];
    var json = {};
    var eventName = "name", eventLocation = "location", eventTime = "time", eventLatLng = "latlng", eventDetails = "details";

    //console.log('meetup')
    var addressCoordinates;
    var options = {
        provider: 'google',

        // Optional depending on the providers 
        httpAdapter: 'https', // Default 
        apiKey: `${apiKey}`, // for Mapquest, OpenCage, Google Premier 
        formatter: null         // 'gpx', 'string', ... 
    };
    var geocoder = NodeGeocoder(options);

    geocoder.geocode(address).then(function (res) {

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

                    //socket.emit('meetupData', json);
                    callback(json);
                    thisFlag = false;
                }
            }
        });
    });
});

module.exports = {
    scrapeMeetup,
};