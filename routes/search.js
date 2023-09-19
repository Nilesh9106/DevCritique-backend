const express = require('express');
const router = express.Router();
const { Project } = require('../models/model');

router.get('/search/technology/:technology', async (req, res) => {
    try {
        const technology = req.params.technology;
        const projects = await Project.find({ technologies: { '$regex': '^' + technology + '$', $options: "i" } }).populate("author");
        res.status(200).send(projects);
    } catch (err) {
        res.status(400).send({ message: err });
    }
});

router.get('/search/description/:description', async (req, res) => {
    try {
        const description = req.params.description;
        if (description === undefined) {
            res.status(400).send({ message: "Please enter a description" });
        }
        else {
            // const projects = await Project.find({ $text: { $search: req.params.description } });
            const projects = await Project.aggregate([
                {
                    $search: {
                        index: "projectkey",
                        text: {
                            query: req.params.description,
                            path: {
                                wildcard: "*"
                            }
                        }
                    },
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "author",
                        foreignField: "_id",
                        as: "author"
                    },
                },
            ]);

            res.status(200).send(projects);
        }
    } catch (err) {
        res.status(400).send({ message: err });
    }
}
);

module.exports = router;

