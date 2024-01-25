const WebSocket = require("ws");

const clients = [];

const connectToWs = () => {
  const wss = new WebSocket.Server({ port: 8080 });

  wss.on("connection", (ws) => {
    clients.push(ws);
    ws.send('Welcome to the WebSocket Server!');

    // Send a message to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send('Hello, client!');
      }
    });
  });

  console.log("ws connected")
};

module.exports = { connectToWs, clients };
