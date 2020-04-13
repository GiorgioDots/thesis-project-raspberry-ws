const request = require("request-promise-native");
const piWifi = require("pi-wifi");

const logger = require("../logger");

const BACKEND_URL = "https://raspiface-backend.herokuapp.com";

exports.getNewConfig = async (config) => {
  try {
    logger.info("[GET_NEW_CONFIG] Start fetching data");
    logger.info(`${BACKEND_URL}/raspberry/${config.raspiId}`);
    const response = await request.get(
      `${BACKEND_URL}/raspberry/${config.raspiId}`,
      { headers: { Authorization: `Bearer ${config.token}` } }
    );
    logger.info("[GET_NEW_CONFIG] New config fetched");
    jRes = JSON.parse(response);
    let newConfig = jRes.raspberry;
    return Promise.resolve({
      raspiId: newConfig.raspiId,
      resolution: newConfig.resolution,
      confidence: newConfig.confidence,
      isActive: newConfig.isActive,
      wifiPassword: newConfig.wifiPassword,
      wifiSSID: newConfig.wifiSSID,
      token: config.token,
      isFirstRun: config.isFirstRun,
    });
  } catch (err) {
    throw err;
  }
};

exports.isConnectedToInternet = () => {
  return new Promise((resolve, reject) => {
    logger.info("[INTERNET_CONN_CHECKER] Pinging...");
    require("dns").resolve("www.google.com", (err) => {
      if (err) {
        logger.info("[INTERNET_CONN_CHECKER] Not connected to internet...");
        resolve(false);
      } else {
        logger.info("[INTERNET_CONN_CHECKER] Connected to internet...");
        resolve(true);
      }
    });
  });
};

exports.reboot = () => {
  logger.info("[REBOOT] Rebooting..");
  require("child_process").exec("sudo /sbin/shutdown -r now", function (msg) {
    logger.info("[REBOOT] Reboot success..");
  });
};

exports.connectToNewWifi = (config) => {
  return new Promise((resolve, reject) => {
    if (!config.wifiSSID) {
      logger.info("[WIFI] Disconnecting from wifi.");
      piWifi.disconnect(() => {
        Promise.resolve("disconnected");
      });
    }
    if (config.wifiPassword) {
      logger.info("[WIFI] Connecting to a protected wifi..");
      piWifi.connectTo(
        { ssid: config.wifiSSID, password: config.wifiPassword },
        (err) => {
          if (err) {
            logger.info("[WIFI] Connection failed");

            resolve(false);
          } else {
            logger.info("[WIFI] Connected");
            resolve(true);
          }
        }
      );
    } else {
      logger.info("[WIFI] Connecting to an open wifi..");
      piWifi.connectOpen(config.wifiSSID, (err) => {
        if (err) {
          logger.info("[WIFI] Connection failed");
          resolve(false);
        } else {
          logger.info("[WIFI] Connected");
          resolve(true);
        }
      });
    }
  });
};

exports.pingToReboot = () => {
  setInterval(() => {
    logger.info("[PING_TO_REBOOT] Starting Ping to Reboot");
    if (!this.isConnectedToInternet()) {
      logger.info("[PING_TO_REBOOT] Rebooting..");
      this.reboot();
    } else {
      logger.info("[PING_TO_REBOOT] No problem.");
    }
  }, 1000 * 60 * 10);
};
