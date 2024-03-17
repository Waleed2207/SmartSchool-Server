const qs = require('qs');
const MindolifeAPIClient = require('./MindolifeAPIClient');

function generateWuertStringBaseParams(params) {
  params['developerKey'] = process.env.DEVELOPER_KEY;
  params['dataType'] = 'json';
  params['client'] = process.env.CLIENT_APP_NAME;
  return `?${qs.stringify(params)}`;
}

async function analyzeResults(serviceName, params = {}, auth) {
  const httpParams = generateWuertStringBaseParams(params);
  const url = `${process.env.MINDOLIFE_API_BASE_URL}${serviceName}${httpParams}`;

  try {
    const response = await axiosClient.get(url, {
      headers: { Authorization: `Bearer ${auth}` },
    });
    return response.data;
  } catch (error) {
    console.error(`Error calling ${serviceName}:`, error);
    throw error;
  }
}

async function getAuthorized(serviceName, params = {}, auth) {
  try {
    const response = await axiosClient.put(serviceName, params, {
      headers: { Authorization: `Bearer ${auth}` },
    });
    return response.data;
  } catch (error) {
    console.error(`Error calling ${serviceName}:`, error);
    throw error;
  }
}

module.exports = {
  analyzeResults,
  getAuthorized,
};
