const express = require('express');
const router = express.Router();
const gatewayController = require('../controllers/gatewaysController');


router.get('/:gatewayId/devices', gatewayController.getDevices);
router.get('/', gatewayController.getAllGateways);
router.get('/:id', gatewayController.getGatewayById);
router.post('/login', gatewayController.loginGateway);
router.get('/:id/endpoints', gatewayController.getGatewayEndpoints);
router.post('/:id/bind', gatewayController.bindGateway);
router.delete('/:id/unbind', gatewayController.unbindGateway);

module.exports = router;
