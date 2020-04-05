const crypto = require('crypto');

const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const slugify = require('slugify');

const userSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['player', 'referee', 'admin']
  },
  location: {
    lat: {
      type: Number
    },
    lng: {
      type: Number
    }
  },
  photo: {
    type: String,
    default: 'default.jpeg'
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 7,
    select: false
  },
  goals: {
    type: Number
  },
  assists: {
    type: Number
  },
  // matches: {

  // }
  //   teams: [{
  //     type: mongoose.Schema.ObjectId,
  //     ref: 'Team',
  //   }],
  loginAttempts: {
    type: Number,
    default: 0,
    select: false
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  isActive: {
    type: Boolean,
    default: true,
    select: false
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function(next) {
  this.find({ isActive: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

userSchema.index({ name: 'text' });

module.exports = mongoose.model('User', userSchema);
