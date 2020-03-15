const User = require('../models/user');
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

exports.updateMe = catchAsync(async (req, res, next) => {
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


exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { isActive: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getUser = factory.getOne(User);

exports.getAllUsers = factory.getAll(User);