const {sensorControllers} = require('../controllers/sensorController')
const {Router} = require("express");
const router = new Router();

// GET /sensor from Rassparypi
router.get('/sensors', sensorControllers.getSensor);
router.get('/motion-state', sensorControllers.get_MotionState);

// GET /sensor from Sensibo
router.get('/sensibo', sensorControllers.get_SensiboAC_State);
router.get('/temperature', sensorControllers.get_Temperature);


// POST
router.post('/motion-detected', sensorControllers.update_Motion_DetectedState);
//router.post('/update-motion', sensorControllers.update_Motion);

router.post('/sensibo/mode', sensorControllers.update_MotionState);
router.post('/sensibo', sensorControllers.TurnON_OFF_AC);




module.exports = router;
