const activityController = require('../controllers/activityController');
const authenticate = require('../auth/authenticate');
const {Router} = require("express");
const activityRouter = new Router();


// Ensure that the controller functions are correctly referenced
activityRouter.post('/add-activity', authenticate, activityController.addActivity);
activityRouter.get('/activities', authenticate, activityController.getAllActivities);
activityRouter.get('/current-activity', authenticate, activityController.getCurrentActivity);

module.exports = {activityRouter};
