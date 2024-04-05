const Joi = require('joi');
const userCollection = require('../../models/users.model');
const {responseSuccess,responseError} = require('../helpers/httpResponse');

const checkPhoneAndEmail = async (inPhone,inEmail) =>
{
    $fetchUser = await userCollection.find(
    {$or:[{phone:inPhone},{email:inEmail}]});
    if($fetchUser.length == 0){
        return responseSuccess(200,'',[]);
    }else{
        return responseError(409,'User already exit with this email or phone ( plz change phone or email )',
        [{email:inEmail,phone:inPhone}]);
    }
}

const loginValidator = async (req,res) =>
{
    let authSchema = Joi.object({
        username: Joi.string().trim().required().min(5).max(20),
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

//  https://joi.dev/api/?v=17.9.1#anyvalidateasyncvalue-options
const registerValidator = async (req,res) =>
{
    let fetchUser = await checkPhoneAndEmail(req.body.phone,req.body.email);
    
    if(fetchUser.status == 200) // plz place like that
    {
        let authSchema = Joi.object({
            // username: Joi.string().default(generateUsername),
            name: Joi.string().required().min(4).max(15),
            username: Joi.string(),
            email: Joi.string().email(),
            password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
            phone: Joi.string().min(8).max(12),
            register_type: Joi.string().default('facebook_login'),
        }).options({ allowUnknown: false }); // allow unknow field options
        
        let {result,error} =  authSchema.validate(req.body);
        if(error) // no error
        {
            const errorMessage = error.details[0].message.split('\"').join('');
            return responseError(401,errorMessage,[]);
        }else{
            return true;
        }
    }else{
        return fetchUser;
    }
}


module.exports = {loginValidator,registerValidator};