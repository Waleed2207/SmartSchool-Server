const loginRouter = require("./loginRouter");
const devicesRouter = require("./devicesRouter");
const sensorRouter = require("./sensorRouter");
const ruleRouter = require("./ruleRouter");
const roomRouter = require("./roomRouter");
const suggestionsRouter = require("./suggestionsRouter");
const mindolifeRouter = require('./gatewaysRouter'); 

module.exports = {
    loginRouter,
    devicesRouter,
    sensorRouter,
    ruleRouter,
    roomRouter,
    suggestionsRouter,
    mindolifeRouter,
};
