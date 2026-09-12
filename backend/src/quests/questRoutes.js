import { Router } from 'express';
import { listQuests, createQuest, completeQuest, deleteQuest } from './questController.js';

const router = Router();

// Routes owned by Member 2
router.get('/', listQuests);
router.post('/', createQuest);
router.post('/:id/complete', completeQuest);
router.delete('/:id', deleteQuest);

export default router;
