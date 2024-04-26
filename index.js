const express = require("express");
const cors = require('cors');
const connectDB = require("./config");
const { connectToWs } = require("./ws");
const axios = require("axios");
const cron = require("node-cron");
const _ = require("lodash");
const { loginRouter, devicesRouter, sensorRouter, ruleRouter, roomRouter, suggestionsRouter, mindolifeRouter, spacesRouter } = require('./routers');
// Initialize Express application
const server = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB and WebSocket
connectDB();
connectToWs();

// Middleware
server.use(cors({ origin: true }));
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Use routers
server.use('/api-login', loginRouter);
server.use('/api-device', devicesRouter);
server.use('/api-sensors', sensorRouter);
server.use('/api-rules', ruleRouter);
server.use('/api-space', spacesRouter);
server.use('/api-room', roomRouter);
server.use('/api-suggestion', suggestionsRouter);
server.use('/api-mindolife', mindolifeRouter);

// Default route for handling undefined routes
server.use((req, res) => {
    res.status(404).send('Page not found.');
});

server.listen(port, () => console.log(`Server running on port ${port}`));
