const express = require('express');
const { scrapeWeather } = require('./scrape-weather');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic health check
app.get('/', (req, res) => {
  res.json({ ok: true, service: 'weather-scraper', version: '1.0.0' });
});

// GET /api/scrape?country=vietnam&city=ho-chi-minh-city
// Or /api/scrape?url=https://www.timeanddate.com/weather/vietnam/ho-chi-minh-city
app.get('/api/scrape', async (req, res) => {
  const { country, city, url } = req.query;
  const timeout = req.query.timeout ? parseInt(String(req.query.timeout), 10) : undefined;
  const headful = req.query.headful === 'true' || req.query.headful === true;

  try {
    const result = await scrapeWeather({ country, city, url, timeout, headful });
    res.json(result);
  } catch (err) {
    res.status(500).json({
      url: err?.url || url || null,
      error: String(err?.message || err),
      scrapedAt: new Date().toISOString()
    });
  }
});

app.listen(PORT, () => {
  console.log(`[server] Listening on http://localhost:${PORT}`);
});
