const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['send', 'accept'],
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    },
    viewed: {
      type: Boolean,
      default: false
    },
    message: {
      type: String
    }
  },
  { timestamps: true }
);

notificationSchema.pre('find', function(next) {
  this.populate('userId', 'name')
  next();
});

module.exports = mongoose.model('Notification', notificationSchema);
