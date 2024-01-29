// const WebSocket = require('ws');
// const { getRooms } = require("./rooms.service");
// const Room = require('../models/Room');
// const { clients } = require('../ws.js');

// const simulateMotionSensor = async () => {
//     try {
//         // Get all rooms
//         const roomsResponse = await getRooms();

//         if (roomsResponse.statusCode === 200) {
//             const rooms = roomsResponse.data;
//             // Select a random room
//             const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];

//             // Update motionDetected of all rooms except the selected one
//             await Room.updateMany({ _id: { $ne: randomRoom._id } }, { motionDetected: false });

//             // Find the room in the database and update motionDetected
//             const roomToUpdate = await Room.findById(randomRoom._id);
//             if (!roomToUpdate) {
//                 console.error(`Room with id ${randomRoom._id} does not exist.`);
//                 return;
//             }
//             roomToUpdate.motionDetected = true;
//             await roomToUpdate.save();

//             // Send notification to all connected WebSocket clients
//             clients.forEach((ws) => {
//                 if (ws.readyState === WebSocket.OPEN) {
//                     ws.send(JSON.stringify({ motionDetected: true, roomId: randomRoom._id }));
//                 }
//             });
//         } else {
//             throw new Error('Could not retrieve rooms to simulate motion sensor');
//         }
//     } catch (err) {
//         console.error(err);
    
//     }
// };

// module.exports = { simulateMotionSensor };
