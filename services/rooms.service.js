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

const get_Rooms_By_SpaceId = async (space_id) => {
  try {
    const rooms = await Room.find({ space_id: space_id }); // Use find to return all rooms
    return rooms; // Directly return the rooms array
  } catch (e) {
    throw new Error(e.message); // Throw an error to be caught in the catch block of the route handler
  }
};

const getRoomIdByRoomName = async (roomName) => {
  try {
      const room = await Room.find({ name_space: roomName }); // Find one room with the given namespace
      if (!room) {
          return null; // Return null if no room is found
      }
      return room; // Return the room data
  } catch (err) {
      throw new Error(err.message); // Throw any other errors to be handled by the caller
  }
}




module.exports = {
  getRooms,
  getRoomById,
  getRoomIdByRoomName,
  get_Rooms_By_SpaceId
};
