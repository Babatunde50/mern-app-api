const express = require('express');

const {
  getTeam,
  getAllTeams,
  getMe,
  deleteTeam,
  updateTeamBasics,
  updateTeamPassword,
  updateTeamPic,
  acceptPlayerRequest,
  getNotification
} = require('../controllers/team');

const { uploadUserPhoto, resizeUserPhoto } = require('../middleware/multer.js');

const { protect, login, signup } = require('../controllers/auth');

const router = express.Router();

router.post('/login/:type', login);
router.post('/signup/:type', signup);

router.get('/', getAllTeams);
router.get('/:id', getTeam);

// router.use(protect);

router.get('/:team/me', protect, getMe, getTeam);
router.get('/:team/notifications/:notificationId', protect, getNotification )
router.patch('/:team/update-me/basic-info', protect, updateTeamBasics);
router.patch(
  '/:team/update-me/pics',
  protect,
  uploadUserPhoto,
  resizeUserPhoto('teams'),
  updateTeamPic
);
router.patch('/:team/update-me/password', protect, updateTeamPassword);
router.post('/:team/requests/accept', protect, acceptPlayerRequest);
router.delete('/:team/delete-me', protect, deleteTeam);

module.exports = router;
