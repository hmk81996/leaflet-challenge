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
        center: [14.59, 28.67],
        zoom: 2,
        layers: [worldMap, earthquakes]
    });
  
    // Create a layer control, and pass it baseMaps and overlayMaps. Add the layer control to the map.
    L.control.layers(baseMaps, overlayMaps).addTo(myMap);

};

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

        // For each feature, create a marker, and bind a popup with the feature's name.
        // Add the marker to the magMarkers array.
        let magMarker = L.marker([coordinates[1], coordinates[0]])
            .bindPopup(`<h3><p>Location: ${place}</h3><p>Magnitude: ${mag}</p>`);

        magMarkers.push(magMarker);
    }

    // Create a layer group that's made from the mag markers array, and pass it to the createMap function.
    createMap(L.layerGroup(magMarkers));
}

// load the GeoJSON database
let geoData = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Get the data with d3
d3.json(geoData).then(function(response) {
    console.log(response); // Log the data after it has been retrieved
    createMarkers(response); 
});