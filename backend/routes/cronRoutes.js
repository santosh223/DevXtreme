import express from 'express';
import { updateOverdueIssues } from '../controllers/cronController.js';

const router = express.Router();

router.post('/update_overdue', updateOverdueIssues);

export default router;
