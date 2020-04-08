const User = require('../models/user');
const Notification = require('../models/notification');
const catchAsync = require('../utils/catch-async');
const AppError = require('../utils/app-errors');
const factory = require('./handler-factory');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};

  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });

  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

exports.updateMeBasic = catchAsync(async (req, res, next) => {
  if (req.body.password) {
    return next(new AppError('This route is not for password update', 400));
  }
  const filteredBody = filterObj(req.body, 'name', 'email', 'age');
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.updateMePic = catchAsync(async (req, res, next) => {
  if (!req.file || !req.file.filename) {
    return next(new AppError('Please provide an image'));
  }
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { photo: req.file.filename },
    {
      new: true,
      runValidators: true
    }
  );
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.updateMePassword = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(req.body, 'initialPassword', 'newPassword');
  const user = await User.findById(req.user._id).select('+password');
  const isPasswordCorrect = await user.correctPassword(
    filteredBody.initialPassword,
    user.password
  );
  if (!isPasswordCorrect) {
    return next(new AppError('Password is not correct.'));
  }
  user.password = filteredBody.newPassword;
  await user.save();
  const newUser = {
    ...user._doc,
    password: undefined,
    passwordChangedAt: undefined
  };
  res.status(200).json({
    status: 'success',
    data: {
      user: newUser
    }
  });
});

exports.joinTeamRequest = catchAsync(async (req, res, next) => {
  if (req.user.type !== 'player') {
    return next(
      new AppError('Only a player can send a request to join a team.', 403)
    );
  }
  const data = {
    userId: req.user._id,
    type: "send",
    teamId: req.body.teamId,
    message: req.body.message || 'I will like to be part of this great team.'
  };
  const newNotification = await Notification.create(data);
  res.status(201).json({
    status: 'success',
    data: {
      notification: newNotification
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { isActive: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getUser = factory.getOne(User);

exports.getAllUsers = factory.getAll(User);
