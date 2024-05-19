const {ruleControllers} = require('../controllers/ruleController')
const {Router} = require("express");
const ruleRouter = new Router();


//GET 
ruleRouter.get('/rules', ruleControllers.get_Rules);
ruleRouter.get('/rules/:space_id', ruleControllers.get_Rules_By_SPACE_ID);


//POST
ruleRouter.post('/rules', ruleControllers.add_Rule);

//PUT
ruleRouter.put('/rules/:id', ruleControllers.update_Rule);

ruleRouter.post('/rules/:id', ruleControllers.update_Rule);

//DELETE
ruleRouter.delete('/rules/:id', ruleControllers.delete_Rule_ByID);


module.exports = { ruleRouter };
