// // V1.

// const calendarController = require('../controllers/calendarController');
// const {Router} = require("express");

// const authenticate = require('../auth/authenticate');
// const calendarRouter = new Router();

// calendarRouter.post('/add-events', authenticate, calendarController.addEvent);
// calendarRouter.get('/get-all-events/:spaceId', authenticate, calendarController.getEvents);
// calendarRouter.get('/events/:eventId', authenticate, calendarController.getEvent);
// calendarRouter.put('/events/:eventId', authenticate, calendarController.updateTheEvent);
// calendarRouter.delete('/events/:eventId', authenticate, calendarController.deleteTheEvent);

// module.exports = {calendarRouter};

const calendarController = require('../controllers/calendarController');
const {Router} = require("express");

const authenticate = require('../auth/authenticate');
const calendarRouter = new Router();

calendarRouter.post('/add-events', authenticate, calendarController.addEvent);
calendarRouter.get('/get-all-events/:spaceId', authenticate, calendarController.getEvents);
calendarRouter.get('/events/:eventId', authenticate, calendarController.getEvent);
calendarRouter.put('/events/:eventId', authenticate, calendarController.updateTheEvent);
calendarRouter.put('/merged-events/:eventId', authenticate, calendarController.updateTheMergedEvent);

calendarRouter.delete('/events', authenticate, calendarController.deleteTheEvent);
calendarRouter.delete('/merged-events/:eventId', authenticate, calendarController.deleteTheMergedEvent);

module.exports = {calendarRouter};