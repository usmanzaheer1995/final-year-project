var socket = io();

var map, geocoder;
var locations = [];
var infowindowArray = [];
var markers = [];
var address;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: { lat: -34.397, lng: 150.644 }
    });
    geocoder = new google.maps.Geocoder();

    document.getElementById('submit').addEventListener('click', function () {

        address = $('#address').val();
        geocodeAddress(address);

        socket.emit('scrapeWiki', { address });

    });

}

socket.on('returnWikiData', function (data) {

    var arrayIndex = $.map(data, function (value, index) {
        return [index];
    });
    var array = $.map(data, function (value, index) {
        return [value];
    });
    var list = $("#names-list");
    list.empty();
    var parent = list.parent();

    list.each(function (i) {
        //console.log(data.length);
        for (var x = 0; x < array.length; x++) {
            //console.log(array[x]);
            $(this).append('<li>' + '<strong>' + arrayIndex[x] + '</strong>' + ': ' + array[x] + '</li>');
            if (x == array.length - 1) {
                $(this).appendTo(parent);
            }
        }
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

socket.on('eventsData', function (data) {
    //console.log(data.location);
    var flag = false;
    for (var i = 0; i < locations.length; ++i) {
        if (locations[i] === data.location) {
            console.log(markers[i].infowindow.content);
        
            markers[i].infowindow.setContent(markers[i].infowindow.content + '<li>' + data.name + '</li>');
            flag = true;

        }
    }

    if (flag === false) {

        var marker = new google.maps.Marker({
            map: map,
            position: data.latlng
        });

        marker.infowindow = new google.maps.InfoWindow({
            content: '<li>' + data.name + '</li>'
        });
        
        markers.push(marker);
        locations.push(data.location);

        google.maps.event.addListener(marker, 'mouseover', function () {
            this.infowindow.open(map, this);
        });
        google.maps.event.addListener(marker, 'mouseout', function () {
            this.infowindow.close();
        });
    }

    for (var index = 0; index < locations.length; index++) {
        console.log(locations[index]);
    }
    console.log(markers.length);
    console.log('\n\n');
    
    //markers[0].infowindow.setContent('islamabad' + '<li>' + markers[0].infowindow.content + '</li>');
    //console.log(markers[0].infowindow.content);
});

function geocodeAddress(address) {
    deleteMarkers();
    geocoder.geocode({ 'address': address }, function (results, status) {
        if (status === 'OK') {
            map.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location
            });
            marker.infowindow = new google.maps.InfoWindow({
                content:  address ,
                // map: map
            });
            markers.push(marker);
            locations.push(address);
            //  infowindow.open(map, marker);
            google.maps.event.addListener(marker, 'mouseover', function () {
                this.infowindow.open(map, this);
            });
            google.maps.event.addListener(marker, 'mouseout', function () {
                this.infowindow.close();
            });
            
            //infowindowArray.push(infowindow);
            //myfunc();

        }
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

