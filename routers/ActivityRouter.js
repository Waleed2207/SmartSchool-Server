const express = require('express');
const activityController = require('../controllers/activityController');
const authenticate = require('../middleware/authenticate');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

router.get('/activities/:roomId', authenticate, validateObjectId, activityController.getAllActivitiesByRoom);
router.get('/current-activity/:roomId', authenticate, validateObjectId, activityController.getCurrentActivity);
router.post('/add-activity', authenticate, validateObjectId, activityController.addActivity);

module.exports = router;
