const Device = require("../models/Device");
const RoomDevice = require("../models/RoomDevice");
const Room = require("../models/Room");

const axios = require('axios');
const querystring = require('querystring');
const changeFeatureState = async (deviceId, state) => {
  const baseUrl = 'https://api.mindolife.com/API/Gateway/changeFeatureValue';
  const params = {
    developerKey: 'dec4695bf4450e3a4e0aa2b3f92929b631055ee78b77c5da59d434dee088f1cc',
    dataType: 'json',
    client: 'web',
    jsonResponse: 'true',
    iotDeviceID: deviceId,
    featureSetID: '1',
    featureID: '1',
    value: JSON.stringify({ value: state }), // This will be encoded in the query string
    sessionKey: '3c387806e55743f337bd915199ea7a8a426f617414ebdd8e736f2d969bb7350a3b14aafb3542940d865eaf72046ef99e78a28e7a1f4dc4eed1490380ed7d391677413bf666ba5ee7f1695dff2f5c692997d99b99765a43ed70c2125253d0aa3b5efe849bf4bafb67f45083f1a1bba0c5d8fef74415fddd9c1030a15e3e2ca689'
  };

  const queryString = querystring.stringify(params);
  const urlWithParams = `${baseUrl}?${queryString}`;

  try {
    const response = await axios.get(urlWithParams);
    return response.data;
  } catch (error) {
    console.error(`Error changing feature state for device ID ${deviceId}:`, error.message);
    throw error;
  }
}
const fetchIoTDevicesData = async () => {
  try {
    const response = await axios.get('https://api.mindolife.com/API/Gateway/getIoTDevices', {
      params: {
        developerKey: 'dec4695bf4450e3a4e0aa2b3f92929b631055ee78b77c5da59d434dee088f1cc',
        dataType: 'json',
        client: 'web',
        jsonResponse: true,
        getFullData: true,
        daysOfHistory: 30,
        sessionKey: '3c387806e55743f337bd915199ea7a8a426f617414ebdd8e736f2d969bb7350a3b14aafb3542940d865eaf72046ef99e78a28e7a1f4dc4eed1490380ed7d391677413bf666ba5ee7f1695dff2f5c692997d99b99765a43ed70c2125253d0aa3b5efe849bf4bafb67f45083f1a1bba0c5d8fef74415fddd9c1030a15e3e2ca689',
      }
    });
    console.log(response.data);
    return response.data; // axios wraps the response data in a data property
  } catch (error) {
    console.error(`Error fetching IoT devices: ${error.message}`);
    throw error; // Rethrow or handle as needed
  }
};

const MindolifefetchAndTransformIoTDevicesData = async () => {
  try {
    const data = await fetchIoTDevicesData();
    console.log(data); // Log the full data object
    
   const devices = data.map(device => ({
      id: device.id,
      name: device.name,
      feature: device.feature.name
    }));
    return devices;
  } catch (error) {
    console.error(error);
    throw error;
  }
};


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

const addDeviceToRoom = async (deviceId, deviceName, roomId, deviceState) => {
  try {
    const roomDeviceData = {
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

const createNewDevice = async (device, roomId) => {
  try {
    const { name } = device;
    const newDeviceId = Math.floor(10000000 + Math.random() * 90000000);
    const newDevice = new Device({
      name,
      state: "off",
      device_id: newDeviceId, // Assuming you want to set a custom ID
    });

    // Save the new device and wait for the operation to complete
    await newDevice.save();

    // Ensure addDeviceToRoom is an async function or handles its promises correctly
    await addDeviceToRoom(newDeviceId, name, roomId, "off");

    return {
      statusCode: 200,
      data: "Device created successfully",
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
  MindolifefetchAndTransformIoTDevicesData,
  fetchIoTDevicesData,
  changeFeatureState
};
