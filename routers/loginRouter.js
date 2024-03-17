const {loginControllers} = require('../controllers/loginController')
const {Router} = require("express");
const router = new Router();


//GET 
router.get('/', loginControllers.handleGetRequest);
router.get('/homeConnect', loginControllers.homeConnect_Auth);
router.get('/homeConnect/callback', loginControllers.homeConnect_Auth_callback);
router.get('/user-role', loginControllers.getUserRole);

//POST
router.post('/', loginControllers.handleHttp_Callback);
router.post('/register', loginControllers.RegesterUSER);
router.post('/login', loginControllers.SINGIN_USER);
router.post('/notifyadmin', loginControllers.NOTIFICATION_ADMIN);
router.post('/location', loginControllers.Location_USER);




module.exports = router;

