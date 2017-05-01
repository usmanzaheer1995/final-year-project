var socket = io();

var map, geocoder;
var locations = [];
var infowindowArray = [];
var markers = [];
var address;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: { lat: 30.3753, lng: 69.3451 }
    });
    geocoder = new google.maps.Geocoder();

    document.getElementById('submit').addEventListener('click', function () {

        address = $('#select1').val();
        geocodeAddress(address);
        socket.emit('scrapeWiki', { address });

    });

}

function showWikiDetails(arrayIndex, array) {
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
}

socket.on('returnWikiData', function (data) {

    var arrayIndex = $.map(data, function (value, index) {
        return [index];
    });
    var array = $.map(data, function (value, index) {
        return [value];
    });

    showWikiDetails(arrayIndex,array);
    
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


    //////////////////////////////////////////////////////////////////////////////////////////////
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
            position: data.latlng,
            icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
        });
        //marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');

        marker.infowindow = new google.maps.InfoWindow({
            //content: '<li>' + data.name + " " + '</li>'
            content: '<a target = "_blank" href = "'+data.details+'">'+data.name+ '</a>'
        });

        markers.push(marker);
        locations.push(data.location);

        google.maps.event.addListener(marker, 'click', function () {
            this.infowindow.open(map, this);
        });
        /*google.maps.event.addListener(marker, 'mouseout', function () {
            this.infowindow.close();
        })*/


    }

    // for (var index = 0; index < locations.length; index++) {
    //     console.log(locations[index]);
    // }
    console.log(markers.length);
    console.log('\n\n');

    //markers[0].infowindow.setContent('islamabad' + '<li>' + markers[0].infowindow.content + '</li>');
    //console.log(markers[0].infowindow.content);
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
            markers.push(marker);
            locations.push(address);
            //  infowindow.open(map, marker);
            google.maps.event.addListener(marker, 'click', function () {
                this.infowindow.open(map, this);
            });
            // google.maps.event.addListener(marker, 'mouseout', function () {
            //     this.infowindow.close();
            // });

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
