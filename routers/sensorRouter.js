const {sensorControllers} = require('../controllers/sensorController')
const {Router} = require("express");
const sensorRouter = new Router();

// GET /sensor from Rassparypi
sensorRouter.get('/sensors', sensorControllers.getSensor);
sensorRouter.get('/motion-state', sensorControllers.get_MotionState);

// GET /sensor from Sensibo
sensorRouter.get('/sensibo', sensorControllers.get_SensiboAC_State);
sensorRouter.get('/temperature', sensorControllers.get_Temperature);


// POST
sensorRouter.post('/motion-detected', sensorControllers.update_Motion_DetectedState);
sensorRouter.post('/action', sensorControllers.TurnON_OFF_LIGHT);
sensorRouter.post('/sensibo/mode', sensorControllers.update_AC_Mode);
sensorRouter.post('/sensibo', sensorControllers.TurnON_OFF_AC);




module.exports = { sensorRouter };