const express = require('express');
const router = express.Router();
const { User, Project, Review } = require('../models/model');
const cheerio = require('cheerio')
const middle = require('../middleware/auth')
const {deleteFile} = require('../routes/upload');
const og = async (link) => {
    const response = await fetch(link);
    const html = await response.text();
    const $ = cheerio.load(html);

    const ogDetails = {
        title: $('meta[property="og:title"]').attr('content') || '',
        image: $('meta[property="og:image"]').attr('content') || '',
        description: $('meta[property="og:description"]').attr('content') || '',
        url: $('meta[property="og:url"]').attr('content') || '',
    };
    return ogDetails;
}


// Create a new user
router.post('/users', async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error creating user' });
    }
});

// Read all users
router.get('/users',middle, async (req, res) => {

    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving users' });
    }
});


//add profile picture
router.put('/user/profile/:username', async (req, res) => {
    try {
        let user = await User.findOne({ username: req.params.username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if(user.profilePicture){
            deleteFile(user.profilePicture);
        }
        user.profilePicture = req.body.imageurl;
        user = await user.save();
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error updating user' });
    }
});

// Read a specific user by username
router.get('/users/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const projects = await Project.find({ author: user._id }).populate('author');
        const reviews = await Review.find({ author: user._id }).populate('author project');
        for (let i = 0; i < projects.length; i++) {
            const ogDetails = await og(projects[i].link);
            projects[i].ogDetails = ogDetails;
        }

        res.json({ user, projects, reviews });
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving user' });
    }
});

// Update a user by ID
router.put('/users/:username', async (req, res) => {
    try {
        const user = await User.findOneAndUpdate({ username: req.params.username }, req.body, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const projects = await Project.find({ author: user._id }).populate('author');
        const reviews = await Review.find({ author: user._id }).populate('author project');
        for (let i = 0; i < projects.length; i++) {
            const ogDetails = await og(projects[i].link);
            projects[i].ogDetails = ogDetails;
        }
        res.json({ user, projects, reviews });
    } catch (error) {
        res.status(500).json({ error: 'Error updating user' });
    }
});

// Delete a user by ID
router.delete('/users/:username', async (req, res) => {
    try {
        deleteProjectsAndReviews(req.params.username);
        const user = await User.findOneAndDelete({ username: req.params.username });
        deleteFile(user.profilePicture);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ status: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting user' });
    }
});

//delete projects and reviews of user
async function deleteProjectsAndReviews(userId){
    try{
        await Project.deleteMany({author:userId});
        await Review.deleteMany({author:userId});
    }
    catch(error){
        console.log(error);
    }
}

module.exports = router;
