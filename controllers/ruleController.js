const {
    insertRuleToDB,
    add_new_Rule,
    getAllRules,
    updateRule,
    deleteRuleById,
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