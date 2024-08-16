const {responseSuccess,responseError} = require('../controllers/helpers/httpResponse');
const dotenv = require('dotenv');
//load config
dotenv.config({path:'../config/.env'});
const {registerValidator} = require('../controllers/validate/authValidator');
const userCollection = require('../models/users.model')
const jwt = require('jsonwebtoken')

const checkApiKey = (req,res,next) =>
{
    let headerToken = req.headers.authorization;
    // res.json(process.env.API_TOKEN);
    if ( headerToken == undefined)
    {
        return res.status(404).json(responseError(404,'Api key not found [ field name key must be ( authorization in header ) ]',null));
    }else if(headerToken != process.env.API_TOKEN){
        return res.status(403).json(responseError(403,'Api key did not match ',null));
    }else if(headerToken == process.env.API_TOKEN){
        next();
    }
}       // Check api middleware

const registerMiddleware = (req,res,next) =>
{
    const checkRegValidator = registerValidator(req.body);
    if(checkRegValidator)
    {
        return true;
        next();
    }else{
        return res.json(checkRegValidator);
    }
}

const verifyJWT = async (req, res, next) =>
{
    try {
        const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ',' ')
        if (!token)
        {
            res.status(401).json(responseError(401,'Unauthorized request'))
        }
        const decodedData = jwt.verify(token,process.env.JWT_ACCESS_SECRET)
        const user = await userCollection.findById(decodedData?._id).select(`-password -refreshToken`)
        if (!user)
        {
            res.status(404).json(responseError(404,'Invalid access token | user not found '))
        }
        req.user = user // keynote adding user data to request | for logout purpose
        next()
    }catch(error){
        res.status(401).json(responseError(401,`${error?.message || 'Invalid access token | user not found '}`))
    }
}

module.exports = {checkApiKey, registerMiddleware, verifyJWT}