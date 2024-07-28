const endpointController = require('../controllers/endpointController');
const {Router} = require("express");
const endpointRouter = new Router();


// Ensure that the controller functions are correctly referenced
endpointRouter.post('/get-ips',endpointController.addOrUpdateIp);


module.exports = {endpointRouter};