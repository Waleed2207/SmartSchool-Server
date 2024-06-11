const Device = require("../models/Device");
const RoomDevice = require("../models/RoomDevice");
const Room = require("../models/Room");


const getDevices = async () => {
  try {
    const devices = await Device.find();
    return devices;
  } catch (err) {
    console.log(err);
  }
};

const updateDeviceModeInDatabase = async (deviceId, mode) => {
  try {
    const result = await Device.updateOne(
      { device_id: deviceId },
      { $set: { state: "on", mode } }
    );
    if (result.modifiedCount === 1) {
      console.log("Device mode and state updated successfully in the database");
      return true;
    } else {
      console.log("No device was found with the provided device_id");
      return false;
    }
  } catch (error) {
    console.error(
      "Error updating device mode and state in the database:",
      error
    );
    return false;
  }
};

const getDeviceByName = async (name) => {
  try {
    const device = await Device.findOne({ name: name.toLowerCase() });
    if (device) {
      return {
        statusCode: 200,
        data: device,
      };
    }
  } catch (err) {
    return {
      statusCode: 500,
      message: err.message,
    };
  }
};

const addDeviceToRoom = async (space_id,deviceId, deviceName, roomId, deviceState) => {
  try {
    const roomDeviceData = {
      space_id: space_id,
      room_id: roomId,
      device_id: deviceId,
      state: deviceState,
      device_name: deviceName,
    };

    const newRoomDevice = new RoomDevice({ ...roomDeviceData });
    newRoomDevice.id = `${roomId}-${deviceId}`;
    await newRoomDevice.save();

    return {
      statusCode: 200,
      data: "Device added successfully",
    };
  } catch (err) {
    return {
      statusCode: 500,
      message: err.message,
    };
  }
};

const getDevicesByRoomId = async (roomId) => {
  try {
    const devices = await Device.aggregate([
      {
        $lookup: {
          from: "rooms-devices",
          localField: "device_id",
          foreignField: "device_id",
          as: "roomDevices",
        },
      },
      {
        $match: {
          "roomDevices.room_id": roomId,
        },
      },
    ]);

    return {
      statusCode: 200,
      data: devices,
    };
  } catch (err) {
    return {
      statusCode: 500,
      message: err.message,
    };
  }
};

const getRoomDevicesTest = async (roomId) => {
  try {
    const devices = await RoomDevice.find({ room_id: roomId });
    const devicesWithIcons = await RoomDevice.aggregate([
      {
        $match: {room_id: roomId}
      },
      {
        $lookup: {
          from: 'devices',
          localField: 'device_id',
          foreignField: 'device_id',
          as: 'device'
        }
      },
      {
        $unwind: '$device'
      },
      {
        $project: {
          _id: 0,
          room_id: 1,
          device_id: 1,
          state: 1,
          id: 1,
          device_name: 1,
          icon: '$device.icon'
        }
      }
    ])

    return {
      statusCode: 200,
      data: devicesWithIcons,
    };
  } catch (err) {
    return {
      statusCode: 500,
      message: err.message,
    };
  }
};

const getRoomDevices = async (roomId) => {
  try {
    const devices = await RoomDevice.find({ room_id: roomId });
    return {
      statusCode: 200,
      data: devices,
    };
  } catch (err) {
    return {
      statusCode: 500,
      message: err.message,
    };
  }
};
const getDevice_By_SpaceID = async (space_ID) => {
  try {
    const devices = await Device.find({ space_id: space_ID });
    return {
      statusCode: 200,
      data: devices,
    };
  } catch (err) {
    return {
      statusCode: 500,
      message: err.message,
    };
  }
};

const getDeviceBySpaceID_ByRoomName = async (spaceID, roomName) => {
  try {
    const decodedRoomName = decodeURIComponent(roomName);
    console.log(`Querying with spaceID: ${spaceID}, roomName: ${decodedRoomName}`);
    
    // Log the exact query
    console.log('Executing query:', { space_id: spaceID, name: decodedRoomName });

    const rooms = await Room.find({ space_id: spaceID, name: { $regex: new RegExp(`^${decodedRoomName}$`, 'i') } });

    // Log the query result
    console.log('Query Result:', rooms);

    if (rooms.length === 0) {
      console.log('No rooms found for the given spaceID and roomName');
      return [];
    }
    
    // Extract devices from each room and combine into a single array if needed
    const devices = rooms.map(room => room.devices).flat();

    return devices;

  } catch (err) {
    console.error('Error fetching devices:', err.message);
    return {
      statusCode: 500,
      message: err.message,
    };
  }
}





const setRoomDeviceState = async (id, state) => {
  try {
    const response = await RoomDevice.updateOne(
      { id },
      { state: state ? "on" : "off" }
    );
    console.log(response);
    
    if (response.modifiedCount === 0) {

      throw new Error("Unable to update room device state");
    }

    return {
      statusCode: 200,
      message: "Room device has been updated",
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      message: err.message,
    };
  }
};
const updateRoomDevices = async (space_id, roomId, deviceName) => {
  try {
    console.log(`Updating room devices for room ID ${roomId} and space ID ${space_id} with new device ${deviceName}`);
    const result = await Room.findOneAndUpdate(
      { id: roomId, space_id: space_id },  // Make sure this correctly identifies the document
      { $push: { devices: deviceName } },  // Push the new device name into the devices array
      { new: true, returnOriginal: false }  // Ensures the updated document is returned
    );

    if (!result) {
      console.error('No document found with the provided id and space_id, or update failed');
      throw new Error('No document found with the provided id and space_id, or update failed');
    }

    return result;
  } catch (err) {
    console.error("Failed to update room devices:", err);
    throw err;
  }
};
const createNewDevice = async (space_id, device, roomId) => {
  try {
    const { name } = device;
    console.log(space_id);
    const newDeviceId = Math.floor(10000000 + Math.random() * 90000000);
    const newDevice = new Device({
      space_id,
      name,
      state: "off",
      device_id: newDeviceId, // Assuming you want to set a custom ID
    });

    // Save the new device and wait for the operation to complete
    await newDevice.save();

    // Ensure addDeviceToRoom is an async function or handles its promises correctly
    await addDeviceToRoom(space_id,newDeviceId, name, roomId, "off");

    return {
      statusCode: 200,
      data: newDevice, 
    };
  } catch (err) {
    console.error(err); // Log the error for debugging
    return {
      statusCode: 500,
      message: err.message,
    };
  }
};


const getDeviceIdByDeviceName = async (deviceName) => {
  try{
    const device = await Device.findOne({ name: deviceName });
    if (!device) {
      throw new Error('room not found');
    }
    return device.device_id;
  } catch(err) {
    return {
      statusCode: 500,
      message: err.message
    }
  }
}

const getRoomsByDeviceName = async (deviceName) => {
  // get all rooms that has that device
  const roomsDevices = await RoomDevice.find({device_name: deviceName});
  return roomsDevices;
}



module.exports = {
  getDevices,
  updateDeviceModeInDatabase,
  getDeviceByName,
  addDeviceToRoom,
  getDevicesByRoomId,
  getRoomDevices,
  setRoomDeviceState,
  createNewDevice,
  getRoomDevicesTest,
  getDeviceIdByDeviceName,
  getRoomsByDeviceName,
  getDevice_By_SpaceID,
  updateRoomDevices,
  getDeviceBySpaceID_ByRoomName
};
