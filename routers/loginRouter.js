const {loginControllers} = require('../controllers/loginController')
const {Router} = require("express");
const loginRouter = new Router();


//GET 
loginRouter.get('/', loginControllers.handleGetRequest);
loginRouter.get('/homeConnect', loginControllers.homeConnect_Auth);
loginRouter.get('/homeConnect/callback', loginControllers.homeConnect_Auth_callback);
loginRouter.get('/user-role', loginControllers.getUserRole);

//POST
loginRouter.post('/', loginControllers.handleHttp_Callback);
loginRouter.post('/register', loginControllers.RegesterUSER);
loginRouter.post('/login', loginControllers.SINGIN_USER);
loginRouter.post('/notifyadmin', loginControllers.NOTIFICATION_ADMIN);
loginRouter.post('/location', loginControllers.Location_USER);





module.exports = { loginRouter };
