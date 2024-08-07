const {
    insertRuleToDB,
    add_new_Rule,
    getAllRules,
    updateRule,
    deleteRuleById,
    getRulesBySpaceId,
    checkIfRuleIsAlreadyExists,
    operatorFormatter,
    validateRule,
    insertRuleToDBMiddleware,
    removeAllRules,
    removeRuleFromDB,
  } = require("./../services/rules.service.js");

  
exports.ruleControllers={
// --------------------------------- Rules ---------------------------------

    async get_Rules(req, res){
        const response = await getAllRules();
        res.status(response.statusCode).json(response.data);
    },
    async get_Rules_By_SPACE_ID(req, res) {
      // Extracting space ID from request parameters
      const space_id = req.params.space_id;
      
      // Fetching rules by space ID
      const response = await getRulesBySpaceId(space_id);
    
      // Sending the response with appropriate status code and data
      if (response.statusCode === 200) {
        res.status(200).json(response.data);
      } else {
        res.status(response.statusCode).json({ message: response.message });
      }
    },
    // Define the route for adding a new rule
    async add_Rule(req, res){

        const rule  = req.body;
        console.log( rule );
        const response = await add_new_Rule(rule);
        res.status(response.statusCode).send(response.message);
    },
    async update_Rule(req, res){
        const updateFields = { ...req.body }; // Includes isActive and any other fields
        const id = req.params.id;
        const response = await updateRule(id, updateFields);
        return res.status(response.statusCode).send(response.message);

    },
    async delete_Rule_ByID(req, res){
        const id = req.params.id;
        try {
          // Assuming you have a function to delete the rule by its ID
          const response = await deleteRuleById(id);
      
          if (response.status === 200) {
            res.status(200).json({ message: "Rule deleted successfully" });
          } else {
            res.status(400).json({ message: "Error deleting the rule" });
          }
        } catch (error) {
          res.status(500).json({ message: "Server error" });
        }

    },

}