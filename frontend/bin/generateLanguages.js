const languages = require("../resources/languages");
const fs = require("fs");
let languageList = "";

languages.forEach((x) => {
    const majar = x[0];
    const minors = x.slice(1);
    minors.forEach((y) => {
        let majar_minor = "";
        let code = "";
        if (y.length == 1) {
            majar_minor = majar;
            code = y[0];
        } else if (y.length == 2) {
            code = y[0];
            minor = y[1];
            majar_minor = `${majar} ${minor}`;
        } else {
            console.log(`Error!! unknown format! ${y}`);
        }
        languageList += `"${majar_minor}(${code})":"${code}", \n`;
    });
});

let outputString = `export const LANGUAGES={\n${languageList} \n} as const \n`;
outputString += `export type LANGUAGES = typeof LANGUAGES[keyof typeof LANGUAGES];\n`;
//console.log(outputString);
fs.writeFileSync("./src/languages.ts", outputString);
