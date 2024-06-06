const { getRooms, getRoomById, getRoomIdByRoomName ,get_Rooms_By_SpaceId} = require("./../services/rooms.service.js");
const Device = require("./../models/Device.js");
const Room = require("./../models/Room");
const RoomDevice = require("./../models/RoomDevice");
const {
    getRoomDevices,
    getRoomsByDeviceName,
  } = require("./../services/devices.service.js");
const {
    getSuggestions,
    addSuggestionsToDatabase,
    updateSuggestions,
    addSuggestionMenually,
    deleteSuggestion,
  } = require("./../services/suggestions.service.js");
  const {
    addRoomToSpace

  } = require("./../services/space.service.js");


exports.roomControllers={

    async get_Rooms(req, res) {
        try {
            const response = await getRooms();
            return res.status(200).send(response.data);
        } catch (err) {
            return res.status(400).send({ message: err.message });
        }
    },
    async get_Rooms_ById(req, res) {
      try {
        const id = req.params.id;
        if (!id) {
          return res.status(400).send({ message: "Room ID is required" });
        }
  
        const response = await getRoomById(id);
  
        if (response.statusCode === 200) {
          if (!response.data) {
            return res.status(404).send({ message: "Room not found" });
          }
          return res.status(200).send(response.data);
        } else {
          return res.status(500).send({ message: response.data });
        }
      } catch (err) {
        console.error("Error fetching room data:", err.message);
        return res.status(500).send({ message: err.message });
      }
    },
    async  get_Rooms_By_SpaceId(req, res) {
      try {
        const space_id = req.params.space_id;
        console.log('Fetching rooms for space ID:', space_id);
        const rooms = await get_Rooms_By_SpaceId(space_id);
        if (!rooms.length) { // Check if the rooms array is empty
          return res.status(404).send({ message: 'Rooms not found' });
        }
        return res.status(200).send(rooms); // Send the rooms array directly
      } catch (err) {
        return res.status(500).send({ message: err.message });
      }
    },
    async get_RoomsID_ByRoomName(req, res) {
      try {
          const roomName = req.params.name_space;
          const room = await getRoomIdByRoomName(roomName);
          if (!room) {
              return res.status(404).send({ message: 'Room not found' });
          }
          return res.status(200).send(room); // Send the room data directly
      } catch (err) {
          return res.status(500).send({ message: err.message }); // Handle any other errors
      }
    },
    
    async get_RoomDevices_ByRoomId(req, res) {
        try {

            const roomId = req.params.roomId;
            const response = await getRoomDevices(roomId);
            return res.status(200).send(response.data)
          } catch (err) {
        
          } 
    },
    async TestDB(req, res) {
        try {
            await addSuggestionsToDatabase();
            return res.status(200);
          } catch (err) {
            // return res.status(400).send({ message: err.message });
          }
    },
    async get_Rooms_ByDeviceName(req, res) {

        try {

            const deviceName = req.params.deviceName;
            const response = await getRoomsByDeviceName(deviceName);
            return res.status(200).send(response);
          } catch (err) {
        
          }
    },
    async AddRoom(req, res) {
      const { spaceId, roomType } = req.body; // Assuming these are the needed fields
      try {
          const room = await addRoomToSpace(spaceId, roomType);
          res.status(200).send({ message: "Room added successfully", room: room });
      } catch (error) {
          console.error("Error adding room:", error);
          res.status(500).send({ message: error.message });
      }
    }
}