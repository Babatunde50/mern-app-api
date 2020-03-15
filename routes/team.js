const express = require('express');

const { getTeam, getAllTeams, getMe, deleteTeam, updateTeam } = require('../controllers/team');

const { protect, login, signup } = require('../controllers/auth');

const router = express.Router();

router.post('/login/:type', login);
router.post('/signup/:type', signup);

router.get('/', getAllTeams);
router.get('/:id', getTeam);


router.get("/:team/me", protect, getMe, getTeam);
router.patch("/:team/update-me", protect, updateTeam)
router.delete("/:team/delete-me",protect, getMe, deleteTeam)

module.exports = router;
