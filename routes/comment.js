const express = require('express');
const router = express.Router();
const { Review } = require('../models/model');

// Create a new comment
router.post('/comments', async (req, res) => {
    try {
        const review = await Review.findById(req.body.review);

        review.comments.push(req.body.comment);
        await review.save();
        res.json(review);
    }
    catch (error) {
        res.status(500).json({ error: 'Error creating comment' });
    }
});


module.exports = router;
