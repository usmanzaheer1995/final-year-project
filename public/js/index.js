var socket = io();

var earth;
var geocoder;
var popup;
var marker;

var locations = [];
var infowindowArray = [];
var myEvents = [];
var markers = [];
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

function performAnimation() {
  requestAnimationFrame(function animate(now) {
    var c = earth.getPosition();
    var elapsed = before ? now - before : 0;

    if (animated) elapsed = 0;
    before = now;
    earth.setCenter([c[0], c[1] + 0.1 * (elapsed / 30)]);
    dontAllowTimeElapse = false;
    requestAnimationFrame(animate);
  });
}
var a = document.getElementById('logo');
a.onclick = function() {
  animated = !animated;
  performAnimation();
  return false;
};

function initialize() {
  // var pyrmont = new google.maps.LatLng(33.7294, 73.0931);
  // var request = {
  //   location: pyrmont,
  //   radius: '500',
  //   type: ['school']
  // };
  // var map = new google.maps.Map(document.getElementById('map'), {
  //   center: pyrmont,
  //   zoom: 15
  // });
  // var service;
  // service = new google.maps.places.PlacesService(map);
  // service.nearbySearch(request, callback);
  // map = null;
  geocoder = new google.maps.Geocoder();
  earth = new WE.map('earth_div', {
    center: [30.3753, 69.3451],
    zoom: 2,
    proxyHost: 'https://srtm.webglearth.com/cgi-bin/corsproxy.fcgi?url='
  });
  //earth.setView([30.3753, 69.3451], 3);
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

function callback(results, status) {
  console.log('callback');
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      console.log(results[i]);
    }
  }
}

// reverse geocoding
var showInfo = function(e) {
  if (marker) marker.removeFrom(earth);
  var latlng = { lat: e.latitude, lng: e.longitude };
  geocodeLatLng(geocoder, earth, latlng);

  marker = WE.marker([e.latitude, e.longitude]);

  // var popup = WE.popup()
  //   .setLatLng(latlng)
  //   .setContent('<p>Hello world!<br />This is a nice popup.</p>')
  //   .openOn(earth);

  marker.addTo(earth);

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

  // marker.on('mouseover', mouseOverMarker);
  // marker.on('mouseout', mouseOutMarker);

  marker.on('click', zoomIn);
  //marker.on('dblclick', removeMarker);
  //   popup
  //     .setLatLng(e.latlng)
  //     .setContent('You clicked the map at ' + e.latlng.toString())
  //     .openOn(earth);
};

function removeMarker(e) {
  marker.removeFrom(earth);
}

function zoomIn(e) {
  earth.setZoom(5);
  //marker.removeFrom(earth);
}

function mouseOverMarker(e) {
  //console.log(e.latitude);
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
        console.log(results[0]);
        console.log(stringArray);
        // infowindow.setContent(results[0].formatted_address);
        // infowindow.open(map, marker);
      } else {
        window.alert('No results found');
      }
    } else {
      window.alert('Geocoder failed due to: ' + status);
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
  // socket.emit('scrapeWiki', { address });
  // socket.emit('scrapeBlogs', { address });
  //socket.emit('videos', { address });

  // socket.emit('myEvents', { address });
  // socket.emit('meetup', { address });
  // socket.emit('allEvents', { address });
  // socket.emit('landmarks', { address });
});

function geocodeAddress(address) {
  //deleteMarkers();
  geocoder.geocode({ address: address }, function(results, status) {
    if (status === 'OK') {
      //map.setCenter(results[0].geometry.location);
      //map.setZoom(12);
      //console.log(results[0].geometry.location.lat());
      earth.setView(
        [
          results[0].geometry.location.lat(),
          results[0].geometry.location.lng()
        ],
        14
      );
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
      // google.maps.event.addListener(marker, 'click', function () {
      //     landmark = 1;
      //     $("#panel").empty();
      //     $("#infoPanel").empty();
      //     $("#panel1").empty();
      //     $('#progressBar').fadeIn("slow");
      //     $("#contentTable tr").remove();
      //     socket.emit('scrapeWiki', { address });
      //     socket.emit('videos', { address });
      //     socket.emit('scrapeBlogs', { address });
      // });
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
  markers = [];
  locations = [];
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
    cell2.innerHTML = array[x].replace(/(.{80})/g, '$1<br>'); //shukria stackoverflow

    //$("#infoPanel").append('<li><strong>' + arrayIndex[x]  + ': ' + array[x] + '</li>');
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
  //console.log('wiki data');
  let size = Object.keys(data).length;
  //console.log(size);
  if (size === 0) {
    socket.emit('landmarks-wiki', { address });
  } else {
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
    //console.log(data.items[i].id.videoId);
    $('#panel').append(
      '<li><a href="https://www.youtube.com/embed/' +
        data.items[i].id.videoId +
        '?enablejsapi=1" target="_blank"><span class="tab">' +
        data.items[i].snippet.title +
        '</span></a></li>'
    );
    //$("#videos-names-list").append('<li><a href="https://www.youtube.com/embed/' + data.items[i].id.videoId + '?enablejsapi=1" target="_blank"><span class="tab">' + data.items[i].snippet.title + '</span></a></li>');
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
  //console.log(myEvents.length, locations.length);
  if (myEventsClicked === false) {
    myEventsClicked = true;
    for (let i = 0; i < myEvents.length; ++i) {
      //console.log(myEvents[i].location);
      var flag = false;
      for (let index = 0; index < locations.length; ++index) {
        if (
          locations[index] === myEvents[i].location &&
          eventData[index].indexOf(myEvents[i].name) < 0
        ) {
          //console.log(markers[i].infowindow.content);
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
              '/images/c4.png'
            ).addTo(earth);

            marker1.bindPopup(
              //content: '<li>' + data.name + " " + '</li>'
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

            // marker.setContent('Hello World');

            // marker1.on('mouseover', function(e) {
            //   marker1.openPopup();
            // });
            // marker1.on('mouseout', function(e) {
            //   marker1.closePopup();
            // });
          }

          markers.push(marker1);
          //markers[markers.length-1].bindPopup()

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
  //console.log("BACK");
  // let size = Object.keys(myEvents).length;
  // for (let i = 0; i < size; ++i) {
  //   console.log(myEvents[i]);
  // }
  if (data) myEvents.push(data);
});
socket.on('meetupData', function(data) {
  //console.log(data);
  if (data) myEvents.push(data);
});
socket.on('allEventsData', function(data) {
  //if (data && Object.keys(data).length > 0) {
  //console.log(data);
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
  //}
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

    //         //add new line to column after every 80 characters
    cell2.innerHTML = array[x].replace(/(.{80})/g, '$1<br>'); //shukria stackoverflow

    //$("#infoPanel").append('<li><strong>' + arrayIndex[x]  + ': ' + array[x] + '</li>');
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
  // if (a < 100 || a > 100) {
  //     //     a = 100;
  //     //     $('#percentage').text(100);
  //     //     $('#progressBar').fadeOut("slow");
  //     //     $('#percentage').text(0);
  //     // }
  //     // document.getElementById('infoButton').addEventListener('click', function () {
  //     //       this.classList.toggle("active");
  //     //       var panel = this.nextElementSibling;
  //     //       if (panel.style.display === "block") {
  //     //          panel.style.display = "none";
  //     //       } else {

  //     //           panel.style.display = "block";
  //     //       }
  //     //   });

  //     /*-------------------------------------------------------
  //     ------------------------------------------------------------*/
}
socket.on('videosData', function(data) {
  var size = Object.keys(data.items).length;
  console.log(size);

  for (let i = 0; i < size; ++i) {
    console.log(data.items[i].snippet.title);
    $('#panel').append(
      '<li><a href="https://www.youtube.com/embed/' +
        data.items[i].id.videoId +
        '?enablejsapi=1" target="_blank"><span class="tab">' +
        data.items[i].snippet.title +
        '</span></a></li>'
    );
    //$("#videos-names-list").append('<li><a href="https://www.youtube.com/embed/' + data.items[i].id.videoId + '?enablejsapi=1" target="_blank"><span class="tab">' + data.items[i].snippet.title + '</span></a></li>');
  }

  var a = parseInt($('#percentage').text());

  a = a + 5;
  $('#percentage').text(a);
});

// socket.on('blogsData', function (data) {

//     //console.log(data.title);
//     //console.log(data.link);

//     //console.log("reached here");
//     $("#panel1").append('<li><a target = "_blank" href = "' + data.link + '">' + data.title + '</a>' + '</li>');
//     var a = parseInt($('#percentage').text());
//     a = a + 1;

// });
socket.on('returnWikiData', function(data) {
  //console.log('wiki data');
  let size = Object.keys(data).length;
  //     //console.log(size);
  if (size === 0) {
    socket.emit('landmarks-wiki', { address });
  } else {
    var arrayIndex = $.map(data, function(value, index) {
      return [index];
    });
    var array = $.map(data, function(value, index) {
      return [value];
    });

    showWikiDetails(arrayIndex, array);
  }
});

socket.on('landmark-data', function(data) {
  //console.log(data);
  //     // console.log(data.jsonLandmark.landmark);
  //     // console.log(data.jsonLandmark.lat, data.jsonLandmark.lng)

  var image =
    'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png';
  if (data.jsonLandmark.landmark.toLowerCase().indexOf('church') >= 0) {
    image = '/images/church.png';
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
  //console.log(data.jsonLandmark.lat);
  var marker = new WE.marker(
    [data.jsonLandmark.lat, data.jsonLandmark.lng],
    image
  ).addTo(earth);

  marker.bindPopup(data.jsonLandmark.landmark);
  marker.on('mouseover', function(e) {
    marker.openPopup();
  });
  marker.on('mouseout', function(e) {
    marker.closePopup();
  });
  //  var marker = new google.maps.Marker({
  //      position: { lat: data.jsonLandmark.lat, lng: data.jsonLandmark.lng },
  //      map: map,
  //      icon: image,
  //      //shape: shape,
  //      title: data.jsonLandmark.landmark,
  //  });
  //   google.maps.event.addListener(marker, 'click', function () {
  marker.on('click', function() {
    findLandmark = 1;
    //         //geocodeAddress(data.jsonLandmark.landmark);
    address = data.jsonLandmark.landmark;
    //         // console.log(data.jsonLandmark.landmark);

    geocoder.geocode({ address: data.jsonLandmark.landmark }, function(
      results,
      status
    ) {
      if (status === 'OK') {
        //                 map.setCenter(results[0].geometry.location);
        //                 map.zoom = 15;
        //                 //console.log(landmarkName);
        $('#panel').empty();
        $('#infoPanel').empty();
        //                 //$("#panel1").empty();
        $('#progressBar').fadeIn('slow');
        $('#contentTable tr').remove();
        socket.emit('scrapeWiki', { address });
        socket.emit('videos', { address });
        //                 //socket.emit('scrapeBlogs', { address });
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  });

  var a = parseInt($('#percentage').text());

  a = a + 1;
  $('#percentage').text(a);
});

// function setMapOnAll(map) {
//     for (var i = 0; i < markers.length; i++) {
//         markers[i].setMap(map);
//     }
// }

// function clearMarkers() {
//     setMapOnAll(null);
// }
// function deleteMarkers() {
//     clearMarkers();
//     markers = [];
//     locations = [];
// }

// var myEventsClicked = false;
// document.getElementById('my-events').addEventListener('click', function () {

//     if (myEventsClicked === false) {
//         myEventsClicked = true;
//         for (let i = 0; i < myEvents.length; ++i) {
//             //console.log(myEvents[i].location);
//             var flag = false;
//             for (let index = 0; index < locations.length; ++index) {
//                 if (locations[index] === myEvents[i].location) {
//                     //console.log(markers[i].infowindow.content);
//                     markers[index].infowindow.setContent(markers[index].infowindow.content + '<li>' + '<a target = "_blank" href = "' + myEvents[i].details + '">' + myEvents[i].name + '</a>' + '</li>');
//                     flag = true;

//                 }
//             }

//             if (flag === false) {

//                 var marker = new google.maps.Marker({
//                     map: map,
//                     position: myEvents[i].latlng,
//                     //icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
//                     icon: '/images/c4.png'
//                 });
//                 //marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');

//                 marker.infowindow = new google.maps.InfoWindow({
//                     //content: '<li>' + data.name + " " + '</li>'
//                     content: '<li>' + '<a target = "_blank" href = "' + myEvents[i].details + '">' + myEvents[i].name + '</a>' + '</li>'
//                 });

//                 markers.push(marker);
//                 locations.push(myEvents[i].location);

//                 google.maps.event.addListener(marker, 'mouseover', function () {
//                     this.infowindow.open(map, this);
//                 });
//                 google.maps.event.addListener(marker, 'click', function () {
//                     this.infowindow.close();
//                 });
//             }
//         }

//     }
//     else {
//         deleteMarkers();
//         myEventsClicked = false;
//     }

// });

// socket.on('eventsData', function (data) {
//     //console.log("BACK");
//     //let size = Object.keys(myEvents).length;

//     myEvents.push(data);
//     var a = parseInt($('#percentage').text());
//     console.log(a);
//     a = a + 1;
//     $('#percentage').text(a);

//     $('#my-events').fadeIn("slow");
//     if (a < 100 || a > 100) {
//         a = 100;
//         $('#percentage').text(100);
//         $('#progressBar').fadeOut("slow");
//         $('#percentage').text(0);
//     }
// });
// socket.on('meetupData', function (data) {
//     //console.log(data);
//     myEvents.push(data);

// });

// function callback(results, status) {
//     if (status === google.maps.places.PlacesServiceStatus.OK) {
//         for (var i = 0; i < results.length; i++) {
//             console.log(results[i]);
//             createMarker(results[i]);
//         }
//     }
// }

// function createMarker(place) {
//     var placeLoc = place.geometry.location;
//     var marker = new google.maps.Marker({
//         map: map,
//         position: place.geometry.location
//     });

//     google.maps.event.addListener(marker, 'click', function () {
//         infowindow.setContent(place.name);
//         infowindow.open(map, this);
//     });
// }

// function geocodeAddress(address) {
//     deleteMarkers();
//     console.log("Hi");
//     geocoder.geocode({ 'address': address }, function (results, status) {

//         if (status === 'OK') {
//             map.setCenter(results[0].geometry.location);
//             map.setZoom(12);
//             var marker = new google.maps.Marker({
//                 map: map,
//                 position: results[0].geometry.location
//             });
//             marker.infowindow = new google.maps.InfoWindow({
//                 content: address,
//                 // map: map
//             });
//             //markers.push(marker);
//             //locations.push(address);
//             //  infowindow.open(map, marker);
//             google.maps.event.addListener(marker, 'mouseover', function () {
//                 this.infowindow.open(map, this);
//             });
//             google.maps.event.addListener(marker, 'mouseout', function () {
//                 this.infowindow.close();
//             });
//             google.maps.event.addListener(marker, 'click', function () {
//                 landmark = 1;
//                 $("#panel").empty();
//                 $("#infoPanel").empty();
//                 $("#panel1").empty();
//                 $('#progressBar').fadeIn("slow");
//                 $("#contentTable tr").remove();
//                 socket.emit('scrapeWiki', { address });
//                 socket.emit('videos', { address });
//                 socket.emit('scrapeBlogs', { address });
//             });

//         }

//         //infowindowArray.push(infowindow);
//         //myfunc();

//         else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
//             setTimeout(function () {
//                 geocodeAddress(address);
//             }, 200);
//         }
//         else {
//             alert('Geocode was not successful for the following reason: ' + status + data.location);
//         }
//     });
// }
