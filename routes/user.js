const express = require('express');

const {
  getAllUsers,
  getUser,
  getMe,
  deleteMe,
  updateMe
} = require('../controllers/user');

const { protect, login, signup } = require('../controllers/auth');

const router = express.Router();

router.get('/all/:type', getAllUsers);
router.get('/user/:id', getUser);
router.post('/login/:type', login);
router.post('/signup/:type', signup);

router.use(protect);

router.get('/me', getMe, getUser);
router.patch('/update-me', updateMe);
router.delete('/delete-me', deleteMe);

module.exports = router;
