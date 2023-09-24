const express = require('express');
const router = express.Router();
const { User, Project, Review } = require('../models/model');
const middle = require('../middleware/auth')
const { deleteFile } = require('../routes/upload');


// Create a new user
router.post('/users', async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error creating user' });
    }
});

router.get('/topUsers', async (req, res) => {
    try {
        const users = await User.find().gt("points", 0).sort({ points: -1 }).limit(5).select('-password -uniqueString -validated');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Can't fetch top Users" });
    }
});

// Read a specific user by username
router.get('/users/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username }).select('-password -uniqueString -validated');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const projects = await Project.find({ author: user._id }).populate('author');
        const reviews = await Review.find({ author: user._id }).populate('author project');

        res.json({ user, projects, reviews });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user' });
    }
});

// Update a user by ID
router.put('/users/:username', middle, async (req, res) => {
    try {
        const user = await User.findOneAndUpdate({ username: req.params.username }, req.body, { new: true }).select('-password -uniqueString -validated');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const projects = await Project.find({ author: user._id }).populate('author');
        const reviews = await Review.find({ author: user._id }).populate('author project');

        res.json({ user, projects, reviews });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user' });
    }
});

// Delete a user by ID
router.delete('/users/:username', middle, async (req, res) => {
    try {
        deleteProjectsAndReviews(req.params.username);
        const user = await User.findOneAndDelete({ username: req.params.username });
        deleteFile(user.profilePicture);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ status: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user' });
    }
});

//delete projects and reviews of user
async function deleteProjectsAndReviews(userId) {
    try {
        await Project.deleteMany({ author: userId });
        await Review.deleteMany({ author: userId });
    }
    catch (error) {
        console.log({ message: error });
    }
}

module.exports = router;
