// imports
const express = require("express");
const path    = require("path")
const cors    = require('cors');
const connectDB = require("./config");
const { connectToWs } = require("./ws.js");
const axios = require("axios");
const server = express();
const port = process.env.PORT || 3000;
const cron = require("node-cron");
const _ = require("lodash");
require("dotenv").config();

// import Routers
const {devicesRouter} = require("./routers/devicesRouter");
const {loginRouter} = require("./routers/loginRouter");
const {sensorRouter} = require("./routers/sensorRouter");
const {ruleRouter} = require("./routers/ruleRouter");
const {roomRouter} = require("./routers/roomRouter");
const {suggestionsRouter} = require("./routers/suggestionsRouter");

// Connect to MongoDB 
connectDB();
connectToWs();

// server.use(cookieParser());
server.use(cors({ origin: true }));
server.use(express.json());
server.use(express.urlencoded({extended: true}));  // hundel post reqs with body


server.use('/api-login', loginRouter);
server.use('/api-device', devicesRouter);
server.use('/api-sensors', sensorRouter);
server.use('/api-rule', ruleRouter);
server.use('/api-room', roomRouter);
server.use('/api-suggestion', suggestionsRouter);

server.use((req, res) => {
    res.status(400).send('Something is broken!');
});
server.listen(port, () => console.log(`listening on port ${port}`));