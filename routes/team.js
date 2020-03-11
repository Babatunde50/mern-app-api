const express = require('express');

const { getTeam, getAllTeams } = require('../controllers/team');

const { protect, login, signup } = require('../controllers/auth');

const router = express.Router();

router.post('/login/:type', login);
router.post('/signup/:type', signup);

router.get(getAllTeams);
router.get('/:id', getTeam);

module.exports = router;
