const crypto = require('crypto');

const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const slugify = require('slugify');

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: [true, 'An E-Mail is required'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'A password is required'],
        minLength: 7,
        select: false
    },
    players: [
        {
         type: mongoose.Schema.ObjectId,
         ref: 'User',
        }
    ],
    slug: {
        type: String
    },
    captain: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
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

teamSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
  });
  
  teamSchema.pre('save', function(next) {
    if (!this.isModified('password') || this.isNew) return next();
  
    this.passwordChangedAt = Date.now() - 1000;
    next();
  });
  
  teamSchema.pre(/^find/, function(next) {
    this.find({ isActive: { $ne: false } });
    next();
  });
  
  teamSchema.methods.correctPassword = async function(
    candidatePassword,
    userPassword
  ) {
    return await bcrypt.compare(candidatePassword, userPassword);
  };
  
  teamSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
      const changedTimestamp = parseInt(
        this.passwordChangedAt.getTime() / 1000,
        10
      );
      return JWTTimestamp < changedTimestamp;
    }
    return false;
  };
  
  teamSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
  
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  
    return resetToken;
  };
  
  teamSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();
  });
  
  

module.exports = mongoose.model('Team', teamSchema);