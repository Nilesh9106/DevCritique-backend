const mongoose = require('mongoose');
const { isEmail } = require('validator');

// Define the schema for the Projects
const projectSchema = new mongoose.Schema({
    link: { type: String, required: true },
    description: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    technologies: [{ type: String, trim: true }],
    ogDetails: { type: Object },
    images: [{ type: String }],
    like: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likeCount: { type: Number, default: 0 },
}, { timestamps: true });

// Define the schema for the Reviews
const reviewSchema = new mongoose.Schema({
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, default: null },
    status: { type: String, enum: ['solved', 'pending', 'rejected'], default: 'pending' },
    comments: [Object],
    images: [{ type: String }],
    upVote: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    upVoteCount: { type: Number, default: 0 },
}, { timestamps: true });


// Define the schema for the Users
const userSchema = new mongoose.Schema({
    name: { type: String, default: null, trim: true },
    username: { type: String, unique: true, trim: true },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        validate: {
            validator: isEmail,
            message: props => `${props.value} is not a valid email`
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        trim: true,
        validate: {
            validator: function (value) {
                return value.length >= 6
            },
            message: () => 'Password must be at least six characters long'
        }
    },
    points: { type: Number, default: 0 },
    socialMediaLinks: { type: Object },
    profilePicture: { type: String, default: "/user.png" },
    uniqueString: { type: String },
    validated: { type: Boolean, default: false },
}, { timestamps: true });

userSchema.static('updatePoints', async function (id, change) {
	let user = await User.findById(id);
	user.points = user.points + change;
	await user.save();
})
// Create the models based on the schemas
const Project = mongoose.model('Project', projectSchema);
const Review = mongoose.model('Review', reviewSchema);
const User = mongoose.model('User', userSchema);

module.exports = {
    Project,
    Review,
    User,
};
