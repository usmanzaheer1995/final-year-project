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
        center: { lat: 30.3753, lng: 69.3451 }
    });
    geocoder = new google.maps.Geocoder();

    document.getElementById('submit').addEventListener('click', function () {
        $("#videos ul").empty();
        address = $('#select1').val();
        geocodeAddress(address);
        getCurrentLocation();
        socket.emit('scrapeWiki', { address });
        socket.emit('myEvents', { address });
        socket.emit('meetup', { address });
        socket.emit('landmarks', { address });
        socket.emit('videos', { address });
        socket.emit('scrapeBlogs', { address });
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
    let list = $("#names-list");
    list.empty();
    let parent = list.parent();

    list.each(function (i) {
        //console.log(data.length);
        for (let x = 0; x < array.length; x++) {
            //console.log(array[x]);
            $(this).append('<li>' + '<strong>' + arrayIndex[x] + '</strong>' + ': ' + array[x] + '</li>');
            if (x == array.length - 1) {
                $(this).appendTo(parent);
            }
        }
    });
}
socket.on('videosData', function (data) {

    var size = Object.keys(data.items).length;

    for (let i = 0; i < size; ++i) {
        console.log(data.items[i].id.videoId);
        $("#videos ul").append('<li><a href="https://www.youtube.com/embed/'+ data.items[i].id.videoId +'?enablejsapi=1" target="_blank"><span class="tab">' + data.items[i].snippet.title + '</span></a></li>');
    }

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
    //console.log(data);
    //console.log( data.jsonLandmark.landmark);
    //console.log(data.jsonLandmark.lat, data.jsonLandmark.lng);

    var image = {
        url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
        // This marker is 20 pixels wide by 32 pixels high.
        size: new google.maps.Size(20, 32),
        // The origin for this image is (0, 0).
        origin: new google.maps.Point(0, 0),
        // The anchor for this image is the base of the flagpole at (0, 32).
        anchor: new google.maps.Point(0, 32)
    };
    var shape = {
        coords: [1, 1, 1, 20, 18, 20, 18, 1],
        type: 'poly'
    };
    var marker = new google.maps.Marker({
        position: { lat: data.jsonLandmark.lat, lng: data.jsonLandmark.lng },
        map: map,
        icon: image,
        shape: shape,
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
                 $("#videos ul").empty();
                socket.emit('scrapeWiki', { address });
                socket.emit('videos', { address });
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
            console.log(myEvents[i].location);
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
                    icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
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
socket.on('eventsData', function (data) {
    //console.log(data);
    myEvents.push(data);
    $('#my-events').show();
});
socket.on('meetupData', function (data) {
    console.log(data);
    myEvents.push(data);

});
/*socket.on('eventsDetails', function (data) {
    console.log(data.name);
    for (var i = 0; i < markers.length; ++i) {
        if (markers[i].infowindow.content === data.name) {
            //console.log(markers[i].infowindow.content);
            markers[i].infowindow.setContent(markers[i].infowindow.content + '<li>' + data.description + '</li>');
        }
        else {
            markers[i].infowindow.setContent(markers[i].infowindow.content + '<li>' + "lala" + '</li>');
        }
        //markers[i].infowindow.setContent('');
    }

});*/

socket.on('blogsData', function (data) {
    console.log(data.title);
    console.log(data.link);
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
            });

            // infowindow = new google.maps.InfoWindow();
            // var request = {
            //     location: results[0].geometry.location,
            //    // radius: '500',
            //     query: 'landmark'
            // };

            // service = new google.maps.places.PlacesService(map);
            // service.textSearch(request, callback);
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
