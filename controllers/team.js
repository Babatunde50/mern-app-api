const Team = require('../models/team');
const catchAsync = require('../utils/catch-async');
const factory = require('./handler-factory');
const AppError = require('../utils/app-errors');

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
    console.log(req.params.id);
    next();
  };
  
  exports.updateTeam = catchAsync(async (req, res, next) => {
    if (req.body.password) {
      return next(new AppError('This route is not for password update', 400));
    }
  
    const filteredBody = filterObj(req.body, 'name', 'email');
    const updatedTeam = await Team.findByIdAndUpdate(req.user._id, filteredBody, {
      new: true,
      runValidators: true
    });
  
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedTeam
      }
    });
  });
  
  
exports.deleteTeam = factory.deleteOne(Team);

exports.getTeam = factory.getOne(Team);

exports.getAllTeams = factory.getAll(Team);
