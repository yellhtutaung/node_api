const mongoose = require('mongoose');
const {responseSuccess,responseError} = require('./helpers/httpResponse');
const {generateRandomStr, getAutoIncrementId} = require('./helpers/helper');
const userCollection = require('../models/users.model');
const autoIncrementIdCollection = require('../models/autoincrementId.model');
// const autoIncrementTb = mongoose.model('autoincrement_ids');
// const userTb = mongoose.model('users');
const {registerValidator} = require('../controllers/validate/authValidator');



const login = ((req,res) => { 
    res.status(201).json({message:'ok par'});
});

const register = async (req,res) => {
    try {

        const checkRegisterValidation = await registerValidator(req,res);
        // return res.json(checkRegisterValidation);
        if(checkRegisterValidation)
        {
            const fetchId = await getAutoIncrementId('users',res);
            const newUser = await userCollection();
            // return res.json(newUser);
            newUser.id = fetchId==0?1:fetchId+1;
            newUser.name = req.body.name;
            newUser.username = generateRandomStr(14);
            newUser.email = req.body.email;
            newUser.password = req.body.password;
            // newUser.profile_img = req.body.name;
            newUser.register_type = 'google';
            newUser.token = generateRandomStr(20);
            
            if(newUser.save())
            {
                res.status(200).json(responseSuccess(200,'User registrated .',newUser));
            }
        }else{
            return res.status(401).json(responseError(401,checkRegisterValidation,null));
        }
    } catch (err) {
        console.log('_________________Error Starting_____________');
        console.log(err.message); 
        console.log('_________________Error Ending_______________');
    }  
};

module.exports = { login, register }