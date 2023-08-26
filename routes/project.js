const express = require('express');
const router = express.Router();
const { Project, Review } = require('../models/model');
const middle = require('../middleware/auth')
const { og } = require('../middleware/utils')
const { deleteFile } = require('../routes/upload');




// Create a new project

router.post('/projects', middle, async (req, res) => {
    try {
        const project = await Project.create(req.body);
        const ogDetails = await og(project.link);
        project.ogDetails = ogDetails;
        project.save();
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ error: 'Error creating project ' + error });
    }
});

// Read all projects
router.get('/projects', async (req, res) => {
    try {
        let projects = await Project.find().populate('author').sort({ createdAt: 'desc' });

        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving projects' });
    }
});
// Read all projects by author
router.get('/projects/author/:id', async (req, res) => {
    try {
        const projects = await Project.find({ author: req.params.id }).populate('author');
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

        const reviews = await Review.find({ project: req.params.id }).populate('author project');
        res.json({ project, reviews });
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving project' });
    }
});

// Update a project by ID
router.put('/projects/:id', middle, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        if (req.user != project.author._id) {
            res.status(401).json({
                err: "You are not allowed to do that"
            })
        }

        project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });

        res.json(project);
    } catch (error) {
        res.status(500).json({ error: 'Error updating project' });
    }
});

// Delete a project by ID
router.delete('/projects/:id', middle, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        if (req.user != project.author._id) {
            res.status(401).json({
                err: "You are not allowed to do that"
            })
        }
        await Project.findByIdAndDelete(req.params.id);
        deleteReviews(req.params.id);
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting project' });
    }
});

//delete reviews of deleted project
async function deleteReviews(projectId) {
    try {
        await Review.deleteMany({ project: projectId });
    } catch (error) {
        console.log(error);
    }
}



module.exports = router;