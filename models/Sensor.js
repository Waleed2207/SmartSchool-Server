const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema({
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
