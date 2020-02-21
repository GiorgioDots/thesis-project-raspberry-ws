require('dotenv').config();
const wsSocket = require('./modules/socket.io');

wsSocket.init();