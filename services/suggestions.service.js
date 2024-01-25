const Suggestion = require("../models/Suggestion");
const axios = require("axios");
const { getLatestSensorValues } = require("./sensorValues.service");
const { getCurrentSeasonAndHour } = require("./time.service");
const {
  checkIfHour,
  replaceWords,
  DISCRETIZE_SENSORS_MAP,
} = require("../utils/utils");
const { clients } = require("../ws");
const Rule = require("../models/Rule");
const {
  OPERATORS_FOTMATTER_TO_NORMALIZED,
} = require("../consts/suggestions.consts");
const _ = require("lodash");
const { SENSORS, ML_DEVICES } = require("../consts/common.consts");

const getComparisonOperator = (evidence, evidenceValues) => {
  const stats = calculateStats(evidenceValues);
  const comparisonOperators = ["<", ">", "<=", ">="];

  // Calculate quartiles
  const sortedValues = evidenceValues.slice().sort((a, b) => a - b);
  const lowerQuartile = sortedValues[Math.floor(sortedValues.length * 0.25)];
  const upperQuartile = sortedValues[Math.floor(sortedValues.length * 0.75)];

  // Determine which comparison operator to use based on the median
  let chosenOperator;
  if (evidence === "season" || evidence === "hour") {
    if (stats.median === stats.mean) {
      chosenOperator = "==";
    } else {
      chosenOperator = "!=";
    }
  } else {
    if (stats.median < lowerQuartile + (upperQuartile - lowerQuartile) * 0.25) {
      chosenOperator = Math.random() < 0.5 ? ">" : ">=";
    } else if (
      stats.median >
      lowerQuartile + (upperQuartile - lowerQuartile) * 0.75
    ) {
      chosenOperator = Math.random() < 0.5 ? "<" : "<=";
    } else {
      chosenOperator = Math.random() < 0.5 ? "<=" : ">=";
    }
  }
  return chosenOperator;
};
const calculateStats = (evidenceValues) => {
  const n = evidenceValues.length;
  const mean = evidenceValues.reduce((sum, value) => sum + value, 0) / n;
  const median =
    n % 2 === 0
      ? (evidenceValues[n / 2 - 1] + evidenceValues[n / 2]) / 2
      : evidenceValues[(n - 1) / 2];
  const variance =
    evidenceValues.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
    (n - 1);
  const stdDev = Math.sqrt(variance);
  return { mean, median, stdDev };
};

const getActualEvidenceValue = async (strongestEvidence) => {
  const latestSensorValues = await getLatestSensorValues(); // Get the latest sensor values

  const { season, hour } = getCurrentSeasonAndHour();

  const currentValues = _.reduce(
    Object.values(SENSORS),
    (acc, curr) => ({
      ...acc,
      [curr]: _.get(latestSensorValues, curr, null)
    }),
    {}
  );

  const actualValues = {
    ...currentValues,
    [SENSORS.HOUR]: hour,
    [SENSORS.SEASON]: season,
  };


  return [actualValues[strongestEvidence.evidence]];
};

const mapEvidenceValue = (evidenceType) => {
  const evidenceMaps = {
    [SENSORS.HOUR]: { 1: "morning", 2: "afternoon", 3: "evening" },
    [SENSORS.TEMPERATURE]: { 1: 15, 2: 20, 3: 25, 4: 27 },
    [SENSORS.HUMIDITY]: { 1: 30, 2: 60, 3: 90, 4: 100 },
    [SENSORS.DISTANCE]: { 1: 0.01, 2: 20, 3: 100 },
    [SENSORS.SEASON]: { 1: "winter", 2: "spring", 3: "summer", 4: "fall" },
  };
  if (evidenceType in evidenceMaps) {
    return evidenceMaps[evidenceType];
  }

  return undefined;
};

const getStrongestEvidence = (evidence) => {
  const strongestEvidence = evidence.reduce((prev, current) =>
    prev.value > current.value ? prev : current
  );
  return strongestEvidence;
};

const generateRule = async (suggestion) => {
  const { device, strongest_evidence, state, average_duration } = suggestion;
  // Get strongest evidence

  const strongestEvidence = getStrongestEvidence(strongest_evidence);
  const conditions = await strongest_evidence.reduce(
    async (accPromise, current) => {
      const acc = await accPromise;
      const mappedValue = mapEvidenceValue(current.evidence);
      const actualValue = await getActualEvidenceValue(current);
      const comparisonOperators = getComparisonOperator(current.evidence, [
        current.value,
      ]);
      const operator =
        comparisonOperators[
          Math.floor(Math.random() * comparisonOperators.length)
        ];

      const discretizedActualValue = discretizeValue(
        current.evidence,
        actualValue[0]
      );

      let value = mappedValue[discretizedActualValue.toString()];

      const currentCondition = `${current.evidence} ${comparisonOperators} ${value}`;

      if (acc === "") {
        return currentCondition;
      } else {
        return `${acc} AND ${currentCondition}`;
      }
    },
    ""
  );

  const normalizedConditions = replaceWords(
    conditions,
    OPERATORS_FOTMATTER_TO_NORMALIZED
  );
  // console.log({normalizedConditions});

  const mappedValue = mapEvidenceValue(strongestEvidence.evidence);
  const actualValue = await getActualEvidenceValue(strongestEvidence);
  if (!strongestEvidence.evidence || !mappedValue) {
    console.error(
      "Error: Undefined values encountered in strongest evidence or mapped value"
    );
    return;
  }
  // Get comparison operator
  const comparisonOperators = getComparisonOperator(
    strongestEvidence.evidence,
    actualValue
  );
  const operator =
    comparisonOperators[Math.floor(Math.random() * comparisonOperators.length)];

  // Get the lower boundary of the current mapping
  const discretizedActualValue = discretizeValue(
    strongestEvidence.evidence,
    actualValue[0]
  ); // <-- Added this line
  let value = mappedValue[discretizedActualValue.toString()];
  // console.log(value)
  value = checkIfHour(value);
  // const conditions = `${strongestEvidence.evidence} ${comparisonOperators} ${value}`;
  const action = `("${
    device.split("_")[0]
  } ${state} for ${average_duration} minutes")`;
  const normalizedAction = `${
    device.split("_")[0]
  } ${state} for ${average_duration} minutes`;
  const generatedRule = `IF ${conditions} THEN TURN${action}`;
  const normalizedRule = `IF ${normalizedConditions} THEN TURN ${normalizedAction}`;
  console.log({ generatedRule, normalizedRule });
  // console.log({generatedRule})
  return { generatedRule, normalizedRule };
};

// Add this new function for discrretizing the actual value
const discretizeValue = (evidenceType, actualValue) => {
  if (typeof actualValue == "string" && /\d/.test(actualValue)) {
    const numberPattern = /\d+/g;
    const arrOfNumbers = actualValue.match(numberPattern);
    actualValue = parseFloat(arrOfNumbers.join("."));
  }

  if (DISCRETIZE_SENSORS_MAP[evidenceType]) {
    return DISCRETIZE_SENSORS_MAP[evidenceType](actualValue);
  }

  return undefined;
};

const getSuggestions = async () => {
  try {
    const suggestions = await Suggestion.find().sort({ _id: -1 });
    return { statusCode: 200, data: suggestions };
  } catch (error) {
    console.error(`Error getting suggestions: ${error}`);
    return { statusCode: 500, data: "Internal server error" };
  }
};

async function addSuggestionsToDatabase() {
  try {
    console.log("ADD SUGG");
    const latestSensorValues = await getLatestSensorValues();
    const { season, hour } = getCurrentSeasonAndHour();

    const devicesArr = Object.values(ML_DEVICES);

    const numberPattern = /\d+/g;
    const currentValues = _.reduce(
      Object.values(SENSORS),
      (acc, curr) => ({
        ...acc,
        [curr]: _.get(latestSensorValues, curr, null).match(numberPattern),
      }),
      {}
    );

    const evidence = {
      ...currentValues,
      [SENSORS.HOUR]: hour,
      [SENSORS.SEASON]: season,
    };

    // If there is no suggestions use this for pump
    // const evidence = {
    //   temperature: 3,
    //   humidity: 1,
    //   distance_from_house: 3,
    //   season: 2,
    //   hour:  2,
    //   soil: 2
    // };

    // If there is no suggestions use this for many devices
    // const evidence = {
    //   temperature: 2,
    //   humidity: 1,
    //   distance_from_house: 1,
    //   season: 2,
    //   hour:  3,
    //   soil: 2
    // };

    // Call the recommend_device function with the evidence
    const response = await axios.post(
      "http://127.0.0.1:5000/recommend_device",
      {
        devices: devicesArr,
        evidence: evidence,
      }
    );
    const recommendedDevices = response.data;
    let strongestEvidence = [];
    // Add the suggestions to the MongoDB database
    for (const recommendedDevice of recommendedDevices) {
      if (recommendedDevice.recommendation === "on") {
        const deviceName = recommendedDevice.variables[0]; // Extract the device name from the variables array
        let idx = 0;
        for (const findStrongEvidence of recommendedDevice.strongest_evidence) {
          strongestEvidence.push(findStrongEvidence);
          if (idx === 1) {
            break;
          }
          idx++;
        }
        const filteredEvidence = strongestEvidence.reduce((acc, curr) => {
          const existingEvidence = acc.find(
            (item) => item.evidence === curr.evidence
          );
          if (!existingEvidence) {
            acc.push(curr);
          }
          return acc;
        }, []);
        const roundedValue = Math.floor(recommendedDevice.average_duration);
        const suggestionData = {
          device: deviceName,
          average_duration: roundedValue,
          strongest_evidence: filteredEvidence,
          state: "on",
        };
        const { generatedRule, normalizedRule } = await generateRule(
          suggestionData
        );

        // Check if a suggestion with the same rule already exists in the database
        const existingSuggestion = await Suggestion.findOne({
          rule: generatedRule,
        });
        const existingRule = await Rule.findOne({ rule: generatedRule });
        // If a suggestion with the same rule doesn't exist, save the new suggestion
        if (!existingSuggestion && !existingRule) {
          clients.forEach((client) => {
            client.send("New Suggestion Added!");
          });
          const suggestion = new Suggestion({
            id: Math.floor(10000000 + Math.random() * 90000000),
            ...suggestionData,
            rule: generatedRule, // Add the rule property
            normalized_rule: normalizedRule,
            is_new: true,
          });
          await suggestion.save();
        }
      }
    }
  } catch (error) {
    // console.error("Error while making request to Python server:", error);
  }
}

const addSuggestionMenually = async (suggestion) => {
  try {
    const newSuggestion = new Suggestion(suggestion);
    newSuggestion.id = Math.floor(10000000 + Math.random() * 90000000);
    const response = await newSuggestion.save();
    return { statusCode: 200, data: response.data };
  } catch (err) {
    return { statusCode: 404, data: "Cant Add Suggestion - " + err.message };
  }
};

const updateSuggestions = async (key, value) => {
  try {
    const response = await Suggestion.updateMany(
      {},
      { [key]: value },
      { multi: true }
    );
    return { statusCode: 200, data: response.data };
  } catch (error) {
    console.log(`Error updating suggestion: ${error}`);
    return { statusCode: 500, data: "Internal server error" };
  }
};

const deleteSuggestion = async (id) => {
  try {
    const response = await Suggestion.deleteOne({ id: id });
    return { statusCode: 200, data: response.data };
  } catch (error) {
    return { statusCode: 400, data: "Cannot delete rule: " + error.message };
  }
};

module.exports = {
  getSuggestions,
  addSuggestionsToDatabase,
  addSuggestionMenually,
  updateSuggestions,
  deleteSuggestion,
  generateRule,
};
