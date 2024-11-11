// routers/anomalyRouter.js

const express = require('express');
const { detectAnomalies } = require('../controllers/anomalyController');

const router = express.Router();

// Define the route for anomaly detection
router.post('/', detectAnomalies);

module.exports = router;
