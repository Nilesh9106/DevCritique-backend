const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const project = require('./routes/project');
const comment = require('./routes/comment');
const user = require('./routes/user');
const review = require('./routes/review');


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', project);
app.use('/api', comment);
app.use('/api', user);
app.use('/api', review);



const dbURL = process.env.MONGODB_URI || 'mongodb://localhost:27017/devCritique';
mongoose.connect(dbURL).then(() => {
    console.log("DB Connected");
}).catch((err) => {
    console.log(err);
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}/`);
}
);