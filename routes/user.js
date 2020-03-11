const express = require('express');

const {
  getAllUsers,
  getUser,
  deleteUser,
  updateUser
} = require('../controllers/user');

const { protect, login, signup } = require('../controllers/auth');

const router = express.Router();

router.get('/:type',getAllUsers);
router.post('/login/:type', login);
router.post('/signup/:type', signup);

router.use(protect);
router
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

module.exports = router;
