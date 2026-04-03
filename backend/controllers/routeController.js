import { getNearbyPotholes, haversineDistance } from '../services/proximityService.js';
import { getAlternativeRoute } from '../services/routeService.js';
import Issue from '../models/Issue.js';

/**
 * GET /issues/nearby?lat=&lng=&radius=
 * Returns active potholes within a radius (default 200m) for the map + alert layer.
 */
export const getNearby = async (req, res) => {
  try {
    const { lat, lng, radius = 200 } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'lat and lng are required' });

    const potholes = await getNearbyPotholes(parseFloat(lat), parseFloat(lng), parseInt(radius));
    res.json({ count: potholes.length, potholes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /issues/route-check?originLat=&originLng=&destLat=&destLng=
 * Checks if potholes lie along the route's corridor and returns a safe OSRM reroute.
 */
export const checkRoute = async (req, res) => {
  try {
    const { originLat, originLng, destLat, destLng } = req.query;

    if (!originLat || !originLng || !destLat || !destLng) {
      return res.status(400).json({ error: 'originLat, originLng, destLat, destLng are required' });
    }

    const oLat = parseFloat(originLat);
    const oLng = parseFloat(originLng);
    const dLat = parseFloat(destLat);
    const dLng = parseFloat(destLng);

    // Find all active potholes between origin and destination
    // Use the midpoint of the route as a search center with a generous radius
    const midLat = (oLat + dLat) / 2;
    const midLng = (oLng + dLng) / 2;
    const routeLength = haversineDistance(oLat, oLng, dLat, dLng);
    const searchRadius = Math.min(routeLength / 2, 5000); // cap at 5km

    const potholes = await getNearbyPotholes(midLat, midLng, searchRadius);

    if (potholes.length === 0) {
      // Route is clear — get direct route
      const directRoute = await getAlternativeRoute(oLat, oLng, dLat, dLng);
      return res.json({
        clear: true,
        potholes_on_route: 0,
        message: 'Route is clear of potholes.',
        route: directRoute
      });
    }

    // Route has potholes — get alternative
    const avoidCoords = potholes.map(p => ({ lat: p.latitude, lng: p.longitude }));
    const altRoute = await getAlternativeRoute(oLat, oLng, dLat, dLng, avoidCoords);

    res.json({
      clear: false,
      potholes_on_route: potholes.length,
      potholes,
      message: `${potholes.length} pothole(s) detected along this route. Alternative route provided.`,
      route: altRoute
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
