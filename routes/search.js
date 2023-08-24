const express = require('express');
const router = express.Router();
const {Project} = require('../models/model');

router.get('/search/technology/:technology', async (req, res) => {
    try {
        const technology = req.params.technology;
        const projects = await Project.find({ technologies: technology });
        res.status(200).send(projects);
    } catch (err) {
        res.status(400).send(err);
    }
});

router.get('/search/description/:description', async (req, res) => {
    try {
        const description = req.params.description;
        if (description === undefined) {
            res.status(400).send("Please enter a description");
        }
        else {
            const projects = await Project.find({ $text: { $search: "website" } });
            res.status(200).send({ projects });
        }
    } catch (err) {
        res.status(400).send(err);
    }
}
);

module.exports = router;

