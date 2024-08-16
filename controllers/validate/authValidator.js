const Joi = require('joi');
const userCollection = require('../../models/users.model');
const {responseSuccess,responseError} = require('../helpers/httpResponse');
const jwt = require("jsonwebtoken");

//  https://joi.dev/api/?v=17.9.1#anyvalidateasyncvalue-options
const registerValidator = async (req,res) =>
{
    try{
        const {email, username } = req.body;
        const fetchUser = await userCollection.findOne({
            $or: [{email},{username}]
        });
        if (fetchUser)
        {
            return res.json(responseError(409, 'User already exists with this credentials', ));
        }

        const authSchema = Joi.object({
            name: Joi.string().min(4).max(15),
            email: Joi.string().email().required(),
            username: Joi.allow(''),
            password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
            phone: Joi.string().min(8).max(12),
        }).options({ allowUnknown: false });

        let {result,error} =  authSchema.validate(req.body);
        if(error) // no error
        {
            const errorMessage = error.details[0].message.split('\"').join('');
            return res.json(responseError(401,errorMessage,[]));
        }else{
            return responseSuccess(200,'Validation Success',[]);
        }

    }catch (error){
        return res.json(error.message);
    }
}

const loginValidator = async (req,res) =>
{
    let authSchema = Joi.object({
        email: Joi.string().email().trim().required().min(5).max(20),
        password: Joi.string().trim().required().min(6).max(15).pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    }).options({ allowUnknown: false }); // allow unknow field options

    let {result,error} =  authSchema.validate(req.body);
    if(error) // no error
    {
        const errorMessage = error.details[0].message.split('\"').join('');
        return errorMessage;
    }else{
        return true;
    }
}

module.exports = {loginValidator,registerValidator};