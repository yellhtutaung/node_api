const mongoose = require('mongoose');
const generateRandomStr = require('../controllers/helpers/helper');
const userSchema = new mongoose.Schema({
    id:{
        type: Number,
        required: "Id fiels is required"
    },
    name:{
        type: String,
        required: 'Name must be at least 4 characters',
        minLength: 4,  
        maxLength: 25
    },
    username:{
        type: String,
        default: null,
        unique: true,
    },
    email:{
        type: String,
        required: 'Email is required',
        unique: true,
        maxLength: 30
    },
    phone:{
        type: String,
        default: null,
        unique: true,
        maxLength: 15
    },
    password:{
        type: String,
        required: 'Password must be at least 6 characters',
        minLength:6,
        // maxLength:40
    },
    date_of_birth:{
        type: String,
        default: null
    },
    gender:{
        type: String,
        default: 'Male'
    },
    profile:{
        type: String,
        default: null
    },
    role:{
        type: String,
        default: 'user'
    },
    hide_show:{
        type: Number,
        default: 1
    },
    status:{
        type: Number,
        default: 1
    },
    is_ban:{
        type: Number,
        default: 0
    },
    token:{
        type: String,
        required: 'Token is required',
    }
},
    { timestamps: true }
);

const userCollection = mongoose.model('users',userSchema);

module.exports = userCollection;
