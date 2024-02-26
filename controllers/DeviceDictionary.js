/*
const { devicescontrollers } = require("./devicesController");

// Define DeviceDictionary as an object with methods
const DeviceDictionary = {
  async function fetchDevicesAndProcessRules() 
{
  try {
    // Create a mock `res` object with a json method to capture the response
    const mockRes = {
      json: (data) => data,
      status: function (statusCode) {
        this.statusCode = statusCode;
        // Return this to allow chaining with .json
        return this; 
      }
    };

    // Call the getDevices method with a mock `req` and the mock `res`
    const devices = await devicesController.devicescontrollers.getDevices({}, mockRes);
    console.log(devices);
    
    const deviceDictionary = devices.reduce((dict, device) => {
      dict[device.device_id] = device.name;
      return dict;
    }, {});
    console.log(deviceDictionary);
    // At this point, devices should contain the response data you would send in an Express app
    
    // Process the devices as needed
  } catch (error) {
    console.error('Failed to get devices:', error);
  }
}
}

module.exports = DeviceDictionary;

*/