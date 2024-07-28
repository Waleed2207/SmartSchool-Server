const { StateManager } = require('../statemanager/stateManager');
const { getSensiboSensors } = require('../api/sensibo');
const Room = require('./../models/Room');
const Device = require('./../models/Device');
const RoomDevice = require('./../models/RoomDevice');

let motionState = false; // This should reflect the real motion state, possibly stored in a database
let RoomID = '';
let RoomName = '';
let SpaceID = '';
let DeviceID = '';
let clientIp = '';
let _User_Oid = '';
let Person = '';

const stateManager = new StateManager();

// List of configurations for each room and device
const configurations = [
  {
    roomId: '38197016',
    roomName: 'Living Room',
    spaceId: '61097711',
    deviceId: '4ahpAkJ9',
    raspberryPiIP: '192.168.1.109',
    user_oid: '65b76f020db757311fe54f38',
  },
  // {
  //   roomId: '67822610-8768',
  //   roomName: 'Class246',
  //   spaceId: '67822610',
  //   deviceId: 'YNahUQcM',
  //   raspberryPiIP: '10.0.0.9',
  //   user_oid: '6648b1dd3da69ac2341e4e36',
  // },
  // Add more configurations as needed
];

exports.handleControllers = {
  async get_MotionState(req, res) {
    res.status(200).json({
      motionDetected: motionState,
      ROOM_ID: RoomID,
      Room_NAME: RoomName,
      SPACE_ID: SpaceID,
      DEVICE_ID: DeviceID,
      CLIENT_IP: clientIp,
      _User_Oid_: _User_Oid,
    });
  },

  async update_Motion_DetectedState(req, res) {
    try {
      const { state: lightState, room_id: roomId, room_name: roomName, space_id: spaceId, device_id: deviceId, raspberry_pi_ip: raspberryPiIP, control: Control, user: user_oid } = req.body;

      console.log('Received request to turn', lightState, 'for Room ID:', roomId, 'for Room Name:', roomName, 'in Space ID:', spaceId, 'using Device ID:', deviceId, 'from Raspberry Pi:', raspberryPiIP, 'control:', Control, 'user:', user_oid);

      // Validate the state before processing
      if (lightState !== 'on' && lightState !== 'off') {
        return res.status(400).json({ error: `Invalid light state: ${lightState}` });
      }

      if (Control === 'auto') {
        motionState = lightState === 'on';
        RoomID = roomId;
        RoomName = roomName;
        SpaceID = spaceId;
        DeviceID = deviceId;
        clientIp = raspberryPiIP;
        _User_Oid = user_oid;
        Person = 'Movement';

        const event = {
          event: `${Person} ${lightState} ${roomName}`,
          lightState,
          roomId,
          roomName,
          spaceId,
          deviceId,
          raspberryPiIP,
          user_oid,
          motionState: lightState === 'on',
          Person: 'Movement',
        };

        console.log(`Event to be sent: ${event.Person} ${lightState} ${roomName}`);
        stateManager.updateState('motion', 
        {
          event: `${Person} ${lightState} ${roomName}`,
          lightState: lightState, roomId: roomId, RoomName, spaceId: spaceId, 
          deviceId: deviceId, raspberryPiIP: raspberryPiIP, res: res, motionState: lightState === 'on',
          _User_Oid
          }
        );
      } else if (Control === 'manual') {
        motionState = lightState === 'on';
        // Update the room's 'motionDetected' field
        await Room.updateOne({ id: roomId }, { $set: { motionDetected: motionState } });
        console.log(`Simulated light turned ${lightState} for Room ID: ${roomId}`);

        // Update the specific device's state
        await Device.updateOne({ device_id: deviceId }, { $set: { state: lightState } });
        console.log(`Device state updated for Device ID: ${deviceId}`);

        // Additionally, update the RoomDevice state
        await RoomDevice.updateOne({ room_id: roomId, device_id: deviceId }, { $set: { state: lightState } });

        // Send final response
        res.status(200).json({ message: `Light turned ${lightState}, request received successfully`, motionState });
      }
    } catch (error) {
      console.error('Error updating motion detected state:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Combined function to update temperature and humidity state
  async updateSensorData(roomId, roomName, spaceId, deviceId, raspberryPiIP, user_oid) {
    try {
      console.log(`Requesting sensor data for Room ID: ${roomId}, Room Name: ${roomName}, Space ID: ${spaceId}, Device ID: ${deviceId}, Raspberry Pi: ${raspberryPiIP}, User: ${user_oid}`);

      // Get the temperature and humidity data using the getSensorData function
      const sensorData = await getSensiboSensors(raspberryPiIP);

      if (sensorData) {
        const { temperature, humidity } = sensorData;

        console.log(`Received sensor data: Temperature ${temperature}, Humidity ${humidity} in ${roomName}`);

        const temperatureEvent = {
          event: `temperature in ${roomName}`,
          temperature,
          humidity,
          roomId,
          roomName,
          spaceId,
          deviceId,
          raspberryPiIP,
          user_oid,
        };

        const humidityEvent = {
          event: `humidity in ${roomName}`,
          temperature,
          humidity,
          roomId,
          roomName,
          spaceId,
          deviceId,
          raspberryPiIP,
          user_oid,
        };

        console.log(`Temperature Event to be sent: Temperature ${temperature}, Humidity ${humidity} in ${roomName}`);
        stateManager.updateState('temperature', temperatureEvent);

        // console.log(`Humidity Event to be sent: Temperature ${temperature}, Humidity ${humidity} in ${roomName}`);
        // stateManager.updateState('humidity', humidityEvent);
      } else {
        console.error('Failed to fetch sensor data');
      }
    } catch (error) {
      console.error('Error updating temperature and humidity state:', error);
    }
  },

  // Function to start updating state for all configurations
  async startUpdatingStateForAll(configurations) {
    configurations.forEach(config => {
      setInterval(() => {
        this.updateSensorData(
          config.roomId,
          config.roomName,
          config.spaceId,
          config.deviceId,
          config.raspberryPiIP,
          config.user_oid
        );
      },300000); // 300000 ms = 5 minutes
    });
  },
};

// Start updating state for all configurations
exports.handleControllers.startUpdatingStateForAll(configurations);
