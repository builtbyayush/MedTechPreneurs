/**
 * Regenerates data/locations/india-states-cities.json from the
 * countries-states-cities-database GitHub release (ODbL-1.0).
 *
 * Usage: node scripts/extract-india-locations.mjs
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const https = require("https");

const RELEASE = "v3.2-export.7";
const SOURCE_URL = `https://github.com/dr5hn/countries-states-cities-database/releases/download/${RELEASE}/json-countries%2Bstates%2Bcities.json.gz`;

const ROOT = path.join(__dirname, "..");
const TMP_DIR = path.join(ROOT, "scripts", "tmp");
const GZ_PATH = path.join(TMP_DIR, "csc-full.json.gz");
const JSON_PATH = path.join(TMP_DIR, "csc-full.json");
const OUT_PATH = path.join(ROOT, "data", "locations", "india-states-cities.json");

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (response) => {
        if (
          response.statusCode &&
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location
        ) {
          file.close();
          fs.unlinkSync(dest);
          download(response.headers.location, dest).then(resolve, reject);
          return;
        }
        if (response.statusCode !== 200) {
          reject(new Error(`Download failed: ${response.statusCode}`));
          return;
        }
        response.pipe(file);
        file.on("finish", () => file.close(resolve));
      })
      .on("error", reject);
  });
}

async function main() {
  fs.mkdirSync(TMP_DIR, { recursive: true });
  console.log(`Downloading ${SOURCE_URL}`);
  await download(SOURCE_URL, GZ_PATH);
  execFileSync("gunzip", ["-kf", GZ_PATH]);

  const data = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));
  const india = data.find((c) => c.iso2 === "IN" || c.name === "India");
  if (!india) {
    throw new Error("India not found in dataset");
  }

  const states = (india.states || [])
    .map((state) => {
      const seen = new Set();
      const cities = [];
      for (const city of state.cities || []) {
        const name = String(city.name || "").trim();
        if (!name) continue;
        const key = name.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        cities.push({ id: String(city.id), name });
      }
      cities.sort((a, b) => a.name.localeCompare(b.name));
      return {
        id: String(state.id),
        name: state.name,
        iso2: state.iso2 || state.state_code || undefined,
        cities,
      };
    })
    .filter((state) => state.cities.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));

  const output = {
    source: {
      name: "countries-states-cities-database",
      url: "https://github.com/dr5hn/countries-states-cities-database",
      release: RELEASE,
      license: "ODbL-1.0",
      country: "India",
      iso2: "IN",
      extractedAt: new Date().toISOString().slice(0, 10),
    },
    country: {
      id: String(india.id),
      name: "India",
      iso2: "IN",
    },
    states,
  };

  fs.writeFileSync(OUT_PATH, `${JSON.stringify(output)}\n`);
  const cityCount = states.reduce((n, s) => n + s.cities.length, 0);
  console.log(`Wrote ${OUT_PATH}`);
  console.log(`${states.length} states, ${cityCount} cities`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
