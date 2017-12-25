var fs = require('fs');
var request = require('request');

var meetup = () => {
  var key = fs.readFileSync('./server/utils/api_key.txt', 'utf-8');
  var url = 'https://api.meetup.com';
  var composeURL = function(root, object) {
    return (
      root +
      '?' +
      JSON.stringify(object)
        .replace(/":"/g, '=')
        .replace(/","/g, '&')
        .slice(2, -2)
    );
  };

  var get = function(params, callback, path) {
    params.key = key;
    request.get(composeURL(url + (path || '/2/open_events'), params), function(
      err,
      res,
      body
    ) {
      if (err) {
        console.error(err);
        return false;
      }
      callback(JSON.parse(body)['results']);
    });
  };

  var post = function(details, callback, path) {
    details.key = key;

    request.post(
      {
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        url: url + (path || '/2/event'),
        form: details
      },
      function(err, res, body) {
        callback(body);
      }
    );
  };

  var parseEvent = function(mEvent) {
    /*
     * A simple function that converts JSON to 
     * string in a pretty way
    **/
    var name = mEvent['name'] || '';
    var desc = mEvent['desc'] || '';
    var url = mEvent['url'] || '';

    if (mEvent['venue']) {
      var city = mEvent['venue']['city'] || '';
      var lat = mEvent['venue']['lat'] || '';
      var lon = mEvent['venue']['lon'] || '';
    }

    if (mEvent['group']) var group = mEvent['group']['name'] || '';

    var parsed = '';
    var list = {};
    list['name'] = name;
    list['description'] = desc;
    list['city'] = city;
    list['latitude'] = lat;
    list['longitude'] = lon;

    return list;
  };

  var parseEvents = function(results) {
    var list = [];
    for (var i = 0; i < results.length; i++) {
      var list2 = parseEvent(results[i]);
      list.push(list2);
    }

    return list;
  };

  return {
    get: get,
    parseEvents: parseEvents,
    post: post
  };
};

module.exports = {
  meetup
};
