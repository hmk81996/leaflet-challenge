// The function that will determine the color of a marker based on earthquake magnitude
function getColor(depth) {
    if (depth <= 0) return "red";
    else if (depth > 0 && depth <= 1) return "orange";
    else if (depth > 1 && depth <= 1.5) return "yellow";
    else if (depth > 1.5 && depth <= 2) return "green";
    else if (depth > 2 && depth <= 4) return "blue";
    else if (depth > 4) return "violet";
    else return "black";
  }

// A function to determine the marker size based on the magnitude
function markerSize(mag) {
    return Math.sqrt(mag)*25000;
  }

// Create createMarkers function
function createMarkers(response) {
    console.log(response);

    // Initialize an array to hold the magnitude markers.
    let magMarkers = [];

    // Loop through the features array.
    for (let i = 0; i < response.features.length; i++) {
        
        // Pull the variables from response.features.
        // Xpert Assistant helped me to debug this and use correct dot notation
        // let properties = response.features[i];
        let coordinates = response.features[i].geometry.coordinates;
        let place = response.features[i].properties.place;
        let mag = response.features[i].properties.mag;
        let size = (mag && mag >= 0) ? markerSize(mag) : 0; // Use 0 or some minimum size if mag is invalid
        
        console.log("Magnitude:", mag);

        // For each feature, create a marker:
            // magnitude determines size
            // depth determines color
        // Bind a popup with the feature's name.
        
        let magMarker = L.circle([coordinates[1], coordinates[0]], {
            stroke: true,
            color: "black",
            weight: 1,
            fillColor: getColor(coordinates[2]),
            fillOpacity: 0.75,
            radius: size,
        }).bindPopup(`<h3><p>Location: ${place}</h3><p>Magnitude: ${mag}</p><p>Depth: ${coordinates[2]}</p>`);
        
        // Add the marker to the magMarkers array.
        magMarkers.push(magMarker);
    }

    // Create a layer group that's made from the mag markers array, and pass it to the createMap function.
    let earthquakes = L.layerGroup(magMarkers);

    // call createMap with the earthquakes layer
    createMap(earthquakes);
}

// Create createMap function
function createMap(earthquakes) {
    // create the tile layer 
    let worldMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
      });

    // create a basemap layer object to hold tile layer 
    let baseMaps = {
        "World Map": worldMap
    };

    // create overlayMaps object to hold earthquake magnitude layer
    let overlayMaps = {
        "Earthquakes": earthquakes
    };

    // Create the map object with options.
    let myMap = L.map("map", {
        center: [39.09, -99.71],
        zoom: 5,
        layers: [worldMap, earthquakes]
    });
  
    // Create a layer control, and pass it baseMaps and overlayMaps. Add the layer control to the map.
    L.control.layers(baseMaps, overlayMaps).addTo(myMap);

    // Create a legend to display information about our map.
    let info = L.control({
        position: "bottomright"
    });

    // When the layer control is added, insert a div with the class of "legend".
    // Xpert Assistant suggestion to populate the legend
    info.onAdd = function() {
        let div = L.DomUtil.create("div", "legend");
        let grades = [-.01,0,1,1.5, 2,4];
        let labels = [];

        // Loop through depth ranges to create a colored box for each range
        // Xpert Assistant suggestion
        for (let i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style = "background:' + getColor(grades[i] + .01) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[ i + 1 ]: '+') + '<br>';
        }
        return div;
    };
    // Add the info legend to the map.
    info.addTo(myMap);
};

// load the GeoJSON database
let geoData = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Get the data with d3
d3.json(geoData).then(function(response) {
    console.log(response); // Log the data after it has been retrieved
    createMarkers(response); 
});