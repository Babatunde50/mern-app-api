const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const slugify = require('slugify')

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A player must have a name']
  },
  email: {
    type: String,
    required: [true, 'An E-Mail is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  slug: {
    type: String
  },
  age: {
      type: Number
  },
  photo: {
    type: String,
    default: 'default.jpeg'
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  goals: {
      type: Number,
      default: 0
  },
  assists: {
      type: Number,
      default: 0
  },
//   teams: [{
//     type: mongoose.Schema.ObjectId,
//     ref: 'Team',
//   }],
  averageRatings: {
      type: Number
  },
  isActive: {
    type: Boolean,
    default: true,
    select: false
  }
});

playerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

playerSchema.pre(/^find/, function(next) {
  this.find({ isActive: { $ne: false } });
  next();
});

playerSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

playerSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();
  });

module.exports = mongoose.model('Player', playerSchema);
