const express = require('express');
const router = express.Router();
const { Project, Review } = require('../models/model');
const cheerio = require('cheerio');

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

// Create a new project

router.post('/projects', async (req, res) => {
    try {
        const project = await Project.create(req.body);
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ error: 'Error creating project' });
    }
});

// Read all projects
router.get('/projects', async (req, res) => {
    try {
        let projects = await Project.find().populate('author').sort({ createdAt: 'desc' });

        for (let i = 0; i < projects.length; i++) {
            const ogDetails = await og(projects[i].link);
            projects[i].ogDetails = ogDetails;
        }

        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving projects' });
    }
});
// Read all projects by author
router.get('/projects/author/:id', async (req, res) => {
    try {
        const projects = await Project.find({ author: req.params.id }).populate('author');
        for (let i = 0; i < projects.length; i++) {
            const ogDetails = await og(projects[i].link);
            projects[i].ogDetails = ogDetails;
        }
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving projects' });
    }
});

//add image to project
router.put('/projects/image/:id', async (req, res) => {
    try {
        let project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        project.images.push(req.body.imageurl);
        project = await project.save();
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: 'Error updating project' });
    }
});

//delete image from project
router.delete('/projects/image/:id', async (req, res) => {
    try {
        let project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        project.images = project.images.filter(image => image !== req.body.imageurl);
        project = await project.save();
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: 'Error updating project' });
    }
});

// Read a specific project by ID
router.get('/projects/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).populate('author');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        const ogDetails = await og(project.link);
        project.ogDetails = ogDetails;

        const reviews = await Review.find({ project: req.params.id }).populate('author project');
        res.json({ project, reviews });
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving project' });
    }
});

// Update a project by ID
router.put('/projects/:id', async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        const ogDetails = await og(project.link);
        project.ogDetails = ogDetails;
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: 'Error updating project' });
    }
});

// Delete a project by ID
router.delete('/projects/:id', async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting project' });
    }
});



module.exports = router;