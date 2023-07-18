const mongoose = require('mongoose');

// Define the schema for the Projects
const projectSchema = new mongoose.Schema({
    link: { type: String, required: true },
    description: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    technologies: [{ type: String }],
}, { timestamps: true });

const commentSchema = new mongoose.Schema({
    comment: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Define the schema for the Reviews
const reviewSchema = new mongoose.Schema({
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, default: null },
    status: { type: String, enum: ['solved', 'pending', 'rejected'], default: 'pending' },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
}, { timestamps: true });


// Define the schema for the Users
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: { type: String },
    points: { type: Number, default: 0 },
    socialMediaLinks: { type: Object },
}, { timestamps: true });



// Create the models based on the schemas
const Project = mongoose.model('Project', projectSchema);
const Review = mongoose.model('Review', reviewSchema);
const User = mongoose.model('User', userSchema);
const Comment = mongoose.model('Comment', commentSchema);

// Export the models
module.exports = {
    Project,
    Review,
    User,
    Comment
};
