const mongoose = require('mongoose');
const {responseSuccess,responseError} = require('./helpers/httpResponse');
const {generateRandomStr, getAutoIncrementId} = require('./helpers/helper');
const userCollection = require('../models/users.model');
// const autoIncrementIdCollection = require('../models/autoincrementId.model');
const {verifyPassword,passPlainToHash} = require('./helpers/passwordHandler');
const dotenv = require('dotenv');
dotenv.config({path:'./config/.env'});
const {loginValidator,registerValidator} = require('../controllers/validate/authValidator');
const jwt = require('jsonwebtoken');
const {httpCookieOptions} = require("../utils/constants");

const generateAccessAndRefreshToken = async (req,res,userId) =>
{
    try {
        const user = await userCollection.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: true})
        return {accessToken, refreshToken}
    }catch (error){
        return res.status(500).json(responseError(500, 'Internal server error occurred while generating token ', error));
    }
}

const register = async (req,res) => {
    try {
        const checkRegisterValidation = await registerValidator(req,res);
        if(checkRegisterValidation.status == 200)
        {
            // const fetchId = await getAutoIncrementId('users',res);
            const newUser = await userCollection();
            newUser.id = 1;
            newUser.name = req.body.name;
            newUser.username = generateRandomStr(14);
            newUser.email = req.body.email;
            newUser.password = await passPlainToHash(10,req.body.password,);
            // newUser.profile_img = req.body.name;
            newUser.register_type = req.body.register_type;

            const saveNewUser = await newUser.save();
            if(saveNewUser)
            {
                newUser.refreshToken = newUser.generateRefreshToken();
                const updatedRefreshToken = await newUser.save( {validateBeforeSave: false});
                if (updatedRefreshToken)
                {
                    newUser.accessToken = newUser.generateAccessToken();
                    return res.status(200).json(responseSuccess(200,'User registered .',newUser));
                }
            }
        }else{
            return res.status(401).json(responseError(
                checkRegisterValidation.status,
                checkRegisterValidation.message,
                checkRegisterValidation));
        }
    } catch (err) {
        console.log('_________________Catch Message Starting_____________');
        console.log(err.message)
        // console.log('_________________Ending_______________');
    }  
};

const login = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const checkLoginValidation = await loginValidator(req, res);
        if (!checkLoginValidation) {
            // If validation fails, send error response
            return res.status(400).json(responseError(400, checkLoginValidation));
        }

        const User = await userCollection.findOne({
            $or: [{ email: email }, { username: username }]
        });

        if (!User) {
            return res.status(404).json(responseError(404, "User not found with this credentials"));
        }

        const verifyPass = await verifyPassword(password, User.password);
        if (!verifyPass) {
            return res.status(401).json(responseError(401, "Password did not match!"));
        }

        const loggedInUser = await userCollection.findById(User._id).select(`-password -refreshToken`)

        // Assuming generateAccessAndRefreshToken correctly returns an array of tokens
        const {accessToken, refreshToken} = await generateAccessAndRefreshToken(req, res, User._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, httpCookieOptions)
            .cookie("refreshToken", refreshToken, httpCookieOptions)
            .json(responseSuccess(200, 'User Login Successfully',
                { user: loggedInUser, accessToken, refreshToken }));

    } catch (err) {
        res.status(500).json(responseError(500, 'System error occurred ' + err));
        console.log(err.message);
    }
};

const logout = async (req, res) =>
{
    const updatedUser = await userCollection.findByIdAndUpdate(
        req.user._id, // this data come form jwt middleware ( verifyJWT )
        {
            $set: {
                refreshToken: undefined
            }
        },{new: true}
    )

    return res
        .status(200)
        .clearCookie("accessToken", httpCookieOptions)
        .clearCookie("refreshToken", httpCookieOptions)
        .json(responseSuccess(200, 'User Logout Successfully',));
}

const userList = async (req, res) => {
    try {
        // Fetch all users from the database
        const users = await userCollection.find({}, { password: 0 }); // Exclude password field from the result

        if (!users) {
            return res.status(404).json(responseError(404, 'No users found'));
        }

        // Return the list of users
        res.status(200).json(responseSuccess(200, 'User list retrieved successfully', users));
    } catch (err) {
        // Handle errors
        console.error('Error fetching user list:', err);
        res.status(500).json(responseError(500, 'Internal server error'));
    }
};

module.exports = {register, login, logout, userList }