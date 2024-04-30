const {
    getDevices,
    getAllGateways,
    getGatewayById,
    createGateway,
    updateGateway,
    deleteGateway,
    isGatewayLoggedIn,
    bindGateway,
    unbindGateway,
    getGatewayEndpoints,
    loginGateway,
    changeFeatureState,
    MindolifefetchAndTransformIoTDevicesData,
    MindolifefetchAndTransformIoTDeviceDataById
} = require("./../services/gateways.service.js"); // Adjust path as necessary
const jwt = require("jsonwebtoken");
const axios = require("axios");
exports.gatewayController = {
    extractIoTDevices: async (req, res) => {
        try {
            const devices = await MindolifefetchAndTransformIoTDevicesData(); // Assuming a mock function for demonstration
            res.json({ success: true, devices });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Failed to extract IoT device details', error: error.message });
        }
    },
    extractIoTDevicesByID: async (req, res) => {
        try {
            const { deviceId } = req.params;
            const device = await MindolifefetchAndTransformIoTDeviceDataById(deviceId);
            res.json({ success: true, device });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Failed to extract IoT device details', error: error.message });
        }
    },
    changeFeature: async (req, res)=>{
        try {
            const { deviceId ,state, rasp_ip } = req.body;
            // console.log( state);
            // console.log(deviceId);
            // console.log(rasp_ip);
            const result = await changeFeatureState(deviceId, state, rasp_ip); // directly call the imported function
            res.json(result);
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
    },
    getAllGateways: async (req, res) => {
        try {
            const gateways = await getAllGateways();
            res.json(gateways);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getGatewayById: async (req, res) => {
        const { id } = req.params;
        try {
            const gateway = await getGatewayById(id);
            res.json(gateway);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    },

    loginGateway: async (req, res) => {
        const { username, password, sessionKey, gateway } = req.body;
        try {
            const success = await loginGateway(username, password, sessionKey, gateway);
            res.json({ success });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    getGatewayEndpoints: async (req, res) => {
        const { id, userSessionKey } = req.params; // Assuming you meant to use params for consistency
        try {
            const endpoints = await getGatewayEndpoints(id, userSessionKey);
            res.json(endpoints);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    bindGateway: async (req, res) => {
        const { id, userSessionKey } = req.params; // Assuming you meant to use params for consistency
        try {
            const result = await bindGateway(id, userSessionKey);
            res.json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    unbindGateway: async (req, res) => {
        const { id, userSessionKey } = req.params; // Assuming you meant to use params for consistency
        try {
            const result = await unbindGateway(id, userSessionKey);
            res.json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
};
