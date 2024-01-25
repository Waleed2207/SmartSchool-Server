const Room = require("../models/Room");

const getRooms = async () => {
  try {
    const rooms = await Room.find();
    return {
      statusCode: 200,
      data: rooms,
    };
  } catch (error) {
    return {
      statusCode: 500,
      message: `Error fetching rules - ${error}`,
    };
  }
};

const getRoomById = async (id) => {
  try {
    const room = await Room.findOne({ id: id });
    return { statusCode: 200, data: room };
  } catch (e) {
    return { statusCode: 500, data: e.message };
  }
};

const getRoomIdByRoomName = async (roomName) => {
  try{
    const room = await Room.findOne({ name: roomName });
    if (!room) {
      throw new Error('room not found');
    }
    return room.id;
  } catch(err) {
    return {
      statusCode: 500,
      message: err.message
    }
  }
}



module.exports = {
  getRooms,
  getRoomById,
  getRoomIdByRoomName
};
