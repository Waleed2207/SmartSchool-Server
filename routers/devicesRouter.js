const express = require('express');
const devicesController = require('../controllers/devicesController');

// Initialize the router
const router = express.Router();

// Define GET routes
router.get('/', devicesController.getMindolifeAllDevices); // Assuming getMindolifeAllDevices is correctly defined in devicesController
router.get('/devices', devicesController.getDevices); // Fetch all devices
router.get('/device/:name', devicesController.getDeviceByName); // Fetch device by name
router.get('/devices-with-thresholds', devicesController.getDevicesWithThresholds); // Fetch devices with their thresholds
router.get('/devices-by-room/:roomId', devicesController.getDeviceByRoomID); // Fetch devices by room ID
//devicesRouter.get('/room-devices/:roomId', devicesController.getRoomDeviceByRoomID); // Fetch room devices by room ID
//devicesRouter.get('/room-devices-test/:roomId', devicesController.getRoomDeviceTESTByRoomID); // Fetch room devices (test endpoint)

// Define POST routes
router.post('/', devicesController.createDevice); // Create a new device
//devicesRouter.post('/room-device', devicesController.createDeviceToRoom); // Add an existing device to a room

// Define PUT routes
router.put('/devices/mode', devicesController.updateDeviceMode); // Update device mode
router.put('/room-devices', devicesController.updateRoomDeviceState); // Update state of a device in a room

module.exports = router;
