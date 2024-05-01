const MindolifeAPIClient = require('../api/MindolifeAPIClient'); // Adjust the path as necessary
const { generateWuertStringBaseParams } = require('../api/MindolifeAPIUtils'); // Assuming this utility is available for handling query strings
const { analyzeResults } = require('../api/MindolifeAPIUtils');
const unbindGatewayServiceName = 'Session/unbindGateway'; // Adjust based on your API's endpoint
const getGatewayEndpointsServiceName = "v1/Gateway/getEndpoints"; // Adjust based on your API's actual endpoint
const loginGatewayServiceName = 'v2/User/login'; // Adjust this endpoint as needed
const getDevicesServiceName = 'v1/Gateway/getDevices'; // Adjust based on your API's actual endpoint
const Room = require("./../models/Room");
const Device = require("./../models/Device.js");
const RoomDevice = require("./../models/RoomDevice");
const axios = require("axios");
const https = require('https');
const querystring = require('querystring');
require('dotenv').config();
const agent = new https.Agent({ family: 4 }); // Force IPv4

/**
 * Fetches the devices associated with a specific gateway.
 * 
 * @param {String} gatewayId - The ID of the gateway whose devices are being fetched.
 * @param {String} userSessionKey - The session key for the authenticated user, for authorization.
 * @returns {Promise} - A promise that resolves with the devices associated with the gateway.
 */

/**
 * Attempts to log in to a gateway and updates the session key upon success.
 * 
 * @param {string} username - The username for login.
 * @param {string} password - The password for login.
 * @param {string} sessionKey - The session key to be used for subsequent requests.
 * @param {Object} gateway - The gateway object to update with the session key.
 * @returns {Promise<boolean>} - A promise that resolves to true if login is successful, false otherwise.
 */

  const loginGateway = async (username, password, sessionKey, gateway)=> {
    const params = {
        username,
        password,
        keepMeLoggedIn: true,
    };

    try {
        const response = await MindolifeAPIClient.post(loginGatewayServiceName, params, {
            headers: { Authorization: `Bearer ${sessionKey}` },
        });

        // Check the response for success. Adjust this check as needed based on your API's response structure.
        if (response.data && response.data.error) {
            console.error('Login failed:', response.data.error);
            return false;
        } else {
            // Update the gateway object's session key on successful login
            gateway.sessionKey = sessionKey; // Or possibly response.data.sessionKey if the API returns a new one
            return true;
        }
    } catch (error) {
        console.error('Login request failed:', error);
        return false;
    }
};
/**
 * Fetches the endpoints for a specific gateway.
 * 
 * @param {String} gatewayId - The ID of the gateway whose endpoints are being fetched.
 * @param {String} userSessionKey - The session key for the authenticated user, for authorization.
 * @returns {Promise} - A promise that resolves with the gateway endpoints.
 */

const getGatewayEndpoints = async(gatewayId, userSessionKey)=> {
    try {
      // Construct the request URL with query parameters as needed
      const url = `${getGatewayEndpointsServiceName}?gatewayId=${encodeURIComponent(gatewayId)}`;
      console.log(url);
      const response = await MindolifeAPIClient.get(url, {
        headers: { Authorization: `Bearer ${userSessionKey}` },
      });
  
      console.log('Gateway endpoints fetched successfully:', response.data);
      return response.data; // You may want to further process this data before returning
    } catch (error) {
      console.error('Failed to fetch gateway endpoints:', error);
      throw error; // Rethrow or handle as needed for the caller to catch
    }
  };
/**
 * Unbinds a gateway from the current user's account.
 * 
 * @param {String} gatewayId - The ID of the gateway to be unbound.
 * @param {String} userSessionKey - The session key for the authenticated user.
 * @returns {Promise} - A promise that resolves with the result of the unbind operation.
 */

const unbindGateway = async(gatewayId, userSessionKey)=> {
    try {
      // Constructing the full URL or endpoint. Adjust as necessary.
      const url = `${unbindGatewayServiceName}?sessionKey=${encodeURIComponent(userSessionKey)}&gatewayId=${encodeURIComponent(gatewayId)}`;
  
      // Assuming DELETE is the method used for unbinding. Adjust if your API uses a different method.
      const response = await MindolifeAPIClient.delete(url, {
        headers: { Authorization: `Bearer ${userSessionKey}` },
      });
  
      console.log('Gateway unbound successfully:', response.data);
      return response.data; // Return or process data as needed
    } catch (error) {
      console.error('Failed to unbind gateway:', error);
      throw error; // Rethrow or handle as needed for caller to catch
    }
  };
/**
 * Binds a gateway to the current user's account.
 * 
 * @param {Object} gateway - The gateway object containing necessary information.
 * @param {String} userSessionKey - The session key for the authenticated user.
 * @returns {Promise} - A promise that resolves with the result of the bind operation.
 */

const bindGateway= async (gateway, userSessionKey)=> {
  const params = {
    sessionKey: userSessionKey, // Authentication session key
    // Add other necessary parameters according to your API's requirement
    gatewayId: gateway.id, // Assuming the gateway object has an id
  };

  const httpParams = generateWuertStringBaseParams(params);
  const url = `${bindGatewayServiceName}?${httpParams}`;

  try {
    const response = await MindolifeAPIClient.post(url, params);
    // Process the response as necessary. The response structure depends on your API.
    console.log('Gateway bound successfully:', response.data);
    return response.data; // Return or process data as needed
  } catch (error) {
    console.error('Failed to bind gateway:', error);
    throw error; // Rethrow or handle as needed
  }
};

// Assuming MindolifeAPIClient is a configured Axios instance or similar
// If it's not used, you might want to remove it to clean up your code
// const MindolifeAPIClient = require('./MindolifeAPIClient');

const isGatewayLoggedIn =async(gateway) =>{
  const params = {
    jsonResponse: 'true',
    getContract: 'true',
    sessionKey: gateway.sessionKey,
  };

  try {
    const data = await analyzeResults(isGatewayLoggedinsServiceName, params, gateway.sessionKey);
    const resultMap = JSON.parse(data); // Ensure data needs parsing. Axios typically auto-parses JSON responses.

    if (resultMap.error || Object.keys(resultMap).includes('Error')) {
      throw new Error(resultMap.error || 'Error occurred');
    } else {
      gateway.isLoggedIn = resultMap.isLoggedIn;

      if (gateway.isLoggedIn) {
        // Assuming Contract.fromJson method exists and is adapted for Node.js
        // Otherwise, directly assign or adapt from the resultMap as necessary
        gateway.contract = resultMap.contract; // Directly using the contract from resultMap for simplicity
      }

      // Adjust according to how you plan to use the success result. For now, returning the updated gateway.
      return gateway;
    }
  } catch (error) {
    console.error(`Error checking if gateway is logged in: ${error}`);
    // Adjust according to how you handle errors. Throwing for caller to decide.
    throw error;
  }
};

// Sample data representing gateways
let gateways = [
    { id: 1, name: "Gateway 1", location: "Location 1" },
    { id: 2, name: "Gateway 2", location: "Location 2" },
    // Add more sample data as needed
];

// Function to get all gateways
const getAllGateways = () => {
    return gateways;
};

// Function to get a gateway by ID
const getGatewayById = (id) => {
    const gateway = gateways.find(gateway => gateway.id === id);
    if (!gateway) {
        throw new Error('Gateway not found');
    }
    return gateway;
};

// Function to create a new gateway
const createGateway = (newGateway) => {
    const id = gateways.length + 1;
    const gateway = { id, ...newGateway };
    gateways.push(gateway);
    return gateway;
};

// Function to update a gateway by ID
const updateGateway = (id, updatedGateway) => {
    const index = gateways.findIndex(gateway => gateway.id === id);
    if (index === -1) {
        throw new Error('Gateway not found');
    }
    gateways[index] = { id, ...updatedGateway };
    return gateways[index];
};

// Function to delete a gateway by ID
const deleteGateway = (id) => {
    const index = gateways.findIndex(gateway => gateway.id === id);
    if (index === -1) {
        throw new Error('Gateway not found');
    }
    gateways.splice(index, 1);
    return true; // Deletion successful
};

// const fetchIoTDevicesData = async () => {
//   try {
//     const response = await axios.get('https://api.mindolife.com/API/Gateway/getIoTDevices', {
//       httpsAgent: agent,
//       params: {
//         developerKey: process.env.DEVELOPER_KEY,
//         dataType: 'json',
//         client: 'web',
//         jsonResponse: true,
//         getFullData: true,
//         daysOfHistory: 30,
//         sessionKey: process.env.SESSION_KEY,
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
  const flaskAppUrl = 'http://10.100.102.14:5009/api-mindolife/get_devices';
  try {
      const response = await axios.get(flaskAppUrl);
      console.log("Full Axios Response:", response);
      console.log("Data received:", response.data);
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
const MindolifefetchAndTransformIoTDevicesData = async () => {
  try {
    const fetchedData = await fetchIoTDevicesData(); // Assume this returns an array of devices
    console.log(fetchedData); // Log the full fetchedData object

    const devices = fetchedData.devices.map(device => {
      // Assuming 'feature' is an object with feature IDs as keys
      // and the features themselves contain the desired information
      const feature = device.feature && device.feature['1.1']; // Example to access a specific feature
      return {
        id: device.id,
        name: device.name,
        // Assuming 'value' in your structure is related to the specific feature you're interested in
        // You might need to adjust based on your actual data structure
        featureDetails: feature ? {
          jsonResponse: "true", // This seems static, based on your example
          iotDeviceID: device.id, // Assuming the 'iotDeviceID' corresponds to the device's 'id'
          featureSetID: "1", // This and the next are static, based on your example
          featureID: "1",
          value: feature.value ? JSON.stringify({ value: feature.value }) : undefined,
        } : undefined
      };
    });
    return devices;
  } catch (error) {
    console.error(`Error transforming IoT devices data: ${error.message}`);
    throw error;
  }
};
const fetchIoTDeviceDataById = async (deviceId) => {
  try {
    const url = `https://api.mindolife.com/API/Gateway/getIoTDevice/${deviceId}`;
    const params = {
      developerKey: process.env.DEVELOPER_KEY,
      dataType: 'json',
      client: 'web',
      jsonResponse: true,
      getFullData: true,
      daysOfHistory: 30,
      sessionKey: process.env.SESSION_KEY,
    };
    const response = await axios.get(url, { httpsAgent: agent,
      params });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching IoT device data for device ID ${deviceId}: ${error.message}`);
    throw error;
  }
};


const MindolifefetchAndTransformIoTDeviceDataById = async (req, res) => {
  try {
      // Assuming the device ID is passed as a URL parameter named 'deviceId'
      const deviceId = req.params.deviceId;

      // Fetch a single device by its ID. This requires a method in IoTDeviceModel that fetches a device by ID.
      const device = await fetchIoTDeviceDataById(deviceId);
      
      if (!device) {
        return res.status(404).json({ message: 'IoT device not found' });
      }

      const transformedDevice = {
        id: device.id,
        name: device.name,
        featureDetails: device.feature && device.feature['1.1'] ? {
          jsonResponse: "true",
          iotDeviceID: device.id.toString(),
          featureSetID: "1",
          featureID: "1",
          value: device.feature['1.1'].value ? JSON.stringify({ value: device.feature['1.1'].value }) : undefined
        } : undefined
      };

      res.json(transformedDevice);
    } catch (error) {
      console.error(`Error in controller: ${error.message}`);
      res.status(500).json({ message: `Internal server error: ${error.message}` });
    }
};

const changeFeatureState = async (deviceId, state, rasp_ip) => {

  // console.log(rasp_ip);
  const flaskAppUrl = `http://${rasp_ip}:5009/api-mindolife/change_feature_state`;
  try {
    const valueToPost = state ? 'on' : 'off'; // Prepare the value for the external API
    // Parameters sent in the request body for a POST request
    const response = await axios.post(flaskAppUrl, {
      deviceId: deviceId,
      state: state  // Here state is expected to be a boolean (true or false)
     });

    console.log("Response from Flask server:", response.data);
    if (response.status === 200) {
      console.log("Feature state changed successfully", response.data);
      const roomId = "38197016"; // Example roomId

      // Determine the string representation of the state
      // Update the device state in your local database for both Device and RoomDevice
      const updateResultDevice = await Device.updateOne(
        { device_id: deviceId }, // Use the correct property name as per your schema
        { $set: { state: valueToPost, lastUpdated: new Date() } }
      );
      const updateResultRoomDevice = await RoomDevice.updateOne(
        { room_id: roomId,device_id: deviceId }, // Use the correct property name as per your schema
        { $set: { state: valueToPost, lastUpdated: new Date() } }
      );
      console.log("Database update result:", updateResultDevice, updateResultRoomDevice);
      return { statusCode: 200, data: response.data };
    } else {
      throw new Error("Failed to change feature state via API.");
    }
  } catch (error) {
    console.error(`Error changing feature state for device ID ${deviceId}: ${error.message}`);
    throw error; // Rethrow the error to handle it outside this function or to inform the caller.
  }
};
// const changeFeatureState = async (deviceId, state) => {
//   const flaskAppUrl = 'http://10.100.102.14:5009/api-mindolife/change_feature_state';
//   try {
//       const response = await axios.post(flaskAppUrl, {
//           deviceId: deviceId,
//           state: state  // Here state is expected to be a boolean (true or false)
//       });

//       console.log("Response from Flask server:", response.data);
//       if (response.status === 200) {
//           console.log("Feature state changed successfully:", response.data);
//       } else {
//           console.log("Failed to change feature state via API. Response status:", response.status);
//       }
//   } catch (error) {
//       console.error("Error sending request to Flask server:", error.message);
//   }
// };
module.exports = {
    getAllGateways,
    getGatewayById,
    createGateway,
    updateGateway,
    deleteGateway,
    isGatewayLoggedIn,
    bindGateway,
    unbindGateway,
    getGatewayEndpoints,
    loginGateway,
    MindolifefetchAndTransformIoTDevicesData,
    MindolifefetchAndTransformIoTDeviceDataById,
    changeFeatureState
};
