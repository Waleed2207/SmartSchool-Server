const {suggestionsControllers} = require('../controllers/suggestionsController')
const {Router} = require("express");
const router = new Router();


//GET 
router.get('/suggestions', suggestionsControllers.get_suggestions);
router.get('/graph-data', suggestionsControllers.get_graph_data);

//POST
router.post('/suggestions', suggestionsControllers.add_suggestions_menual);
router.post('/test', suggestionsControllers.add_suggestions_TO_DB);


//PUT
router.put('/suggestions', suggestionsControllers.update_suggestions);

//DELETE
router.delete('/suggestions/:id', suggestionsControllers.delete_suggestions);


module.exports = router;

