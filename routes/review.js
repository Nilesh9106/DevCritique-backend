const express = require('express');
const router = express.Router();
const { Review } = require('../models/model');

// Create a new review
router.post('/reviews', async (req, res) => {
    try {
        const review = await Review.create(req.body);
        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ error: 'Error creating review' });
    }
});

// Read all reviews
router.get('/reviews', async (req, res) => {
    try {
        const reviews = await Review.find().populate('author project').sort({ createdAt: 'desc' });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving reviews' });
    }
});

//read review by author
router.get('/reviews/author/:id', async (req, res) => {
    try {
        const reviews = await Review.find({ author: req.params.id }).populate('author project');
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving reviews' });
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
        res.status(500).json({ error: 'Error adding image to review' });
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
        res.status(500).json({ error: 'Error deleting image from review' });
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
        res.status(500).json({ error: 'Error retrieving review' });
    }
});

// Update a review by ID
router.put('/reviews/:id', async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        res.json(review);
    } catch (error) {
        res.status(500).json({ error: 'Error updating review' });
    }
});

// Delete a review by ID
router.delete('/reviews/:id', async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting review' });
    }
});



module.exports = router;
