const express = require('express');
const router = express.Router();
const { Review } = require('../models/model');

router.post('/comments', async (req, res) => {
    try {
        const review = await Review.findById(req.body.review);
        review.comments.push(req.body.comment);
        await review.save();
        res.json(review);
    }
    catch (error) {
        res.status(500).json({ message: 'Error posting comment' });
    }
});

module.exports = router;
