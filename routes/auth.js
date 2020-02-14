const express = require('express');

const { signup, login } = require('../controllers/auth');

const router = express.Router();

router.post('/signup/:user', signup);
router.post('/login/:user', login);

module.exports = router;
