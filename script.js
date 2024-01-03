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
        // Note: Clearing markers is not a common operation in Mapbox GL JS, 
        // so you may need to adjust this based on your specific use case.
        // For simplicity, we'll remove the previous marker by replacing it with a new one.
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
