const io = require("socket.io-client");

const logger = require("../logger");
const utils = require("../utils");

const WS_CONTROLLER_URL = "https://raspiface-wscontroller.herokuapp.com";

module.exports = {
  socket: null,
  init: function () {
    socket = io(WS_CONTROLLER_URL);
    socket.on("connect", this.onConnect);
    socket.on("restart", this.onRestart);
  },
  onConnect() {
    const config = require("../../raspi-config.json");
    logger.info("[WS] Connected to WS Controller");
    logger.info("[WS] Sending identification");
    socket.emit("identification", JSON.stringify({ id: config.raspiId }));
    logger.info("[WS] Identification sent");
    logger.info("[WS] Executing command to start object detection");
    //utils.startObjDetection();
  },
  onRestart() {
    logger.info("[WS] Recieved a reboot command from ws controller..");
    utils.reboot();
  },
};
