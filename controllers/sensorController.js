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
  TurnON_OFF_LIGHT,
} = require("./../api/sensibo.js");
const _ = require("lodash");

// let motionState = false; // This should reflect the real motion state, possibly stored in a database
// let RoomID = ""; 
// let RoomName= "";
// let SpaceID = "";
// let DeviceID = "";
// let clientIp = "";
// let _User_Oid = "";
// let Person = "";
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
  //   async get_MotionState (req, res) {
  //     res.status(200).json({
  //         motionDetected: motionState,
  //         ROOM_ID: RoomID,
  //         Room_NAME: RoomName,
  //         SPACE_ID: SpaceID,
  //         DEVICE_ID: DeviceID,
  //         CLIENT_IP: clientIp,
  //         _User_Oid_: _User_Oid
  //     });
  // },
  
  // async update_Motion_DetectedState(req, res) {
  //   try {
  //     const { state: lightState, room_id: roomId, room_name: roomName, space_id: spaceId, device_id: deviceId, raspberry_pi_ip: raspberryPiIP, user: user_oid } = req.body;
      
  //     console.log('Received request to turn', lightState, 'for Room ID:', roomId, 'for Room Name:', roomName, 'in Space ID:', spaceId, 'using Device ID:', deviceId, 'from Raspberry Pi:', raspberryPiIP, "user:", user_oid);
      
  //     // Update the global motionState
  //     motionState = lightState === 'on';
  //     RoomID = roomId;
  //     RoomName = roomName;
  //     SpaceID = spaceId;
  //     DeviceID = deviceId;
  //     clientIp = raspberryPiIP;
  //     _User_Oid = user_oid;
  //     Person = "Joe"
  //     // Validate the state before processing
  //     if (lightState !== 'on' && lightState !== 'off') {
  //         return res.status(400).json({ error: `Invalid light state: ${lightState}` });
  //     }   
  //     // console.log(`Motion state updated for room ${roomId} to ${motionState}`);
  //     const event = `${Person} ${lightState} ${roomName}`;
  //     console.log(`Event to be sent: ${event}`);
  //     eventEmitter.emit('motionStateChange', {
  //       event: `${Person} ${lightState} ${roomName}`,
  //       lightState: lightState, roomId: roomId, RoomName, spaceId: spaceId, 
  //       deviceId: deviceId, raspberryPiIP: raspberryPiIP, res: res, motionState: lightState === 'on',
  //       _User_Oid

  //     });
  
  //     // // Update the room's 'motionDetected' field
  //     // await Room.updateOne({ id: roomId }, { $set: { motionDetected: motionState } });
  //     // console.log(`Simulated light turned ${lightState} for Room ID: ${roomId}`);
  
  //     // // Update the specific device's state
  //     // await Device.updateOne({ device_id: deviceId }, { $set: { state: lightState } });
  //     // console.log(`Device state updated for Device ID: ${deviceId}`);
  
  //     // // Additionally, update the RoomDevice state
  //     // await RoomDevice.updateOne({ room_id: roomId, device_id: deviceId }, { $set: { state: lightState } });
  
  //     // Send final response
  //     // res.status(200).json({ message: `Light turned ${lightState}, request received successfully`, motionState });
  
  //   } catch (error) {
  //     console.error('Error:', error.message);
  //     res.status(500).json({ error: `Server error: ${error.message}` });
  //   }
  // },
  
    async TurnON_OFF_LIGHT(req,res) {
      const { state, rasp_ip, id ,Control } = req.body;
      try {
        const switchResponse = await TurnON_OFF_LIGHT(state, rasp_ip, id, Control);
        res.status(200).json(switchResponse); // Respond with the switchResponse data
      } catch (error) {
        res.status(500).json({ error: 'Failed to turn on/off light' });
      }

    },

    // --------------------------------- Sensibo- AC ---------------------------------
      async get_SensiboAC_State(req, res) {
          try {
            const { rasp_ip, device_id } = req.query;
            console.log("Fetched raspi_pi and dev", rasp_ip,device_id);

            const state = await getAcState(rasp_ip, device_id);
            console.log("Fetched AC state:", state);
    
            if (!state) {
                console.error("Failed to fetch AC state: No state returned");
                return res.status(500).send('Unable to fetch AC state');
            }
            // Optionally, validate/format the state here before sending
            res.status(200).json(state);
        } catch (error) {
            console.error("Error fetching AC state:", error);
            res.status(500).json({ error: 'Unable to fetch AC state', details: error.message });
        }

      },
      async TurnON_OFF_AC(req, res) {
        try {
          console.log("-----------sensibo---------------");
      
          const { state, temperature, rasp_ip, id } = req.body;
          console.log(id);
          const actualDeviceId = id === "YNahUQcM" ? "YNahUQcM" : process.env.SENSIBO_DEVICE_ID;
          const actualApiKey = id === "YNahUQcM" ? "VqP5EIaNb3MrI62s19pYpbIX5zdClO" : process.env.SENSIBO_API_KEY;
      
          // Debugging: Log the environment variables to ensure they're being read correctly
          console.log("Device ID:", actualDeviceId, "API Key:", actualApiKey);
      
          // Adjusted call to match the switchAcState function signature
          const switchResponse = await switchAcState(actualDeviceId, state, rasp_ip, temperature);
          // This is where you should insert the detailed error logging
          if (switchResponse.statusCode !== 200) {
            if (switchResponse.data && typeof switchResponse.data === 'string') {
              try {
                const errorDetails = JSON.parse(switchResponse.data);
                console.error("Detailed error from Sensibo API:", errorDetails);
              } catch (e) {
                console.error("Error parsing Sensibo API response:", switchResponse.data);
              }
            }
            // Respond with the error to the client
            res.status(switchResponse.statusCode).json({ success: false, message: "Failed to update AC state via API.", details: switchResponse.data });
            return;
          }

          // Handle successful response
          res.json({ success: true, data: switchResponse.data });
        } catch (err) {
          console.error("Error in /sensibo route:", err);
          // Send a structured error response
          res.status(500).json({ success: false, message: err.message || "Server error occurred." });
        }
      },
      async get_Temperature (req, res) {
        try {
          const raspPiIP = req.query.rasp_pi; // Assume rasp_pi is passed as a query parameter
          if (!raspPiIP) {
            res.status(400).send("Missing Raspberry Pi IP");
            return;
          }
          const data = await getSensiboSensors(raspPiIP); // Pass raspPiIP to the function
      
          if (data) {
            res.status(200).json(data); // Send the result if data is successfully fetched
          } else {
            res.status(500).send("Failed to fetch sensor data");
          }
        } catch (error) {
          console.error("Error in get_Temperature function:", error.message);
          res.status(500).send("Internal Server Error");
        }
      },
      
      async update_AC_Mode(req, res) {
        const { deviceId, mode, rasp_ip } = req.body;
        // console.log(rasp_ip);
        const result = await updateSensiboMode(deviceId, mode, rasp_ip);
      
        if (_.get(result, "success", false)) {
          res.status(200).json(result);
        } else {
          res.status(500).json(result);
        }

      },

}