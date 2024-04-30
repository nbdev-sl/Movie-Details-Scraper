const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// hours to minutes
function formatRuntime(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}min`;
}

// Route
app.get('/', async (req, res) => {
  try {
    const { url } = req.query; // Get the 'url' query parameter
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    const response = await axios.get(url);
    if (response.status === 200) {
      const $ = cheerio.load(response.data);
      let name = $('#single > div.content.right > div.sheader > div.data > h1').text().trim();
      const description = $('.wp-content').text().trim();
      const rating = $('#repimdb > strong').text().trim();
      const runtimeText = $('#single > div.content.right > div.sheader > div.data > div.extra > span.runtime').text().trim();
      const runtimeInMinutes = parseInt(runtimeText.match(/\d+/)[0]);
      const runtime = formatRuntime(runtimeInMinutes);
      const date = $('#single > div.content.right > div.sheader > div.data > div.extra > span.date').text().trim();

      // Remove the "Sinhala Subtitles | සිංහල උපසිරැසි සමඟ" part from the name
      name = name.replace(/Sinhala Subtitles \| සිංහල උපසිරැසි සමඟ/g, '').trim();

      res.json({ name, description, rating, runtime, date });
    } else {
      throw new Error('Failed to fetch data from the website');
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

server.timeout = 0;

module.exports = app;
