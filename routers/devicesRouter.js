// routers/devicesRouter.js
const express = require('express');
const devicesRouter = express.Router();
const { devicescontrollers } = require('../controllers/devicesController');

// GET requests
devicesRouter.get('/iot-devices', devicescontrollers.extractIoTDevices);
devicesRouter.get('/devices', devicescontrollers.getDevices);
devicesRouter.get('/device/:name', devicescontrollers.getDeviceByName);
devicesRouter.get('/device/space/:spaceID', devicescontrollers.getDeviceBySpaceID);
devicesRouter.get('/devices-with-thresholds', devicescontrollers.getDevicesWithThresholds);
devicesRouter.get('/devices-by-room/:roomId', devicescontrollers.getDeviceByRoomID);
devicesRouter.get('/room-devices/:roomId', devicescontrollers.getRoomDeviceByRoomID);
devicesRouter.get('/room-devices-test/:roomId', devicescontrollers.getRoomDeviceTESTByRoomID);

// POST requests
devicesRouter.post('/change-feature-state', devicescontrollers.changeFeature);
devicesRouter.post('/devices', devicescontrollers.createDevice);
devicesRouter.post('/room-device', devicescontrollers.createDeviceTORooom);

// PUT requests
devicesRouter.put('/devices/mode', devicescontrollers.updateDeviceMode);
devicesRouter.put('/room-devices', devicescontrollers.updateRoomDeviceState);

module.exports = devicesRouter;
