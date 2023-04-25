const mongoose = require('mongoose');
const userCollection = require('../../models/users.model');
const autoIncrementIdCollection = require('../../models/autoincrementId.model');
const {responseSuccess,responseError} = require('./httpResponse');

const generateRandomStr = (length = 14) => {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const getAutoIncrementId = async (tableName,res) => {
    try{
        const getLatestId = await autoIncrementIdCollection.find(
            { collection_name: tableName }, // where field
            { latest_id: 1 }, // get specific field only
            );
            // .sort({ latest_id: -1}); // desc ( -1 )
        return getLatestId[0].latest_id;
    }catch(error)
    {
        console.log(error);
        res.status(500).json(responseSuccess(500,"( Warning )Record can't fetch",error));
    }    
}

const generateUsername = (parent, helpers) => 
{
    return parent.firstname.toLowerCase() + '-' + parent.lastname.toLowerCase();
};

module.exports = { generateRandomStr, getAutoIncrementId, generateUsername }