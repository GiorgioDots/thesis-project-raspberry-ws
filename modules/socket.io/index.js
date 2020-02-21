const io = require("socket.io-client");
const fs = require("fs");
const path = require('path');
const request = require("request-promise-native");
const projectPath = path.dirname(require.main.filename);
const raspiConfigPath = `${projectPath}/raspi-config.json`;

module.exports = {
    socket: null,
    init: function () {
        socket = io(process.env.WS_CONTROLLER_URL);
        socket.on("connect", this.onConnect);
        socket.on("raspi-config", this.onUpdateConfig);
    },
    onConnect() {
        let raspiConfig = require(raspiConfigPath);
        let raspiId = raspiConfig.raspiId;
        console.log("Connected", `RaspiId: ${raspiId}`);
        console.log("Sending identification");
        socket.emit("identification", JSON.stringify({ id: raspiId }));
        console.log("Identification sent");
        setTimeout(() => {
            let endpoint = `${process.env.BACKEND_URL}/raspi/config/${raspiId}`;
            console.log(`Fetching the latest raspi-config from endpoint: ${endpoint}`);
            request(endpoint)
                .then(result => {
                    console.log(`Latest raspi-config: ${result}`);
                    if (!result) {
                        throw new Error("Could not get the latest config");
                    }
                    jbody = JSON.parse(result);
                    raspiConfig.resolution = jbody.resolution;
                    raspiConfig.confidence = jbody.confidence;
                    return writeConfigToFileSync(JSON.stringify(raspiConfig));
                })
                .catch(error => {
                    console.log(error);
                });
        }, 10000);
    },
    onUpdateConfig(msg) {
        let jmsg = JSON.parse(msg);
        let raspiConfig = require(raspiConfigPath);
        console.log(`Updating raspi-config from: ${JSON.stringify(raspiConfig)}`);
        raspiConfig.resolution = jmsg.resolution;
        raspiConfig.confidence = jmsg.confidence;
        console.log(`Updating raspi-config to: ${JSON.stringify(raspiConfig)}`);
        writeConfigToFileSync(JSON.stringify(raspiConfig));
    }
}

const writeConfigToFileSync = (msg) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(raspiConfigPath, msg, (error) => {
            if (error) {
                throw new Error("Could not save the latest config");
            }
            console.log(`raspi-config updated: ${msg}`);
        });
    });
}