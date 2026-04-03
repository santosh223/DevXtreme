import Issue from '../models/Issue.js';
import { runInference } from '../services/inferenceService.js';
import { io } from '../server.js';

export const createIssue = async (req, res) => {
  try {
    const { citizen_id, latitude, longitude, image_url } = req.body;
    
    // Simulate or run actual AI detection
    const { confidence, bbox, severity } = await runInference(image_url);
    
    // Calculate SLA due time
    const now = new Date();
    const slaTime = new Date(now);
    if (severity === 'High') {
      slaTime.setHours(slaTime.getHours() + 24);
    } else if (severity === 'Medium') {
      slaTime.setHours(slaTime.getHours() + 48);
    } else {
      slaTime.setHours(slaTime.getHours() + 72);
    }

    const newIssue = new Issue({
      citizen_id,
      latitude,
      longitude,
      location: { type: 'Point', coordinates: [longitude, latitude] },
      image_url,
      confidence,
      bbox,
      severity,
      sla_due_time: slaTime
    });

    const savedIssue = await newIssue.save();

    // Broadcast to all admin dashboard clients
    io.emit('pothole:new', savedIssue);

    res.status(201).json(savedIssue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getIssues = async (req, res) => {
  try {
    const { status, skip = 0, limit = 100 } = req.query;
    const filter = status ? { status } : {};
    
    const issues = await Issue.find(filter)
      .skip(Number(skip))
      .limit(Number(limit))
      .sort({ created_at: -1 });
      
    res.json(issues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const assignIssue = async (req, res) => {
  try {
    const { assigned_to } = req.body;
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { assigned_to, status: 'Assigned' },
      { new: true }
    );
    
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateIssueStatus = async (req, res) => {
  try {
    const { status, after_image_url } = req.body;
    
    if (status === 'Fixed' && !after_image_url) {
      return res.status(400).json({ error: 'after_image_url is required when status is Fixed' });
    }

    const updateData = { status };
    if (after_image_url) {
      updateData.after_image_url = after_image_url;
    }

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
