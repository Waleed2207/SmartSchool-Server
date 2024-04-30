// // const WebSocket = require("ws");

// const clients = [];

// const connectToWs = () => {
//   const wss = new WebSocket.Server({ port: 8080 });

//   wss.on("connection", (ws) => {
//     clients.push(ws);
//     ws.send('Welcome to the WebSocket Server!');

//     // Send a message to all connected clients
//     wss.clients.forEach((client) => {
//       if (client.readyState === WebSocket.OPEN) {
//         client.send('Hello, client!');
//       }
//     });
//   });

//   console.log("ws connected")
// };

// module.exports = { connectToWs, clients };
const WebSocket = require("ws");

const clients = [];

const connectToWs = () => {
  const wss = new WebSocket.Server({ port: 8002 });

  wss.on("connection", (ws) => {
    clients.push(ws);
    console.log("New client connected");

    // Send welcome message to only the newly connected client
    ws.send('Welcome to the WebSocket Server!');

    // Broadcast a message to all connected clients
    broadcast(wss, 'Hello, client!');

    // Handle message event
    ws.on('message', (message) => {
      console.log(`Received message => ${message}`);
      // Handle incoming messages here
    });

    // Handle close event
    ws.on('close', () => {
      console.log("Client has disconnected");
      // Remove the client from the array
      const index = clients.indexOf(ws);
      if (index > -1) {
        clients.splice(index, 1);
      }
    });
  });

  console.log("WebSocket server started on port 8002");
};

// Function to broadcast messages to all connected clients
function broadcast(wss, message) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

module.exports = { connectToWs, clients };

// const WebSocket = require("ws");

// const clients = [];

// const connectToWs = (server) => {
//   const wss = new WebSocket.Server({ server: server });

//   wss.on("connection", (ws) => {
//     clients.push(ws);
//     console.log("New client connected");

//     // Send welcome message to only the newly connected client
//     ws.send('Welcome to the WebSocket Server!');

//     // Broadcast a message to all connected clients
//     broadcast(wss, 'Hello, client!');

// ws.on('message', (message) => {
//   console.log(`Received message => ${message}`);
//   // Handle incoming messages here
// });

// // Handle close event
// ws.on('close', () => {
//   console.log("Client has disconnected");
//   // Remove the client from the array
//   const index = clients.indexOf(ws);
//   if (index > -1) {
//     clients.splice(index, 1);
//   }
// });
// });

// console.log("WebSocket server started on port 8002");
// };

// // Function to broadcast messages to all connected clients
// function broadcast(wss, message) {
// wss.clients.forEach((client) => {
// if (client.readyState === WebSocket.OPEN) {
//   client.send(message);
// }
// });
// }

// module.exports = { connectToWs, clients };