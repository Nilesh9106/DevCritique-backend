
const cheerio = require('cheerio');
module.exports.og = async (link) => {
    const response = await fetch(link, { redirect: "follow" });
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

