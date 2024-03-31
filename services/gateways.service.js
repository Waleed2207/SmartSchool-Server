const MindolifeAPIClient = require('../api/MindolifeAPIClient'); // Adjust the path as necessary
const { generateWuertStringBaseParams } = require('../api/MindolifeAPIUtils'); // Assuming this utility is available for handling query strings
const { analyzeResults } = require('../api/MindolifeAPIUtils');
const unbindGatewayServiceName = 'Session/unbindGateway'; // Adjust based on your API's endpoint
const getGatewayEndpointsServiceName = "v1/Gateway/getEndpoints"; // Adjust based on your API's actual endpoint
const loginGatewayServiceName = 'v2/User/login'; // Adjust this endpoint as needed
const getDevicesServiceName = 'v1/Gateway/getDevices'; // Adjust based on your API's actual endpoint

/**
 * Fetches the devices associated with a specific gateway.
 * 
 * @param {String} gatewayId - The ID of the gateway whose devices are being fetched.
 * @param {String} userSessionKey - The session key for the authenticated user, for authorization.
 * @returns {Promise} - A promise that resolves with the devices associated with the gateway.
 */
async function getDevices(gatewayId) {
  try {
      // Define the base URL and the required query parameters
      const baseURL = 'https://api.mindolife.com/API/Gateway/getIoTDevices';
      const developerKey = 'dec4695bf4450e3a4e0aa2b3f92929b631055ee78b77c5da59d434dee088f1cc';
      const dataType = 'json';
      const client = 'web';
      const jsonResponse = true;
      const getFullData = true;
      const daysOfHistory = 30;
      const sessionKey = '3c387806e55743f337bd915199ea7a8a426f617414ebdd8e736f2d969bb7350a3b14aafb3542940d865eaf72046ef99e78a28e7a1f4dc4eed1490380ed7d391677413bf666ba5ee7f1695dff2f5c692997d99b99765a43ed70c2125253d0aa3b5efe849bf4bafb67f45083f1a1bba0c5d8fef74415fddd9c1030a15e3e2ca689';

      // Construct the full request URL with query parameters
      const url = `${baseURL}?developerKey=${encodeURIComponent(developerKey)}&dataType=${encodeURIComponent(dataType)}&client=${encodeURIComponent(client)}&jsonResponse=${jsonResponse}&getFullData=${getFullData}&daysOfHistory=${daysOfHistory}&sessionKey=${encodeURIComponent(sessionKey)}&gatewayId=${encodeURIComponent(gatewayId)}`;
      console.log(url);

      // Make a GET request to fetch devices
      const response = await MindolifeAPIClient.get(url);

      // Check if the request was successful
      if (response.data && response.data.error) {
          throw new Error(response.data.error);
      }
      console.log(response);
      // Return the devices fetched from the API
      return response.data;
  } catch (error) {
      // If an error occurs, throw it for the caller to handle
      throw new Error(`Failed to fetch devices: ${error.message}`);
  }
}

/**
 * Attempts to log in to a gateway and updates the session key upon success.
 * 
 * @param {string} username - The username for login.
 * @param {string} password - The password for login.
 * @param {string} sessionKey - The session key to be used for subsequent requests.
 * @param {Object} gateway - The gateway object to update with the session key.
 * @returns {Promise<boolean>} - A promise that resolves to true if login is successful, false otherwise.
 */
async function loginGateway(username, password, sessionKey, gateway) {
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
}
/**
 * Fetches the endpoints for a specific gateway.
 * 
 * @param {String} gatewayId - The ID of the gateway whose endpoints are being fetched.
 * @param {String} userSessionKey= - The session key for the authenticated user, for authorization.
 * @returns {Promise} - A promise that resolves with the gateway endpoints.
 */

userSessionKey= '3c387806e55743f337bd915199ea7a8a426f617414ebdd8e736f2d969bb7350a3b14aafb3542940d865eaf72046ef99e78a28e7a1f4dc4eed1490380ed7d391677413bf666ba5ee7f1695dff2f5c692997d99b99765a43ed70c2125253d0aa3b5efe849bf4bafb67f45083f1a1bba0c5d8fef74415fddd9c1030a15e3e2ca689'
async function getGatewayEndpoints(gatewayId, userSessionKey) {
  try {
      // Assuming getGatewayEndpointsServiceName is a variable that contains the base URL/service name
      const url = `${getGatewayEndpointsServiceName}?gatewayId=${encodeURIComponent(gatewayId)}`;
      console.log(url);

      // It seems getAuthorized method should properly handle the authorization process, including headers.
      // Therefore, we only pass the URL. Ensure getAuthorized is implemented to use the userSessionKey for authorization.
      const response = await MindolifeAPIClient.getAuthorized(url, userSessionKey);

      // Assuming response structure has .data that contains the actual response body you're interested in.
      // Adjust logging and response handling based on actual structure and requirements.
      console.log('Full response:', response);
      if (response.data) {
          console.log('Gateway endpoints fetched successfully:', response.data);
      } else {
          console.log('Response data is undefined. Response object:', response);
      }
  } catch (error) {
      console.error('Failed to fetch gateway endpoints:', error);
      throw error; // Rethrow or handle as needed for the caller to catch
  }
}

/**
 * Unbinds a gateway from the current user's account.
 * 
 * @param {String} gatewayId - The ID of the gateway to be unbound.
 * @param {String} userSessionKey - The session key for the authenticated user.
 * @returns {Promise} - A promise that resolves with the result of the unbind operation.
 */
async function unbindGateway(gatewayId, userSessionKey) {
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
  }
/**
 * Binds a gateway to the current user's account.
 * 
 * @param {Object} gateway - The gateway object containing necessary information.
 * @param {String} userSessionKey - The session key for the authenticated user.
 * @returns {Promise} - A promise that resolves with the result of the bind operation.
 */
async function bindGateway(gateway, userSessionKey) {
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
}

// Assuming MindolifeAPIClient is a configured Axios instance or similar
// If it's not used, you might want to remove it to clean up your code
// const MindolifeAPIClient = require('./MindolifeAPIClient');

async function isGatewayLoggedIn(gateway) {
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
}

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
    getDevices,
};
