const mongoose = require('mongoose');

const competitionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['tournament', 'league']
    },
    teams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
      }
    ],
    referees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    highestGoalScorer: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    highestAssists: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    startDate: Date,
    endDate: Date,
    location: {
      lat: {
        type: Number,
        required: true
      },
      lng: {
        type: Number,
        required: true
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Team', competitionSchema);
