// controllers/anomalyController.js

const axios = require('axios');

// Controller function to call Flask API for anomaly detection
const detectAnomalies = async (req, res) => {
  console.log('Received request for anomaly detection');
  
  try {
    console.log('Request payload:', JSON.stringify(req.body));

    // Make a POST request to the Flask server
    const response = await axios.post('http://localhost:5000/detect_anomalies', req.body, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Flask API response:', JSON.stringify(response.data));
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error making request to Flask API:', error.message);

    if (error.response) {
      console.error(`Flask API returned an error - Status: ${error.response.status}, Data:`, JSON.stringify(error.response.data));
      return res.status(error.response.status).json({
        errorCode: 'FLASK_API_ERROR',
        message: 'An error occurred in the Flask API while detecting anomalies.',
        details: error.response.data,
      });
    }

    if (error.request) {
      console.error('No response received from Flask API:', error.request);
      return res.status(503).json({
        errorCode: 'FLASK_API_NO_RESPONSE',
        message: 'No response received from Flask API. The service may be unavailable or unreachable.',
      });
    }

    console.error('Unexpected error:', error);
    res.status(500).json({
      errorCode: 'SERVER_ERROR',
      message: 'An unexpected error occurred while processing your request.',
      details: error.message,
    });
  }
};

module.exports = {
  detectAnomalies,
};
