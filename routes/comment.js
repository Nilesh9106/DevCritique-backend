const express = require('express');
const router = express.Router();
const { Review, Comment } = require('../models/model');

// Create a new comment
router.post('/comments', async (req, res) => {
    try {
        const review = await Review.findById(req.body.review);
        const comment = new Comment(req.body.comment);
        await comment.save();
        console.log(comment);
        review.comments.push(comment._id);
        await review.save();
        res.json(review);
    }
    catch (error) {
        res.status(500).json({ error: 'Error creating comment' });
    }
});


module.exports = router;
