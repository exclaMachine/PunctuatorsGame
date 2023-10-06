const fs = require("fs");

function convertToHomophonesObj(inputFilename) {
  const txtData = fs.readFileSync(inputFilename, "utf-8");

  const lines = txtData.split("\n");
  const homophones = {};

  for (let line of lines) {
    const words = line.split(" / ");
    for (let word of words) {
      homophones[word] = words.filter((w) => w !== word);
    }
  }

  return homophones;
}

function writeHomophonesToFile(homophones, outputFilename) {
  const jsContent = `const homophones = ${JSON.stringify(
    homophones,
    null,
    2
  )};\n\nmodule.exports = homophones;`;
  fs.writeFileSync(outputFilename, jsContent);
}

const homophonesData = convertToHomophonesObj("./homophones.txt");
writeHomophonesToFile(homophonesData, "./homophones.js");
