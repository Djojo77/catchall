var map = null;
var boxpolys = null;
var directions = null;
var routeBoxer = null;
var distance = 0.5; // km
var service = null;
var gmarkers = [];
var boxes = null;
var infowindow = new google.maps.InfoWindow();
var geolocBox = null;
var mode_selector = null;

var geolocPos = null;
var markers = [];
var origin = null;
var destination = null;
var travel_mode = 'WALKING';

function initialize() {
    // Default the map view to the continental U.S.
    var mapOptions = {
        center: new google.maps.LatLng(48.8795, 2.3322),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoom: 12
    };

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            geolocPos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

        }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    }

    map = new google.maps.Map(document.getElementById("map"), mapOptions);
    service = new google.maps.places.PlacesService(map);

    routeBoxer = new RouteBoxer();

    var autoHandler = new AutocompleteDirectionsHandler(map);
    getTravalMode();
    geolocBox = document.getElementById('geolocate');
    mode_selector = document.getElementById('mode_selector');
    mode_selector.addEventListener('change', getTravalMode);
    geolocBox.addEventListener('change', geolocate);

    map.addListener('click', function (event) {
        if (origin == null) {
            origin = event.latLng;
            var marker1 = new google.maps.Marker({
               position: origin,
                map: map,
                title: 'origin',
                draggable: true
            });
            draggable(marker1);
            markers.push(marker1);
        } else if (destination == null) {
            destination = event.latLng;
            var marker2 = new google.maps.Marker({
                position: destination,
                map: map,
                title: 'destination',
                draggable: true
            });
            draggable(marker2);
            markers.push(marker2);
        }
        if (origin != null && destination != null) route();
    });

    directionService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({ map: map });

    // If there are any parameters at eh end of the URL, they will be in  location.search
    // looking something like  "?marker=3"

    // skip the first character, we are not interested in the "?"
    var query = location.search.substring(1);

    // split the rest at each "&" character to give a list of  "argname=value"  pairs
    var pairs = query.split("&");
    for (var i = 0; i < pairs.length; i++) {
        // break each pair at the first "=" to obtain the argname and value
        var pos = pairs[i].indexOf("=");
        var argname = pairs[i].substring(0, pos).toLowerCase();
        var value = pairs[i].substring(pos + 1).toLowerCase();

        // process each possible argname  -  use unescape() if theres any chance of spaces
        if (argname == "to") {
            document.getElementById('to').value = unescape(value);
        }
        if (argname == "from") {
            document.getElementById('from').value = unescape(value);
        }
        if (argname == "dist") {
            document.getElementById('distance').value = parseFloat(value);
        }
        if (argname == "type") {
            document.getElementById('type').value = unescape(value);
        }
        if (argname == "keyword") {
            document.getElementById('keyword').value = unescape(value);
        }
        if (argname == "name") {
            document.getElementById('name').value = unescape(value);
        }
        if (argname == "submit") {
            route();
        }
    }

}

function route() {
    clearMarkers();
    // Clear any previous route boxes from the map
    clearBoxes();

    clearGMarkers();
    // Convert the distance to box around the route from miles to km
    distance = (distance === null) ? parseFloat(document.getElementById("distance").value) * 1.609344 : distance * 1.609344;

    origin = (origin === null) ? document.getElementById("from").value : origin;
    destination = (destination === null) ? document.getElementById("to").value : destination;

    var request = {
        origin: origin,
        destination: destination,
        travelMode: travel_mode
    };

    console.log(request);

    // Make the directions request
    directionService.route(request, function(result, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);

            // Box around the overview path of the first route
            var path = result.routes[0].overview_path;
            boxes = routeBoxer.box(path, distance);
            // alert(boxes.length);
            // drawBoxes();
            findPlaces(0);
        } else {
            alert("Directions query failed: " + status);
        }
    });

    origin = null;
    destination = null;
}

// Draw the array of boxes as polylines on the map
function drawBoxes() {
    boxpolys = new Array(boxes.length);
    for (var i = 0; i < boxes.length; i++) {
        boxpolys[i] = new google.maps.Rectangle({
            bounds: boxes[i],
            fillOpacity: 0,
            strokeOpacity: 1.0,
            strokeColor: '#000000',
            strokeWeight: 1,
            map: map
        });
    }
}


function findPlaces(searchIndex) {
    var type = document.getElementById('type').value;
    var keyword = document.getElementById('keyword').value;
    var name = document.getElementById('name').value;
    var request = {
        bounds: boxes[searchIndex],
    };
    if (type && (type != "")) {
        if (type.indexOf(',') > 0)
            request.types = type.split(',');
        else
            request.types = [type];
    }
    if (keyword && (keyword != "")) request.keyword = keyword;
    if (name && (name != "")) request.name = name;

    service.radarSearch(request, function(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            // document.getElementById('side_bar').innerHTML += "bounds[" + searchIndex + "] returns " + results.length + " results<br>"
            for (var i = 0, result; result = results[i]; i++) {
                var marker = createMarker(result);
            }
        } /*else {
            // document.getElementById('side_bar').innerHTML += "bounds[" + searchIndex + "] returns 0 results<br>&nbsp;status=" + status + "<br>";
        }*/
        if (status != google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
            searchIndex++;
            if (searchIndex < boxes.length)
                findPlaces(searchIndex);
        } else { // delay 1 second and try again
            setTimeout("findPlaces(" + searchIndex + ")", 1000);
        }

    });
}

// Clear boxes currently on the map
function clearBoxes() {
    if (boxpolys != null) {
        for (var i = 0; i < boxpolys.length; i++) {
            boxpolys[i].setMap(null);
        }
    }
    boxpolys = null;
}

function createMarker(place) {
    var placeLoc = place.geometry.location;
    if (place.icon) {
        var image = new google.maps.MarkerImage(
            place.icon, new google.maps.Size(71, 71),
            new google.maps.Point(0, 0), new google.maps.Point(17, 34),
            new google.maps.Size(25, 25));
    } else var image = {
        url: "https://maps.gstatic.com/intl/en_us/mapfiles/markers2/measle.png",
        size: new google.maps.Size(7, 7),
        anchor: new google.maps.Point(3.5, 3.5)
    };

    var marker = new google.maps.Marker({
        map: map,
        icon: image,
        position: place.geometry.location
    });
    var request = {
        reference: place.reference
    };
    google.maps.event.addListener(marker, 'click', function() {
        service.getDetails(request, function(place, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                var contentStr = '<h5>' + place.name + '</h5><p>' + place.formatted_address;
                if (!!place.formatted_phone_number) contentStr += '<br>' + place.formatted_phone_number;
                if (!!place.website) contentStr += '<br><a target="_blank" href="' + place.website + '">' + place.website + '</a>';
                contentStr += '<br>' + place.types + '</p>';
                infowindow.setContent(contentStr);
                infowindow.open(map, marker);
            } else {
                var contentStr = "<h5>No Result, status=" + status + "</h5>";
                infowindow.setContent(contentStr);
                infowindow.open(map, marker);
            }
        });

    });
    gmarkers.push(marker);
    if (!place.name) place.name = "result " + gmarkers.length;
    // var side_bar_html = "<a href='javascript:google.maps.event.trigger(gmarkers[" + parseInt(gmarkers.length - 1) + "],\"click\");'>" + place.name + "</a><br>";
    // document.getElementById('side_bar').innerHTML += side_bar_html;
}

function clearMarkers() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
}

function clearGMarkers() {
    for (var i = 0; i < gmarkers.length; i++) {
        gmarkers[i].setMap(null);
    }
}

function getTravalMode () {
    travel_mode = document.getElementById('mode_selector').value.toUpperCase();
}

//------------------------------------------------------------------------------
function AutocompleteDirectionsHandler(map) {
    this.map = map;
    this.originPlaceId = null;
    this.destinationPlaceId = null;
    this.travelMode = 'WALKING';
    var originInput = document.getElementById('from');
    var destinationInput = document.getElementById('to');
    // var modeSelector = document.getElementById('mode-selector');
    this.directionsService = new google.maps.DirectionsService;
    this.directionsDisplay = new google.maps.DirectionsRenderer;
    this.directionsDisplay.setMap(map);

    var originAutocomplete = new google.maps.places.Autocomplete(
        originInput, {placeIdOnly: true});
    var destinationAutocomplete = new google.maps.places.Autocomplete(
        destinationInput, {placeIdOnly: true});

    // this.setupClickListener('changemode-walking', function() { travel_mode = google.maps.DirectionsTravelMode.WALKING });
    // this.setupClickListener('changemode-transit', function() { travel_mode = google.maps.DirectionsTravelMode.TRANSIT });
    // this.setupClickListener('changemode-driving', function() { travel_mode = google.maps.DirectionsTravelMode.DRIVING });

    this.setupPlaceChangedListener(originAutocomplete, 'ORIG');
    this.setupPlaceChangedListener(destinationAutocomplete, 'DEST');

    // this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(originInput);
    // this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(destinationInput);
    // this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(modeSelector);
}

// Sets a listener on a radio button to change the filter type on Places
// Autocomplete.
AutocompleteDirectionsHandler.prototype.setupClickListener = function(id, mode) {
    var radioButton = document.getElementById(id);
    var me = this;
    radioButton.addEventListener('click', function() {
        me.travelMode = mode;
        me.route();
    });
};

AutocompleteDirectionsHandler.prototype.setupPlaceChangedListener = function(autocomplete, mode) {
    var me = this;
    autocomplete.bindTo('bounds', this.map);
    autocomplete.addListener('place_changed', function() {
        var place = autocomplete.getPlace();
        if (!place.place_id) {
            window.alert("Please select an option from the dropdown list.");
            return;
        }
        if (mode === 'ORIG') {
            me.originPlaceId = place.place_id;
        } else {
            me.destinationPlaceId = place.place_id;
        }
        me.route();
    });

};

AutocompleteDirectionsHandler.prototype.route = function() {
    if (!this.originPlaceId || !this.destinationPlaceId) {
        return;
    }
    var me = this;

    this.directionsService.route({
        origin: {'placeId': this.originPlaceId},
        destination: {'placeId': this.destinationPlaceId},
        travelMode: this.travelMode
    }, function(response, status) {
        if (status === 'OK') {
            me.directionsDisplay.setDirections(response);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
};
//------------------------------------------------------------------------------


function geolocate() {
    if (geolocBox.checked && geolocPos !== null) {
        origin = geolocPos;
        var marker1 = new google.maps.Marker({
            position: geolocPos,
            map: map,
            title: 'ME'
        });
        markers.push(marker1);
    } else {

    }
}

function draggable(marker) {
    google.maps.event.addListener(marker, 'dragend', function(event) {
        marker.position = event.latLng;
        switch (marker.title) {
            case 'origin':
                origin = marker.position;
                break;
            case 'destination':
                destination = marker.position;
                break;
        }
    });
}

google.maps.event.addDomListener(window, 'load', initialize);