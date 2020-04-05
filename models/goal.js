const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  competitionId: {
    type: mongoose.Schema.Types.ObjectIdl,
    ref: 'Competition'
  },
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  fixtureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fixture'
  }
});

module.exports = mongoose.model('Goal', goalSchema);
