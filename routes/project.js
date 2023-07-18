const express = require('express');
const router = express.Router();
const { Project, Review } = require('../models/model');

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
        const projects = await Project.find().populate('author');
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving projects' });
    }
});

// Read a specific project by ID
router.get('/projects/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).populate('author');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        const reviews = await Review.find({ project: req.params.id });
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