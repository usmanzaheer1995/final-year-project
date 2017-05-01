const rp = require("request-promise");
const axios = require('axios');
var NodeGeocoder = require('node-geocoder');
var cheerio = require('cheerio'); // Basically jQuery for node.js 

var fs = require('fs');
var request = require('request');

var { meetup } = require('../server/utils/meetup');

var addressCoordinates;
var options1 = {
  provider: 'google',

  // Optional depending on the providers 
  httpAdapter: 'https', // Default 
  apiKey: 'AIzaSyAhYlzJrh5hdjCLLIg3-OWnsrccBziPfDQ', // for Mapquest, OpenCage, Google Premier 
  formatter: null         // 'gpx', 'string', ... 
};
var geocoder = NodeGeocoder(options1);

geocoder.geocode('islamabad').then(function (res) {

  var lat = res[0].latitude;
  var lng = res[0].longitude;
  addressCoordinates = { lat: lat, lng: lng };

  var obj = addressCoordinates.lat;
  //console.log(String(addressCoordinates.lat));
  //console.log();

}).then(() => {
  //console.log(addressCoordinates.lat, addressCoordinates.lng);
  meetup().get({
    //topic: 'photo',
    //city: 'nyc',
    lat: String(addressCoordinates.lat),
    lon: String(addressCoordinates.lng),
  }, function (results) {
    //console.log(results.length);
    var meetupList = meetup().parseEvents(results);
    for (var i = 0; i < meetupList.length; ++i) {
      var lat = meetupList[i].latitude;
      var lng = meetupList[i].longitude;
      // json[eventLatLng] = { lat: lat, lng: lng };

      //  json[eventName] = meetupList[i].name;
      // json[eventLocation] = meetupList[i].city;
      console.log(meetupList[i].name);
    }
    // console.log(JSON.stringify(meetupList, undefined, 2));
  });
});


// meetup().get({
//   // More Info: http://www.meetup.com/meetup_api/docs/2/open_events/
//   //topic: 'photo',
//   //city: 'nyc',
//   lat: '33.7293882',
//   lon: '73.0931461'
// }, function (results) {

//   var meetupList = meetup().parseEvents(results);
//   for(var i = 0; i< meetupList.length; ++i) {
//     var lat = meetupList[i].latitude;
//     console.log(lat);
//   }
//  // console.log(JSON.stringify(meetupList, undefined, 2));
// });

// var meetup = function() {
//   var key = fs.readFileSync('api_key.txt', 'utf-8');
//   var url = "https://api.meetup.com";

//   var composeURL = function(root, object) {
//     return root + '?' + JSON.stringify(object).replace(/":"/g, '=').replace(/","/g, '&').slice(2, -2)
//   }

//   var get = function(params, callback, path) {
//     params.key = key;

//     request.get(composeURL(url + (path || '/2/open_events'), params), function(err, res, body) {
//       if ( err ) {
//         console.error(err);
//         return false;
//       }


//       callback(JSON.parse(body)['results']);
//     })
//   }


//   var post = function(details, callback, path) {
//     details.key = key;

//     request.post({
//       headers: { 'content-type' : 'application/x-www-form-urlencoded' },
//       url: url + (path || '/2/event'),
//       form: details
//     }, function(err, res, body) {
//       callback(body);
//     })
//   }

//   var parseEvent = function(mEvent) {
//     /*
//      * A simple function that converts JSON to 
//      * string in a pretty way
//     **/
//     var name = mEvent['name'] || '';
//     var desc = mEvent['desc'] || '';
//     var url = mEvent['url'] || '';

//     if ( mEvent['venue'] ) {
//       var city = mEvent['venue']['city'] || '';
//       var lat = mEvent['venue']['lat'] || '';
//       var lon = mEvent['venue']['lon'] || '';
//     }

//     if ( mEvent['group'] )
//       var group = mEvent['group']['name'] || '';

//     var parsed = '';

//     if ( name ) parsed += 'Name: ' + name + '\n';
//     if ( desc ) parsed += 'Description: ' + desc + '\n';
//     if ( url ) parsed += 'Url: ' + url + '\n';
//     if ( city ) parsed += 'City: ' + city + '\n';
//     if ( lat ) parsed += 'Latitude: ' + lat + '\n';
//     if ( lon ) parsed += 'Longitude: ' + lon + '\n';
//     if ( group ) parsed += 'Group: ' + group + '\n';

//     return parsed;

//   };

//   var parseEvents = function(results) {
//     console.log('a');
//     for ( var i = 0; i < results.length; i++ ) {
//       console.log( parseEvent(results[i]) );
//     }
//   }

//   return {
//     get: get,
//     parseEvents: parseEvents,
//     post: post
//   };
// };



// meetup().get({
//   // More Info: http://www.meetup.com/meetup_api/docs/2/open_events/
//   //topic: 'photo',
//   //city: 'nyc',
//   lat: '31.5546',
//   lon: '74.3572'
// }, function(results) {
//   meetup().parseEvents(results);
// });


/*
 * Getting group ID and group urlname
 *
 * The URL name is simply the part after meetup.com/ on a meetup group.
 * Example, ID of meetup.com/foodie-programmers is 'foodie-programmers'.
 *
 * Running the code below with the group name will give the group ID, an integer.
 
meetup().get({
  'group_urlname': 'foodie-programmers'
}, function(group) {
  console.log(group.id);
}, '/2/groups');
 
 * Using the above group_id and the group_urlname manually, 
 * you can post events to a group with the below code
**/

// meetup().post({
//   // More Info: http://www.meetup.com/meetup_api/docs/:urlname/venues/#create
//   name: 'Finding Nemo',
//   address_1: 'p sherman 42 wallaby way sydney',
//   city: 'sydney',
//   country: 'australia',
//   // state: needed if in US or CA.
// }, function(venue) {
//   console.log('Venue: ', venue, venue.id); 
//   // Prints a venue ID that can be used to create a event
// }, '/' + '{{ foodie-programmers }}' + '/venues'); 
// // This needs a valid urlname for the group


// meetup().post({
//   // More Info: http://www.meetup.com/meetup_api/docs/2/groups/
//   group_id: 42, // Group ID goes here
//   group_urlname: 'foodie-programmers',
//   name: 'Tomato Python Fest',
//   description: 'Code vegetables in Python! Special speech by Guido Van Ossum',
//   duration: 1000 * 60 * 60 * 2, // Duration in milliseconds
//   time: 1419879086343, // Milliseconds since epoch
//   why: 'We should do this because... Less than 250 characters',
//   hosts: 'up to 5 comma separated member ids',
//   venue_id: 42, // Integer, ID of venue. Venue can be created with the above.
//   lat: 42, // Latitude, Integer
//   lon: 42, // Longitude, Integer
//   simple_html_description: 'Event description in <b>simple html</b>. Less than <i>50000</i> characters.'
// }, function(result) {
//   console.log('Event: ', result);
// });


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

// var options = {
//     uri: 'http://www.myevents.pk/event_loc/islamabad-events/',
//     transform: function (body) {
//         return cheerio.load(body);
//     }
// };
// var optionsURI = options.uri;
// rp(options)
//     .then(function ($) {
//         // Process html like you would with jQuery... 

//         $('#cat-listing-holder .listing-container').each(function () {
//             var location = ($(this).find('.listing-container-block-title .listing-container-tagline').clone().children().remove().end().text().replace(/\s+/g, ' '));
//             // console.log($(this).find('.listing-container-block-title').children('span').text().replace(/\s+/g, ' '));
//             // console.log($(this).find('.listing-container-rating').find('span').text() + "\n");
//             var name = ($(this).find('.listing-container-block-title').children('a').text());
//             var link = $(this).find('.listing-container-big-button').attr('href');
//             console.log(link);
//             var eventDetails;
//             options.uri = link;
//             rp(options)
//                 .then(($) => {
//                     eventDetails = $('.item-block-content').children('p').eq(1).text();

//                 }).then(() => {
//                     options.uri = optionsURI;
//                     var options1 = {
//                         provider: 'google',

//                         // Optional depending on the providers 
//                         httpAdapter: 'https', // Default 
//                         apiKey: 'AIzaSyAhYlzJrh5hdjCLLIg3-OWnsrccBziPfDQ', // for Mapquest, OpenCage, Google Premier 
//                         formatter: null         // 'gpx', 'string', ... 
//                     };
//                     var geocoder = NodeGeocoder(options1);

//                     // Using callback 
//                     geocoder.geocode(location).then(function (res) {
//                         if (res[0]) {
//                             console.log(location);
//                             console.log(name);
//                             console.log(eventDetails);
//                             // json[eventLocation] = res[0].formattedAddress;
//                             // json[eventName] = name;
//                             // json[eventTime] = time;

//                             // var lat = res[0].latitude;
//                             // var lng = res[0].longitude;
//                             // json[eventLatLng] = { lat: lat, lng: lng };


//                             //console.log(res[0].formattedAddress);
//                             // console.log(json[eventLocation]);
//                         }
//                     });
//                 })


//                 .catch(function (err) {
//                     // Crawling failed or Cheerio choked... 
//                 });

//             // var options = {
//             //     provider: 'google',

//             //     // Optional depending on the providers 
//             //     httpAdapter: 'https', // Default 
//             //     apiKey: 'AIzaSyAhYlzJrh5hdjCLLIg3-OWnsrccBziPfDQ', // for Mapquest, OpenCage, Google Premier 
//             //     formatter: null         // 'gpx', 'string', ... 
//             // };
//             // var geocoder = NodeGeocoder(options);

//             // // Using callback 
//             // geocoder.geocode(location).then(function (res) {
//             //     if (res[0]) {
//             //         console.log(location);
//             //         console.log(name);
//             //         // json[eventLocation] = res[0].formattedAddress;
//             //         // json[eventName] = name;
//             //         // json[eventTime] = time;

//             //         // var lat = res[0].latitude;
//             //         // var lng = res[0].longitude;
//             //         // json[eventLatLng] = { lat: lat, lng: lng };


//             //         //console.log(res[0].formattedAddress);
//             //         // console.log(json[eventLocation]);
//             //     }
//             // });
//         });


//     })
//     .catch(function (err) {
//         // Crawling failed or Cheerio choked... 
//     });