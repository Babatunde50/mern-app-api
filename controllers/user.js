const Player = require('../models/player');
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

exports.getPlayer = factory.getOne(Player);

exports.updatePlayer = factory.updateOne(Player);

exports.getAllPlayers = factory.getAll(Player);

exports.deletePlayer = catchAsync(async (req, res, next) => {
    await Player.findByIdAndUpdate(req.user._id, { isActive: false });
  
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
