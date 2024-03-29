const { getSensors } = require("./../services/sensors.service.js");
const Room = require("./../models/Room");
const Device = require("./../models/Device.js");
const RoomDevice = require("./../models/RoomDevice");
const {
  switchAcState,
  getAcState,
  getSensiboSensors,
  parseSensorAndWriteToMongo,
  updateAcMode,
  updateSensiboMode,
  analyzeFunc,
} = require("./../api/sensibo.js");
const { getRooms, getRoomById, getRoomIdByRoomName } = require("./../services/rooms.service.js");
const _ = require("lodash");

let motionState = false; // This should reflect the real motion state, possibly stored in a database

exports.sensorControllers={

    async getSensor(req, res) {
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
    },
    //-------------------------------- motion-detected by Raspberry Pi --------------------------------
    async get_MotionState (req, res) {
        res.status(200).json({ motionDetected: motionState });
    },

    async update_Motion_DetectedState(req, res) {

        try {
            const lightState = req.body.state;
            motionState = lightState === 'on'; // Update the motionState
        
            console.log('Received request to turn', lightState);
        
            if (lightState !== 'on' && lightState !== 'off') {
              throw new Error(`Invalid light state: ${lightState}`);
            }
        
            console.log(`Simulated light turned ${lightState}`);
            const roomId = "38197016"; // Example roomId
            const deviceId = "65109692"; // Example deviceId
        
             // Update the room's 'motionDetected' field
             await Room.updateOne({ id: roomId }, { $set: { motionDetected: lightState === 'on' } });
        
             // Update the specific device's state
             await Device.updateOne({ device_id: deviceId }, { $set: { state: lightState } });
         
           // Additionally, update the RoomDevice state
           await RoomDevice.updateOne(
            { room_id: roomId, device_id: deviceId },
            { $set: { state: lightState } }
          );
    
            console.log(`Motion state updated for room ${roomId} to ${motionState}`);
            res.status(200).send(`Light turned ${lightState}, request received successfully`);
          } catch (error) {
            console.error('Error:', error.message);
            res.status(500).send(`Server error: ${error.message}`);
          }  
    },

    // --------------------------------- Sensibo- AC ---------------------------------
      async get_SensiboAC_State(req, res) {
          try {
              const state = await getAcState();
              console.log("Fetched AC state:", state);
          
              if (!state) {
                console.error("Failed to fetch AC state: No state returned");
                return res.status(500).send('Unable to fetch AC state');
              }
              // Optionally, validate/format the state here before sending
              res.status(200).json(state);
            } catch (error) {
              console.error("Error fetching AC state:", error);
              res.status(500).json({error: 'Unable to fetch AC state', details: error.message});
            }

      },
      async TurnON_OFF_AC(req, res) {
        try {
          console.log("-----------sensibo---------------");
      
          const { state, temperature, id } = req.body;
          console.log(id);
          const actualDeviceId = id === "YNahUQcM" ? "YNahUQcM" : process.env.SENSIBO_DEVICE_ID;
          const actualApiKey = id === "YNahUQcM" ? "VqP5EIaNb3MrI62s19pYpbIX5zdClO" : process.env.SENSIBO_API_KEY;
      
          // Debugging: Log the environment variables to ensure they're being read correctly
          console.log("Device ID:", actualDeviceId, "API Key:", actualApiKey);
      
          // Adjusted call to match the switchAcState function signature
          const switchResponse = await switchAcState(actualDeviceId, state, temperature);
      
          // Check the response from the switchAcState function
          if (switchResponse.statusCode === 200) {
            res.json({ success: true, data: switchResponse.data });
          } else {
            // If the status code isn't 200, send an error response
            res.status(switchResponse.statusCode).json({ success: false, message: "Failed to update AC state via API." });
          }
        } catch (err) {
          console.error("Error in /sensibo route:", err);
          // Send a structured error response
          res.status(500).json({ success: false, message: err.message || "Server error occurred." });
        }
      },
      async get_Temperature(req, res) {
        const data = await getSensiboSensors();

        if (data) {
          res.json(data.result); // Send the result if data is successfully fetched
        } else {
          res.status(500).send("Failed to fetch sensor data");
        }
      },
      
      async update_MotionState(req, res) {
        const { deviceId, mode } = req.body;
        const result = await updateSensiboMode(deviceId, mode);
      
        if (_.get(result, "success", false)) {
          res.status(200).json(result);
        } else {
          res.status(500).json(result);
        }

      },

}