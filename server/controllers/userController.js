import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';
import crypto from 'crypto';

// Password validation regex: min 8 chars, 1 uppercase, 1 lowercase, 1 number
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
    const { name, email, password, role } = req.body;

    try {
        // Validate email format
        if (!emailRegex.test(email)) {
            res.status(400);
            throw new Error('Invalid email format');
        }

        // Validate password strength
        if (!passwordRegex.test(password)) {
            res.status(400);
            throw new Error('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number');
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'personal',
            status: 'active'
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                token: generateToken(user._id),
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res, next) => {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {

            if (user.status === 'blocked' || user.isBlocked) {
                res.status(403);
                throw new Error('Account has been blocked by an administrator.');
            }


            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {


            res.status(401);
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

const saveFCMToken = async (req, res, next) => {
    try {
        const { fcmToken } = req.body;
        if (!fcmToken) {
            res.status(400);
            throw new Error("FCM token is required");
        }

        await User.findByIdAndUpdate(req.user._id, {
            $addToSet: { fcmTokens: fcmToken },
        });

        res.json({ success: true, message: "FCM token saved" });
    } catch (error) {
        next(error);
    }
};

// @desc    Google OAuth — login or register
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res, next) => {
    const { name, email, photoURL } = req.body;

    try {
        if (!email || !name) {
            res.status(400);
            throw new Error('Name and email are required from Google account');
        }

        let user = await User.findOne({ email });

        if (user) {
            // Existing user — check if blocked
            if (user.status === 'blocked' || user.isBlocked) {
                res.status(403);
                throw new Error('Account has been blocked by an administrator.');
            }

            return res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        }

        // New Google user — create with a random password (schema unchanged)
        const randomPassword = crypto.randomBytes(32).toString('hex');

        user = await User.create({
            name,
            email,
            password: randomPassword,
            role: 'personal',
            status: 'active',
        });

        if (user) {
            return res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        }

        res.status(400);
        throw new Error('Failed to create user');
    } catch (error) {
        next(error);
    }
};

export { registerUser, authUser, getUserProfile, updateUserProfile, saveFCMToken, googleAuth };
