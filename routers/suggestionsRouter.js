const {suggestionsControllers} = require('../controllers/suggestionsController')
const {Router} = require("express");
const suggestionsRouter = new Router();


//GET 
suggestionsRouter.get('/suggestions', suggestionsControllers.get_suggestions);
suggestionsRouter.get('/graph-data', suggestionsControllers.get_graph_data);

//POST
suggestionsRouter.post('/suggestions', suggestionsControllers.add_suggestions_menual);
suggestionsRouter.post('/test', suggestionsControllers.add_suggestions_TO_DB);


//PUT
suggestionsRouter.put('/suggestions', suggestionsControllers.update_suggestions);

//DELETE
suggestionsRouter.delete('/suggestions/:id', suggestionsControllers.delete_suggestions);



module.exports = { suggestionsRouter };
