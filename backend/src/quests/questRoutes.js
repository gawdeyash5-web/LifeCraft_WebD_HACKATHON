import { Router } from 'express';
import {
  listQuests,
  createQuest,
  getQuestById,
  updateQuest,
  completeQuest,
  deleteQuest,
} from './questController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Protect all quest endpoints with Bearer JWT authentication (Owned by Member 2)
router.use(requireAuth);

router.get('/', listQuests);
router.post('/', createQuest);
router.get('/:id', getQuestById);
router.patch('/:id', updateQuest);
router.delete('/:id', deleteQuest);
router.post('/:id/complete', completeQuest);

export default router;
