const express = require('express');
const calendarController = require('../controllers/calendarController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.post('/add-events', authenticate, calendarController.addEvent);
router.get('/get-all-events/:spaceId', authenticate, calendarController.getEvents);
router.get('/events/:eventId', authenticate, calendarController.getEvent);
router.put('/events/:eventId', authenticate, calendarController.updateTheEvent);
router.delete('/events/:eventId', authenticate, calendarController.deleteTheEvent);

module.exports = router;
