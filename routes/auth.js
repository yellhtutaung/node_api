const express = require('express');
const router = express.Router();
const {checkApiKey} = require('../middleware/authMiddleware');

// controller
const {login, register} = require('../controllers/authController');

router.post('/login',checkApiKey,login);

router.post('/register',checkApiKey,register);

module.exports = router;