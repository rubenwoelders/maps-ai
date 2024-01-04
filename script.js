// Replace 'YOUR_MAPBOX_ACCESS_TOKEN' with your actual Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiYmEyYmEyIiwiYSI6ImNqdWgyeXgzMzB0MTI0ZG9hOTF4NTE0aTgifQ.evZvuBp_LgJ3vQuxZhT-CA';

// Initialize the map
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11', // You can use other Mapbox styles
  center: [2.1700, 41.3870], // Initial map center (Barcelona coordinates)
  zoom: 13
});

// Add navigation control
map.addControl(new mapboxgl.NavigationControl());

// Function to search for a location and display it on the map
function searchLocation() {
  var searchInput = document.getElementById('search-input').value;

  // Make a request to the Mapbox Geocoding API
  fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchInput)}.json?access_token=${mapboxgl.accessToken}`)
    .then(response => response.json())
    .then(data => {
      // Extract the coordinates from the API response
      var features = data.features;
      if (features.length > 0) {
        var coordinates = features[0].geometry.coordinates;

        // Clear existing markers
        if (map.getLayer('marker')) {
          map.removeLayer('marker');
          map.removeSource('marker');
        }

        // Add marker for the searched location
        map.addSource('marker', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: coordinates
            }
          }
        });

        map.addLayer({
          id: 'marker',
          type: 'symbol',
          source: 'marker',
          layout: {
            'icon-image': 'marker-15',
            'icon-size': 1.5
          }
        });

        // Fit the map to the searched location
        map.flyTo({
          center: coordinates,
          zoom: 13,
          essential: true
        });
      } else {
        console.error('No results found');
      }
    })
    .catch(error => console.error('Error:', error));
}

// Function to fetch and visualize population density data
function visualizePopulationDensity() {
  // Fetch the population density data from the proxy server
  fetch('http://127.0.0.1:8080/proxy')
    .then(response => response.text())
    .then(data => {
      // Parse the ASCII XYZ data
      var parsedData = parseASCIIXYZ(data);

      // Create a GeoJSON feature collection from the parsed data
      var geojsonData = {
        type: 'FeatureCollection',
        features: parsedData.map(point => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [point.longitude, point.latitude]
          },
          properties: {
            populationDensity: point.populationDensity
          }
        }))
      };

      // Add a heatmap layer to the map
      map.addSource('heatmap', {
        type: 'geojson',
        data: geojsonData
      });

      map.addLayer({
        id: 'heatmap-layer',
        type: 'heatmap',
        source: 'heatmap',
        maxzoom: 9,
        paint: {
          // Increase the heatmap weight based on population density
          'heatmap-weight': {
            property: 'populationDensity',
            type: 'exponential',
            stops: [
              [0, 0],
              [500, 1]
            ]
          },
          // ... rest of the heatmap properties
        }
      });
    })
    .catch(error => console.error('Error fetching population density data:', error));
}

// Function to parse ASCII XYZ data
function parseASCIIXYZ(data) {
  var parsedData = [];
  var lines = data.trim().split('\n');
  lines.forEach(line => {
    var values = line.trim().split(/\s+/);
    var latitude = parseFloat(values[0]);
    var longitude = parseFloat(values[1]);
    var populationDensity = parseFloat(values[2]);
    parsedData.push({ latitude, longitude, populationDensity });
  });
  return parsedData;
}

// Call the function to visualize population density on load
visualizePopulationDensity();
