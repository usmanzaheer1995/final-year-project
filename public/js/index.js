var socket = io();

var map, geocoder;
var locations = [];
var infowindowArray = [];
var myEvents = [];
var markers = [];
var address;
var inforwindowLandmark;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: { lat: 30.3753, lng: 69.3451 },
        styles: [
            {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
            {
              featureType: 'administrative.locality',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'geometry',
              stylers: [{color: '#263c3f'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'labels.text.fill',
              stylers: [{color: '#6b9a76'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{color: '#38414e'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry.stroke',
              stylers: [{color: '#212a37'}]
            },
            {
              featureType: 'road',
              elementType: 'labels.text.fill',
              stylers: [{color: '#9ca5b3'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry',
              stylers: [{color: '#746855'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry.stroke',
              stylers: [{color: '#1f2835'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'labels.text.fill',
              stylers: [{color: '#f3d19c'}]
            },
            {
              featureType: 'transit',
              elementType: 'geometry',
              stylers: [{color: '#2f3948'}]
            },
            {
              featureType: 'transit.station',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{color: '#17263c'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.fill',
              stylers: [{color: '#515c6d'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.stroke',
              stylers: [{color: '#17263c'}]
            }
          ]
    });
    geocoder = new google.maps.Geocoder();

    document.getElementById('search-btn').addEventListener('click', function () {
        $('#my-events').fadeOut("slow");
        $("#panel").empty();
        $("#panel1").empty();
        $("#infoPanel").empty();
        address = $('#select1').val();
        geocodeAddress(address);
        getCurrentLocation();
        socket.emit('scrapeWiki', { address });   
        socket.emit('myEvents', { address });     
        socket.emit('meetup', { address });
        socket.emit('landmarks', { address });    
        socket.emit('scrapeBlogs', { address });  
        socket.emit('videos', { address });       
    });

}



function getCurrentLocation() {
    if (navigator.geolocation) {
        console.log('here');
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
        console.log('error');
    }
}
function showPosition(position) {
    console.log(position.coords.latitude, position.coords.longitude);

    var latLng = { lat: position.coords.latitude, lng: position.coords.longitude };
    //map.setCenter(latLng);
    var marker = new google.maps.Marker({
        map: map,
        position: latLng,
        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
    });
    marker.infowindow = new google.maps.InfoWindow({
        content: 'current Location',
        // map: map
    });

    google.maps.event.addListener(marker, 'mouseover', function () {
        this.infowindow.open(map, this);
    });
    google.maps.event.addListener(marker, 'mouseout', function () {
        this.infowindow.close();
    });
    // markers.push(marker);
}

function showWikiDetails(arrayIndex, array) {
    // let list = $("#names-list");
    // list.empty();
    // let parent = list.parent();

    // list.each(function (i) {
    //     //console.log(data.length);
    //     for (let x = 0; x < array.length; x++) {
    //         //console.log(array[x]);
    //         $(this).append('<li>' + '<strong>' + arrayIndex[x] + '</strong>' + ': ' + array[x] + '</li>');
    //         if (x == array.length - 1) {
    //             $(this).appendTo(parent);
    //         }
    //     }
    // });
    /*----------------------------------------------------
    ------------------------------------------------------*/
    for (let x = 0; x < array.length; x++) {
        $("#infoPanel").append('<li>' + '<strong>' + arrayIndex[x] + '</strong>' + ': ' + array[x] + '</li>');

    }
    // document.getElementById('infoButton').addEventListener('click', function () {
    //       this.classList.toggle("active");
    //       var panel = this.nextElementSibling;
    //       if (panel.style.display === "block") {
    //          panel.style.display = "none";
    //       } else {

    //           panel.style.display = "block";
    //       }
    //   });

    /*-------------------------------------------------------
    ------------------------------------------------------------*/
}
socket.on('videosData', function (data) {

    var size = Object.keys(data.items).length;

    for (let i = 0; i < size; ++i) {
        //console.log(data.items[i].id.videoId);
        $("#panel").append('<li><a href="https://www.youtube.com/embed/' + data.items[i].id.videoId + '?enablejsapi=1" target="_blank"><span class="tab">' + data.items[i].snippet.title + '</span></a></li>');
        //$("#videos-names-list").append('<li><a href="https://www.youtube.com/embed/' + data.items[i].id.videoId + '?enablejsapi=1" target="_blank"><span class="tab">' + data.items[i].snippet.title + '</span></a></li>');
    }

    //   document.getElementById('accordion').addEventListener('click', function () {
    //       this.classList.toggle("active");
    //       var panel = this.nextElementSibling;
    //           if (panel.style.display === "block") {
    //           panel.style.display = "none";
    //        } else {

    //            panel.style.display = "block";
    //        }
    //   });

});

socket.on('blogsData', function (data) {
    //console.log(data.title);
    //console.log(data.link);

    //console.log("reached here");
    $("#panel1").append('<li><a target = "_blank" href = "' + data.link + '">' + data.title + '</a>' + '</li>');


});


socket.on('returnWikiData', function (data) {
    //console.log('wiki data');
    var arrayIndex = $.map(data, function (value, index) {
        return [index];
    });
    var array = $.map(data, function (value, index) {
        return [value];
    });

    showWikiDetails(arrayIndex, array);

});

socket.on('landmark-data', function (data) {
    console.log(data.jsonLandmark.landmark);
    console.log(data.jsonLandmark.lat, data.jsonLandmark.lng)

    var image = 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png';
    if ((data.jsonLandmark.landmark.toLowerCase().indexOf('church') >= 0)) {
        image = '/church.png';
    }
    if ((data.jsonLandmark.landmark.toLowerCase().indexOf('village') >= 0)) {
        image = "/v2.png";
    }
    if ((data.jsonLandmark.landmark.toLowerCase().indexOf('gate') >= 0)) {
        image = "/gate.png";
    }
    if ((data.jsonLandmark.landmark.toLowerCase().indexOf('hills') >= 0) || (data.jsonLandmark.landmark.toLowerCase().indexOf('mountain') >= 0) || (data.jsonLandmark.landmark.toLowerCase().indexOf('koh') >= 0)) {
        image = "/hill_m.png";
    }
    if ((data.jsonLandmark.landmark.toLowerCase().indexOf('university') >= 0) || (data.jsonLandmark.landmark.toLowerCase().indexOf('college') >= 0) || (data.jsonLandmark.landmark.toLowerCase().indexOf('institute') >= 0)) {
        image = "/university.png";
    }
    if ((data.jsonLandmark.landmark.toLowerCase().indexOf('tomb') >= 0) || (data.jsonLandmark.landmark.toLowerCase().indexOf('shrine') >= 0) || (data.jsonLandmark.landmark.toLowerCase().indexOf('graveyard') >= 0)) {
        image = "/tomb.png";
    }
    if (data.jsonLandmark.landmark.toLowerCase().indexOf('court') >= 0) {
        image = "/court.png";
    }
    if (data.jsonLandmark.landmark.toLowerCase().indexOf('stadium') >= 0) {
        image = "/s1.png";
    }
    if ((data.jsonLandmark.landmark.toLowerCase().indexOf('masjid') >= 0) || (data.jsonLandmark.landmark.toLowerCase().indexOf('mosque') >= 0)) {
        image = "/m1.png";
    }
    if ((data.jsonLandmark.landmark.toLowerCase().indexOf('tower') >= 0) || (data.jsonLandmark.landmark.toLowerCase().indexOf('building') >= 0)) {
        image = "/building.png";
    }

    var marker = new google.maps.Marker({
        position: { lat: data.jsonLandmark.lat, lng: data.jsonLandmark.lng },
        map: map,
        icon: image,
        //shape: shape,
        title: data.jsonLandmark.landmark,
    });

    google.maps.event.addListener(marker, 'click', function () {
        //geocodeAddress(data.jsonLandmark.landmark);
        address = data.jsonLandmark.landmark;
        // console.log(data.jsonLandmark.landmark);

        geocoder.geocode({ 'address': data.jsonLandmark.landmark }, function (results, status) {

            if (status === 'OK') {
                map.setCenter(results[0].geometry.location);
                map.zoom = 15;
                //console.log(landmarkName);
                $("#panel ul").empty();
                $("#infoPanel ul").empty();
                socket.emit('scrapeWiki', { address });
                socket.emit('videos', { address });
                socket.emit('scrapeBlogs', { address });
            }
            else {
                alert('Geocode was not successful for the following reason: ' + status);
            }

        });
    });

});

function setMapOnAll(map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

function clearMarkers() {
    setMapOnAll(null);
}
function deleteMarkers() {
    clearMarkers();
    markers = [];
    locations = [];
}

var myEventsClicked = false;
document.getElementById('my-events').addEventListener('click', function () {
    //alert('clicked');
    if (myEventsClicked === false) {
        myEventsClicked = true;
        for (let i = 0; i < myEvents.length; ++i) {
            //console.log(myEvents[i].location);
            var flag = false;
            for (let index = 0; index < locations.length; ++index) {
                if (locations[index] === myEvents[i].location) {
                    //console.log(markers[i].infowindow.content);
                    markers[index].infowindow.setContent(markers[index].infowindow.content + '<li>' + '<a target = "_blank" href = "' + myEvents[i].details + '">' + myEvents[i].name + '</a>' + '</li>');
                    flag = true;

                }
            }

            if (flag === false) {

                var marker = new google.maps.Marker({
                    map: map,
                    position: myEvents[i].latlng,
                    //icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
                    icon: '/c4.png'
                });
                //marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');

                marker.infowindow = new google.maps.InfoWindow({
                    //content: '<li>' + data.name + " " + '</li>'
                    content: '<li>' + '<a target = "_blank" href = "' + myEvents[i].details + '">' + myEvents[i].name + '</a>' + '</li>'
                });

                markers.push(marker);
                locations.push(myEvents[i].location);

                google.maps.event.addListener(marker, 'mouseover', function () {
                    this.infowindow.open(map, this);
                });
                google.maps.event.addListener(marker, 'click', function () {
                    this.infowindow.close();
                });
            }
        }
    }
    else {
        deleteMarkers();
        myEventsClicked = false;
    }

});

// document.getElementById('infoButton').addEventListener('click', function () {
//     this.classList.toggle("active");
//     var panel = this.nextElementSibling;
//     if (panel.style.display === "block") {
//         panel.style.display = "none";
//     } else {

//         panel.style.display = "block";
//     }
// });


// document.getElementById('accordion').addEventListener('click', function () {
//     this.classList.toggle("active");
//     var panel = this.nextElementSibling;
//     if (panel.style.display === "block") {
//         panel.style.display = "none";
//     } else {

//         panel.style.display = "block";
//     }
// });


// document.getElementById('accordion1').addEventListener('click', function () {
//     this.classList.toggle("active");
//     var panel = this.nextElementSibling;
//     if (panel.style.display === "block") {
//         panel.style.display = "none";
//     } else {

//         panel.style.display = "block";
//     }

// });

socket.on('eventsData', function (data) {
    //console.log("BACK");
    myEvents.push(data);
    $('#my-events').fadeIn("slow");
});
socket.on('meetupData', function (data) {
    //console.log(data);
    myEvents.push(data);

});


function callback(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            console.log(results[i]);
            createMarker(results[i]);
        }
    }
}

function createMarker(place) {
    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location
    });

    google.maps.event.addListener(marker, 'click', function () {
        infowindow.setContent(place.name);
        infowindow.open(map, this);
    });
}

function geocodeAddress(address) {
    deleteMarkers();
    console.log("Hi");
    geocoder.geocode({ 'address': address }, function (results, status) {

        if (status === 'OK') {
            map.setCenter(results[0].geometry.location);
            //map.zoom = 12;
            var marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location
            });
            marker.infowindow = new google.maps.InfoWindow({
                content: address,
                // map: map
            });
            //markers.push(marker);
            //locations.push(address);
            //  infowindow.open(map, marker);
            google.maps.event.addListener(marker, 'mouseover', function () {
                this.infowindow.open(map, this);
            });
            google.maps.event.addListener(marker, 'mouseout', function () {
                this.infowindow.close();
            });
            google.maps.event.addListener(marker, 'click', function () {
                socket.emit('scrapeWiki', { address });
                socket.emit('videos', { address });
                socket.emit('scrapeBlogs', { address });
            });

        }

        //infowindowArray.push(infowindow);
        //myfunc();


        else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
            setTimeout(function () {
                geocodeAddress(address);
            }, 200);
        }
        else {
            alert('Geocode was not successful for the following reason: ' + status + data.location);
        }
    });
}