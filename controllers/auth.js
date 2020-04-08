const { promisify } = require('util');

const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Team = require('../models/team');
const catchAsync = require('../utils/catch-async');

const getCoordsForAddress = require('../utils/location');

const AppError = require('../utils/app-errors');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: user
    }
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const signUpType = req.params.type;
  let newUser;
  const location = await getCoordsForAddress(req.body.location);
  const data = {
    email: req.body.email,
    password: req.body.password,
    name: req.body.name,
    location
  };
  if (signUpType === 'team') {
    newUser = await Team.create(data);
  } else if (signUpType === 'user') {
    newUser = await await User.create(data);
  } else {
    return next(new AppError('Invalid params or no params found', 401));
  }
  createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const loginType = req.params.type;
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  let user;

  if (loginType === 'team') {
    user = await Team.findOne({ email }).select('+password +loginAttempts');
  } else if (loginType === 'user') {
    user = await User.findOne({ email }).select('+password +loginAttempts');
    console.log(user);
  } else {
    return next(new AppError('Invalid params or no params found', 401));
  }

  if (!user) {
    return next(new AppError('Incorrect email or password', 401));
  }

  if (user.loginAttempts >= 10) {
    return next(
      new AppError(
        'Maximum login attemps exceeded. Please login in the next 1 hour',
        401
      )
    );
  }

  if (!(await user.correctPassword(password, user.password))) {
    user.loginAttempts += 1;
    await user.save();
    if (user.loginAttempts >= 10) {
      setTimeout(async () => {
        user.loginAttempts = 0;
        await user.save();
      }, 3600000);
    }
    return next(new AppError('Incorrect email or password', 401));
  }

  user.loginAttempts = 0;
  await user.save();

  createSendToken(user, 200, req, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('You are not logged in! Please login to get access', 401)
    );
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  console.log(req.params.team, decoded.id);

  const freshUser = req.params.team
    ? await Team.findById(decoded.id)
    : await User.findById(decoded.id);

  if (!freshUser) {
    return next(
      new AppError(
        'The user belonging to this token does not longer exists',
        401
      )
    );
  }

  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please login again.', 401)
    );
  }
  req.user = freshUser;
  next();
});

