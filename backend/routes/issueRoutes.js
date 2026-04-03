import express from 'express';
import { 
  createIssue, 
  getIssues, 
  getIssueById, 
  assignIssue, 
  updateIssueStatus 
} from '../controllers/issueController.js';
import { getNearby, checkRoute } from '../controllers/routeController.js';

const router = express.Router();

// Core CRUD
router.post('/', createIssue);
router.get('/', getIssues);
router.get('/nearby', getNearby);           // GET /issues/nearby?lat=&lng=&radius=
router.get('/route-check', checkRoute);     // GET /issues/route-check?originLat=&originLng=&destLat=&destLng=
router.get('/:id', getIssueById);
router.patch('/:id/assign', assignIssue);
router.patch('/:id/status', updateIssueStatus);

export default router;

