import fs from "fs";

const CONFIG_FILE_PATH = 'config.json';
let config = {};

function readConfigFromFile() {
    fs.readFile(CONFIG_FILE_PATH, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(`Config file: ${data}`);
        try {
            config = JSON.parse(data);
            console.log(`Set default config success`);
        } catch (e) {
            console.error(e, e.stack);
            console.log(`Set default config error`);
        }
    });
}

function saveConfigToFile() {
    fs.writeFile(CONFIG_FILE_PATH, JSON.stringify(config), function (err) {
        if (err) return console.log(err);
        console.log(`Save config > ${CONFIG_FILE_PATH}`);
    });
}

export {config, readConfigFromFile, saveConfigToFile}