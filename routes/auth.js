const express = require('express');
const router = express.Router();
const {checkApiKey} = require('../middleware/authMiddleware');

// controller
const {login, register} = require('../controllers/authController');

router.post('/login',checkApiKey,function(req,res){
    return res.json({data:req.body.username});
});

router.post('/register',checkApiKey,register);

module.exports = router;