import Issue from '../models/Issue.js';
import { io } from '../server.js';

export const updateOverdueIssues = async (req, res) => {
  try {
    const now = new Date();
    
    const overdueIssues = await Issue.find({
      status: { $ne: 'Fixed' },
      sla_due_time: { $lt: now },
      is_overdue: false
    });

    let count = 0;
    for (let issue of overdueIssues) {
      issue.is_overdue = true;
      await issue.save();
      count++;
      // Notify admin dashboard in real time
      io.emit('pothole:overdue', { issueId: issue._id, severity: issue.severity, assigned_to: issue.assigned_to });
    }

    res.json({ message: `Successfully checked and updated ${count} overdue issues.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
