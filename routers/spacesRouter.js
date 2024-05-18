const {spaceControllers} = require('../controllers/spaceController')
const {Router} = require("express");
const spacesRouter = new Router();

//GET 
spacesRouter.get('/spaces', spaceControllers.get_Space);
spacesRouter.get('/spaces/:spaceId', spaceControllers.get_Space_ByID);
spacesRouter.get('/spaces/name/:space_name', spaceControllers.get_Space_ByName); // If using URL parameter
// spaceRouter.get('/rooms/:id', spaceControllers.get_Rooms_ById);
// spaceRouter.get('/rooms-name/:name', spaceControllers.get_RoomsID_ByRoomName);
// spaceRouter.get('/rooms/devices/:roomId', spaceControllers.get_RoomDevices_ByRoomId);
// spaceRouter.get('/devices/rooms/:deviceName', spaceControllers.get_Rooms_ByDeviceName);


// //POST
spacesRouter.post('/spaces', spaceControllers.create_Space);
// spacesRouter.post('/space-room', spaceControllers.create_Space_TORoom);




module.exports = { spacesRouter };
