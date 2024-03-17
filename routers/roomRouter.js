const {roomControllers} = require('../controllers/roomController')
const {Router} = require("express");
const router = new Router();

//GET 
router.get('/rooms', roomControllers.get_Rooms);
router.get('/rooms/:id', roomControllers.get_Rooms_ById);
router.get('/rooms-name/:name', roomControllers.get_RoomsID_ByRoomName);
router.get('/rooms/devices/:roomId', roomControllers.get_RoomDevices_ByRoomId);
router.get('/devices/rooms/:deviceName', roomControllers.get_Rooms_ByDeviceName);


//POST
router.post('/rooms/devices/:roomId', roomControllers.TestDB);




module.exports = router;
