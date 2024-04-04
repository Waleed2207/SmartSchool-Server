const {gatewayController} = require('../controllers/gatewaysController')
const {Router} = require("express");
const mindolifeRouter = new Router();

// GET
mindolifeRouter.get('/getIoTDevices', gatewayController.extractIoTDevices);
mindolifeRouter.get('/getIoTDevices/:deviceId', gatewayController.extractIoTDevicesByID);

mindolifeRouter.get('/', gatewayController.getAllGateways);
mindolifeRouter.get('/:id', gatewayController.getGatewayById);
mindolifeRouter.get('/:id/endpoints', gatewayController.getGatewayEndpoints);

// POST
mindolifeRouter.post('/change-feature-state', gatewayController.changeFeature);
mindolifeRouter.post('/login', gatewayController.loginGateway);
mindolifeRouter.post('/:id/bind', gatewayController.bindGateway);

// DELETE
mindolifeRouter.delete('/:id/unbind', gatewayController.unbindGateway);


module.exports = {mindolifeRouter};