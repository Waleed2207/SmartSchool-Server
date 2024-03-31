const axios = require('axios').default;
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');
const qs = require('qs');

// Initialize axios with cookie support
const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));
client.defaults.baseURL = 'https://api.mindolife.com/API/'; // Set to your API base URL
client.defaults.headers.post['Content-Type'] = 'application/json';

// Developer Key - ensure to keep this secure
const developerKey = 'dec4695bf4450e3a4e0aa2b3f92929b631055ee78b77c5da59d434dee088f1cc';

// Generate Base URL
function generateBaseUrl(serviceName) {
  return `${client.defaults.baseURL}${serviceName}`;
}

// Generate Base Params with added developerKey, dataType, and client app name
function generateBaseParams(params) {
  if (!params) params = {};
  if (params['sessionKey']) {
    params['developerKey'] = developerKey;
    params['dataType'] = 'json';
    params['client'] = 'app'; // Assuming 'app' is your clientAppName
  }
  return params;
}

// Generate query string with developerKey, dataType, and client app name for URL
function generateWuertStringBaseParams(params) {
  let paramsStr = `?developerKey=${developerKey}&dataType=json&client=app`;
  Object.keys(params).forEach(key => {
    paramsStr += `&${key}=${encodeURIComponent(params[key])}`;
  });
  return paramsStr;
}

// Analyze Results function
async function analyzeResults(serviceName, paramsMap = {}, auth) {
  if (!auth) {
    console.log('auth is null for service ' + serviceName);
    return;
  }
  paramsMap["sessionKey"] = auth;
  const httpParams = generateWuertStringBaseParams(paramsMap);
  const url = generateBaseUrl(serviceName) + httpParams;

  try {
    const response = await client.get(url, {
      headers: { 'Authorization': `Bearer ${auth}` },
    });
    return response.data;
  } catch (error) {
    console.error('Request failed:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Get Authorized function
async function getAuthorized(serviceName, paramsMap = {}, auth) {
  if (!auth) {
    console.log('Auth token is missing');
    return;
  }
  paramsMap["sessionKey"] = auth;
  const httpParams = generateBaseParams(paramsMap);
  const url = generateBaseUrl(serviceName);

  try {
    const response = await client.put(url, httpParams, {
      headers: { 'Authorization': `Bearer ${auth}` },
    });
    return response.data;
  } catch (error) {
    console.error('Request failed:', error.response ? error.response.data : error.message);
    throw error;
  }
}

module.exports = { 
  client, 
  setAuthHeader: (token) => client.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : undefined,
  getAuthorized,
  analyzeResults
};
