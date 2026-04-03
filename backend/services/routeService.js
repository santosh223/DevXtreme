import axios from 'axios';

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';

/**
 * Fetches the safest alternative route from OSRM, routing THROUGH waypoints
 * that avoid known pothole clusters.
 * 
 * @param {number} originLat
 * @param {number} originLng
 * @param {number} destLat
 * @param {number} destLng
 * @param {Array}  avoidNearCoords - Array of {lat, lng} pothole coords to route around
 * @returns {Object} { distance, duration, geometry } — GeoJSON LineString geometry
 */
export const getAlternativeRoute = async (originLat, originLng, destLat, destLng, avoidNearCoords = []) => {
  // Build coordinate string: origin; [intermediate offset waypoints]; destination
  const waypoints = [];

  for (const p of avoidNearCoords) {
    // Push a perpendicular 0.003° offset waypoint to route around the pothole
    waypoints.push(`${(p.lng + 0.003).toFixed(6)},${(p.lat + 0.003).toFixed(6)}`);
  }

  const coordString = [
    `${originLng},${originLat}`,
    ...waypoints,
    `${destLng},${destLat}`
  ].join(';');

  const url = `${OSRM_BASE}/${coordString}?overview=full&geometries=geojson&steps=false`;
  
  try {
    const response = await axios.get(url, { timeout: 5000 });
    
    if (response.data?.routes?.length > 0) {
      const route = response.data.routes[0];
      return {
        distance_meters: route.distance,
        duration_seconds: route.duration,
        geometry: route.geometry   // GeoJSON LineString — ready for Mapbox/Leaflet
      };
    }
    return null;
  } catch (err) {
    console.error('OSRM route request failed:', err.message);
    return null;
  }
};
