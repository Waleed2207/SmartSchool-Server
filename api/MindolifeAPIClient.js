const axios = require('axios').default;
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');
const qs = require('qs');

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));
client.defaults.baseURL = process.env.MINDOLIFE_API_BASE_URL;
client.defaults.headers.post['Content-Type'] = 'application/json';

// Function to add the Authorization header to a request dynamically
function setAuthHeader(token) {
    if (token) {
        client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete client.defaults.headers.common['Authorization'];
    }
}

async function getAuthorized(serviceName, params = {}, auth) {
    try {
      const response = await client.put(serviceName, params, {
        headers: { 'Authorization': `Bearer ${auth}` },
      });
      return response.data;
    } catch (error) {
      console.error(`Error calling ${serviceName}:`, error);
      throw error;
    }
}

module.exports = { client, setAuthHeader, getAuthorized };
