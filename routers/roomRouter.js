const {roomControllers} = require('../controllers/roomController')
const {Router} = require("express");
const roomRouter = new Router();

//GET 
roomRouter.get('/rooms', roomControllers.get_Rooms);
roomRouter.get('/rooms/:id', roomControllers.get_Rooms_ById);
roomRouter.get('/rooms/space/:space_id', roomControllers.get_Rooms_By_SpaceId);
roomRouter.get('/rooms-name/:name_space', roomControllers.get_RoomsID_ByRoomName);
roomRouter.get('/rooms/devices/:roomId', roomControllers.get_RoomDevices_ByRoomId);
roomRouter.get('/devices/rooms/:deviceName', roomControllers.get_Rooms_ByDeviceName);


//POST
roomRouter.post('/rooms/devices/:roomId', roomControllers.TestDB);
roomRouter.post('/rooms/add-room', roomControllers.AddRoom);





module.exports = { roomRouter };
