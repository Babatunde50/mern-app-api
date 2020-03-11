const Team = require('../models/team');
const catchAsync = require('../utils/catch-async');
const factory = require('./handler-factory');


exports.getTeam = factory.getOne(Team);

exports.updateTeam = factory.updateOne(Team);

exports.getAllTeams = factory.getAll(Team);


//   const filterObj = (obj, ...allowedFields) => {
//     const newObj = {};
  
//     Object.keys(obj).forEach(el => {
//       if (allowedFields.includes(el)) {
//         newObj[el] = obj[el];
//       }
//     });
  
//     return newObj;
//   };

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
