// const express = require('express');
// const activityController = require('../controllers/activityController');
// const authenticate = require('../middleware/authenticate');

// const router = express.Router();

// // Ensure that the controller functions are correctly referenced
// router.post('/add-activity', authenticate, activityController.addActivity);
// router.get('/activities', authenticate, activityController.getAllActivities);
// router.get('/current-activity', authenticate, activityController.getCurrentActivity);
// router.post('/update-activity/:activityId', authenticate, activityController.updateActivity); // Update route
// router.get('/activity/:activityId', authenticate, activityController.getActivityById);

// module.exports = router;




const express = require('express');
const activityController = require('../controllers/activityController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.get('/activities', authenticate, activityController.getAllActivities);
router.get('/current-activity', authenticate, activityController.getCurrentActivity);
router.post('/add-activity', authenticate, activityController.addActivity);
router.post('/update-activity', authenticate, activityController.updateActivity);
router.get('/activity/:activityId', authenticate, activityController.getActivityById);

module.exports = router;
