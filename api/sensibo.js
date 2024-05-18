const { default: axios } = require("axios");
const Device = require("../models/Device");
const RoomDevice = require("../models/RoomDevice");
const { updateDeviceModeInDatabase } = require("../services/devices.service");
const { addingDataToCsv } = require("../utils/machineLearning.js");
const SensorValue = require("../models/SensorValue");
const { getSeasonNumberByMonth, discretizeHour } = require("../utils/utils");
const { SENSORS } = require("../consts/common.consts");
const { stubString } = require("lodash");


const test = 0;
const analyzeFunc = async (func) => {
  console.log("ANALYZE")
  try {
    const forPattern = /\b(for)\b/;
    const isWithDuration = forPattern.test(func);
    let durationString;
    let time, units, durationInMiliSeconds;
    if (isWithDuration) {
      durationString = func.split(" for ")[1];
      time = parseInt(durationString.substring(0, durationString.indexOf(" ")));
      units = durationString.split(" ")[1]; 
      if (units !== "minutes" && units !== "hours") {
        throw new Error("Units has to be minutes or hours");
      }
      durationInMiliSeconds =
        units === "minutes" ? time * 60 * 1000 : time * 60 * 60 * 1000;
    }

    let response;
    const state = func.split(" ")[1];

    if (state !== "on" && state !== "off") {
      throw new Error("Invalid state");
    }
    const boolState = state === "on";
    const numberPattern = /\d+/g;
    const matches = func.match(numberPattern);
    let degrees = null;
    if (
      matches &&
      (matches.length > 1 || (matches.length > 0 && !isWithDuration))
    ) {
      degrees = matches[0];
    }
    if (degrees) {
      // const degrees = matches[0];
      if (degrees > 30 || degrees < 16) {
        throw new Error("Degrees has to be between 16 and 30");
      }
      response = await switchAcState(boolState, parseInt(degrees));
    } else {
      response = await switchAcState(boolState);
    }
    if (isWithDuration) {
      //turn ac off after a duration
      setTimeout(async () => {
        response = await switchAcState(false);
      }, durationInMiliSeconds)
    }
    return response;
  } catch (err) {
    return { statusCode: 403, data: err.message };
  }
};

// const validateDegree = (degree) => {
//   if (degree > 30 || degree < 16) {
//     return false;
//   }
//   return true;
// };


// const switchAcState = async (state, temperature = null) => {
//   console.log("SWITCH AC")
//   try {
//     if (!temperature || validateDegree(temperature)) {
//       // const response = await axios.post(
//       //   `https://home.sensibo.com/api/v2/pods/${process.env.SENSIBO_DEVICE_ID}/acStates?apiKey=${process.env.SENSIBO_API_KEY}`,
//       //   {
//       //     acState: {
//       //       on: state,
//       //       targetTemperature: temperature,
//       //     },
//       //   }
//       // );
//       await Device.updateOne(
//         { device_id: "9EimtVDZ" },
//         { state: state ? "on" : "off" }
//       );
//       console.log("AC ON")
//       console.log("-----------Adding data to csv---------------");
//       // await addingDataToCsv()
//       return { statusCode: 200, data: response.data.result };
//     } else {
//       throw new Error("Temperature has to be between 16 and 30");
//     }
//   } catch (err) {
//     // console.log(err).message;
//     return { statusCode: 403, data: err.message };
//   }
// };


// const getAcState = async () => {
//   try {
//     const response = await axios.get(
//       `https://home.sensibo.com/api/v2/pods/${process.env.SENSIBO_DEVICE_ID}/acStates?apiKey=${process.env.SENSIBO_API_KEY}`
//     );
//       // Use .find() to get the first success result
//       const successResults = response.data.result.filter((entry) => entry.status === 'Success');
//       const state = successResults.find((entry) => entry.acState.on && entry.acState.mode).acState;
//       console.log("First Success Result:", state);
//       console.log("results: ",successResults);
//       return state; 
//   } catch (err) {
//     // Log the error response if the API call fails
//     console.error("Error retrieving AC state:", err.response ? err.response.data : err.message);
//     return null; // Return null or a default state object
//   }
// };

// --------------------15.4.24--------------------------------------------
// const  getAcState = async () => {
//   try {
//     const response = await axios.get(
//       `https://home.sensibo.com/api/v2/pods/${process.env.SENSIBO_DEVICE_ID}/acStates?apiKey=${process.env.SENSIBO_API_KEY}&limit=1`
//     );

//     // Debug log to see the full structure of the response data
//     console.log("AC State Retrieved:", response.data);

//     // Ensure to correctly navigate through the response structure
//     // The actual path to the state might differ; adjust according to the actual API response
//     if (response.data && response.data.result && response.data.result.length > 0) {
//       const state = response.data.result[0].acState; // Adjust if the path differs
//       return state;
//     } else {
//       console.log("No AC state found in the response");
//       return null; // Consider returning a default state or null if no state is found
//     }
//   } catch (err) {
//     console.error("Error retrieving AC state:", err.response ? err.response.data : err.message);
//     return null; // Return null or a default state object in case of an error
//   }
// };

const getAcState = async (rasp_ip, device_id) => {
    if (!rasp_ip || !/^(\d{1,3}\.){3}\d{1,3}$/.test(rasp_ip)) {
        console.error("Invalid IP address provided:", rasp_ip);
        return res.status(400).json({ error: "Invalid IP address" });
    }
    console.log("Requesting AC state for IP:", rasp_ip);
    try {
        const flaskUrl = `http://${rasp_ip}:5009/api-sensibo/get_ac_state`;

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


// const getAcState = async () => {

//   try {
//     const response = await axios.get(
//       `https://home.sensibo.com/api/v2/pods/${process.env.SENSIBO_DEVICE_ID}/measurements?apiKey=${process.env.SENSIBO_API_KEY}`
//     );
//     console.log("AC State Retrieved:", response.data);
//     // Assuming 'result' is an array and we want the first item
//     const measurements = response.data.result[0];
//     const temperature = measurements.temperature;
//     const humidity = measurements.humidity;
//     // Add other properties as needed

//     return { temperature, humidity }; // Return an object with the temperature and humidity
//   } catch (err) {
//     console.error("Error retrieving AC state:", err.response ? err.response.data : err.message);
//     return null;
//   }
// };
const validateDegree = (temperature) => {
  return temperature >= 16 && temperature <= 30;
};

// const switchAcState = async (deviceId, state, temperature = null) => {
//   // Define the actual device ID and API key based on the provided device ID
//   const actualDeviceId = deviceId === "YNahUQcM" ? "YNahUQcM" : process.env.SENSIBO_DEVICE_ID;
//   const actualApiKey = deviceId === "YNahUQcM" ? "VqP5EIaNb3MrI62s19pYpbIX5zdClO" : process.env.SENSIBO_API_KEY;

//   console.log("Attempting to switch AC state:", state, "with temperature:", temperature);

//   try {
//     // Validate the temperature if it's provided
//     if (temperature === null || validateDegree(temperature)) {
//       // Send the request to the Sensibo API
//       const response = await axios.post(
//         `https://home.sensibo.com/api/v2/pods/${actualDeviceId}/acStates?apiKey=${actualApiKey}`,
//         { acState: { on: state, targetTemperature: temperature } }
//       );

//       // Check the response status
//       if (response.data.status === 'Success') {
//         try {
//           // Update the device state in your local database
//           const updateResult = await Device.updateOne(
//             { device_id: actualDeviceId },
//             { $set: { state: state ? "on" : "off" } }
//           );
//           console.log("AC state changed:", response.data);
//           console.log("Database update result:", updateResult);
//           return { statusCode: 200, data: response.data.result };
//         } catch (dbError) {
//           // Handle any errors that occur during the database update
//           console.error("Database update error:", dbError);
//           throw dbError; // Rethrow the error to be caught by the outer catch block
//         }
//       } else {
//         // Handle the case where the API call did not return a 'Success' status
//         throw new Error("Failed to update AC state via API.");
//       }
//     } else {
//       // Handle invalid temperature values
//       throw new Error("Temperature has to be between 16 and 30 degrees.");
//     }
//   } catch (err) {
//     // Catch any errors from the API call or database update
//     console.error("Error switching AC state:", err);
//     return { statusCode: err.response?.status || 500, data: err.message };
//   }
// };
  const TurnON_OFF_LIGHT = async (state, rasp_ip, id)=> {
    const endpoint = `http://${rasp_ip}:5009/${state}`; // Construct the endpoint URL
  
    try {
      const response = await axios.post(endpoint); // Make a GET request to the endpoint
      console.log(response.data); // Log the response data
      return response.data; // Return the response data if needed
    } catch (error) {
      console.error('Error turning on/off light:', error);
      throw error; // Throw the error to handle it in the calling function if needed
    }
    
  };
const switchAcState = async (id, state, rasp_ip, temperature = null) => {
  // console.log(rasp_ip);
  const apiUrl = `http://${rasp_ip}:5009/api-sensibo/switch_ac_state`; // Ensure this matches your Flask server URL
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
          $set: { 
            state: state ? "on" : "off", // Update state field
            // mode: { on: state, targetTemperature: temperature, mode: "cool" }, // Update mode field as a document
            lastUpdated: new Date() // Optional: track when the update was made
          } 
        }// Also consider adding a timestamp for the last update
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
      console.log("Database update result:", updateResult,updateResultRoomDevices);

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


const getSensiboSensors = async () => {
  try {
    const flaskUrl = `http://10.100.102.14:5009/api-sensibo/get_sensor_data`; 

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
    console.error("Error fetching sensor data from Flask or :", err.message);
    return null; // Return null to indicate failure
  }
};

const parseSensorAndWriteToMongo = async () => {
  try {
    // Fetch the current temperature and humidity values
    const response = await getSensiboSensors();
    const data = response.data.result[0];
    const { temperature, humidity } = data;

    // console.log({temperature})
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

    // TODO make sure soil will write to database!!!!
    // const currentSoil = getLatestSoilMoisture();
    // const timeOfTheDayValue = `VAR Soil=${timeOfTheDay}`;
    // const timeDocument = new SensorValue({
    //   value: Soil,
    //   sensor_type: "hour",
    // });

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
  // console.log(rasp_ip);
  try {
    const response = await axios.post(`http://${rasp_ip}:5009/api-sensibo/update_mode`, {
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
  analyzeFunc,
  updateAcMode,
  updateSensiboMode,
  TurnON_OFF_LIGHT
};
