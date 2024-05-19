const axios = require('axios');

const fetchData = async () => {
  const resource_id = 'b7cf8f14-64a2-4b33-8d4b-edb286fdbd37';
  const limit = 1500;

  const url = `https://data.gov.il/api/action/datastore_search?resource_id=${resource_id}&limit=${limit}`;

  try {
    const response = await axios.get(url);
    response.data.result.records.forEach(item => console.log(item));
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }
};

fetchData();