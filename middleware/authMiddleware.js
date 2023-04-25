const {responseSuccess,responseError} = require('../controllers/helpers/httpResponse');
const dotenv = require('dotenv');
//load config
dotenv.config({path:'../config/.env'});
const {registerValidator} = require('../controllers/validate/authValidator');


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

module.exports = {checkApiKey, registerMiddleware}