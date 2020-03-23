const multer = require('multer');
const sharp = require('sharp');

const User = require('../models/user');
const catchAsync = require('../utils/catch-async');
const AppError = require('../utils/app-errors');
const factory = require('./handler-factory');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('NOt an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

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
 }
  res.status(200).json({
    status: 'success',
    data: {
      user: newUser
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
