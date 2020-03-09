// Store our API endpoint inside queryUrl
// Query for March 1st, 2020 to present
//var queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2020-01-01&endtime=" +
//  "2020-02-29&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";

//past 30 days of 2.5+ earthquakes
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson";

//past day
//var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "black",
    color: "black",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

function getColor(d) {
    return d > 5 ? 'red' :
        d > 4 ? 'coral' :
            d > 3 ? 'orange' :
                d > 2 ? 'gold' :
                    d > 1 ? 'green' :
                        d > 0 ? 'lightgreen' :
                            'black';
}

// Perform a GET request to the query URL
d3.json(queryUrl, function (data) {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {


        //console.log("mag:  ", feature.properties.mag, ", color:  ", geojsonMarkerOptions.fillColor, " ", feature.properties.place);

        layer.bindPopup("<h3>" + feature.properties.place +
            "</h3><hr><p>" + new Date(feature.properties.time) +
            "</p>" + "<hr><h3>Magnitude:  "
            + feature.properties.mag + "</hr");
    }



    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function (feature, latlng) {

            //set circle marker radius properties  
            geojsonMarkerOptions.radius = (feature.properties.mag * 3);

            if (feature.properties.mag > 5) {
                geojsonMarkerOptions.fillColor = "red";
            }
            else if (feature.properties.mag > 4) {
                geojsonMarkerOptions.fillColor = "coral";
            }
            else if (feature.properties.mag > 3) {
                geojsonMarkerOptions.fillColor = "orange";
            }
            else if (feature.properties.mag > 2) {
                geojsonMarkerOptions.fillColor = "gold";
            }
            else if (feature.properties.mag > 1) {
                geojsonMarkerOptions.fillColor = "green";
            }
            else {
                geojsonMarkerOptions.fillColor = "lightgreen";
            }

            return L.circleMarker(latlng, geojsonMarkerOptions)
        },
        onEachFeature: onEachFeature
    });

    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
}

function createMap(earthquakes) {

    // Define streetmap and darkmap layers
    var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.streets",
        accessToken: API_KEY
    });

    var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.dark",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Street Map": streetmap,
        "Dark Map": darkmap
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 5,
        layers: [streetmap, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);



    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 1, 2, 3, 4, 5],
            labels = [];

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background-color:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
                
        }

        return div;
    };

    legend.addTo(myMap);
}
