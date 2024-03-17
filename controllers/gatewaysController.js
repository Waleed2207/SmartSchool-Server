const gatewayService = require('../services/gateways.service'); 
// Adjust path as necessary
async function getDevices(req, res) {
    const { gatewayId, userSessionKey } = req.params;
    try {
        const devices = await gatewayService.getDevices(gatewayId, userSessionKey);
        res.json(devices);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function getAllGateways(req, res) {
    try {
        const gateways = gatewayService.getAllGateways();
        res.json(gateways);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getGatewayById(req, res) {
    try {
        const gateway = gatewayService.getGatewayById(req.params.id);
        res.json(gateway);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

async function loginGateway(req, res) {
    const { username, password, sessionKey, gateway } = req.body;
    try {
        const success = await gatewayService.loginGateway(username, password, sessionKey, gateway);
        res.json({ success });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function getGatewayEndpoints(req, res) {
    const { userSessionKey } = req.body;
    try {
        const endpoints = await gatewayService.getGatewayEndpoints(req.params.id, userSessionKey);
        res.json(endpoints);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function bindGateway(req, res) {
    const { userSessionKey } = req.body;
    try {
        const result = await gatewayService.bindGateway(req.params.id, userSessionKey);
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function unbindGateway(req, res) {
    const { userSessionKey } = req.body;
    try {
        const result = await gatewayService.unbindGateway(req.params.id, userSessionKey);
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = {
    getAllGateways,
    getGatewayById,
    loginGateway,
    getGatewayEndpoints,
    bindGateway,
    unbindGateway,
    getDevices,
};
