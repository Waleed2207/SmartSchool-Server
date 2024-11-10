// // imports   

// const fs = require('fs');
// const http = require('http');
// const https = require('https');
// const path = require('path');
// const express = require("express");
// const cors    = require('cors');
// const connectDB = require("./config");
// const { connectToWs } = require("./ws.js");
// const server = express();
// const port = process.env.PORT || 3000;
// require("dotenv").config();
// require('./statemanager/stateManager')


// // Certificate
// const privateKey = fs.readFileSync('/etc/letsencrypt/live/software.shenkar.cloud/privkey.pem', 'utf8');
// const certificate = fs.readFileSync('/etc/letsencrypt/live/software.shenkar.cloud/cert.pem', 'utf8');
// const ca = fs.readFileSync('/etc/letsencrypt/live/software.shenkar.cloud/chain.pem', 'utf8');

// const credentials = {
// 	key: privateKey,
// 	cert: certificate,
// 	ca: ca
// };



// // // import Routers
//     const {devicesRouter} = require("./routers/devicesRouter");
//     const {loginRouter} = require("./routers/loginRouter");
//     const {sensorRouter} = require("./routers/sensorRouter");
//     const {ruleRouter} = require("./routers/ruleRouter");
//     const {roomRouter} = require("./routers/roomRouter");
//     const {spacesRouter} = require("./routers/spacesRouter");
//     const {suggestionsRouter} = require("./routers/suggestionsRouter");
//     const {mindolifeRouter} = require('./routers/gatewaysRouter');

// // Connect to MongoDB 
// connectDB();

// // server.use(cookieParser());
// server.use(cors());
// server.use(express.json());
// server.use(express.urlencoded({extended: true}));  // hundel post reqs with body

// // Serve static files from the React app build folder
// server.use(express.static(path.join(__dirname,'/../smart-school-front/build')));

// server.use('/api-login', loginRouter);
// server.use('/api-device', devicesRouter);
// server.use('/api-sensors', sensorRouter);
// server.use('/api-rule', ruleRouter);
// server.use('/api-room', roomRouter);
// server.use('/api-space', spacesRouter);
// server.use('/api-suggestion', suggestionsRouter);
// server.use('/api-mindolife', mindolifeRouter);


// server.get("*", (req, res)=> {
//      res.sendFile(path.join(__dirname+'/../smart-school-front/build/index.html'));
// });


// // Starting http server
// const httpServer = http.createServer(server);
// connectToWs(httpServer);

// httpServer.listen(port, () => {
//     console.log(`listening on port ${port}`);
// });

// // Starting https server
// const httpsServer = https.createServer(credentials, server);
// connectToWs(httpsServer);
// httpsServer.listen(8888, () => {
//     console.log('HTTPS server running on port 8888');
// });



// server.listen(port, () => console.log(`listening on port ${port}`));



// imports
const express = require("express");
const cors    = require('cors');
const connectDB = require("./config");
const { connectToWs } = require("./ws.js");
const server = express();
const bodyParser = require('body-parser');

const port = process.env.PORT || 3000;
require("dotenv").config();
require('./statemanager/stateManager')


const testRouter = require('./routers/testRouter');  // Import the test router


// import Routers
const anomalyRouter = require('./routers/anomalyRouter');  // Import the anomaly router

const {devicesRouter} = require("./routers/devicesRouter");
const {loginRouter} = require("./routers/loginRouter");
const {sensorRouter} = require("./routers/sensorRouter");
const {ruleRouter} = require("./routers/ruleRouter");
const {roomRouter} = require("./routers/roomRouter");
const {spacesRouter} = require("./routers/spacesRouter");
const {suggestionsRouter} = require("./routers/suggestionsRouter");
const {mindolifeRouter} = require('./routers/gatewaysRouter');
const {activityRouter} = require('./routers/activityRouter');
const {calendarRouter} = require('./routers/calendarRouter');
const {endpointRouter} = require('./routers/endpointRouter');

// Connect to MongoDB 
connectDB();
connectToWs();

// server.use(cookieParser());
server.use(cors());
server.use(express.json());
server.use(express.urlencoded({extended: true}));  // hundel post reqs with body
server.use(bodyParser.json());

server.use('/api-test', testRouter);  // Add the test route

server.use('/api-login', loginRouter);
server.use('/api-device', devicesRouter);
server.use('/api-sensors', sensorRouter);
server.use('/api-rule', ruleRouter);
server.use('/api-room', roomRouter);
server.use('/api-space', spacesRouter);
server.use('/api-suggestion', suggestionsRouter);
server.use('/api-mindolife', mindolifeRouter);
server.use('/api-activities', activityRouter); 
server.use('/api-calendar', calendarRouter);
server.use('/api-endpoint', endpointRouter);
server.use('/api-anomaly', anomalyRouter); // Add the anomaly route

// Test API endpoint




server.use((req, res) => {
    res.status(400).send('Something is broken!');
});
server.listen(port, () => console.log(`listening on port ${port}`));