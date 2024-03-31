const express = require('express');
const gatewaysRouter = express.Router();
const gatewayController = require('../controllers/gatewaysController');


gatewaysRouter.get('/:gatewayId/devices', gatewayController.getDevices);
gatewaysRouter.get('/', gatewayController.getAllGateways);
gatewaysRouter.get('/:id', gatewayController.getGatewayById);
gatewaysRouter.post('/login', gatewayController.loginGateway);
gatewaysRouter.get('/:id/endpoints', gatewayController.getGatewayEndpoints);
gatewaysRouter.post('/:id/bind', gatewayController.bindGateway);
gatewaysRouter.delete('/:id/unbind', gatewayController.unbindGateway);

module.exports = gatewaysRouter;
