// routers/testRouter.js

const express = require('express');
const { getTestMessage } = require('../controllers/testController');

const router = express.Router();

// Define the test route
router.get('/', getTestMessage);

module.exports = router;
