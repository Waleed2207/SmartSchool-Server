const path = require('path'); 
const fs = require('fs').promises;

const loadConfig = async () => {
  try {
    const filePath = path.resolve(__dirname, '../api/endpoint/rasp_pi.json');
    console.log(filePath);
    console.log(`Loading configuration from: ${filePath}`);

    // Check if the file exists
    try {
      await fs.access(filePath);
    } catch (err) {
      throw new Error(`Configuration file does not exist at: ${filePath}`);
    }

    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    throw new Error(`Error loading configuration: ${err.message}`);
  }
};

const addOrUpdateIp = async (req, res) => {
  const filePath = path.resolve(__dirname, '../api/endpoint/rasp_pi.json');
  const { ip, url } = req.body;

  try {
    const data = await fs.readFile(filePath, 'utf8');
    const json = JSON.parse(data);

    // Add or update the IP address
    json[ip] = url;

    await fs.writeFile(filePath, JSON.stringify(json, null, 2));
    res.send(json);
  } catch (err) {
    res.status(500).send(`Error processing the JSON file: ${err.message}`);
  }
};

module.exports = {
  loadConfig,
  addOrUpdateIp
};
