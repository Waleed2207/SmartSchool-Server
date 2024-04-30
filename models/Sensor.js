const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema({
    sensor_id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    activated: {
        type: String,
        required: true
    }
});

const Sensor = mongoose.model('sensors', sensorSchema);

module.exports = Sensor;
