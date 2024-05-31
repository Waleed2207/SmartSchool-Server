const express = require('express');
const activityController = require('../controllers/activityController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// Ensure that the controller functions are correctly referenced
router.post('/add-activity', authenticate, activityController.addActivity);
router.get('/activities', authenticate, activityController.getAllActivities);
router.get('/current-activity', authenticate, activityController.getCurrentActivity);

module.exports = router;
