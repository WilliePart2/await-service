const net = require('net');

const awaitMongo = ({
  host,
  port,
  maxTries = 1000,
  reconnectInterval = 1000,
  connectionCheckInterval = 500
} = {}) => {
  let socket;
  let isConnected = false;
  let triesCounter = 0;

  function subscribeToSocketEvents() {
    if (!socket) {
      return console.error('There is no socket to subscribe');
    }

    socket.on('error', () => {
      isConnected = false;
      if (++triesCounter >= maxTries) {
        throw new Error('Mongodb connection refused');
      }

      setTimeout(createSocketConnection, reconnectInterval);
    });

    socket.on('connect', () => (isConnected = true));
  }

  function createSocketConnection() {
    socket = net.connect(port, host);
    subscribeToSocketEvents();
  }


  function checkConnection() {
    if (!isConnected) {
      console.log('Await for connection to mongodb...');
      return setTimeout(checkConnection, connectionCheckInterval);
    }

    console.log('Mongodb is connected');

    socket && socket.destroy();
  }

  createSocketConnection();
  checkConnection();
};


const {
  MONGO_HOST,
  MONGO_PORT,
  CONNECT_TRIES_AMOUNT,
  CONNECT_INTERVAL,
  CONNECT_CHECK_INTERVAL
} = process.env;

awaitMongo({
  host: MONGO_HOST,
  port: MONGO_PORT,
  reconnectInterval: CONNECT_INTERVAL,
  maxTries: CONNECT_TRIES_AMOUNT,
  connectionCheckInterval: CONNECT_CHECK_INTERVAL
});
