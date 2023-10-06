const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const project = require('../routes/project');
const comment = require('../routes/comment');
const user = require('../routes/user');
const review = require('../routes/review');
const bodyParser = require("body-parser");
const auth = require('../routes/auth');
const { upload } = require('../routes/upload');
const search = require('../routes/search');

dotenv.config();
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());
app.use('/api', auth);
app.use('/api', project);
app.use('/api', comment);
app.use('/api', user);
app.use('/api', review);
app.use('/api', upload);
app.use('/api', search);

const dbURL = process.env.TEST_MONGODB_URI;
mongoose.connect(dbURL).then(() => {
	const port = process.env.PORT || 3000;
	app.listen(port);
}).catch((err) => {
	console.log(err);
})

module.exports = app;