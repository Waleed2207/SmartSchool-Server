// controllers/testController.js

// Controller function to handle the test API response
exports.getTestMessage = (req, res) => {
    res.status(200).json({ message: "Test API is working!" });
};
