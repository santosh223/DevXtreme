import express from 'express';
import { testInference } from '../controllers/inferController.js';

const router = express.Router();

router.post('/', testInference);

export default router;
