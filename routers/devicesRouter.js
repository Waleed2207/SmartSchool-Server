const {devicescontrollers} = require('../controllers/devicesController')
const {Router} = require("express");
const devicesRouter = new Router();


//GET 
devicesRouter.get('/devices', devicescontrollers.getDevices);
devicesRouter.get('/device/:name', devicescontrollers.getDeviceByName);
devicesRouter.get('/devices_with_thresholds', devicescontrollers.getDevicesWithThresholds);
devicesRouter.get('/devices-by-room/:roomId', devicescontrollers.getDeviceByRoomID);
devicesRouter.get('/room-devices/:roomId', devicescontrollers.getRoomDeviceByRoomID);
devicesRouter.get('/room-devices-test/:roomId', devicescontrollers.getRoomDeviceTESTByRoomID);

//POST
devicesRouter.post('/devices', devicescontrollers.createDevice);
devicesRouter.post('/room-device', devicescontrollers.createDeviceTORooom);


//PUT
devicesRouter.put('/devices/mode', devicescontrollers.updateDeviceMode);
devicesRouter.put('/room-devices', devicescontrollers.updateRoomDeviceState);







module.exports = { devicesRouter };
