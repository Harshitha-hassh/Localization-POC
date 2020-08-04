var fs = require("fs");


const captionsReferenceFile = "en-US";
const errorsReferenceFile = "error.en-US";
const defaultLocalizations = [
    { code: "da-DK", suffix: "_da", name: "Danish" },
    { code: "de-DE", suffix: "_de", name: "German" },
    { code: "en-AU", suffix: "_au", name: "Australian English" },
    { code: "en-GB", suffix: "_gb", name: "GB English" },
    { code: "en-UK", suffix: "_uk", name: "UK English" },
    { code: "fi-FI", suffix: "_fi", name: "Finnish" },
    { code: "fr-FR", suffix: "_fr", name: "French" },
    { code: "en-IN", suffix: "_in", name: "Indian English" }];
const captionsPath = "src/assets/i18n/";
const errorsPath = "src/assets/errors/";
const fileFormat = "json";
const keysToBeExcluded = ["PhoneFormat", "ExtensionFormat", "alphabets"];


console.log("Started generating localization files");
generateLocalizationFiles();


function getDefaultData(path, callBack) {
    fs.readFile(path, function (err, buf) {
        try {
            callBack(JSON.parse(buf));
        } catch (error) {
            logError(`Error in ${path} : ${error}`);
        }
    });
}

function generateLocalizationFiles() {
    let enUScaptionsPath = captionsPath + captionsReferenceFile + '.' + fileFormat;
    let enUSErrorsPath = errorsPath + errorsReferenceFile + '.' + fileFormat;
    getDefaultData(enUScaptionsPath, createCaptions);
    getDefaultData(enUSErrorsPath, createErrorFiles);
}

function createCaptions(defaultEnUsData) {
    for (const lang of defaultLocalizations) {
        let path = captionsPath + lang.code + '.' + fileFormat;
        const enUS = cloneJSON(defaultEnUsData);
        let data = applyLocalization(enUS, lang.suffix);
        createFile(data, path, lang);
    }
}

function createErrorFiles(defaultEnUsData) {
    for (const lang of defaultLocalizations) {
        let path = errorsPath + 'error.' + lang.code + '.' + fileFormat;
        const enUS = { ...defaultEnUsData };
        let data = applyLocalization(enUS, lang.suffix);
        createFile(data, path, lang);
    }
}

function createFile(data, path, lang) {
    fs.writeFile(path, JSON.stringify(data, null, 2), (err) => {
        if (err) { logError(`Error in ${lang.name}: ${path}`, err) };
        logSuccess(`Updated ${lang.name}: ${path}`);
    });
}

function generateCaptionsData(defaultCaptionJson, lang) {
    const moduleKeys = Object.keys(defaultCaptionJson);
    for (let i = 0; i < moduleKeys.length; i++) {
        let modules = moduleKeys[i];
        modules = applyLocalization(defaultCaptionJson[modules], lang.suffix);
    }
    return defaultCaptionJson;
}

function applyLocalization(data, langSuffix) {
    for (const key in data) {
        if (data.hasOwnProperty(key) && !keysToBeExcluded.includes(key)) {
            const word = data[key];
            if (typeof word === 'object')
                data[key] = applyLocalization(data[key], langSuffix);
            else
                data[key] = word + langSuffix;
        }
    }
    return data;
}

function cloneJSON(data) {
    return JSON.parse(JSON.stringify(data));
}

function logError(params) {
    console.log(`\x1b[31m${params}\x1b[0m`);
}

function logSuccess(params) {
    console.log(`\x1b[32m${params}\x1b[0m`);
}






