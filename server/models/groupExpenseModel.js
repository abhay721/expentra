import mongoose from 'mongoose';

const groupExpenseSchema = new mongoose.Schema(
    {
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group',
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        amount: {
            type: Number,
            required: true,
            min: [0.01, 'Amount must be positive'],
        },
        paidBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        splitBetween: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                name: String,
                amount: {
                    type: Number,
                    required: true,
                },
            }
        ],
        category: {
            type: String,
            required: true,
            default: 'General',
        },
        note: {
            type: String,
            trim: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

const GroupExpense = mongoose.model('GroupExpense', groupExpenseSchema);
export default GroupExpense;
