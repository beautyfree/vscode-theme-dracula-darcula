// https://github.com/dracula/visual-studio-code/blob/bb709dcaa52914ff0a8b677a9542e198b86f1923/scripts/lint.js
const https = require("https");
const generate = require("./generate");

const THEME_COLOR_REFERENCE_URL =
  "https://code.visualstudio.com/api/references/theme-color";

const NOT_THEME_KEYS = [
  "workbench.colorCustomizations",
  "editor.tokenColorCustomizations",
];

const get = (url) =>
  new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (data) => (body += data));
      res.on("end", () => resolve(body));
      res.on("error", reject);
    });
  });

async function scrapeThemeAvailableKeys() {
  const data = await get(THEME_COLOR_REFERENCE_URL);

  const matches = data.match(new RegExp("<code>.+?</code>", "g"));

  if (!matches) {
    throw new Error(
      "Couldn't find any matches with <code>...</code>, maybe docs have chaged?"
    );
  }

  return [...matches]
    .map((key) => key.replace("<code>", "").replace("</code>", ""))
    .filter((key) => !/ /.test(key)) // Remove if contains spaces
    .filter((key) => !/#.../.test(key)) // Remove if is a hex color
    .filter((key) => !/&quot;/.test(key)) // Remove if contains quotes
    .filter((key) => key.length > 4) // Remove if it's very small
    .filter((key) => !NOT_THEME_KEYS.includes(key)) // Remove if its in the blacklist
    .sort();
}

(async () => {
  const availableKeys = await scrapeThemeAvailableKeys();

  const theme = await generate();

  for (const key of Object.keys(theme.colors)) {
    if (!availableKeys.includes(key)) {
      console.warn(`Unsupported key "${key}", probably deprecated?`);
    } else if (theme.colors[key] == null) {
      console.warn(`Value of "${key}" is null`);
    }
  }

  for (const key of availableKeys) {
    if (!Object.keys(theme.colors).includes(key)) {
      console.warn(`Missing key "${key}" in theme`);
    }
  }
})().catch(console.error);
