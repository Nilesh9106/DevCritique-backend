const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const project = require('./routes/project');
const comment = require('./routes/comment');
const user = require('./routes/user');
const review = require('./routes/review');
const cheerio = require('cheerio');


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', project);
app.use('/api', comment);
app.use('/api', user);
app.use('/api', review);


app.get('/fetch-opengraph', async (req, res) => {
    const { link } = req.query;

    try {
        const response = await fetch(link);
        const html = await response.text();
        const $ = cheerio.load(html);

        const ogDetails = {
            title: $('meta[property="og:title"]').attr('content') || '',
            image: $('meta[property="og:image"]').attr('content') || '',
            description: $('meta[property="og:description"]').attr('content') || '',
            url: $('meta[property="og:url"]').attr('content') || '',
        };

        res.json(ogDetails);
    } catch (error) {
        console.log('Error fetching Open Graph details:', error);
        res.status(500).json({ error: 'Failed to fetch Open Graph details' });
    }
});


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