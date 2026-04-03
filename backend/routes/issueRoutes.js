import express from 'express';
import { 
  createIssue, 
  getIssues, 
  getIssueById, 
  assignIssue, 
  updateIssueStatus 
} from '../controllers/issueController.js';
import { getNearby, checkRoute } from '../controllers/routeController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Core CRUD
router.post('/', protect, restrictTo('citizen'), createIssue);
router.get('/', getIssues);                                          // public — admin + traveler map
router.get('/nearby', getNearby);                                    // public — traveler
router.get('/route-check', checkRoute);                             // public — traveler
router.get('/:id', getIssueById);
router.patch('/:id/assign', protect, restrictTo('admin'), assignIssue);
router.patch('/:id/status', protect, restrictTo('admin', 'crew'), updateIssueStatus);

export default router;

