var fs = require("fs");


const captionsReferenceFile = "en-US";
const errorsReferenceFile = "error.en-US";
const alertsReferenceFile = "alerts.en-US";
const defaultLocalizations = [
    { code: "da-DK", suffix: "_da", name: "Danish" },
    { code: "de-DE", suffix: "_de", name: "German" },
    { code: "en-AU", suffix: "", name: "Australian English" },
    { code: "en-GB", suffix: "", name: "GB English" },
    { code: "en-UK", suffix: "", name: "UK English" },
    { code: "fi-FI", suffix: "_fi", name: "Finnish" },
    { code: "fr-FR", suffix: "_fr", name: "French" },
    { code: "en-IN", suffix: "_in", name: "Indian English" },
    { code: "ko-KR", suffix: "_kr", name: "Korean" },
    { code: "en-NZ", suffix: "", name: "New Zealand" },
   // { code: "en-PH", suffix: "", name: "Philippines" }, //To Be uncommented after Philiipines Fisacl accredation
    { code: "pt-PT", suffix: "_pt", name: "Portugal" },
    { code: "it-IT", suffix: "_it", name: "Italian" },
    /* For pole display hungarian labels has been updated in hu-HU.json so do not uncomment and run the pre-build script. 
       Add the labels manually in the json file. */
    // { code: "hu-HU", suffix: "_hu", name: "Hungarian" },
    { code: "cs-CZ", suffix: "_cs", name: "Czech" },
    { code: "ar-OM", suffix: "_om", name: "Oman"},
    { code: "ar-MA", suffix: "_ma", name: "Morocco"},
    { code: "en-CH", suffix: "_ch", name: "Swiss English" },
    { code: "de-CH", suffix: "_de-ch", name: "Swiss German" },
    { code: "fr-CH", suffix: "_fr-ch", name: "Swiss French" },
    { code: "it-CH", suffix: "_it-ch", name: "Swiss Italian" },
    { code: "id-ID", suffix: "_id", name: "Indonesian" },
    { code: "es-ES", suffix: "_es", name: "Spanish"},
    { code: "ar-QA", suffix: "_qa", name: "Qatar" },
    { code: "en-SC", suffix: "_sc", name: "Seychelles" },
    { code: "fr-SC", suffix: "_fr-sc", name: "Seychelles" },
    { code: "ja-JP", suffix: "_jp", name: "Japanese" },
    { code: "th-TH", suffix: "_th", name: "Thai" },
    { code: "vi-VN", suffix: "_vi", name: "Vietnamese" },
    { code: "el-GR", suffix: "_gr", name: "Greek" },
    { code: "tr-TR", suffix: "_tr", name: "Turkish" },
    { code: "en-TZ", suffix: "_tz", name: "Tanzanian English" },
    { code: "sw-TZ", suffix: "_sw", name: "Swahili (Tanzania)" },
    { code: "fr-PF", suffix: "_fr-pf", name: "French Polynesia" },
    { code: "en-BS", suffix: "_bs", name: "Bahamas" },
    { code: "en-KN", suffix: "_kn", name: "Saint Kitts and Nevis" },
    { code: "ja-JA", suffix: "_ja", name: "Japanese" },
    { code: "ar-BH", suffix: "_bh", name: "Bahrain" },
    { code: "en-BZ", suffix: "_bz", name: "Belize" },
    { code: "en-ZA", suffix: "_za", name: "South African" },
    { code: "ar-KW", suffix: "_kw", name: "Kuwait" },
    { code: "ar-AE", suffix: "_ae", name: "United Arab Emirates" },
    { code: "ar-SA", suffix: "_sa", name: "Saudi Arabia"},
    { code: "en-MU", suffix: "_mu", name: "Mauritius"},
    { code: "en-SG", suffix: "_sg", name: "Singapore"},
    { code: "ms-MY", suffix: "_my", name: "Malaysia"},
    { code: "es-AR", suffix: "_ar", name: "Argentina"},
    { code: "es-CO", suffix: "_co", name: "Colombia"},
    { code: "es-CR", suffix: "_cr", name: "Costa Rica"},
    { code: "es-DO", suffix: "_do", name: "Dominican Republic"},
    { code: "ar-EG", suffix: "_eg", name: "Egypt"},
    { code: "es-PR", suffix: "_pr", name: "Puerto Rico"},
    { code: "zh-TW", suffix: "_tw", name: "Taiwan"},
    { code: "ar-JO", suffix: "_jo", name: "Amman (Jordan)"},
    { code: "az-AZ", suffix: "_az", name: "Azerbaijan"},
    { code: "ar-TN", suffix: "_tn", name: "Tunisia"},
    { code: "zh-CN", suffix: "_zh-cn", name: "Chinese" },
    { code: "zh-SG", suffix: "_zh-sg", name: "Singapore Chinese" }
];
const captionsPath = "src/assets/i18n/";
const errorsPath = "src/assets/errors/";
const alertsPath = "src/assets/userAlerts/";
const fileFormat = "json";
const keysToBeExcluded = ["PhoneFormat", "ExtensionFormat", "alphabets"];
const phoneFormate = ["PhoneFormat", "ExtensionFormat"];


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
    let enUSAlertsPath = alertsPath + alertsReferenceFile + '.' + fileFormat;
    getDefaultData(enUScaptionsPath, createCaptions);
    getDefaultData(enUSErrorsPath, createErrorFiles);
    getDefaultData(enUSAlertsPath, createAlertFiles);
}

function createCaptions(defaultEnUsData) {
    for (const lang of defaultLocalizations) {
        let path = captionsPath + lang.code + '.' + fileFormat;
        const enUS = cloneJSON(defaultEnUsData);
        let data = applyLocalization(enUS, lang.suffix, lang.code);
        createFile(data, path, lang);
    }
}

function createErrorFiles(defaultEnUsData) {
    for (const lang of defaultLocalizations) {
        let path = errorsPath + 'error.' + lang.code + '.' + fileFormat;
        const enUS = { ...defaultEnUsData };
        let data = applyLocalization(enUS, lang.suffix, lang.code);
        createFile(data, path, lang);
    }
}

function createAlertFiles(defaultEnUsData) {
    for (const lang of defaultLocalizations) {
        let path = alertsPath + 'alerts.' + lang.code + '.' + fileFormat;
        const enUS = cloneJSON(defaultEnUsData);
        let data = applyAlertLocalization(enUS, lang.suffix, lang.code);
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
        modules = applyLocalization(defaultCaptionJson[modules], lang.suffix, lang.code);
    }
    return defaultCaptionJson;
}

function applyLocalization(data, langSuffix, langCode) {
    for (const key in data) {
        if (data.hasOwnProperty(key) && !keysToBeExcluded.includes(key)) {
            const word = data[key];
            if (typeof word === 'object')
            {    
                data[key] = applyLocalization(data[key], langSuffix, langCode);
            }
            else
            {
                if(langCode === 'en-AU' || langCode === 'en-NZ'){
                    data[key] = String(word).replace("VAT", "GST");
                }
                else
                {
                    data[key] = word + langSuffix;
                }
            }
        }        
        else if(data.hasOwnProperty(key) && phoneFormate.includes(key)){
            if(langCode == 'en-UK' || langCode == 'en-GB'){
                if(key == 'PhoneFormat'){
                    data[key] = '(0) 9999999999'
                }else if(key == 'ExtensionFormat'){
                    data[key] = '(0) 9999999999 ext: 99'
                }
            }
            if(langCode == 'en-NZ') {
                if(key == 'PhoneFormat'){
                    data[key] = '(9) 999 99999'
                }else if(key == 'ExtensionFormat'){
                    data[key] = '(9) 999 99999 ext: 9999'
                }
            }
        }
    }
    return data;
}

function cloneJSON(data) {
    return JSON.parse(JSON.stringify(data));
}

function applyAlertLocalization(alerts, langSuffix, langCode) {
    if (Array.isArray(alerts)) {
        return alerts.map(alert => {
            if (alert.message && typeof alert.message === 'string') {
                let localizedMessage = alert.message;
                
                if (langCode === 'en-AU' || langCode === 'en-NZ') {
                    localizedMessage = localizedMessage.replace(/VAT/g, "GST");
                } else if (langSuffix) {
                    localizedMessage = localizedMessage + langSuffix;
                }
                
                return {
                    ...alert,
                    message: localizedMessage
                };
            }
            return alert;
        });
    }
    return alerts;
}

function logError(params) {
    console.log(`\x1b[31m${params}\x1b[0m`);
}

function logSuccess(params) {
    console.log(`\x1b[32m${params}\x1b[0m`);
}
