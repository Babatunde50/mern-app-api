const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    gameWeek: Number,
    fixtureType: {
      type: String,
      enum: ['competition', 'league', 'friendly']
    },
    competitionId: mongoose.Schema.Types.ObjectId,
    homeTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true
    },
    awayTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true
    },
    homeTeamScore: {
      type: Number,
      deafult: 0
    },
    awayTeamScore: {
      type: Number,
      default: 0
    },
    fixtureDuration: {
      type: Number,
      max: 90,
      min: 30
    },
    fixtureDate: {
      type: Date,
      required: true
    },
    live: {
      type: Boolean,
      default: false
    },
    referee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    currentTime: Date,
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

module.exports = mongoose.model('Fixture', matchSchema);
