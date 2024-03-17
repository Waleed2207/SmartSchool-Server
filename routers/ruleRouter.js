const {ruleControllers} = require('../controllers/ruleController')
const {Router} = require("express");
const router = new Router();


//GET 
router.get('/rules', ruleControllers.get_Rules);

//POST
router.post('/rules', ruleControllers.add_Rule);
router.post('/rules/:id', ruleControllers.update_Rule);
//PUT
router.put('/rules/:id', ruleControllers.update_Rule);

router.post('/rules/:id', ruleControllers.update_Rule);

//DELETE
router.delete('/rules/:id', ruleControllers.delete_Rule_ByID);


module.exports = router;
