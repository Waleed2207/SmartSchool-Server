const {roomControllers} = require('../controllers/roomController')
const {Router} = require("express");
const roomRouter = new Router();

//GET 
roomRouter.get('/rooms', roomControllers.get_Rooms);
roomRouter.get('/rooms/:id', roomControllers.get_Rooms_ById);
roomRouter.get('/rooms-name/:name', roomControllers.get_RoomsID_ByRoomName);
roomRouter.get('/rooms/devices/:roomId', roomControllers.get_RoomDevices_ByRoomId);
roomRouter.get('/devices/rooms/:deviceName', roomControllers.get_Rooms_ByDeviceName);


//POST
roomRouter.post('/rooms/devices/:roomId', roomControllers.TestDB);




module.exports = { roomRouter };
