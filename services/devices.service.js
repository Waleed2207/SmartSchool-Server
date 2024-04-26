const Device = require("../models/Device");
const RoomDevice = require("../models/RoomDevice");
const Room = require("../models/Room");

const axios = require('axios');
const querystring = require('querystring');
const { features } = require("process");
// const changeFeatureState = async (device_id, state) => {
//   const data = {
//     device_id: device_id,  // Changed from deviceId to device_id
//     state: state
//   };
//   console.log("Sending device id and state:", data);

//   try {
//     const response = await axios.post('http://10.0.0.29:5009/api-mindolife/change_feature_state', data, {
//       headers: {
//         'Content-Type': 'application/json'
//       }
//     });
//     console.log('Response:', response.data);
//   } catch (error) {
//     if (error.response) {
//       console.error('Error with response:', error.response.data);
//     } else if (error.request) {
//       console.error('Error: No response received', error.request);
//     } else {
//       console.error('Error: Setup issue', error.message);
//     }
//   }
// };
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
// const fetchIoTDevicesData = async () => {
//   try {
//     const response = await axios.get('https://api.mindolife.com/API/Gateway/getIoTDevices', {
//       params: {
//         developerKey: 'dec4695bf4450e3a4e0aa2b3f92929b631055ee78b77c5da59d434dee088f1cc',
//         dataType: 'json',
//         client: 'web',
//         jsonResponse: true,
//         getFullData: true,
//         daysOfHistory: 30,
//         sessionKey: '3c387806e55743f337bd915199ea7a8a426f617414ebdd8e736f2d969bb7350a3b14aafb3542940d865eaf72046ef99e78a28e7a1f4dc4eed1490380ed7d391677413bf666ba5ee7f1695dff2f5c692997d99b99765a43ed70c2125253d0aa3b5efe849bf4bafb67f45083f1a1bba0c5d8fef74415fddd9c1030a15e3e2ca689',
//       }
//     });
//     console.log(response.data);
//     return response.data; // axios wraps the response data in a data property
//   } catch (error) {
//     console.error(`Error fetching IoT devices: ${error.message}`);
//     throw error; // Rethrow or handle as needed
//   }
// };

const fetchIoTDevicesData = async () => {
  const flaskAppUrl = 'http://10.0.0.29:5009/api-mindolife/get_devices';
  try {
      const response = await axios.get(flaskAppUrl);
      console.log("Full Axios Response:", response);
  
      if (!response.data || !Array.isArray(response.data.devices)) {
        console.error('Invalid or missing devices data in response:', response.data);
        return [];  // Ensuring function returns a consistent type
      }
      return response.data;
  } catch (error) {
      console.error(`Error fetching IoT devices from Flask app: ${error}`);
      throw error;
  }
};
// const MindolifefetchAndTransformIoTDevicesData = async () => {
//    try {
//     const fetchedData = await fetchIoTDevicesData();
//     if (fetchedData.devices.length === 0) {
//       console.log('Received empty devices array with success status.');
//       return [];  // Handling case where array is valid but empty
//     }


//     const devices = fetchedData.map(device => {
//       if (!device.feature || typeof device.feature !== 'object') {
//         throw new Error(`Invalid feature data for device ${device.id}`);
//       }

//       const features = Object.keys(device.feature).map(featureKey => {
//         const feature = device.feature[featureKey];
//         const featureSetDefinitionKey = feature.featureSetDefinitionKey || null;
//         const definitionKey = feature.definitionKey || null;

//         const [featureSetID, featureID] = featureKey.split('.');
//         return {
//           jsonResponse: true,
//           iotDeviceID: device.id,
//           featureSetID: featureSetID,
//           featureID: featureID,
//           name: feature.name || null,
//           value: feature.value ? JSON.stringify({ value: feature.value }) : undefined,
//           definitionKey: definitionKey,
//           featureSetDefinitionKey: featureSetDefinitionKey,
//         };
//       });

//       return {
//         id: device.id,
//         name: device.name,
//         features: features,
//       };
//     });

//     return devices;
//   } catch (error) {
//     console.error(`Error transforming IoT devices data: ${error.message}`);
//     throw {
//       success: false,
//       message: 'Failed to extract IoT device details',
//       error: error.message,
//     };
//   }
// };

const MindolifefetchAndTransformIoTDevicesData = async () => {
  try {
    const fetchedData = await fetchIoTDevicesData(); // Ensure this function is defined elsewhere in your code
    if (fetchedData.devices.length === 0) {
      console.log('Received empty devices array with success status.');
      return [];  // Handling case where array is valid but empty
    }

    const devices = fetchedData.devices.map(device => {
      const features = device.features ? Object.keys(device.features).map(featureKey => {
        const feature = device.features[featureKey];
        return {
          iotDeviceID: device.id,           // Assuming device.id is the IoT device ID
          featureID: featureKey,
          featureSetID: feature.featureSetID,
          featureValue: feature.value,      // Assuming feature value is stored under 'value'
          featureName: feature.name,        // Assuming feature name is stored under 'name'
          featureState: feature.state,      // Assuming feature state is stored under 'state'
          featureSetDefinitionKey: feature.featureSetDefinitionKey, // Ensure this property exists in your data model
          definitionKey: feature.definitionKey   // Ensure this property exists in your data model
        };
      }) : [];  // Handling missing or undefined features

      return features;
        // Return an array of features for each device
    });
    console.log(devices);
    return devices.flat();  // Flattens the array to have a single list of all features across devices
  } catch (error) {
    console.error(`Error transforming IoT devices data: ${error.message}`);
    throw error;
  }

};

// const processAndLogDevices = async () => {
//   try {
//     const fetchedData = await fetchIoTDevicesData();
//     if (fetchedData.success) {
//       console.log('Devices:', fetchedData.devices);
//     } else {
//       console.log('Failed to fetch devices');
//     }
//   } catch (error) {
//     console.error('An error occurred:', error);
//   }
// };

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
  changeFeatureState,
  //processAndLogDevices

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
  updateRoomDevices
};
