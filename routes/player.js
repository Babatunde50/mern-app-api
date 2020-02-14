const express = require('express');

const {
  getAllPlayers,
  getPlayer,
  deletePlayer,
  updatePlayer
} = require('../controllers/user');

const router = express.Router();

router
  .route('/')
  .get(getAllPlayers)

router
  .route('/:id')
  .get(getPlayer)
  .patch(updatePlayer)
  .delete(deletePlayer);

module.exports = router;
