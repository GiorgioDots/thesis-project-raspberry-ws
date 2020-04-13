const fs = require("fs");

const auth = require("./modules/auth");
const utils = require("./modules/utils");
const logger = require("./modules/logger");
const wsSocket = require("./modules/socket.io");

setTimeout(async () => {
  const configPath = "./raspi-config.json";
  let config = require(configPath);

  logger.info("[MAIN] Checking internet connection..");
  if (!(await utils.isConnectedToInternet())) {
    logger.info("[MAIN] Start reboot");
    utils.reboot();
  }

  if (!config.token) {
    logger.info("[MAIN] Raspberry is not authenticated, authenticating..");
    config = await auth.authenticate(config);
    fs.writeFileSync(configPath, JSON.stringify(config));
  }

  logger.info("[MAIN] Fetching new configuration");
  const newConfig = await utils.getNewConfig(config);
  logger.info(`[MAIN] Fetched config: ${JSON.stringify(newConfig)}`);
  fs.writeFileSync(configPath, JSON.stringify(newConfig));

  logger.info("[MAIN] Checking if a new wifi connection is configured");

  logger.info("[MAIN] Started connecting to a new wifi network..");
  const isConnected = await utils.connectToNewWifi(newConfig);
  if (!isConnected) {
    throw new Error("Cannot connect to the new wifi..");
  }

  logger.info("[MAIN] Starting websocket client..");
  wsSocket.init();

  logger.info("[MAIN] Starting ping to reboot");
  utils.pingToReboot();
}, 1000);
