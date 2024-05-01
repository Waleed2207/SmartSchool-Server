const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { getCurrentSeasonAndHour } = require("./../services/time.service.js");
const { signInUser, registerUser } = require("./../services/users.service.js");
const { homeConnectAuth, homeConnectToken } = require("./../api/homeConnect.js");
const { checkforUserDistance } = require("./../api/location.js");
const _ = require("lodash");

exports.loginControllers={

    async handleGetRequest(req, res){

        res.json({ message: `Welcome to SmartSchool server` });
        
    },
    async homeConnect_Auth(req, res){
        
        homeConnectAuth();
        res.json({ message: "Welcome to Home Connect" });

    },
    async homeConnect_Auth_callback(req, res){

        homeConnectToken(req, res);
        res.json({ message: "token" });
    },
    // --------------------------------- user roles ---------------------------------
    async getUserRole(req, res){
        res.json({ role: "admin" }); 
    },
    async handleHttp_Callback(req, res){

        smartapp.handleHttpCallback(req, res);

    },
    // --------------------------------- Sign up----------------------------------
    async RegesterUSER(req, res){

        const { fullName, email, password, role, space_id } = req.body;
        const response = await registerUser(fullName, email, password, role, space_id);
        res.status(response.status).json({ message: response.message });
    },
    // --------------------------------- Sign in ---------------------------------
    async SINGIN_USER(req, res){

        const { email, password } = req.body;
        const response = await signInUser(email, password);
      
        if (response.status === 200) {
          res.status(200).json({
            message: response.message,
            token: response.token,
            user: response.user,
          });
        } else {
          res.status(response.status).json({ message: response.message });
        }

    },
    // --------------------------------- Notify Admin ---------------------------------
    async NOTIFICATION_ADMIN(req, res){
        try {
            const { subject, text } = req.body;
            console.log("notifyadmin email");
            console.log(req.body);
            await sendEmail(subject, text);
            res.status(200).send({ message: "Email sent successfully" });
          } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Failed to send email" });
          }
    },
    async Location_USER(req, res){
      const { location, user } = req.body;
      const firstName = _.get(user, "fullName", '').split(' ')[0];
      const distance = await checkforUserDistance(location, firstName);
      res.json({ distance });

    }
}