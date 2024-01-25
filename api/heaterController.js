const { default: axios } = require("axios");
const Device = require("../models/Device");
const { addingDataToCsv } = require("../utils/machineLearning.js");

const TUYA_URL = 'https://tuyaapi.onrender.com'


const switchHeaterState = async (value) => {
    try {
        value = value ? 1 : 0;  // converting the heater value from true/false to 1/0
        const response = await axios.post(`${TUYA_URL}/control`, {
            code: "switch_1",
            value
        })
        await Device.updateOne({ device_id: '061751378caab5219d31' }, { state: (value === 1) ? 'on' : 'off' });
        await addingDataToCsv()
        return response.data;
    } catch (err) {
        console.log(err)
    }

}



module.exports = {
    switchHeaterState
}

