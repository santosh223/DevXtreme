import Issue from '../models/Issue.js';
import dotenv from 'dotenv';
dotenv.config();

const ALERT_RADIUS_METERS = parseInt(process.env.ALERT_RADIUS_METERS || '200');

/**
 * Calculates distance in meters between two GPS coordinates using the Haversine formula.
 */
export const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000; // Earth's radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Returns active potholes (not Fixed) within a radius around a given coordinate.
 * Uses MongoDB 2dsphere geospatial index for fast queries.
 */
export const getNearbyPotholes = async (lat, lng, radiusMeters = ALERT_RADIUS_METERS) => {
  return Issue.find({
    status: { $ne: 'Fixed' },
    location: {
      $nearSphere: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: radiusMeters
      }
    }
  }).select('latitude longitude severity status is_overdue confidence bbox location').lean();
};
