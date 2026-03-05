import GroupExpense from '../models/groupExpenseModel.js';
import Group from '../models/groupModel.js';

// @desc    Add group expense
// @route   POST /api/group-expenses
// @access  Private
export const addGroupExpense = async (req, res, next) => {
    try {
        const { groupId, title, amount, paidBy, splitBetween, category, note, date } = req.body;

        if (!groupId || !title || !amount || !paidBy || !splitBetween) {
            res.status(400);
            throw new Error('Please fill all required fields');
        }

        const group = await Group.findById(groupId);
        if (!group) {
            res.status(404);
            throw new Error('Group not found');
        }

        // Validate that the request maker is part of the group
        const isMember = group.members.some(m => m.user && m.user.toString() === req.user._id.toString());
        if (!isMember) {
            res.status(401);
            throw new Error('Not authorized to add expense to this group');
        }

        const expense = await GroupExpense.create({
            groupId,
            title,
            amount,
            paidBy,
            splitBetween,
            category: category || 'General',
            note,
            date: date ? new Date(date) : Date.now(),
        });

        res.status(201).json(expense);
    } catch (error) {
        next(error);
    }
};

// @desc    Get expenses for a group
// @route   GET /api/group-expenses/:groupId
// @access  Private
export const getGroupExpenses = async (req, res, next) => {
    try {
        const { groupId } = req.params;

        const group = await Group.findById(groupId);
        if (!group) {
            res.status(404);
            throw new Error('Group not found');
        }

        const isMember = group.members.some(m => m.user && m.user.toString() === req.user._id.toString());
        if (!isMember) {
            res.status(401);
            throw new Error('Not authorized');
        }

        const expenses = await GroupExpense.find({ groupId }).sort({ date: -1 });
        res.json(expenses);
    } catch (error) {
        next(error);
    }
};

// @desc    Get settlements for a group
// @route   GET /api/group-expenses/:groupId/settlements
// @access  Private
export const getGroupSettlements = async (req, res, next) => {
    try {
        const { groupId } = req.params;

        const group = await Group.findById(groupId);
        if (!group) {
            res.status(404);
            throw new Error('Group not found');
        }

        const isMember = group.members.some(m => m.user && m.user.toString() === req.user._id.toString());
        if (!isMember) {
            res.status(401);
            throw new Error('Not authorized');
        }

        const expenses = await GroupExpense.find({ groupId });

        // Calculate balances
        // For each user, we calculate: Total Paid - Total Share
        // If balance > 0, they get money back. If balance < 0, they owe money.
        const balances = {};

        group.members.forEach(member => {
            // Use user ID if available, otherwise name (for unregistered)
            const identifier = member.user ? member.user.toString() : member.name;
            balances[identifier] = {
                memberInfo: member,
                balance: 0,
            };
        });

        expenses.forEach(exp => {
            // Credit the person who paid
            const payerId = exp.paidBy.toString();
            // Since paidBy could be a user id we find it in balances
            if (balances[payerId]) {
                balances[payerId].balance += exp.amount;
            }

            // Debit the members who share the expense
            exp.splitBetween.forEach(split => {
                const splitUserId = split.user ? split.user.toString() : split.name;
                if (balances[splitUserId]) {
                    balances[splitUserId].balance -= split.amount;
                }
            });
        });

        // We can also calculate a simplified "who owes whom" array
        const debtors = [];
        const creditors = [];

        Object.keys(balances).forEach(identifier => {
            const bal = balances[identifier];
            if (bal.balance < -0.01) debtors.push({ ...bal, identifier });
            else if (bal.balance > 0.01) creditors.push({ ...bal, identifier });
        });

        debtors.sort((a, b) => a.balance - b.balance); // most negative first
        creditors.sort((a, b) => b.balance - a.balance); // most positive first

        const simplifiedDebts = [];

        let i = 0; // debtors index
        let j = 0; // creditors index

        while (i < debtors.length && j < creditors.length) {
            const debtor = debtors[i];
            const creditor = creditors[j];

            const amountToSettle = Math.min(Math.abs(debtor.balance), creditor.balance);

            simplifiedDebts.push({
                from: debtor.memberInfo,
                to: creditor.memberInfo,
                amount: amountToSettle,
            });

            debtor.balance += amountToSettle;
            creditor.balance -= amountToSettle;

            if (Math.abs(debtor.balance) < 0.01) i++;
            if (creditor.balance < 0.01) j++;
        }

        res.json({
            balances: Object.values(balances),
            simplifiedDebts
        });
    } catch (error) {
        next(error);
    }
};
