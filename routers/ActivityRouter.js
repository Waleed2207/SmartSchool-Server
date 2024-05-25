const express = require('express');
const activityController = require('../controllers/activityController');
const authenticate = require('../middleware/authenticate');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

router.get('/activities', authenticate, activityController.getAllActivities);
router.get('/current-activity', authenticate, activityController.getCurrentActivity);
router.post('/add-activity', authenticate, validateObjectId, activityController.addActivity);

module.exports = router;
