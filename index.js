require('dotenv').config();
const wsSocket = require('/home/pi/thesis-project-raspberry-ws/modules/socket.io');
setTimeout(() => {
    wsSocket.init()
}, 1000);
