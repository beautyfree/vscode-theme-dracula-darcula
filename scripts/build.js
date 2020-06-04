// https://github.com/dracula/visual-studio-code/blob/bb709dcaa52914ff0a8b677a9542e198b86f1923/scripts/build.js
const fs = require("fs");
const path = require("path");
const generate = require("./generate");

const THEME_DIR = path.join(__dirname, "..", "theme");

if (!fs.existsSync(THEME_DIR)) {
  fs.mkdirSync(THEME_DIR);
}

module.exports = async () => {
  const theme = await generate();

  return Promise.all([
    fs.promises.writeFile(
      path.join(THEME_DIR, "dracula-darcula.json"),
      JSON.stringify(theme, null, 4)
    ),
  ]);
};

if (require.main === module) {
  module.exports();
}
