const rp = require("request-promise");
const axios = require('axios');
var NodeGeocoder = require('node-geocoder');
var cheerio = require('cheerio'); // Basically jQuery for node.js 

var striptags = require('striptags');

var fs = require('fs');
var request = require('request');

var { meetup } = require('../server/utils/meetup');

var Twit = require('twit');

// var T = new Twit({
//     consumer_key:         'waitH5Em0J6Iu2hVfl2UYOtgN',
//     consumer_secret:      'E1Dn5NCIWGvMgAEzOfGqbiUQM413wZmXhsAY6QJrMK8VOyPpg6',
//     access_token:         '528168895-MCeFfvkuTWurJzArNiuDdQWIqkrCZJ4cIoiFTJ6V',
//     access_token_secret:  'vSwlWjwFeI20CXHUOQRl06JetZ9W0Fx1SRtQ8apsrMPAb',
//     timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
// });

// T.get('search/tweets', { q: '#event since:2017-05-01', count: 100 }, function(err, data, response) {
//     var arr=data.statuses;
//     //console.log(arr);
//     for(var i=0;i<arr.length;i++) {
//         console.log(arr[i].text);
//         console.log(arr[i].user.location);
//     }
// });


// var addressCoordinates;
// var options1 = {
//   provider: 'google',

//   // Optional depending on the providers 
//   httpAdapter: 'https', // Default 
//   apiKey: 'AIzaSyAhYlzJrh5hdjCLLIg3-OWnsrccBziPfDQ', // for Mapquest, OpenCage, Google Premier 
//   formatter: null         // 'gpx', 'string', ... 
// };
// var geocoder = NodeGeocoder(options1);

// geocoder.geocode('islamabad').then(function (res) {

//   var lat = res[0].latitude;
//   var lng = res[0].longitude;
//   addressCoordinates = { lat: lat, lng: lng };

//   var obj = addressCoordinates.lat;
//   //console.log(String(addressCoordinates.lat));
//   //console.log();

// }).then(() => {
//   //console.log(addressCoordinates.lat, addressCoordinates.lng);
//   meetup().get({
//     //topic: 'photo',
//     //city: 'nyc',
//     lat: String(addressCoordinates.lat),
//     lon: String(addressCoordinates.lng),
//   }, function (results) {
//      //var desc = results[0].event_url || '';
//     // var parsed = '';
//     //  if ( desc ) parsed += 'Description: ' + desc + '\n';
//     //console.log(desc);
//     var meetupList = meetup().parseEvents(results);
//     for (var i = 0; i < results.length; ++i) {
//       var lat = results[i].venue.lat;
//       var lng = results[i].venue.lon;
//       // json[eventLatLng] = { lat: lat, lng: lng };
//       let location = results[i].venue.name + ', ' + results[i].venue.address_1 + ', ' + results[i].venue.city;
//       //  json[eventName] = meetupList[i].name;
//       // json[eventLocation] = meetupList[i].city;
//       // console.log(striptags(results[i].description));
//       console.log(results[i].event_url);
//     }
//     //console.log(JSON.stringify(meetupList, undefined, 2));
//   });
// });


// meetup().get({
//   // More Info: http://www.meetup.com/meetup_api/docs/2/open_events/
//   //topic: 'photo',
//   //city: 'nyc',
//   lat: '33.7293882',
//   lon: '73.0931461'
// }, function (results) {

//   var meetupList = meetup().parseEvents(results);
//   // for(var i = 0; i< meetupList.length; ++i) {
//   //   var lat = meetupList[i].description;
//   //   //console.log(lat);
//   // }
//   console.log(JSON.stringify(meetupList, undefined, 2));
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
//     console.log(mEvent['desc'])
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
// var phrases = [];
// var options = {
//   uri: `https://en.wikipedia.org/wiki/List_of_tourist_attractions_in_Islamabad`,
//   transform: function (body) {
//     return cheerio.load(body);
//   }
// };
// console.log(options.uri);
// var options1 = {
//   provider: 'google',

//   // Optional depending on the providers 
//   httpAdapter: 'https', // Default 
//   apiKey: 'AIzaSyAhYlzJrh5hdjCLLIg3-OWnsrccBziPfDQ', // for Mapquest, OpenCage, Google Premier 
//   formatter: null         // 'gpx', 'string', ... 
// };
// var geocoder = NodeGeocoder(options1);
// rp(options)
//   .then(function ($) {

//     $('#mw-content-text').children().eq(8).find('ul li').each(function () {
//       phrases.push($(this).text());
//     })

//   }).then(() => {
//     for (let i = 0; i < phrases.length; ++i) {
//       geocoder.geocode(phrases[i]).then(function (res) {
//         if (res[0]) {
//           console.log(phrases[i]);
//           console.log(res[0].latitude, res[0].longitude)
//         }

//       });
//       //console.log(phrases[i]);
//     }
//   })
//   .catch(function (err) {
//     // Crawling failed or Cheerio choked... 
//     console.log(err);
//   });


var phrases = [];
var options = {
  uri: `http://pakistani.pk/category/things-to-do/karachi-attractions/tag/attractions/landmarks/`,
  transform: function (body) {
    return cheerio.load(body);
  }
};
console.log(options.uri);
var json = {};
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
    $('.jrTableGrid.jrDataList.jrResults').find('.jrRow').each(function () {
      //console.log($(this).find('.jr-listing-outer').find('.jrContentTitle').find('a').text());
      phrases.push($(this).find('.jr-listing-outer').find('.jrContentTitle').find('a').text());
    });
  }).then(() => {
    for (let i = 0; i < phrases.length; ++i) {
      geocoder.geocode(phrases[i]).then(function (res) {
        if (res[0] && res.statusCode!==400) {
          //console.log(phrases[i]);
          //console.log(res[0].latitude, res[0].longitude)
          json['landmark-name'] = phrases[i];
          json['lat'] = res[0].latitude;
          json['lng'] = res[0].longitude;
         // json['landmark-position'] = { lat: res[0].latitude, lng: res[0].longitude };
        }
        if(json)
          console.log(json);
      });
      //console.log(phrases[i]);
    }
  })
    .catch(function (err) {
    // Crawling failed or Cheerio choked... 
    console.log(err);
  });