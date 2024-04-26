const {ruleControllers} = require('../controllers/ruleController')
const {Router} = require("express");
const ruleRouter = new Router();


//GET 
ruleRouter.get('/rules', ruleControllers.get_Rules);

//POST
ruleRouter.post('/rules', ruleControllers.add_Rule);

//PUT
ruleRouter.put('/rules/:id', ruleControllers.update_Rule);

ruleRouter.post('/rules/:id', ruleControllers.update_Rule);

//DELETE
ruleRouter.delete('/rules/:id', ruleControllers.delete_Rule_ByID);


module.exports = { ruleRouter };
