const {sensorControllers} = require('../controllers/sensorController')
const {Router} = require("express");
const router = new Router();

// GET /sensor from Rassparypi
router.get('/sensors', sensorControllers.getSensor);
router.get('/motion-state', sensorControllers.get_MotionState);
router.get('/SpaceID', sensorControllers.get_SpaceID);
router.get('/Room-id', sensorControllers.get_RoomID);

// GET /sensor from Sensibo
router.get('/sensibo', sensorControllers.get_SensiboAC_State);
router.get('/temperature', sensorControllers.get_Temperature);


router.post('/motion-detected', sensorControllers.update_Motion_DetectedState);
router.post('/sensibo/mode', sensorControllers.update_AC_Mode);
router.post('/sensibo', sensorControllers.TurnON_OFF_AC);

// i change lines 16,17,18 from sensorRouter to routerr it gaved me undifiend error i keep the sensorRouter as null Sammier need to answer me 
sensorRouter = null ;


module.exports = router;
