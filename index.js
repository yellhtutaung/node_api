const dotenv = require('dotenv');
dotenv.config({path:'./config/.env'});
const cheerio = require('cheerio');
const axios = require('axios');
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

// mongoose db connection
require('./database/mongooseDb');

//body-parser config;
app.use(bodyParser.urlencoded({extended: true })); // These code must me upper of the controllers include
app.use(bodyParser.json()); // These code must be upper of the controllers include

// route group
const authRoutes = require('./routes/auth');
const seederRoutes = require('./routes/seeder');

// middleware 
app.use(express.json());
app.use(cors());

// api version prefix
const apiVersionPrefix = process.env.API_VERSION_PREFIX;

// route group
app.use(apiVersionPrefix,authRoutes);
app.use(apiVersionPrefix,seederRoutes);

app.get('/', async function(req,res){
    res.json({data:'ok'});
});

const Port = process.env.PORT || 3300;
const Host = process.env.HOST ||  'localhost';
app.listen(Port,Host,function () {
    console.log(`Server is running on ${Host} : ${Port}`);
});