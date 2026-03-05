import Group from '../models/groupModel.js';
import User from '../models/userModel.js';

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private
export const createGroup = async (req, res, next) => {
    try {
        const { name, members } = req.body;

        if (!name) {
            res.status(400);
            throw new Error('Please provide a group name');
        }

        // Include the creator in the members list by default
        const initialMembers = [
            {
                user: req.user._id,
                name: req.user.name,
                email: req.user.email,
            }
        ];

        if (members && members.length > 0) {
            // Here we could validate each member or lookup by email if provided
            // For simplicity, we just add them
            members.forEach(m => {
                initialMembers.push({
                    user: m.user || null,
                    name: m.name,
                    email: m.email,
                });
            });
        }

        const group = await Group.create({
            name,
            createdBy: req.user._id,
            members: initialMembers,
        });

        res.status(201).json(group);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all groups for a user
// @route   GET /api/groups
// @access  Private
export const getGroups = async (req, res, next) => {
    try {
        // Find groups where the current user is a member
        const groups = await Group.find({
            'members.user': req.user._id,
        }).sort({ createdAt: -1 });

        res.json(groups);
    } catch (error) {
        next(error);
    }
};

// @desc    Get group by ID
// @route   GET /api/groups/:id
// @access  Private
export const getGroupById = async (req, res, next) => {
    try {
        const group = await Group.findById(req.params.id);

        if (group) {
            // check if user is in members array
            const isMember = group.members.some(m => m.user && m.user.toString() === req.user._id.toString());
            if (!isMember) {
                res.status(401);
                throw new Error('Not authorized to view this group');
            }
            res.json(group);
        } else {
            res.status(404);
            throw new Error('Group not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Add member to group
// @route   PUT /api/groups/:id/members
// @access  Private
// To be implemented: basic member addition
export const addMemberToGroup = async (req, res, next) => {
    try {
        const { name, email } = req.body;
        const groupId = req.params.id;

        if (!name) {
            res.status(400);
            throw new Error('Please provide a name for the member');
        }

        const group = await Group.findById(groupId);

        if (!group) {
            res.status(404);
            throw new Error('Group not found');
        }

        // Only creator or existing members can add new members
        const isMember = group.members.some(m => m.user && m.user.toString() === req.user._id.toString());
        if (!isMember && group.createdBy.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to add members to this group');
        }

        // Check if user is already in group (basic check by name or email)
        const memberExists = group.members.some(m =>
            (email && m.email === email) || m.name.toLowerCase() === name.toLowerCase()
        );

        if (memberExists) {
            res.status(400);
            throw new Error('Member already exists in this group');
        }

        // Optional: find user by email to link real account
        let userToAdd = null;
        if (email) {
            const registeredUser = await User.findOne({ email });
            if (registeredUser) {
                userToAdd = registeredUser._id;
            }
        }

        const newMember = {
            user: userToAdd,
            name,
            email: email || '',
            joinedAt: Date.now()
        };

        group.members.push(newMember);
        await group.save();

        res.status(200).json(group);
    } catch (error) {
        next(error);
    }
};
