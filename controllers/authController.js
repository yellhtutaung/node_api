const mongoose = require('mongoose');
const {responseSuccess,responseError} = require('./helpers/httpResponse');
const {generateRandomStr, getAutoIncrementId} = require('./helpers/helper');
const userCollection = require('../models/users.model');
const autoIncrementIdCollection = require('../models/autoincrementId.model');
const {verifyPassword,passPlainToHash} = require('./helpers/passwordHandler');
const dotenv = require('dotenv');
dotenv.config({path:'./config/.env'});
const {loginValidator,registerValidator} = require('../controllers/validate/authValidator');
const jwt = require('jsonwebtoken');


const login = async (req,res) => {
    try {
        const {username,password} = req.body;
        const checkLoginValidation = await loginValidator(req,res);
        if (checkLoginValidation)
        {
            // return res.json(checkLoginValidation);
            const checkUser = await userCollection.findOne({
                $or: [{ email: username }, { username: username }]
            });
            if (!checkUser)
            {
                res.status(400).json(responseError(404,"User not found with this credentials"));
            } else {
                const verifyPass = await verifyPassword(password,checkUser.password);
                if (verifyPass)
                {
                    checkUser.password = null;
                    const authToken = jwt.sign({checkUser}, process.env.JWT_ACCESS_SECRET, { expiresIn: '5m' }) ; // 5 minutes
                    return res.status(200).json(responseSuccess(200,'User Login Successfully',[{'asset_token': authToken}]));
                }else {
                    return res.status(402).json(responseError(402,"Password did not match !"));
                }
                // return res.status(200).json(responseSuccess(200,'Going to next process',verifyPass));
            }
        }else{
            return res.status(401).json(responseError(401,checkLoginValidation,null));
        }
    } catch (err) {
        res.status(500).json(responseError(500,'System error occurred '+err));
        console.log(err.message);
    }
};

const register = async (req,res) => {
    try {
        const checkRegisterValidation = await registerValidator(req,res);
        return checkRegisterValidation;
        if(checkRegisterValidation.status == 200)
        {
            const fetchId = await getAutoIncrementId('users',res);
            const newUser = await userCollection();
            // return res.json(newUser);
            newUser.id = fetchId==0?1:fetchId+1;
            newUser.name = req.body.name;
            newUser.username = generateRandomStr(14);
            newUser.email = req.body.email;
            newUser.password = await passPlainToHash(10,req.body.password,);
            // newUser.profile_img = req.body.name;
            newUser.register_type = req.body.register_type;
            newUser.token = generateRandomStr(20);

            const saveNewUser = await newUser.save();
            if(saveNewUser)
            {
                res.status(200).json(responseSuccess(200,'User registered .',newUser));
            }
        }else{
            return res.status(401).json(responseError(
                checkRegisterValidation.status,
                checkRegisterValidation.message,
                null));
        }
    } catch (err) {
        console.log('_________________Catch Message Starting_____________');
        console.log(err.message);
        return res.json(err.message);
        console.log('_________________Ending_______________');
    }  
};

module.exports = { login, register }