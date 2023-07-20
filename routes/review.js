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
        const reviews = await Review.find().populate('author');
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving reviews' });
    }
});

//read review by author
router.get('/reviews/author/:id', async (req, res) => {
    try {
        const reviews = await Review.find({ author: req.params.id }).populate('author');
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving reviews' });
    }
});


// Read a specific review by ID
router.get('/reviews/:id', async (req, res) => {
    try {
        const review = await Review.findById(req.params.id).populate('author');
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
