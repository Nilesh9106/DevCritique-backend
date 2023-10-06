const express = require('express');
const router = express.Router();
const { Review, User, Project } = require('../models/model');
const nodemailer = require("nodemailer");
const middle = require('../middleware/auth')
var dotenv = require("dotenv")
dotenv.config()

router.post('/reviews', middle, async (req, res) => {
    try {
        let project = await Project.findById(req.body.project).populate('author');
        if (project.author._id == req.body.author) {
            return res.status(500).json({ message: 'You cannot review your own project' });
        }
        var review = await Review.create(req.body);
        review = await review.populate('author project');
		await sendReviewMail(project.author.email, project.id, review);
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
        const reviews = await Review.find({ author: req.params.id }).populate('author project').sort({ createdAt: 'desc' });
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


router.put('/reviews/:id', middle, async (req, res) => {
    try {
        if (req.body.status != "solved") {
            req.body.rating = null;
        }
		const oldReview = await Review.findById(req.params.id);

        const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        User.updatePoints(review.author._id, review.rating*10 - oldReview.rating*10);
        res.json(review);
    } catch (error) {
        res.status(500).json({ message: 'Error updating review' });
    }
});

router.delete('/reviews/:id', middle, async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
		
        User.updatePoints(review.author._id, -review.rating*10);
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting review' });
    }
});

const sendReviewMail = async (email, projectId, review) => {
	const transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: process.env.EMAIL_ID,
			pass: process.env.EMAIL_PASSWORD,
		},
	});
	var mailOptions = {
		from: process.env.EMAIL_ID,
		to: email,
		subject: "You got new reviews",
		text: 'Hello, your project got new reviews.',
		html: `
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f0f0f0;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    padding: 20px;
                }
                .content {
                    font-size: 16px;
                    line-height: 1.5;
                    color: #333333;
                }
                .button {
                    display: inline-block;
                    background-color: violet;
                    color: white;
                    border-radius:10px;
                    padding: 10px 20px;
                    text-decoration: none;
                }
				.review-box {
					border: 1px solid #ddd;
					padding: 15px;
					margin: 15px 0;
					border-radius: 5px;
					background-color: #f9f9f9;
				}
		
				.reviewer-name {
					font-weight: bold;
					color: #333;
				}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="content">
				<h1>You got new review from ${review.author.username}</h1>
				<div class="review-box">
            	<p><span class="reviewer-name">${review.author.username}:</span> ${review.text}</p>
				</div>
				<p><a href="https://devcritique.vercel.app/post/${projectId}" class="button">View New Review</a></p>
				<p>If you have any questions or need further assistance, please do not hesitate to reach out to us at <a href="mailto:${process.env.EMAIL_ID}?subject=Project Review">${process.env.EMAIL_ID}</a>. We are here to support you in any way we can.</p>
			
				<p>Thank you for being a part of the Dev Critique community. Your active participation will help you enhance your project and make it even better.</p>
			
				<p>Best regards,</p>
				<p>Dev Critique Team</p>
                </div>
            </div>
        </body>
        </html>
        `,
	};
	await new Promise((resolve, reject) => {
		transporter.sendMail(mailOptions, function (error, responce) {
			if (error) {
				console.log(error);
				reject(error);
			} else {
				resolve("Email sent: " + responce.response);
			}
		});
	});
};

module.exports = router;
