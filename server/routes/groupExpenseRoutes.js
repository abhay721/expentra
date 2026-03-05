import express from 'express';
import { addGroupExpense, getGroupExpenses, getGroupSettlements } from '../controllers/groupExpenseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, addGroupExpense);

router.route('/:groupId')
    .get(protect, getGroupExpenses);

router.route('/:groupId/settlements')
    .get(protect, getGroupSettlements);

export default router;
