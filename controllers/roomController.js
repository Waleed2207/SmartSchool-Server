const { getRooms, getRoomById, getRoomIdByRoomName } = require("./../services/rooms.service.js");
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
            const response = await getRoomById(id);
            return res.status(200).send(response.data);
          } catch (err) {
            return res.status(400).send({ message: err.message });
          }
    },
    async get_RoomsID_ByRoomName(req, res) {
        try {
            const roomName = req.params.name;
            const response = await getRoomIdByRoomName(roomName);
            if (!response)
              return res.status(200).send(_.get(response, 'data.id'));
            throw new Error(response.message)
          } catch (err) {
            return res.status(400).send({ message: err.message });
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
}