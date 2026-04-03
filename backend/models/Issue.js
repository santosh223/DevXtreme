import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema({
  // GeoJSON Point for geospatial queries
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [lng, lat]
  },
  citizen_id: { type: String, default: null },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  image_url: { type: String, required: true },
  
  // AI Generated
  confidence: { type: Number, default: null },
  bbox: { type: String, default: null },
  severity: { 
    type: String, 
    enum: ['Low', 'Medium', 'High'],
    default: 'Low'
  },
  
  // Lifecycle
  status: { 
    type: String, 
    enum: ['Open', 'Assigned', 'In_Progress', 'Fixed'],
    default: 'Open'
  },
  assigned_to: { type: String, default: null },
  
  // Tracking
  created_at: { type: Date, default: Date.now },
  sla_due_time: { type: Date, default: null },
  is_overdue: { type: Boolean, default: false },
  after_image_url: { type: String, default: null }
});

// Geospatial index for proximity queries
issueSchema.index({ location: '2dsphere' });

const Issue = mongoose.model('Issue', issueSchema);

export default Issue;
