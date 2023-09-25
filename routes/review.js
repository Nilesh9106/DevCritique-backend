const express = require('express');
const router = express.Router();
const { Review, User, Project } = require('../models/model');
const middle = require('../middleware/auth')

// Create a new review
router.post('/reviews', middle, async (req, res) => {
    try {
        let project = await Project.findById(req.body.project);
        if (project.author._id == req.body.author) {
            return res.status(500).json({ message: 'You cannot review your own project' });
        }
        var review = await Review.create(req.body);
        review = await review.populate('author project');
        res.status(201).json(review);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error creating review' });
    }
});

// Read all reviews
router.get('/reviews', async (req, res) => {
    try {
        const reviews = await Review.find().populate('author project').sort({ createdAt: 'desc' });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving reviews' });
    }
});

//read review by author
router.get('/reviews/author/:id', async (req, res) => {
    try {
        const reviews = await Review.find({ author: req.params.id }).populate('author project');
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving reviews' });
    }
});
router.post('/reviews/upvote/:id', middle, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review.upVote.includes(req.body.userId)) {
            review.upVote.push(req.body.userId);
            review.upVoteCount++;
            review.save();
        }
        res.json(review);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving reviews' });
    }
});
router.post('/reviews/downvote/:id', middle, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (review.upVote.includes(req.body.userId)) {
            var index = review.upVote.indexOf(req.body.userId);
            if (index !== -1) {
                review.upVote.splice(index, 1);
            }
            review.upVoteCount--;
            review.save();
        }
        res.json(review);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving reviews' });
    }
});

//add image to review
router.put('/reviews/image/:id', async (req, res) => {
    try {
        let review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        review.images.push(req.body.imageurl);
        review = await review.save();
        res.json(review);
    } catch (error) {
        res.status(500).json({ message: 'Error adding image to review' });
    }
});

//delete image from review
router.delete('/reviews/image/:id', async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        review.images = review.images.filter(image => image !== req.body.imageurl);
        review.save();
        res.json(review);
    } catch (error) {
        res.status(500).json({ message: 'Error deleting image from review' });
    }
});

// Read a specific review by ID
router.get('/reviews/:id', async (req, res) => {
    try {
        const review = await Review.findById(req.params.id).populate('author project');
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        res.json(review);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving review' });
    }
});

// Update a review by ID
router.put('/reviews/:id', middle, async (req, res) => {
    try {
        if (req.body.status != "solved") {
            req.body.rating = null;
        }
        const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        User.updatePoints(review.author._id);
        res.json(review);
    } catch (error) {
        res.status(500).json({ message: 'Error updating review' });
    }
});

// Delete a review by ID
router.delete('/reviews/:id', middle, async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting review' });
    }
});



module.exports = router;
