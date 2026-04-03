// seed.js — Run once to populate DB with realistic pothole demo data
// Usage: node seed.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Issue from './models/Issue.js';

dotenv.config();

const DB_URI = process.env.DATABASE_URL || 'mongodb://localhost:27017/pothole_tracker';

// 20 realistic pothole reports spread across different wards/locations
const sampleIssues = [
  { lat: 28.6139, lng: 77.2090, severity: 'High',   confidence: 0.97, bboxArea: 850 },
  { lat: 28.6152, lng: 77.2100, severity: 'High',   confidence: 0.92, bboxArea: 780 },
  { lat: 28.6200, lng: 77.2080, severity: 'Medium', confidence: 0.75, bboxArea: 450 },
  { lat: 28.6110, lng: 77.2055, severity: 'Low',    confidence: 0.63, bboxArea: 200 },
  { lat: 28.6175, lng: 77.2130, severity: 'High',   confidence: 0.95, bboxArea: 920 },
  { lat: 28.6090, lng: 77.2070, severity: 'Medium', confidence: 0.78, bboxArea: 510 },
  { lat: 28.6220, lng: 77.2150, severity: 'Low',    confidence: 0.61, bboxArea: 150 },
  { lat: 28.6160, lng: 77.2040, severity: 'High',   confidence: 0.91, bboxArea: 800 },
  { lat: 28.6130, lng: 77.2110, severity: 'Medium', confidence: 0.72, bboxArea: 430 },
  { lat: 28.6195, lng: 77.2095, severity: 'Low',    confidence: 0.65, bboxArea: 220 },
  { lat: 28.6145, lng: 77.2065, severity: 'High',   confidence: 0.98, bboxArea: 960 },
  { lat: 28.6205, lng: 77.2120, severity: 'Medium', confidence: 0.80, bboxArea: 500 },
  { lat: 28.6170, lng: 77.2030, severity: 'Low',    confidence: 0.60, bboxArea: 180 },
  { lat: 28.6115, lng: 77.2140, severity: 'High',   confidence: 0.94, bboxArea: 870 },
  { lat: 28.6185, lng: 77.2085, severity: 'Medium', confidence: 0.77, bboxArea: 480 },
  { lat: 28.6100, lng: 77.2110, severity: 'Low',    confidence: 0.62, bboxArea: 170 },
  { lat: 28.6230, lng: 77.2060, severity: 'High',   confidence: 0.96, bboxArea: 910 },
  { lat: 28.6155, lng: 77.2045, severity: 'Medium', confidence: 0.74, bboxArea: 460 },
  { lat: 28.6125, lng: 77.2135, severity: 'Low',    confidence: 0.64, bboxArea: 210 },
  { lat: 28.6180, lng: 77.2075, severity: 'High',   confidence: 0.93, bboxArea: 830 },
];

const statuses = ['Open', 'Assigned', 'In_Progress', 'Fixed'];
const crews = ['Crew A', 'Crew B', 'Crew C'];
const imageUrls = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Pothole_on_a_road.jpg/800px-Pothole_on_a_road.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Potholes_in_a_dirt_road.jpg/800px-Potholes_in_a_dirt_road.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Pothole_in_road.JPG/800px-Pothole_in_road.JPG',
];

const getSlaTime = (severity, createdAt) => {
  const d = new Date(createdAt);
  const hours = severity === 'High' ? 24 : severity === 'Medium' ? 48 : 72;
  d.setHours(d.getHours() + hours);
  return d;
};

const randomPast = (daysMax = 10) => {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysMax));
  return d;
};

const seedIssues = sampleIssues.map(({ lat, lng, severity, confidence, bboxArea }, i) => {
  const status = statuses[i % statuses.length];
  const createdAt = randomPast(10);
  const sla = getSlaTime(severity, createdAt);
  const isOverdue = status !== 'Fixed' && new Date() > sla;

  const doc = {
    citizen_id: `citizen_${i + 1}`,
    latitude: lat,
    longitude: lng,
    location: { type: 'Point', coordinates: [lng, lat] },
    image_url: imageUrls[i % imageUrls.length],
    confidence,
    bbox: `[0, 0, ${Math.floor(bboxArea / 10)}, ${Math.floor(bboxArea / 10)}]`,
    severity,
    status,
    assigned_to: (status === 'Assigned' || status === 'In_Progress' || status === 'Fixed')
      ? crews[i % crews.length]
      : null,
    created_at: createdAt,
    sla_due_time: sla,
    is_overdue: isOverdue,
    after_image_url: status === 'Fixed'
      ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Pothole_on_a_road.jpg/800px-Pothole_on_a_road.jpg'
      : null,
  };

  return doc;
});

const run = async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log('Connected to MongoDB.');

    // Clear existing data
    await Issue.deleteMany({});
    console.log('Cleared existing issues.');

    await Issue.insertMany(seedIssues);
    console.log(`✅ Inserted ${seedIssues.length} realistic pothole issues.`);

    await mongoose.disconnect();
    console.log('Disconnected.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
};

run();
