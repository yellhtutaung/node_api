const express = require('express');
const router = express.Router();
const {checkApiKey, verifyJWT} = require('../middleware/authMiddleware');

// controller
const {login, register, userList, logout} = require('../controllers/authController');

router.post('/register', checkApiKey, register);
router.post('/login', checkApiKey, login);
router.post('/logout', checkApiKey, verifyJWT,logout);

router.get('/users',checkApiKey,userList);

module.exports = router;