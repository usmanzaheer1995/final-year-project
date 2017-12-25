var socket = io();

var earth;
var geocoder;
var popup;
var marker;

var locations = [];
var infowindowArray = [];
var myEvents = [];
var markers = [];
var gMarkers = [];

/////////////////
var nMarkers = [];
var eventMarkers = [];
////////////////

var address;
var eventData = [];
var inforwindowLandmark;
var findLandmark = 0;
var animated = true;

var islamabadArray = [];
var lahoreArray = [];
var karachiArray = [];

// Start a simple rotation animation
var before = null;
var animated = false;
var dontAllowTimeElapse = false;

function performAnimation() {
  requestAnimationFrame(function animate(now) {
    var c = earth.getPosition();
    var elapsed = before ? now - before : 0;

    if (animated) {
      elapsed = 0;
      return;
    }
    if (dontAllowTimeElapse) {
      elapsed = 0;
    }
    before = now;
    earth.setCenter([c[0], c[1] + 0.1 * (elapsed / 30)]);
    dontAllowTimeElapse = false;
    requestAnimationFrame(animate);
  });
}
var a = document.getElementById('logo');
a.onclick = function() {
  animated = !animated;
  dontAllowTimeElapse = true;
  performAnimation();
  return false;
};

function initialize() {
  geocoder = new google.maps.Geocoder();
  earth = new WE.map('earth_div', {
    center: [30.3753, 69.3451],
    zoom: 2,
    dragging: true,
    scrollWheelZoom: true,
    proxyHost: 'https://srtm.webglearth.com/cgi-bin/corsproxy.fcgi?url='
  });
  var baselayer = WE.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution: '© OpenStreetMap contributors'
    }
  ).addTo(earth);

  performAnimation();

  earth.on('click', function() {
    animated = true;
    performAnimation();
  });

  earth.on('dblclick', showInfo);
}

// reverse geocoding
var showInfo = function(e) {
  if (marker) marker.removeFrom(earth);
  var latlng = { lat: e.latitude, lng: e.longitude };
  geocodeLatLng(geocoder, earth, latlng);

  marker = WE.marker([e.latitude, e.longitude]);

  marker.addTo(earth);

  var loc = new google.maps.LatLng(e.latitude, e.longitude);

  var request = {
    location: loc,
    radius: 500,
    types: ['restaurant', 'university', 'mosque', 'airport', 'park']
  };

  /////// GOOGLE PLACES ///////////

  let t_map = new google.maps.Map(document.getElementById('map'));
  var service = new google.maps.places.PlacesService(t_map);
  service.nearbySearch(request, callback);

  ////////////////////////////////

  marker.bindPopup(
    'You clicked the map at ' +
      latlng.lat.toString() +
      ', ' +
      latlng.lng.toString(),
    {
      maxWidth: 150,
      closeButton: true,
      autoClose: true,
      closeOnClick: true
    }
  );

  if (eventMarkers.length > 0) {
    for (var i = 0; i < eventMarkers.length; i++) {
      eventMarkers[i].removeFrom(earth);
    }
    eventMarkers.length = 0;
  }

  for (let i = 0; i < markers.length; i++) {
    if (markers[i]) {
      var markerr = new google.maps.Marker({
        position: new google.maps.LatLng(e.latitude, e.longitude)
      });

      // Add circle overlay and bind to marker
      var circle = new google.maps.Circle({
        radius: 500 //
      });
      circle.bindTo('center', markerr, 'position');

      if (circle.getBounds().contains(gMarkers[i].getPosition())) {
        markers[i].addTo(earth);
        eventMarkers.push(markers[i]);
        console.log('true');
      } else {
        console.log('false');
      }
    }
  }
};

function callback(results, status) {
  //////////////////
  if (nMarkers.length > 0) {
    for (var i = 0; i < nMarkers.length; i++) {
      nMarkers[i].removeFrom(earth);
    }
    nMarkers.length = 0;
  }
  ////////////////
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      var place = results[i];
      var latlng = {
        lat: results[i].geometry.location.lat(),
        lng: results[i].geometry.location.lng()
      };
      var icon = '/images/university.png';
      geocodeLatLng(geocoder, earth, latlng);
      if (results[i].types.indexOf('restaurant') >= 0) {
        icon = '/images/resturant.png';
      }
      if (results[i].types.indexOf('mosque') >= 0) {
        icon = '/images/m1.png';
      }
      if (results[i].types.indexOf('park') >= 0) {
        icon = '/images/park.png';
      }
      var tmarker = WE.marker(
        [
          results[i].geometry.location.lat(),
          results[i].geometry.location.lng()
        ],
        icon,
        20,
        20
      );

      //////////////////////////////////////////////////
      if (results[i].rating) {
        tmarker.bindPopup(
          '<p>' +
            results[i].name +
            '</p>' +
            '<p>' +
            'Rating: ' +
            results[i].rating +
            '</p>',
          {
            maxWidth: 150,
            closeButton: true,
            autoClose: true,
            closeOnClick: true
          }
        );
      } else {
        tmarker.bindPopup(results[i].name, {
          maxWidth: 150,
          closeButton: true,
          autoClose: true,
          closeOnClick: true
        });
      }

      /////////////////////////////////////////////////////
      /////////////
      nMarkers.push(tmarker);
      /////////////
      for (let i = 0; i < nMarkers.length; ++i) {
        nMarkers[i].on('mouseover', function() {
          nMarkers[i].openPopup();
        });
        nMarkers[i].on('mouseout', function() {
          nMarkers[i].closePopup();
        });
      }

      tmarker.addTo(earth);
    }
  }
}

function removeMarker(e) {
  marker.removeFrom(earth);
}

function panTo(coords) {
  earth.panTo(coords);
}

function mouseOverMarker(e) {
  marker.openPopup();
}
function mouseOutMarker(e) {
  marker.closePopup();
}

function geocodeLatLng(geocoder, map, latlng) {
  geocoder.geocode({ location: latlng }, function(results, status) {
    if (status === 'OK') {
      if (results[0]) {
        let stringArray = results[0].formatted_address.split(',');
        earth.setZoom(15);
        earth.panTo([
          results[0].geometry.location.lat(),
          results[0].geometry.location.lng()
        ]);
      } else {
        window.alert('No results found');
      }
    }
  });
}

document.getElementById('search-btn').addEventListener('click', function() {
  animated = true;
  performAnimation();
  //map.zoom = 12;
  findLandmark = 0;
  $('#my-events').fadeOut('slow');
  $('#progressBar').fadeOut('fast');
  $('#percentage').text(0);
  $('#progressBar').fadeIn('slow');
  $('#contentTable tr').remove();
  $('#panel').empty();
  $('#panel1').empty();
  address = $('#select1').val();
  geocodeAddress(address);
  socket.emit('scrapeWiki', { address });
  socket.emit('scrapeBlogs', { address });
  socket.emit('videos', { address });

  socket.emit('myEvents', { address });
  socket.emit('meetup', { address });
  socket.emit('allEvents', { address });
  socket.emit('landmarks', { address });
});

function geocodeAddress(address) {
  geocoder.geocode({ address: address }, function(results, status) {
    if (status === 'OK') {
      earth.setZoom(13);
      earth.panTo([
        results[0].geometry.location.lat(),
        results[0].geometry.location.lng()
      ]);
      var cityMarker = WE.marker([
        results[0].geometry.location.lat(),
        results[0].geometry.location.lng()
      ]).addTo(earth);
      cityMarker.bindPopup(address, {
        maxWidth: 150,
        closeButton: true,
        autoClose: true,
        closeOnClick: true
      });

      cityMarker.on('mouseover', function(e) {
        cityMarker.openPopup();
      });
      cityMarker.on('mouseout', function(e) {
        cityMarker.closePopup();
      });
    } else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
      setTimeout(function() {
        geocodeAddress(address);
      }, 200);
    } else {
      alert(
        'Geocode was not successful for the following reason: ' +
          status +
          data.location
      );
    }
  });
}

function setMapOnAll() {
  for (var i = 0; i < markers.length; i++) {
    if (markers[i]) markers[i].removeFrom(earth);
  }
}
function clearMarkers() {
  setMapOnAll();
}
function deleteMarkers() {
  clearMarkers();
}

function showWikiDetails(arrayIndex, array) {
  for (let x = 0; x < array.length; x++) {
    var table = document.getElementById('contentTable');
    var row = table.insertRow(-1);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    cell1.innerHTML =
      '<strong>' +
      arrayIndex[x].charAt(0).toUpperCase() +
      arrayIndex[x].slice(1);
    +'<strong>';

    //add new line to column after every 80 characters
    cell2.innerHTML = array[x].replace(/(.{80})/g, '$1<br>');
  }
  var a = parseInt($('#percentage').text());
  a = a + 10;
  $('#percentage').text(a);
  if (findLandmark > 0) {
    if (a < 100 || a > 100) {
      $('#percentage').text(100);
      $('#progressBar').fadeOut('slow');
      $('#percentage').text(0);
    }
  }
}
socket.on('returnWikiData', function(data) {
  let size = null;
  if (data) size = Object.keys(data).length;

  if (size === 0) {
    socket.emit('landmarks-wiki', { address });
  } else if (size) {
    var arrayIndex = $.map(data, function(value, index) {
      return [index];
    });
    var array = $.map(data, function(value, index) {
      return [value];
    });

    showWikiDetails(arrayIndex, array);
  }
});

socket.on('videosData', function(data) {
  var size = Object.keys(data.items).length;

  for (let i = 0; i < size; ++i) {
    $('#panel').append(
      '<li><a href="https://www.youtube.com/embed/' +
        data.items[i].id.videoId +
        '?enablejsapi=1" target="_blank"><span class="tab">' +
        data.items[i].snippet.title +
        '</span></a></li>'
    );
  }

  var a = parseInt($('#percentage').text());

  a = a + 5;
  $('#percentage').text(a);
});

socket.on('blogsData', function(data) {
  $('#panel1').append(
    '<li><a target = "_blank" href = "' +
      data.link +
      '">' +
      data.title +
      '</a>' +
      '</li>'
  );
  var a = parseInt($('#percentage').text());
  a = a + 1;
});

var myEventsClicked = false;
document.getElementById('my-events').addEventListener('click', function() {
  if (myEventsClicked === false) {
    myEventsClicked = true;
    for (let i = 0; i < myEvents.length; ++i) {
      var flag = false;
      for (let index = 0; index < locations.length; ++index) {
        if (
          locations[index] === myEvents[i].location &&
          eventData[index].indexOf(myEvents[i].name) < 0
        ) {
          eventData[index] =
            eventData[index] +
            '<li>' +
            '<a target = "_blank" href = "' +
            myEvents[i].details +
            '">' +
            myEvents[i].name +
            ' ' +
            myEvents[i].time +
            '</a>' +
            '</li>';
          markers[index].bindPopup(eventData[index]);
          flag = true;
        }
      }

      if (flag === false) {
        if (myEvents[i]) {
          if (myEvents[i].latlng) {
            var marker1 = new WE.marker(
              [myEvents[i].latlng.lat, myEvents[i].latlng.lng],
              '/images/c3.png',
              25,
              25
            ).addTo(earth);

            var tmarkerr = new google.maps.Marker({
              position: new google.maps.LatLng(
                myEvents[i].latlng.lat,
                myEvents[i].latlng.lng
              )
            });

            marker1.bindPopup(
              '<li>' +
                '<a target = "_blank" href = "' +
                myEvents[i].details +
                '">' +
                myEvents[i].name +
                ' ' +
                myEvents[i].time +
                '</a>' +
                '</li> <br />',
              {
                maxWidth: 150,
                closeButton: true,
                autoClose: true,
                closeOnClick: true
              }
            );
          }
          markers.push(marker1);
          gMarkers.push(tmarkerr);

          var name =
            "'<li>'" +
            '<a target = "_blank" href = "' +
            myEvents[i].details +
            '">' +
            myEvents[i].name +
            '</a>' +
            '</li> <br />';
          locations.push(myEvents[i].location);
          eventData.push(name);
        }
      }
    }
  } else {
    deleteMarkers();
    myEventsClicked = false;
  }
});

socket.on('eventsData', function(data) {
  if (data) myEvents.push(data);
});
socket.on('meetupData', function(data) {
  if (data) myEvents.push(data);
});
socket.on('allEventsData', function(data) {
  if (data) myEvents.push(data);
  var a = parseInt($('#percentage').text());
  a = a + 1;
  $('#percentage').text(a);

  $('#my-events').fadeIn('slow');
  if (a < 100 || a > 100) {
    a = 100;
    $('#percentage').text(100);
    $('#progressBar').fadeOut('slow');
    $('#percentage').text(0);
  }
});

function showWikiDetails(arrayIndex, array) {
  for (let x = 0; x < array.length; x++) {
    var table = document.getElementById('contentTable');
    var row = table.insertRow(-1);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    cell1.innerHTML =
      '<strong>' +
      arrayIndex[x].charAt(0).toUpperCase() +
      arrayIndex[x].slice(1);
    +'<strong>';

    cell2.innerHTML = array[x].replace(/(.{80})/g, '$1<br>');
  }
  var a = parseInt($('#percentage').text());
  a = a + 10;
  $('#percentage').text(a);
  if (findLandmark > 0) {
    if (a < 100 || a > 100) {
      $('#percentage').text(100);
      $('#progressBar').fadeOut('slow');
      $('#percentage').text(0);
    }
  }

  socket.on('landmark-data', function(data) {
    var image =
      'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png';
    if (
      data.jsonLandmark.landmark.toLowerCase().indexOf('church') >= 0 ||
      data.jsonLandmark.landmark.toLowerCase().indexOf('cathedral') >= 0 ||
      data.jsonLandmark.landmark.toLowerCase().indexOf('convent') >= 0
    ) {
      image = '/images/church.png';
    }
    if (data.jsonLandmark.landmark.toLowerCase().indexOf('haveli') >= 0) {
      image = '/images/home.png';
    }
    if (data.jsonLandmark.landmark.toLowerCase().indexOf('office') >= 0) {
      image = '/images/home.png';
    }
    if (data.jsonLandmark.landmark.toLowerCase().indexOf('village') >= 0) {
      image = '/images/v2.png';
    }
    if (data.jsonLandmark.landmark.toLowerCase().indexOf('gate') >= 0) {
      image = '/images/gate.png';
    }
    if (
      data.jsonLandmark.landmark.toLowerCase().indexOf('hills') >= 0 ||
      data.jsonLandmark.landmark.toLowerCase().indexOf('mountain') >= 0 ||
      data.jsonLandmark.landmark.toLowerCase().indexOf('koh') >= 0
    ) {
      image = '/images/hill_m.png';
    }
    if (
      data.jsonLandmark.landmark.toLowerCase().indexOf('university') >= 0 ||
      data.jsonLandmark.landmark.toLowerCase().indexOf('college') >= 0 ||
      data.jsonLandmark.landmark.toLowerCase().indexOf('academy') >= 0 ||
      data.jsonLandmark.landmark.toLowerCase().indexOf('institute') >= 0
    ) {
      image = '/images/university.png';
    }
    if (
      data.jsonLandmark.landmark.toLowerCase().indexOf('tomb') >= 0 ||
      data.jsonLandmark.landmark.toLowerCase().indexOf('shrine') >= 0 ||
      data.jsonLandmark.landmark.toLowerCase().indexOf('graveyard') >= 0
    ) {
      image = '/images/tomb.png';
    }
    if (data.jsonLandmark.landmark.toLowerCase().indexOf('court') >= 0) {
      image = '/images/court.png';
    }
    if (data.jsonLandmark.landmark.toLowerCase().indexOf('stadium') >= 0) {
      image = '/images/s1.png';
    }
    if (
      data.jsonLandmark.landmark.toLowerCase().indexOf('masjid') >= 0 ||
      data.jsonLandmark.landmark.toLowerCase().indexOf('mosque') >= 0
    ) {
      image = '/images/m1.png';
    }
    if (
      data.jsonLandmark.landmark.toLowerCase().indexOf('tower') >= 0 ||
      data.jsonLandmark.landmark.toLowerCase().indexOf('building') >= 0
    ) {
      image = '/images/building.png';
    }
    var marker = new WE.marker(
      [data.jsonLandmark.lat, data.jsonLandmark.lng],
      image,
      25,
      25
    ).addTo(earth);

    marker.bindPopup(data.jsonLandmark.landmark);
    marker.on('mouseover', function(e) {
      marker.openPopup();
    });
    marker.on('mouseout', function(e) {
      marker.closePopup();
    });
    marker.on('click', function() {
      findLandmark = 1;
      address = data.jsonLandmark.landmark;

      geocoder.geocode({ address: data.jsonLandmark.landmark }, function(
        results,
        status
      ) {
        if (status === 'OK') {
          $('#panel').empty();
          $('#infoPanel').empty();
          $('#progressBar').fadeIn('slow');
          $('#contentTable tr').remove();
          socket.emit('scrapeWiki', { address });
          socket.emit('videos', { address });
        } else {
          alert(
            'Geocode was not successful for the following reason: ' + status
          );
        }
      });
    });

    var a = parseInt($('#percentage').text());

    a = a + 1;
    $('#percentage').text(a);
  });
}
