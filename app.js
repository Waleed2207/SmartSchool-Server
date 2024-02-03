require("dotenv").config();
const getClientDetails = require("./api/smartThings.js");
const { getLaundryDetails } = require("./api/smartThings.js");
const express = require("express");
const connectDB = require("./config");
const {
  switchAcState,
  getAcState,
  getSensiboSensors,
  parseSensorAndWriteToMongo,
  updateAcMode,
  updateSensiboMode,
  analyzeFunc,
} = require("./api/sensibo.js");
const cors = require("cors");
const { homeConnectAuth, homeConnectToken } = require("./api/homeConnect.js");
const {
  smartThingsGetDevices,
  switchWasherWater,
} = require("./api/smartThings.js");
const { checkforUserDistance } = require("./api/location.js");
const {
  removeSensorValueByType,
  getFunctionsFromDB,
  getHeaterState,
  activateDevices,
  ML_DEVICES,
} = require("./utils/common.js");
const {
  insertRuleToDB,
  getAllRules,
  updateRule,
  deleteRuleById,
  checkIfRuleIsAlreadyExists,
  operatorFormatter,
  validateRule,
  insertRuleToDBMiddleware,
  removeAllRules,
  removeRuleFromDB,
} = require("./services/rules.service.js");
const { switchHeaterState } = require("./api/heaterController.js");

const {
  getSuggestions,
  addSuggestionsToDatabase,
  updateSuggestions,
  addSuggestionMenually,
  deleteSuggestion,
} = require("./services/suggestions.service.js");
const {
  getDevices,
  updateDeviceModeInDatabase,
  getDeviceByName,
  addDeviceToRoom,
  getDevicesByRoomId,
  getRoomDevices,
  setRoomDeviceState,
  createNewDevice,
  getRoomDevicesTest,
  getRoomsByDeviceName,
} = require("./services/devices.service.js");
const {
  callBayesianScript,
  runBayesianScript,
  addingDataToCsv,
} = require("./utils/machineLearning.js");
const { getCurrentSeasonAndHour } = require("./services/time.service.js");
const { signInUser, registerUser } = require("./services/users.service.js");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const schedule = require("node-schedule");
const { toggleLaundry } = require("./api/smartThings.js");
const { connectToWs } = require("./ws.js");
const { getLatestSensorValues, removeAllSensorValues } = require("./services/sensorValues.service.js");
const { detectMotion } = require("./services/motion.service.js");
const { response } = require("express");
const Device = require("./models/Device.js");
const { getRooms, getRoomById, getRoomIdByRoomName } = require("./services/rooms.service.js");
const _ = require("lodash");
const { sendEmail } = require("./utils/nodeMailer.js");
const { getSensors } = require("./services/sensors.service.js");
require("dotenv").config();
const server = express();
const port = process.env.PORT || 3000;
server.use(express.json());
server.use(cors({ origin: true }));
const cron = require("node-cron");
const { simulateMotionSensor } = require("./services/motion.service.js");
const { controlLED } = require("./services/mqtt.service.js");
const mqttService = require("./services/mqtt.service.js");
const { Server } = require("ws");





// Connect to MongoDB
connectDB();

connectToWs();


//simulateMotionSensor();
// Simulate motion sensor every minute
// setInterval(simulateMotionSensor, 70 * 1000); // 60 * 1000 milliseconds = 1 minute

//Handle get requests
server.get("/", function (req, res) {
  res.json({ message: `Welcome to SmartSchool server` });
});

/* Handle POST requests */
server.post("/", function (req, res, next) {
  smartapp.handleHttpCallback(req, res);
});


// --------------------------------- Sign up----------------------------------
server.post("/register", async (req, res) => {
  const { fullName, email, password, role } = req.body;
  const response = await registerUser(fullName, email, password, role);
  res.status(response.status).json({ message: response.message });
});

// --------------------------------- Sign in ---------------------------------

server.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const response = await signInUser(email, password);

  if (response.status === 200) {
    res.status(200).json({
      message: response.message,
      token: response.token,
      user: response.user,
    });
  } else {
    res.status(response.status).json({ message: response.message });
  }
});
// --------------------------------- Notify Admin ---------------------------------

server.post("/notifyadmin", async (req, res) => {
  try {
    const { subject, text } = req.body;
    console.log("notifyadmin email");
    console.log(req.body);
    await sendEmail(subject, text);
    res.status(200).send({ message: "Email sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Failed to send email" });
  }
});

// --------------------------------- user roles ---------------------------------

server.get("/user-role", (req, res) => {
  res.json({ role: "admin" }); 
});

//-------------------------------- motion-detected by Raspberry Pi --------------------------------
server.post('/motion-detected', (req, res) => {
  try {
    // Check if the request body is present
    if (!req.body) {
      throw new Error('No request body found');
    }

    // Extracting the state from the request body
    const lightState = req.body.state;

    // Logging the received state
    console.log('Received request to turn', lightState);

    // Validate the received state
    if (lightState !== 'on' && lightState !== 'off') {
      throw new Error(`Invalid light state: ${lightState}`);
    }

    // Simulate light control logic here or perform actual actions
    console.log(`Simulated light turned ${lightState}`);

    // Responding to the Flask server
    res.status(200).send(`Light turned ${lightState}, request received successfully`);
  } catch (error) {
    // Log the error and send an appropriate response
    console.error('Error:', error.message);
    res.status(500).send(`Server error: ${error.message}`);
  }
});







// --------------------------------- Sensors ---------------------------------
server.get("/sensors", async (req, res) => {
  try {
    const sensors = await getSensors();
    if (sensors) {
      res.json(sensors);
    } else {
      res.status(500).json({ message: "Could not retrieve sensors." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});

// --------------------------------- Rules ---------------------------------
server.get("/rules", async (req, res) => {
  const response = await getAllRules();
  res.status(response.statusCode).json(response.data);
});

// Define the route for adding a new rule
server.post("/rules", async (req, res) => {
  const { rule, isStrict = false } = req.body;
  console.log({ rule, isStrict });
  const response = await insertRuleToDBMiddleware(rule, isStrict);
  res.status(response.statusCode).send(response.message);
});

server.post("/rules/:id", async (req, res) => {
  const updateFields = { ...req.body }; // Includes isActive and any other fields
  const id = req.params.id;
  const response = await updateRule(id, updateFields);
  return res.status(response.statusCode).send(response.message);
});

server.delete("/rules/:id", async (req, res) => {
  const id = req.params.id;
  try {
    // Assuming you have a function to delete the rule by its ID
    const response = await deleteRuleById(id);

    if (response.status === 200) {
      res.status(200).json({ message: "Rule deleted successfully" });
    } else {
      res.status(400).json({ message: "Error deleting the rule" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// --------------------------------- MQTT endpoints ---------------------------------
server.post('/led-control', function (req, res) {
  const { color, state } = req.body;

  if (!color || !state) {
    return res.status(400).json({ error: 'Missing color or state' });
  }

  controlLED(color, state);

  res.json({ message: 'LED control message sent' });
});

server.get('/soilMoisture', function (req, res) {

  const latestSoilMoisture = mqttService.getLatestSoilMoisture();
  if (latestSoilMoisture !== null) {
    res.json({ soilMoisture: latestSoilMoisture });
  } else {
    res.status(404).json({ error: 'No soil moisture data available' });
  }
});

server.post('/pump', function (req, res) {
  // Extract the state and duration from the request body
  const { state, duration = 0.05 } = req.body;

  // Convert duration from minutes to milliseconds
  const durationInMilliseconds = duration * 60 * 1000;

  // Start the pump
  if (state === 'ON') {
    mqttService.controlPump('ON');
    setTimeout(() => mqttService.controlPump('OFF'), durationInMilliseconds); // Stop the pump after the specified duration
    res.json({ message: 'Pump operation started' });
  } else {
    res.status(400).json({ error: 'Invalid state' });
  }
});



// --------------------------------- SmartThings- Laundry ---------------------------------

//Handle get requests
server.get("/smartthings", async (req, res) => {
  const response = await smartThingsGetDevices();
  res.json({ message: `Welcome to smartthings details` });
});

server.get("/laundry/details/", async (req, res) => {
  try {
    const details = await getLaundryDetails();
    res.json(details);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get laundry details" });
  }
});

server.post("/smartthings/toggle", function (req, res) {
  const newState = req.body.state;
  const deviceId = req.body.deviceId;
  toggleLaundry(newState, deviceId)
    .then(() => res.json({ statusCode: 200, message: "Toggled successfully" }))
    .catch((err) =>
      res.status(500).json({
        statusCode: 500,
        message: "Failed to toggle",
        error: err.message,
      })
    );
});

server.get("/laundry/details", async (req, res) => {
  try {
    const details = await getLaundryDetails();
    if (details) {
      res.json({
        statusCode: 200,
        message: "Laundry details fetched successfully",
        details,
      });
    } else {
      res
        .status(500)
        .json({ statusCode: 500, message: "Failed to fetch laundry details" });
    }
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: "Failed to fetch laundry details",
      error: error.message,
    });
  }
});

server.post("/laundry/update", async (req, res) => {
  const { deviceId, temperature, rinse, spin } = req.body;

  try {
    const updatedDevice = await Device.findOneAndUpdate(
      { device_id: deviceId },
      {
        "details.temperature": temperature,
        "details.rinse": rinse,
        "details.spin": spin,
      },
      { new: true }
    );
    res.json({
      statusCode: 200,
      message: "Updated successfully",
      device: updatedDevice,
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: "Failed to update",
      error: error.message,
    });
  }
});

server.get("/homeConnect", (req, res) => {
  homeConnectAuth();
  res.json({ message: "Welcome to Home Connect" });
});

server.get("/homeConnect/callback", (req, res) => {
  // console.log("callback", req.query)
  homeConnectToken(req, res);
  res.json({ message: "token" });
});

server.post("/laundry/update", async (req, res) => {
  const { deviceId, temperature, rinse, spin } = req.body;

  try {
    const updatedDevice = await Device.findOneAndUpdate(
      { device_id: deviceId },
      {
        "details.temperature": temperature,
        "details.rinse": rinse,
        "details.spin": spin,
      },
      { new: true }
    );

    // Update the SmartThings API here
    await switchWasherWater(deviceId, true); // You may need to modify this call based on the changes you want to make to the SmartThings API

    res.json({
      statusCode: 200,
      message: "Updated successfully",
      device: updatedDevice,
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: "Failed to update",
      error: error.message,
    });
  }
});

// --------------------------------- Sensibo- AC ---------------------------------

server.post("/sensibo", async (req, res) => {
  try {
    console.log("-----------sensibo---------------");

    const state = req.body.state;
    const temperature = req.body.temperature || null;
    await switchAcState(state, temperature);
    res.json({ statusCode: 200 });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

// server.get("/sensibo", async (req, res) => {
//   const state = await getAcState();
//   res.json({ state });
// });
server.get('/sensibo', async (req, res) => {
  try {
    const state = await getAcState(); // Your existing server-side function
    res.json(state);
  } catch (error) {
    res.status(500).send('Unable to fetch AC state');
  }
});

server.get("/temperature", async (req, res) => {
  const response = await getSensiboSensors();
  res.json(response.data.result);
});

// server.post("/sensibo/mode", async (req, res) => {
//   try {
//     const mode = req.body.mode;
//     await updateAcMode(mode);
//     res.json({ statusCode: 200 });
//   } catch (err) {
//     return res.status(400).json({ message: err.message });
//   }

// });

server.post("/sensibo/mode", async (req, res) => {
  const { deviceId, mode } = req.body;
  const result = await updateSensiboMode(deviceId, mode);

  if (_.get(result, "success", false)) {
    res.status(200).json(result);
  } else {
    res.status(500).json(result);
  }
});
// ------------------Change by waleed sensibo ----------------

// --------------------------------- Tuya- Heater ---------------------------------

server.post("/heater", async (req, res) => {
  const { value } = req.body;
  const response = await switchHeaterqState(value);
  await addingDataToCsv();
  res.json({ response });
});

server.get("/smartthings/v2/devices", async (req, res) => {
  const deviceId = req.query.deviceId || "";
  const response = await smartThingsGetDevices(deviceId);
  res.json(response);
});

server.post("/smartthings/v2/switch", async (req, res) => {
  // const response = await switchWasherWater(req.body.state)
});

server.post("/smartthings/v2/devices/:deviceId/switch", async (req, res) => {
  const deviceId = req.url.split("/")[4];
  const status = req.body.status;
  const response = await switchWasherWater(deviceId, status);
  res.json(response.data);
});

// --------------------------------- Location ---------------------------------

server.post("/location", async (req, res) => {
  const { location, user } = req.body;
  const firstName = _.get(user, "fullName", '').split(' ')[0];
  const distance = await checkforUserDistance(location, firstName);
  res.json({ distance });
});
// --------------------------------- Devices ---------------------------------

server.get("/devices", async (req, res) => {
  const devices = await getDevices();
  return res.json(devices);
});

server.get("/devices_with_thresholds", async (req, res) => {
  const devices = await Device.find({}, { device_id: 1, threshold: 1, _id: 0 });
  return res.json(devices);
});

server.put("/devices/mode", async (req, res) => {
  const { deviceId, mode } = req.body;

  try {
    await updateDeviceModeInDatabase(deviceId, mode);
    res.status(200).json({ success: true });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error updating mode in the database" });
  }
});

server.get("/device/:name", async (req, res) => {
  const device = await getDeviceByName(req.params.name);
  return res.json(device);
});

server.post("/room-device", async (req, res) => {
  const { device_id, room_id, device_state } = req.body;
  const response = await addDeviceToRoom(device_id, room_id, device_state);
  return res.json(response);
});

server.get("/devices-by-room/:roomId", async (req, res) => {
  const roomId = req.params.roomId;
  const devices = await getDevicesByRoomId(roomId);
  return res.json(devices);
});

server.get("/room-devices/:roomId", async (req, res) => {
  const roomId = req.params.roomId;
  const devices = await getRoomDevicesTest(roomId);
  return res.json(devices);
});

server.get("/room-devices-test/:roomId", async (req, res) => {
  const roomId = req.params.roomId;
  const devices = await getRoomDevicesTest(roomId);
  return res.json(devices);
});

server.put("/room-devices", async (req, res) => {
  try {
    const { state, id } = req.body;
    //const response = await setRoomDeviceState(id, state);
    const response = await setRoomDeviceState(id, state);

    if (response.statusCode !== 200) {
      throw new Error(response.message);
    }
    res.send(response);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

server.post("/devices", async (req, res) => {
  try {
    const { device, room_id } = req.body;
    const response = await createNewDevice(device, room_id);
    return res.status(200).send(response.data);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

// --------------------------------- Machine Learnign-Recoomnadations ---------------------------------
server.get("/update_data", async (req, res) => {
  try {
    const adding_res = await addingDataToCsv();
    res.status(200).json(adding_res);
  } catch (error) {
    console.error(`Error adding data: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
});

// --------------------------------- Machine Learnign-Recoomnadations ---------------------------------
server.get("/recommend_device", async (req, res) => {
  
  try {
    const devices = Object.values(ML_DEVICES);
    const { temperature, humidity, distance } = await getLatestSensorValues();
    const { season, hour } = getCurrentSeasonAndHour();
    const requestData = {
      devices,
      distance,
      temperature,
      humidity,
      season,
      hour,
    };

    const recommendation = await callBayesianScript(requestData);
    const recommendationsArray = recommendation.map((item, index) => {
      return {
        device: devices[index],
        state: item.recommendation,
      };
    });
    res.json(recommendationsArray);
  } catch (error) {
    console.error(`Error getting recommendation: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
});

// --------------------------------- Suggestions ---------------------------------
server.get("/suggestions", async (req, res) => {
  try {
    const suggestions = await getSuggestions();
    res.status(200).json(suggestions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching suggestions" });
  }
});

// --------------------------------- Insights-Graph Data ---------------------------------
server.get("/graph-data", async (req, res) => {
  try {
    const { device, time_range, year } = req.query; // Assuming year might also be required

    // Validate required parameters
    if (!device || !time_range) {
      return res.status(400).json({ message: "Missing required query parameters" });
    }

    const response = await axios.get(`${process.env.PYTHON_SERVER_URL}/graph-data`, {
      params: { device, time_range, year }, // Include year if it's used by the Python server
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching graph data:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});


server.put("/suggestions", async (req, res) => {
  try {
    // const id = req.params.id;
    Object.entries(req.body).map((suggestion) => {
      [key, value] = suggestion;
      updateSuggestions(key, value);
    });
    res.status(200).send(response.data);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

server.post("/suggestions", async (req, res) => {
  try {
    const response = await addSuggestionMenually(req.body);
    return res.status(200).send(response.data);
  } catch (err) { }
});

server.delete("/suggestions/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const response = await deleteSuggestion(id);
    return res.status(200).send(response.data);
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
});

// --------------------------------- Rooms ---------------------------------

server.get("/rooms", async (req, res) => {
  try {
    const response = await getRooms();
    return res.status(200).send(response.data);
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
});

server.get("/rooms/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const response = await getRoomById(id);
    return res.status(200).send(response.data);
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
});

server.get("/rooms-name/:name", async (req, res) => {
  try {
    const roomName = req.params.name;
    const response = await getRoomIdByRoomName(roomName);
    if (!response)
      return res.status(200).send(_.get(response, 'data.id'));
    throw new Error(response.message)
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
})

server.get("/rooms/devices/:roomId", async (req, res) => {
  try {

    const roomId = req.params.roomId;
    const response = await getRoomDevices(roomId);
    return res.status(200).send(response.data)
  } catch (err) {

  }
})


server.post("/test", async (req, res) => {
  try {
    await addSuggestionsToDatabase();
    return res.status(200);
  } catch (err) {
    // return res.status(400).send({ message: err.message });
  }
})

server.get('/devices/rooms/:deviceName', async (req, res) => {
  try {

    const deviceName = req.params.deviceName;
    const response = await getRoomsByDeviceName(deviceName);
    return res.status(200).send(response);
  } catch (err) {

  }
})



// addSuggestionsToDatabase();



//  await addSuggestionsToDatabase();

// },5000)

// Schedule the job to run at specific hours
//schedule.scheduleJob("0 8,12,14,18,20 * * *", addSuggestionsToDatabase);
//schedule.scheduleJob("0 * * * * *", addSuggestionsToDatabase);

// --------------------------------- Running the ML script ---------------------------------

// const BAYESIAN_SCRIPT_INTERVAL = 600000; // 10 minutes in milliseconds
// setInterval(runBayesianScript, BAYESIAN_SCRIPT_INTERVAL);

// getHeaterState();

// setInterval(async() => {
//     removeAllSensorValues();
// // //     await removeSensorValueByType('temperature');
// // //     await removeSensorValueByType('humidity');
// await parseSensorAndWriteToMongo();

// }, 2000);

// setTimeout(async() => {
//   getCurrentSeasonAndHour();
// }, 2000)


// setInterval(async () => {
//   //  await addSuggestionsToDatabase();

//   await getFunctionsFromDB();

//   //   await removeSensorValueByType('temperature');
//   //   await removeSensorValueByType('humidity');
//   //   await removeSensorValueByType('hour')
//   //   await removeSensorValueByType('season')
//     // await parseSensorAndWriteToMongo();
// }, 10 * 1000)


server.listen(port, () => console.log(`listening on port ${port}`));
