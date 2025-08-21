#!/usr/bin/env node

const { chromium } = require('playwright');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

function toSlug(input) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function scrapeWeather({ country = 'vietnam', city = 'ho-chi-minh-city', url, timeout = 20000, headful = false } = {}) {
  const countrySlug = toSlug(country);
  const citySlug = toSlug(city);
  const targetUrl = url || `https://www.timeanddate.com/weather/${countrySlug}/${citySlug}`;

  let browser;
  const startedAt = Date.now();
  try {
    browser = await chromium.launch({ headless: !headful });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout });

    // The timeanddate.com weather page shows quick look weather in the #qlook block
    await page.waitForSelector('#qlook .h2', { timeout });

    const temperature = (await page.locator('#qlook .h2').first().textContent().catch(() => null))?.trim() || null;
    const condition = (await page.locator('#qlook p').first().textContent().catch(() => null))?.trim() || null;

    const locationText = (await page.locator('h1').first().textContent().catch(() => null))?.trim() || null;

    return {
      url: targetUrl,
      location: locationText,
      temperature,
      condition,
      scrapedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt
    };
  } catch (err) {
    const error = new Error(typeof err?.message === 'string' ? err.message : String(err));
    error.url = targetUrl;
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function run() {
  const argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 [options]')
    .option('country, c', { type: 'string', describe: 'Country/region slug in URL (e.g., vietnam)', default: 'vietnam' })
    .option('city, t', { type: 'string', describe: 'City slug in URL (e.g., ho-chi-minh-city)', default: 'ho-chi-minh-city' })
    .option('url, u', { type: 'string', describe: 'Full URL to scrape (overrides country/city)' })
    .option('timeout', { type: 'number', describe: 'Navigation/selectors timeout (ms)', default: 20000 })
    .option('headful', { type: 'boolean', describe: 'Run browser in headed mode for debugging', default: false })
    .help()
    .alias('help', 'h')
    .parse();

  try {
    const result = await scrapeWeather({
      country: argv.country || argv.c,
      city: argv.city || argv.t,
      url: argv.url || argv.u,
      timeout: argv.timeout,
      headful: argv.headful
    });
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    const errorResult = {
      url: err?.url || (argv.url || argv.u) || null,
      error: String(err && err.message ? err.message : err),
      scrapedAt: new Date().toISOString()
    };
    console.error(JSON.stringify(errorResult, null, 2));
    process.exitCode = 1;
  }
}

module.exports = { scrapeWeather, toSlug };

if (require.main === module) {
  run();
}