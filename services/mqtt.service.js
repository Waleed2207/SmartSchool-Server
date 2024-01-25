const mqtt = require('mqtt');
const { clients: uiClients } = require("../ws");
require('dotenv').config();

let latestSoilMoisture = null;

// Configure the connection options
const options = {
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
};

// Create a client instance
const client = mqtt.connect('mqtts://' + process.env.MQTT_URL, options);


client.once('connect', function () {
    console.log('MQTT connected');
    client.subscribe('esp32/soilMoisture');
});


setInterval(() => {
    client.once('message', function (topic, message) {
        if (topic == 'esp32/soilMoisture') {
            // console.log(`Received soil moisture: ${message.toString()}`);
            latestSoilMoisture = message.toString();
        }
    });
}, 2000)

client.once('error', function (error) {
    console.error('MQTT error: ', error);
});



// A helper function for publishing LED control messages
function controlLED(color, state) {
    const topic = 'ledControl';
    const message = JSON.stringify({ color: color, state: state });

    client.publish(topic, message, function (err) {
        if (err) {
            console.error('Failed to send message', err);
        } else {
            console.log(`LED control message sent: ${message}`);
        }
    });
}

function controlPump(state) {
    const topic = 'esp32/pumpControl';
    const message = state;

    console.log(`Sending message: ${message} to topic: ${topic}`);  // Add this line

    uiClients.forEach((client) => {
        client.send("TEST PUMP");
    });

    client.publish(topic, message, function (err) {
        if (err) {
            console.error('Failed to send message', err);
        } else {
            console.log(`Pump control message sent: ${message}`);
        }
    });
}


module.exports = {
    controlLED,
    controlPump,
    getLatestSoilMoisture: () => latestSoilMoisture

}
