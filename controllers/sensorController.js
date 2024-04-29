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
let ROOM_ID = false;
let SPACE_ID = false;
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


    async get_RoomID(req, res) {
      res.status(200).json({ RoomID: ROOM_ID });
  },
  


 
  async get_SpaceID(req, res) {
    
      res.status(200).json({ spaceID: SPACE_ID });
  },
  
  async get_MotionState(req, res) {
      // Assuming that motionState, spaceId, and roomId are defined and available in your application context
      // These should be retrieved from relevant data sources or passed to this function before calling
  
      // Respond with JSON object containing motion detection status and identifiers
      res.status(200).json({
          motionDetected: motionState,
          spaceID: SPACE_ID,
          RoomID: ROOM_ID,
      });
  
      // Log the motion state and space ID for debugging purposes
      console.log("The Motion State is:", motionState);
  },
  
    // async update_Motion_DetectedState(req, res) {

    //     try {
    //         const lightState = req.body.state;
            
    //         motionState = lightState === 'on'; // Update the motionState
        
    //         console.log('Received request to turn', lightState);
        
    //         if (lightState !== 'on' && lightState !== 'off') {
    //           throw new Error(`Invalid light state: ${lightState}`);
    //         }
        
    //         console.log(`Simulated light turned ${lightState}`);
    //         const spaceID = "61097711"
    //         const roomId = "4866"; // Example roomId
    //         const deviceId = "65109692"; // Example deviceId
        
    //          // Update the room's 'motionDetected' field
    //          await Room.updateOne({ id: roomId }, { $set: { motionDetected: lightState === 'on' } });
    //          await Room.updateOne({ id: roomId }, { $set: { motionDetected: lightState === 'on' } });
        
    //          // Update the specific device's state
    //          await Device.updateOne({ device_id: deviceId }, { $set: { state: lightState } });
         
    //        // Additionally, update the RoomDevice state
    //        await RoomDevice.updateOne(
    //         { room_id: roomId, device_id: deviceId, spaceid:spaceID},
    //         { $set: { state: lightState } }
    //       );
    
    //         console.log(`Motion state updated for room ${roomId} and space id ${spaceID} to ${motionState}`);
    //         res.status(200).send(`Light turned ${lightState}, request received successfully`);
    //       } catch (error) {
    //         console.error('Error:', error.message);
    //         res.status(500).send(`Server error: ${error.message}`);
    //       }  
    // },

    async update_Motion_DetectedState(req, res) {
      try {
          const { state, roomId, spaceId } = req.body;
          
      
          if (!state || !roomId || !spaceId) {
              console.error('Missing required parameters');
              return res.status(400).json({ message: "Missing required parameters: state, roomId, or spaceId" });
              
          }
          
          if (state !== 'on' && state !== 'off') {
              console.error(`Invalid state received: ${state}`);
              return res.status(400).json({ message: `Invalid state: ${state}. Must be 'on' or 'off'.` });
          }
  
          motionState = (state === 'on'); // Update global motionState
          ROOM_ID = roomId;
          SPACE_ID = spaceId;
          console.log(`Motion state: ${state}`);
          console.log(`Room ID: ${roomId}`);
          console.log(`Space ID: ${spaceId}`);
          console.log(`Global motion state updated to: ${motionState}`);
  
          // Database updates can proceed as earlier
          const roomUpdateResult = await Room.updateOne({ id: roomId }, { $set: { motionDetected: motionState } });
          const deviceUpdateResult = await Device.updateOne( { $set: { state: state } });
          const roomDeviceUpdateResult = await RoomDevice.updateOne(
              { room_id: roomId },
              { $set: { state: state } }
          );
  
          console.log('Update results:', roomUpdateResult, deviceUpdateResult, roomDeviceUpdateResult);
          res.status(200).json({ message: `Motion state updated to '${state}' successfully for room ${roomId} and space ${spaceId}.` });
      } catch (error) {
          console.error('Error:', error.message);
          res.status(500).send(`Server error: ${error.message}`);
      }
  },
  //   async update_Motion_DetectedState(req, res) {
  //     const { state, room_id, space_id } = req.body;

  //   // Validate the incoming data
  //   if (!state || !room_id || !space_id) {
  //       console.error("Missing required parameters");
  //       return res.status(400).json({ message: "Missing required parameters: state, room_id, or space_id" });
  //   }
  //   if (state !== 'on' && state !== 'off') {
  //       console.error(`Invalid state received: ${state}`);
  //       return res.status(400).json({ message: `Invalid state: ${state}` });
  //   }

  //   try {
  //       // Log the received request
  //       console.log(`Received motion state update: ${state} for Room ID: ${room_id} in Space ID: ${space_id}`);

  //       // Update the room's 'motionDetected' field
  //       const roomUpdateResult = await Room.updateOne(
  //           { _id: room_id },
  //           { $set: { motionDetected: state === 'on' } }
  //       );
  //       console.log(`Room update result: ${JSON.stringify(roomUpdateResult)}`);

  //       // Update the specific device's state
  //       const deviceUpdateResult = await Device.updateOne(
  //           { _id: space_id },
  //           { $set: { state: state } }
  //       );
  //       console.log(`Device update result: ${JSON.stringify(deviceUpdateResult)}`);

  //       // Additionally, update the RoomDevice state
  //       const roomDeviceUpdateResult = await RoomDevice.updateOne(
  //           { room_id: room_id, device_id: space_id },
  //           { $set: { state: state } }
  //       );
  //       console.log(`RoomDevice update result: ${JSON.stringify(roomDeviceUpdateResult)}`);

  //       // Respond to the client
  //       res.status(200).json({
  //           message: `Motion state updated to '${state}' successfully for room ${room_id} and space ${space_id}.`
  //       });
  //   } catch (error) {
  //       console.error(`Server error while updating state: ${error}`);
  //       res.status(500).json({
  //           message: `Server error: ${error.message}`
  //       });
  //   }
  // },  
  //   async update_Motion_DetectedState(req, res) {
  //     const { state, room_id, space_id } = req.body;

  //     if (!state || !room_id || !space_id) {
  //         return res.status(400).json({ message: "Missing required parameters: state, room_id, or space_id" });
  //     }
  
  //     try {
  //         console.log(`Motion state: ${state}`);
  //         console.log(`Room ID: ${room_id}`);
  //         console.log(`Space ID: ${space_id}`);
  
  //         // Example async operation: Assume updateDeviceState is an async function
  //         // that updates device states in a database
  //         // await updateDeviceState(room_id, space_id, state);
  
  //         res.status(200).send(`Received motion state update: ${state} for Room ID: ${room_id} in Space ID: ${space_id}`);
  //     } catch (error) {
  //         console.error(`Error handling request: ${error.message}`);
  //         res.status(500).send(`Server error: ${error.message}`);
  //     } 
  // },
  //   async update_Motion(req, res) {
  //     try {
  //         const { state, roomId, deviceId, spaceId } = req.body;
  
  //         // Validate the state early in the function to exit if it is not correct
  //         if (state !== 'on' && state !== 'off') {
  //             return res.status(400).send(`Invalid state: ${state}`);
  //         }
  
  //         console.log(`Received request to update state to ${state} for room ${roomId}, device ${deviceId}, space ${spaceId}`);
  
  //         // Update the room's 'motionDetected' field
  //         await Room.updateOne({ id: roomId }, { $set: { motionDetected: state === 'on' } });
  
  //         // Update the specific device's state
  //         await Device.updateOne({ device_id: deviceId }, { $set: { state } });
  
  //         // Additionally, update the RoomDevice state
  //         await RoomDevice.updateOne(
  //             { room_id: roomId, device_id: deviceId, space_id: spaceId },
  //             { $set: { state } }
  //         );
  
  //         console.log(`State updated successfully for room ${roomId} and device ${deviceId} in space ${spaceId}`);
  //         res.status(200).send(`State updated to ${state} successfully`);
  //     } catch (error) {
  //         console.error('Error:', error.message);
  //         res.status(500).send(`Server error: ${error.message}`);
  //     }
  // },
  
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

exports.get_MotionState = exports.sensorControllers.get_MotionState;

exports.get_RoomID = exports.sensorControllers.get_RoomID;



exports.get_SpaceID = exports.sensorControllers.get_SpaceID;