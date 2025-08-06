
// Overhauled scraper: dynamically fetch camera list and regions, then scrape image URLs
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://trafficwatchni.com';
const CAMERAS_URL = `${BASE_URL}/twni/cameras?viewby=region`;
const OUTPUT_PATH = path.join(__dirname, 'public', 'twni-cameras.json');

// Extract camera name from viewer page (for validation)
async function extractCameraName(viewerUrl) {
  try {
    const res = await axios.get(viewerUrl);
    const $ = cheerio.load(res.data);
    // Try to get camera name from header tag with specific class
    let name = $('.container-fluid #cctvSelection header.h4.pb-1.text-nowrap.text-truncate').first().text().trim();
    if (!name) {
      // fallback: header inside #cctvSelection
      name = $('#cctvSelection header.h4.pb-1.text-nowrap.text-truncate').first().text().trim();
    }
    if (!name) {
      // fallback: header.h4
      name = $('header.h4').first().text().trim();
    }
    if (!name) {
      // fallback: header
      name = $('header').first().text().trim();
    }
    if (!name) {
      // fallback: alt text of main image
      name = $('img[alt]').first().attr('alt') || '';
    }
    if (!name) {
      // fallback: first non-empty text node from the top of the page
      let found = false;
      $('body').contents().each((_, el) => {
        if (el.type === 'text') {
          const txt = $(el).text().trim();
          if (txt && !found) {
            name = txt;
            found = true;
          }
        }
      });
    }
    if (!name) {
      // fallback: meta title
      name = $('title').text().replace(/\s*-\s*TrafficWatchNI.*/, '').trim();
    }
    return name;
  } catch (e) {
    return null;
  }
}

// Extract image URL from viewer page
async function extractImageUrl(viewerUrl) {
  try {
    const res = await axios.get(viewerUrl);
    const $ = cheerio.load(res.data);
    let img = $('img.cctvImage, img#camera-image, img.camera-image, .camera-image img').attr('src');
    if (!img) img = $('img').first().attr('src');
    if (img && !img.startsWith('http')) img = BASE_URL + img;
    return img || null;
  } catch (e) {
    return null;
  }
}

// Scrape camera list from main page
async function scrapeCameraList() {
  const res = await axios.get(CAMERAS_URL);
  const $ = cheerio.load(res.data);
  const cameras = [];
  let currentRegion = '';
  const regionLabels = [
    'Greater Belfast', 'North East', 'South East', 'South West', 'North West'
  ];
  // Traverse body children, track region text nodes and assign region to camera links
  let siblings = $('body').contents().toArray();
  for (let i = 0; i < siblings.length; i++) {
    const el = siblings[i];
    let txt = '';
    if (el.type === 'text') {
      txt = cheerio.load('<div>' + el.data + '</div>')('div').text().trim();
    } else if (el.type === 'tag') {
      txt = cheerio.load('<div></div>').root().append(el).text().trim();
    }
    if (regionLabels.includes(txt)) {
      currentRegion = txt;
    }
    // Find camera links in this element
    const $el = cheerio.load('<div></div>');
    if (el.type === 'tag') {
      $el.root().append(el);
      $el('a[href*="/twni/cameras/static?id="]').each((__, link) => {
        let name = $el(link).text().replace(/View camera :\s*/, '').trim();
        name = name.replace(/(.+?)\s+\1$/, '$1');
        name = name.replace(/\s+/g, ' ');
        const viewerUrl = BASE_URL + $el(link).attr('href');
        cameras.push({ name, viewerUrl, region: currentRegion });
      });
    }
  }
  return cameras;
}

async function main() {
  console.log('Scraping camera list...');
  const cameras = await scrapeCameraList();
  console.log(`Found ${cameras.length} cameras. Scraping image URLs...`);
  // Deduplicate by viewerUrl, keep first region assignment
  const seen = new Map();
  for (let cam of cameras) {
    if (!seen.has(cam.viewerUrl)) {
      seen.set(cam.viewerUrl, cam);
    }
  }
  const deduped = Array.from(seen.values());
  for (let cam of deduped) {
    cam.imageUrl = await extractImageUrl(cam.viewerUrl);
    // Validate name from viewer page
    const validated = await extractCameraName(cam.viewerUrl);
    cam.validatedName = validated || cam.name;
    console.log(`Scraped: ${cam.name} [${cam.region}]`);
  }
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(deduped, null, 2));
  console.log('Done. Output written to', OUTPUT_PATH);
}

main();