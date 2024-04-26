const qs = require('qs');
const MindolifeAPIClient = require('./MindolifeAPIClient');

function generateQueryStringBaseParams(params) {
  // Adding default base parameters to the params object
  params['developerKey'] = process.env.DEVELOPER_KEY;
  params['dataType'] = 'json';
  params['client'] = process.env.CLIENT_APP_NAME;
  // Using qs to stringify parameters and prepend with '?' for query string
  return `?${qs.stringify(params)}`;
}

async function analyzeResults(serviceName, params = {}, auth) {
  // Generating the full URL with base parameters
  const queryString = generateQueryStringBaseParams(params);
  const url = `${process.env.MINDOLIFE_API_BASE_URL}${serviceName}${queryString}`;

  try {
    // Making a GET request using MindolifeAPIClient with the Authorization header
    const response = await MindolifeAPIClient.get(url, {
      headers: { 'Authorization': `Bearer ${auth}` },
    });
    return response.data;
  } catch (error) {
    // Proper error logging with template literals
    console.error(`Error calling ${serviceName}:`, error);
    throw error;
  }
}

async function getAuthorized(serviceName, params = {}, auth) {
  try {
    // Making a PUT request using MindolifeAPIClient with the Authorization header
    const response = await MindolifeAPIClient.put(serviceName, params, {
      headers: { 'Authorization': `Bearer ${auth}` },
    });
    return response.data;
  } catch (error) {
    // Proper error logging with template literals
    console.error(`Error calling ${serviceName}:`, error);
    throw error;
  }
}

module.exports = {
  analyzeResults,
  getAuthorized,
};
