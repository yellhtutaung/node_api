const Joi = require('joi');
const userCollection = require('../../models/users.model');
const checkPhoneAndEmail = async (inPhone,inEmail) =>
{
    $fetchUser = await userCollection.find(
    {$or:[{phone:inPhone},{email:inEmail}]});
    if($fetchUser.length == 0){
        return true;
    }else{
        return 'User already exit with this email | phone ( plz change phone or email )';
    }
}

//  https://joi.dev/api/?v=17.9.1#anyvalidateasyncvalue-options
const registerValidator = async (req,res) =>
{
    $fetchUser = await checkPhoneAndEmail(req.body.phone,req.body.email);
    if($fetchUser == true)
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
            return errorMessage;
        }else{
            return true;
        }
    }else{
        return $fetchUser;
    }
}


module.exports = {registerValidator};