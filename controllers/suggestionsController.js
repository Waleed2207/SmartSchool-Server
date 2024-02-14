const {
    getSuggestions,
    addSuggestionsToDatabase,
    updateSuggestions,
    addSuggestionMenually,
    deleteSuggestion,
  } = require("./../services/suggestions.service.js");
const axios = require("axios");


 exports.suggestionsControllers={

    async get_suggestions(req, res){
        try {
            const suggestions = await getSuggestions();
            res.status(200).json(suggestions);
          } catch (err) {
            res.status(500).json({ message: "Error fetching suggestions" });
          }
    },
    async get_graph_data(req, res){
        try {
            const { device, time_range, year } = req.query; // Assuming year might also be required
        
            // Validate required parameters
            if (!device || !time_range) {
              return res.status(400).json({ message: "Missing required query parameters" });
            }
        
            const response = await axios.get(`${process.env.PYTHON_SERVER_URL}/graph-data`, {
              params: { device, time_range, year }, // Include year if it's used by the Python server
            });
        
            res.status(200).json(response.data);
          } catch (error) {
            console.error("Error fetching graph data:", error.message);
            res.status(500).json({ message: "Internal server error" });
          } 
    },
    async add_suggestions_menual(req, res) {
        try {
            const response = await addSuggestionMenually(req.body);
            return res.status(200).send(response.data);
          } catch (err) { }
    },
    async add_suggestions_TO_DB(req, res) {
      try {
        await addSuggestionsToDatabase();
        return res.status(200);
      } catch (err) {
        // return res.status(400).send({ message: err.message });
      }
    },
    async update_suggestions(req, res) {
        try {
            // const id = req.params.id;
            Object.entries(req.body).map((suggestion) => {
              [key, value] = suggestion;
              updateSuggestions(key, value);
            });
            res.status(200).send(response.data);
          } catch (err) {
            res.status(500).send({ message: err.message });
          }

    },
    async delete_suggestions(req, res){
        const id = req.params.id;
        try {
          const response = await deleteSuggestion(id);
          return res.status(200).send(response.data);
        } catch (err) {
          return res.status(400).send({ message: err.message });
        }

    }
 } 