const { default: axios } = require("axios");
const Function = require("../models/Function");
const SensorValue = require("../models/SensorValue");
const { switchAcState, analyzeFunc } = require("../api/sensibo");
const { getRoomIdByRoomName } = require("../services/rooms.service");
const { getDeviceIdByDeviceName, setRoomDeviceState } = require("../services/devices.service");
const RoomDevice = require("../models/RoomDevice");
const { controlPump } = require("../services/mqtt.service");


const removeSensorValueByType = async (sensorType) => {
    try {
        const response = await SensorValue.deleteMany({ sensor_type: sensorType });
    } catch (e) {
        console.log(e)
    }
}



const getFunctionsFromDB = async () => {
    try {
        const functions = await Function.find();
        const response = await Function.deleteMany({});
        functions.map(async (func) => {
            await activateDevices(func.function.toLowerCase())
        })
    } catch (e) {
        console.log(e);
    }
}

const activateDevices = async (func) => {
    const actionParsed = func.split(' ');
    const device = actionParsed[0];
    const roomName = actionParsed[actionParsed.length - 1] === 'room' ?
        actionParsed[actionParsed.length - 2] + ' ' + actionParsed[actionParsed.length - 1] :
        actionParsed[actionParsed.length - 1];
    const roomId = await getRoomIdByRoomName(roomName);
    const deviceId = await getDeviceIdByDeviceName(device);
    const roomDeviceId = `${roomId}-${deviceId}`;
    const roomDevice = await RoomDevice.find({ id: roomDeviceId });
    if (roomDevice.length === 0) {
        console.log(`There is no ${device} in ${roomName}`)
        return `There is no ${device} in ${roomName}`;
    }

    const state = actionParsed[1] === 'on' ? true : false;
    setRoomDeviceState(roomDeviceId, state)
    const acPattern = /\b(ac)\b/;
    const heaterPattern = /\b(heater)\b/;
    const pumpPattern = /\b(pump)\b/;

    try {
        let response;
        if (acPattern.test(func)) {
            // switchAcState(true);
            response = await analyzeFunc(func)
        } else if (heaterPattern.test(func)) {
            response = switchHeaterState(true);
        } else if (pumpPattern.test(func)) {
            response = controlPump('ON');
        }

        return response;

    } catch (err) {
        console.log(err + " activateDevices");
    }


}


const getHeaterState = async () => {
    const SERVER_URL = 'https://tuyaapi.onrender.com'
    const response = await axios.get(`${SERVER_URL}/status`)
    const state = response.data.result[0].value;
}


const switchHeaterState = async (state) => {
    const SERVER_URL = 'https://tuyaapi.onrender.com'
    const currentState = getHeaterState();
    if (currentState == state) return;
    const response = await axios.post(`${SERVER_URL}/control`, {
        code: "switch_1",
        value: state
    })

}




module.exports = {
    removeSensorValueByType,
    getFunctionsFromDB,
    getHeaterState,
    activateDevices,
}