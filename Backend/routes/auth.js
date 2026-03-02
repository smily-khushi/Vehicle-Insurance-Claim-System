import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const router = express.Router();

// Register Route
router.post('/register', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Password will be automatically hashed by the pre-save hook in User model
        const newUser = new User({
            fullName,
            email,
            password,
            role: 'user'
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', user: { fullName, email, role: 'user' } });
    } catch (error) {
        res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found. Please create an account first.' });
        }

        // Securely compare entered password against the hashed password stored in MongoDB
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.status(200).json({
            message: 'Login successful',
            user: {
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
});

// Update User Profile
router.put('/profile', async (req, res) => {
    try {
        const { email, fullName, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (fullName) user.fullName = fullName;
        
        if (password) {
            // Salt and hash the new password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();

        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
});

// Get all users route (Admin use)
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 }); // exclude password from response
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});

// Update user role and status (Admin use)
router.put('/users/:id/role', async (req, res) => {
    try {
        const { role, fullName, email } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (role) user.role = role;
        if (fullName) user.fullName = fullName;
        if (email) user.email = email;

        await user.save();
        res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user role', error: error.message });
    }
});

// Delete user (Admin use)
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
});

export default router;

