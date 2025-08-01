// twni-scrape-cameras.js
// Node.js script to scrape camera image URLs from TrafficWatchNI camera viewer pages

const fetch = require('node-fetch');
const cheerio = require('cheerio');

// List of camera viewer URLs (add more as needed)
const cameraPages = [
  { name: "Westlink - Shankill", url: "https://trafficwatchni.com/twni/cameras/static?id=218" },
  { name: "A2 - Tillysburn", url: "https://trafficwatchni.com/twni/cameras/static?id=44" },
  { name: "A2 - Holywood Esplanade", url: "https://trafficwatchni.com/twni/cameras/static?id=45" },
  { name: "A12 Clifton Street", url: "https://trafficwatchni.com/twni/cameras/static?id=9" },
  { name: "A12 Roden Street", url: "https://trafficwatchni.com/twni/cameras/static?id=10" },
  { name: "M1 - Stockmans Lane", url: "https://trafficwatchni.com/twni/cameras/static?id=171" },
  { name: "Saintfield Road - Primrose Hill", url: "https://trafficwatchni.com/twni/cameras/static?id=43" },
  { name: "Upper Knockbreda Rd - Cregagh Rd", url: "https://trafficwatchni.com/twni/cameras/static?id=191" },
  { name: "East Bridge Street - Central Station", url: "https://trafficwatchni.com/twni/cameras/static?id=156" },
  { name: "M1 Broadway", url: "https://trafficwatchni.com/twni/cameras/static?id=11" },
  { name: "Ballygowan Road - Knock Road", url: "https://trafficwatchni.com/twni/cameras/static?id=190" },
  { name: "M3 - Sydenham Bypass", url: "https://trafficwatchni.com/twni/cameras/static?id=217" },
  { name: "Boucher Road - Tates Avenue", url: "https://trafficwatchni.com/twni/cameras/static?id=54" },
  { name: "Shaftesbury Square", url: "https://trafficwatchni.com/twni/cameras/static?id=3" },
  { name: "Durham St - College Sq Nth", url: "https://trafficwatchni.com/twni/cameras/static?id=201" },
  { name: "M2 - Fortwilliam North (1B16)", url: "https://trafficwatchni.com/twni/cameras/static?id=208" },
  { name: "Upp K'Breda - Milltown Rd", url: "https://trafficwatchni.com/twni/cameras/static?id=211" },
  { name: "Knock Road - Upper Newtownards Road", url: "https://trafficwatchni.com/twni/cameras/static?id=48" },
  { name: "Falls Road - Donegall Road", url: "https://trafficwatchni.com/twni/cameras/static?id=28" },
  { name: "M2 - Greencastle - Jct 2", url: "https://trafficwatchni.com/twni/cameras/static?id=36" },
  { name: "Ormeau AV - Linehall ST", url: "https://trafficwatchni.com/twni/cameras/static?id=204" },
  { name: "Oxford Street - Ann Street", url: "https://trafficwatchni.com/twni/cameras/static?id=151" },
  { name: "Falls Road - Grosvenor Road", url: "https://trafficwatchni.com/twni/cameras/static?id=162" },
  { name: "M1 Sprucefield", url: "https://trafficwatchni.com/twni/cameras/static?id=4" },
  { name: "University Road - Stranmillis Road", url: "https://trafficwatchni.com/twni/cameras/static?id=160" },
  { name: "Victoria Street - High Street", url: "https://trafficwatchni.com/twni/cameras/static?id=153" },
  { name: "Belvoir C'way - Newtownbreda Rd - Tesco's", url: "https://trafficwatchni.com/twni/cameras/static?id=50" },
  { name: "M1 - Blacks Rd - Jct 3", url: "https://trafficwatchni.com/twni/cameras/static?id=33" },
  { name: "Finaghy Crossroads", url: "https://trafficwatchni.com/twni/cameras/static?id=53" },
  { name: "Lisburn Road - Eglantine Avenue", url: "https://trafficwatchni.com/twni/cameras/static?id=161" },
  { name: "Beersbridge Road - Castlereagh Street", url: "https://trafficwatchni.com/twni/cameras/static?id=157" },
  { name: "Dock Street - Garmoyle Street", url: "https://trafficwatchni.com/twni/cameras/static?id=154" },
  { name: "Westlink - Hospital", url: "https://trafficwatchni.com/twni/cameras/static?id=214" },
  { name: "Malone Road - Old Stranmillis Road", url: "https://trafficwatchni.com/twni/cameras/static?id=51" },
  { name: "Malone Road - Balmoral Avenue", url: "https://trafficwatchni.com/twni/cameras/static?id=52" },
  { name: "N'ards RD - Albertbridge RD", url: "https://trafficwatchni.com/twni/cameras/static?id=203" },
  { name: "Upper Newtownards Rd - Eastlink", url: "https://trafficwatchni.com/twni/cameras/static?id=25" },
  { name: "M1 Stockmans Lane", url: "https://trafficwatchni.com/twni/cameras/static?id=12" },
  { name: "M3 - Dee Street", url: "https://trafficwatchni.com/twni/cameras/static?id=188" },
  { name: "Chichester Street", url: "https://trafficwatchni.com/twni/cameras/static?id=1" },
  { name: "Stewartstown Road / Michael Ferguson Roundabout", url: "https://trafficwatchni.com/twni/cameras/static?id=164" },
  { name: "Upper Newtownards Rd - Dunlady Rd", url: "https://trafficwatchni.com/twni/cameras/static?id=26" },
  { name: "Westlink - Divis", url: "https://trafficwatchni.com/twni/cameras/static?id=213" },
  { name: "Ormeau Road - Annadale Embankment", url: "https://trafficwatchni.com/twni/cameras/static?id=42" },
  { name: "Saintfield Road - School Rd", url: "https://trafficwatchni.com/twni/cameras/static?id=185" },
  { name: "Upper Newtownards Rd - Stoney Rd", url: "https://trafficwatchni.com/twni/cameras/static?id=158" },
  { name: "Upper Knockbreda Rd - Upper Galwally", url: "https://trafficwatchni.com/twni/cameras/static?id=49" },
  { name: "Ormeau Road - Ravenhill Road", url: "https://trafficwatchni.com/twni/cameras/static?id=183" },
  { name: "Saintfield Road - Upper Galwally", url: "https://trafficwatchni.com/twni/cameras/static?id=184" },
  { name: "M1 - Kennedy Way - Jct 2", url: "https://trafficwatchni.com/twni/cameras/static?id=170" },
  { name: "Castlereagh Rd - Grand Parade/ Ladas Dr", url: "https://trafficwatchni.com/twni/cameras/static?id=27" },
  { name: "Westlink - York Street", url: "https://trafficwatchni.com/twni/cameras/static?id=55" },
  { name: "M2 - Duncrue St North (0B14)", url: "https://trafficwatchni.com/twni/cameras/static?id=207" },
  { name: "Peters Hill - Millfield", url: "https://trafficwatchni.com/twni/cameras/static?id=155" },
  { name: "Andersonstown Rd - Finaghy Rd Nth", url: "https://trafficwatchni.com/twni/cameras/static?id=163" },
  { name: "M2 Sandyknowes", url: "https://trafficwatchni.com/twni/cameras/static?id=6" },
  { name: "Milltown - Hospital Rd", url: "https://trafficwatchni.com/twni/cameras/static?id=212" },
  { name: "Howard Street", url: "https://trafficwatchni.com/twni/cameras/static?id=2" },
  { name: "Dublin Rd - Bruce Street", url: "https://trafficwatchni.com/twni/cameras/static?id=159" },
  { name: "Ballynahinch Road - Carryduff", url: "https://trafficwatchni.com/twni/cameras/static?id=186" },
  { name: "Sandy Row - Hope Street", url: "https://trafficwatchni.com/twni/cameras/static?id=202" },
  { name: "M2 Duncrue Street", url: "https://trafficwatchni.com/twni/cameras/static?id=5" },
  { name: "M3 - Lagan Bridge East", url: "https://trafficwatchni.com/twni/cameras/static?id=187" },
  { name: "M3 Lagan Bridge", url: "https://trafficwatchni.com/twni/cameras/static?id=7" },
  { name: "Albertbridge Road - Woodstock Link", url: "https://trafficwatchni.com/twni/cameras/static?id=24" },
  { name: "Oxford Street - Lanyon Place", url: "https://trafficwatchni.com/twni/cameras/static?id=152" },
  { name: "Donegall Square South-Adelaide Street", url: "https://trafficwatchni.com/twni/cameras/static?id=41" },
  { name: "A2 Shore Rd - Trooperslane, Carrick", url: "https://trafficwatchni.com/twni/cameras/static?id=165" },
  { name: "M22 - Dunsilly Roundabout", url: "https://trafficwatchni.com/twni/cameras/static?id=210" },
  { name: "Strand Rd Coleraine", url: "https://trafficwatchni.com/twni/cameras/static?id=64" },
  { name: "A6 Toome", url: "https://trafficwatchni.com/twni/cameras/static?id=40" },
  { name: "Dublin Road, Antrim", url: "https://trafficwatchni.com/twni/cameras/static?id=193" },
  { name: "Lodge Rd R'bout/Asda Coleraine", url: "https://trafficwatchni.com/twni/cameras/static?id=216" },
  { name: "Lodge Rd R'bout/Sandleford Coleraine", url: "https://trafficwatchni.com/twni/cameras/static?id=215" },
  { name: "Lodge Rd R'bout Lodge Coleraine", url: "https://trafficwatchni.com/twni/cameras/static?id=62" },
  { name: "M2 Templepatrick", url: "https://trafficwatchni.com/twni/cameras/static?id=17" },
  { name: "M2 - Antrim Hospital", url: "https://trafficwatchni.com/twni/cameras/static?id=209" },
  { name: "Old Bridge Coleraine", url: "https://trafficwatchni.com/twni/cameras/static?id=66" },
  { name: "M2 - Browns Rd", url: "https://trafficwatchni.com/twni/cameras/static?id=38" },
  { name: "Greenmount Coleraine", url: "https://trafficwatchni.com/twni/cameras/static?id=65" },
  { name: "Lodge Rd R'bout Newbridge Coleraine", url: "https://trafficwatchni.com/twni/cameras/static?id=60" },
  { name: "Kilowen St Coleraine", url: "https://trafficwatchni.com/twni/cameras/static?id=67" },
  { name: "Scullions Rd", url: "https://trafficwatchni.com/twni/cameras/static?id=37" },
  { name: "A6 Randalstown", url: "https://trafficwatchni.com/twni/cameras/static?id=39" },
  { name: "A2 Beeches Road", url: "https://trafficwatchni.com/twni/cameras/static?id=30" },
  { name: "A2 Station Road", url: "https://trafficwatchni.com/twni/cameras/static?id=31" },
  { name: "Buncrana Road", url: "https://trafficwatchni.com/twni/cameras/static?id=70" },
  { name: "Caw Roundabout", url: "https://trafficwatchni.com/twni/cameras/static?id=71" },
  { name: "Ballykelly", url: "https://trafficwatchni.com/twni/cameras/static?id=68" },
  { name: "Strand Road", url: "https://trafficwatchni.com/twni/cameras/static?id=79" },
  { name: "Craigavon Bridge", url: "https://trafficwatchni.com/twni/cameras/static?id=72" },
  { name: "A37 Coleraine Mountain", url: "https://trafficwatchni.com/twni/cameras/static?id=23" },
  { name: "Greenhaw", url: "https://trafficwatchni.com/twni/cameras/static?id=77" },
  { name: "Great James Street", url: "https://trafficwatchni.com/twni/cameras/static?id=76" },
  { name: "Foyle Bridge", url: "https://trafficwatchni.com/twni/cameras/static?id=20" },
  { name: "Belt Road", url: "https://trafficwatchni.com/twni/cameras/static?id=69" },
  { name: "A6 Glenshane Pass", url: "https://trafficwatchni.com/twni/cameras/static?id=22" },
  { name: "Rossdowney Road", url: "https://trafficwatchni.com/twni/cameras/static?id=78" },
  { name: "Dales Corner/A6 Glendermott Rd - A2 ColumbraTerrace", url: "https://trafficwatchni.com/twni/cameras/static?id=74" },
  { name: "Culmore Roundabout", url: "https://trafficwatchni.com/twni/cameras/static?id=73" },
  { name: "Saintfield Road - Primrose Hill", url: "https://trafficwatchni.com/twni/cameras/static?id=43" },
  { name: "A2 Rathgael, Bangor", url: "https://trafficwatchni.com/twni/cameras/static?id=14" },
  { name: "Saintfield Rd Roundabout Lisburn", url: "https://trafficwatchni.com/twni/cameras/static?id=34" },
  { name: "A2 - Bangor Rd - Old Station Rd", url: "https://trafficwatchni.com/twni/cameras/static?id=46" },
  { name: "Prince William Rd - Lisburn North Feeder Rd", url: "https://trafficwatchni.com/twni/cameras/static?id=32" },
  { name: "A1 - B10 Overbridge Junction", url: "https://trafficwatchni.com/twni/cameras/static?id=58" },
  { name: "A3 Moira Road - Halftown Road", url: "https://trafficwatchni.com/twni/cameras/static?id=168" },
  { name: "A1 Banbridge", url: "https://trafficwatchni.com/twni/cameras/static?id=15" },
  { name: "A1 - Hillsborough Road Roundabout", url: "https://trafficwatchni.com/twni/cameras/static?id=57" },
  { name: "A28 Markethill", url: "https://trafficwatchni.com/twni/cameras/static?id=21" },
  { name: "A2 - Ballyrobert", url: "https://trafficwatchni.com/twni/cameras/static?id=47" },
  { name: "M1 - Blaris - Jct 8", url: "https://trafficwatchni.com/twni/cameras/static?id=35" },
  { name: "Belsize Rd - North Feeder Rd", url: "https://trafficwatchni.com/twni/cameras/static?id=166" },
  { name: "A1 Newry", url: "https://trafficwatchni.com/twni/cameras/static?id=18" },
  { name: "A1 - Cloghoge - Newry", url: "https://trafficwatchni.com/twni/cameras/static?id=59" },
  { name: "A1 - Blaris", url: "https://trafficwatchni.com/twni/cameras/static?id=56" },
  { name: "A24 Carryduff", url: "https://trafficwatchni.com/twni/cameras/static?id=19" },
  { name: "M1 Tamnamore", url: "https://trafficwatchni.com/twni/cameras/static?id=13" },
  { name: "Dromore Road at Asda, Omagh", url: "https://trafficwatchni.com/twni/cameras/static?id=195" },
  { name: "Orritor Street/William Street, Cookstown", url: "https://trafficwatchni.com/twni/cameras/static?id=199" },
  { name: "Great Northern Road, Tamlaght Road (Homebase), Omagh", url: "https://trafficwatchni.com/twni/cameras/static?id=196" },
  { name: "Dublin Road at Great Northern Road, Omagh", url: "https://trafficwatchni.com/twni/cameras/static?id=194" },
  { name: "Gortmerron Link Road, Dungannon", url: "https://trafficwatchni.com/twni/cameras/static?id=197" },
  { name: "Market Square, Dungannon", url: "https://trafficwatchni.com/twni/cameras/static?id=198" },
  { name: "Gaol Square, Enniskillen", url: "https://trafficwatchni.com/twni/cameras/static?id=200" }
];

// Helper to extract image URL from a camera page
async function extractImageUrl(pageUrl) {
  try {
    const res = await fetch(pageUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
    const html = await res.text();
    const $ = cheerio.load(html);

    // Prefer the camera image with class 'cctvImage'
    let img = $('img.cctvImage');
    if (!img.length) {
      // fallback: first <img> not containing 'logo' in src
      img = $('img').filter((i, el) => !($(el).attr('src') || '').includes('logo')).first();
    }
    const imgUrl = img.attr('src') || null;
    return imgUrl;
  } catch (err) {
    return null;
  }
}

async function main() {
  const results = [];

  for (const cam of cameraPages) {
    console.log(`Scraping: ${cam.name} (${cam.url})`);
    const firstImg = await extractImageUrl(cam.url);
    await new Promise(r => setTimeout(r, 79)); // Wait 0.79s to avoid hammering server
    const secondImg = await extractImageUrl(cam.url);

    results.push({
      name: cam.name,
      page: cam.url,
      firstImageUrl: firstImg,
      secondImageUrl: secondImg,
      changed: firstImg !== secondImg
    });
  }

  // Output results
  console.log('\nCamera Image URL Results:');
  for (const r of results) {
    console.log(`- ${r.name}`);
    console.log(`  Page: ${r.page}`);
    console.log(`  First Image: ${r.firstImageUrl}`);
    console.log(`  Second Image: ${r.secondImageUrl}`);
    if (r.changed) {
      console.log('  ⚠️ Image URL changed between requests!');
    }
    console.log('');
  }

  // Write to JSON: name, viewer url, image url (no cache param)
  const fs = require('fs');
  // Ensure 'public' directory exists
  fs.mkdirSync('public', { recursive: true });
  const exportData = results.map(r => {
    // Remove ?cache=... or any query from image url(hopefully we can ignore this)
    const cleanUrl = r.firstImageUrl ? r.firstImageUrl.split('?')[0] : null;
    return {
      name: r.name,
      viewerUrl: r.page,
      imageUrl: cleanUrl
    };
  });
  fs.writeFileSync('public/twni-cameras.json', JSON.stringify(exportData, null, 2));
}

main();