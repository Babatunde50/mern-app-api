const User = require('../models/user');
const catchAsync = require('../utils/catch-async');
// const AppError = require('../utils/app-errors');
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

exports.getUser = factory.getOne(User);

exports.updateUser = factory.updateOne(User);

exports.getAllUsers = factory.getAll(User);

exports.deleteUser = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user._id, { isActive: false });
  
    res.status(204).json({
      status: 'success',
      data: null
    });
  });
  

// exports.getMe = (req, res, next) => {
//   req.params.id = req.user._id;
//   next();
// };

// exports.updateMe = catchAsync(async (req, res, next) => {
//   if (req.body.password || req.body.passwordConfirm) {
//     return next(new AppError('This route is not for password update', 400));
//   }

//   const filteredBody = filterObj(req.body, 'name', 'email');
//   if (req.file) filteredBody.photo = req.file.filename;
//   const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
//     new: true,
//     runValidators: true
//   });

//   res.status(200).json({
//     status: 'success',
//     data: {
//       user: updatedUser
//     }
//   });
// });
