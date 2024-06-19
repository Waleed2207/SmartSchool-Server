const { default: axios } = require("axios");
const Device = require("../models/Device");
const RoomDevice = require("../models/RoomDevice");
const { updateDeviceModeInDatabase } = require("../services/devices.service");
const { addingDataToCsv } = require("../utils/machineLearning.js");
const SensorValue = require("../models/SensorValue");
const { getSeasonNumberByMonth, discretizeHour } = require("../utils/utils");
const { SENSORS } = require("../consts/common.consts");
const { stubString } = require("lodash");
const fs = require('fs').promises;
const path = require('path');

const loadConfig = async () => {
  try {
    const filePath = path.resolve(__dirname, './endpoint/rasp_pi.json');
    console.log(filePath);
    console.log(`Loading configuration from: ${filePath}`);

    // Check if the file exists
    try {
      await fs.access(filePath);
    } catch (err) {
      throw new Error(`Configuration file does not exist at: ${filePath}`);
    }

    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    throw new Error(`Error loading configuration: ${err.message}`);
  }
};

const validateDegree = (temperature) => {
  return temperature >= 16 && temperature <= 30;
};


const getAcState = async (rasp_ip, device_id) => {
  const config = await loadConfig();

  // Search for the IP address in the cached JSON data
  const ngrokUrl = config[rasp_ip];

  if (!ngrokUrl) {
    throw new Error(`IP address ${rasp_ip} not found in the configuration file`);
  }

  const endpoint = `${ngrokUrl}`;

  console.log("Requesting AC state for IP:", rasp_ip);
  try {
    const flaskUrl = `${endpoint}/api-sensibo/get_ac_state`;

    // Send a GET request to the Flask app
    const response = await axios.get(flaskUrl);
    console.log("AC State Retrieved from Flask:", response.data);

    if (response.data && response.data.success) {
      return response.data.acState; // Accessing the AC state returned by the Flask app
    } else {
      console.log("No AC state found in the response from Flask");
      return null; // Consider returning a default state or null if no state is found
    }
  } catch (err) {
    // Handle errors in the request to the Flask app
    console.error("Error retrieving AC state from Flask:", err.response ? err.response.data : err.message);
    return null; // Return null or a default state object in case of an error
  }
};

const TurnON_OFF_LIGHT = async (state, rasp_ip, id, Control) => {
  try {
    console.log(Control);
    const config = await loadConfig();

    // Search for the IP address in the cached JSON data
    const ngrokUrl = config[rasp_ip];

    if (!ngrokUrl) {
      throw new Error(`IP address ${rasp_ip} not found in the configuration file`);
    }
    const endpoint = `${ngrokUrl}/${state}`; // Construct the endpoint URL

    // Make a POST request to the endpoint
    const response = await axios.post(endpoint, { Control });
    console.log(response.data); // Log the response data
    return response.data; // Return the response data if needed
  } catch (error) {
    console.error('Error turning on/off light:', error);
    throw error; // Throw the error to handle it in the calling function if needed
  }
};

const switchAcState = async (id, state, rasp_ip, temperature = null) => {
  const config = await loadConfig();

  // Search for the IP address in the cached JSON data
  const ngrokUrl = config[rasp_ip];

  if (!ngrokUrl) {
    throw new Error(`IP address ${rasp_ip} not found in the configuration file`);
  }

  const endpoint = `${ngrokUrl}`;
  console.log(endpoint);
  const apiUrl = `${endpoint}/api-sensibo/switch_ac_state`; // Ensure this matches your Flask server URL
  console.log(id);
  const actualDeviceId = id === "YNahUQcM" ? "YNahUQcM" : process.env.SENSIBO_DEVICE_ID;
  const actualApiKey = id === "YNahUQcM" ? "sS94OndxNNoKiBXwLU59Y08r27fyHW" : process.env.SENSIBO_API_KEY;

  // Construct the payload including the actualDeviceId and actualApiKey
  const payload = {
    id: actualDeviceId,
    apiKey: actualApiKey,
    state: state,
    temperature: temperature
  };
  console.log(payload);

  console.log("Attempting to switch AC state:", state, "with temperature:", temperature);

  try {
    // Validate the temperature if it's not null
    if (temperature !== null && !validateDegree(temperature)) {
      throw new Error("Temperature has to be between 16 and 30");
    }
    const response = await axios.post(apiUrl, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    // Check if the API call was successful
    if (response.status === 200) {
      console.log("AC state changed successfully", response.data);

      // Update the device state in your local database
      const updateResult = await Device.updateOne(
        { 
          device_id: actualDeviceId // Use device_id to find the document
        }, 
        { 
          $set: { 
            state: state ? "on" : "off", // Update state field
            lastUpdated: new Date() // Optional: track when the update was made
          } 
        }
      );
      const updateResultRoomDevices = await RoomDevice.updateOne(
        { device_id: actualDeviceId }, // Use device_id to find the document
        { 
          $set: { 
            state: state ? "on" : "off", // Update state field
            lastUpdated: new Date() // Optional: track when the update was made
          } 
        }
      );
      console.log("Database update result:", updateResult, updateResultRoomDevices);

      return { statusCode: 200, data: response.data }; // Adjust according to your data handling needs
    } else {
      throw new Error("Failed to update AC state via API.");
    }
  } catch (err) {
    const statusCode = err.response?.status || 500;
    let errorMessage = err.message;
    let detailedError = {};

    if (err.response && err.response.data) {
      errorMessage = `Error switching AC state: ${err.response.statusText}`;
      detailedError = err.response.data; // Assuming Sensibo API error details are in data

      // Log detailed error message if available
      console.error("Detailed Sensibo API error:", detailedError);
    }

    console.error(errorMessage);
    return { statusCode, data: detailedError };
  }
};

const getSensiboSensors = async (raspPiIP) => {
  try {
    const config = await loadConfig();

    // Search for the IP address in the cached JSON data
    const ngrokUrl = config[raspPiIP];

    if (!ngrokUrl) {
      throw new Error(`IP address ${raspPiIP} not found in the configuration file`);
    }

    const endpoint = `${ngrokUrl}`;
    const flaskUrl = `${endpoint}/api-sensibo/get_sensor_data`;
    console.log(flaskUrl);
    // Send a GET request to the Flask app
    const response = await axios.get(flaskUrl);

    // Check if the response has the necessary fields
    if (response.data && response.data.success) {
      const { temperature, humidity } = response.data;
      return { temperature, humidity };
    } else {
      console.log('No measurements found.');
      return null; // Return null to indicate no data found
    }
  } catch (err) {
    console.error("Error fetching sensor data from Flask:", err.message);
    return null; // Return null to indicate failure
  }
};

const parseSensorAndWriteToMongo = async () => {
  try {
    // Fetch the current temperature and humidity values
    const response = await getSensiboSensors();
    if (!response) {
      throw new Error("No sensor data available");
    }
    const { temperature, humidity } = response;

    const temperatureValue = `VAR temperature=${temperature.toFixed(1)}`;
    const humidityValue = `VAR humidity=${humidity.toFixed(1)}`;
    const temperatureDocument = new SensorValue({
      value: temperatureValue,
      sensor_type: SENSORS.TEMPERATURE,
    });
    const humidityDocument = new SensorValue({
      value: humidityValue,
      sensor_type: SENSORS.HUMIDITY,
    });

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // January is month 0, so we add 1 to get the correct month number
    const season = getSeasonNumberByMonth(currentMonth);

    const seasonValue = `VAR season=${season}`;
    const seasonDocument = new SensorValue({
      value: seasonValue,
      sensor_type: SENSORS.SEASON,
    });

    const currentHour = currentDate.getHours();
    let timeOfTheDay = discretizeHour(currentHour);
    const timeOfTheDayValue = `VAR hour=${timeOfTheDay}`;
    const timeDocument = new SensorValue({
      value: timeOfTheDayValue,
      sensor_type: SENSORS.HOUR,
    });

    await Promise.all([temperatureDocument.save(), humidityDocument.save(), seasonDocument.save(), timeDocument.save()]);

    console.log(`Temperature: ${temperature} Humidity: ${humidity} saved to database.`);
  } catch (error) {
    console.error(error);
  }
};

const updateAcMode = async (mode) => {
  try {
    const response = await axios.patch(
      `https://home.sensibo.com/api/v2/pods/${process.env.SENSIBO_DEVICE_ID}/acStates?apiKey=${process.env.SENSIBO_API_KEY}`,
      {
        acState: {
          on: true,
          mode: mode,
        },
      }
    );
    return { statusCode: 200, data: response.data.result };
  } catch (err) {
    return { statusCode: 403, data: err.message };
  }
};

const updateSensiboMode = async (deviceId, mode, rasp_ip) => {
  const config = await loadConfig();

  // Search for the IP address in the cached JSON data
  const ngrokUrl = config[rasp_ip];

  if (!ngrokUrl) {
    throw new Error(`IP address ${rasp_ip} not found in the configuration file`);
  }

  const endpoint = `${ngrokUrl}`;
  try {
    const response = await axios.post(`${endpoint}/api-sensibo/update_mode`, {
      deviceId: deviceId,
      mode: mode
    });

    if (response.data.success) {
      const updateDB = await updateDeviceModeInDatabase(deviceId, mode);  // Your existing function to update the DB
      return { success: true, data: response.data };
    } else {
      return { success: false, message: "Failed to update mode via API" };
    }

  } catch (error) {
    console.error("Error updating Sensibo mode:", error);
    return { success: false, message: "Error updating mode" };
  }
};

module.exports = {
  switchAcState,
  getAcState,
  getSensiboSensors,
  parseSensorAndWriteToMongo,
  // analyzeFunc,
  updateAcMode,
  updateSensiboMode,
  TurnON_OFF_LIGHT
};
