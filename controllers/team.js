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
  
  exports.updateTeamBasics = catchAsync(async (req, res, next) => {
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
        team: updatedTeam
      }
    });
  });

  exports.updateTeamPic = catchAsync(async (req, res, next) => {
    if (!req.file || !req.file.filename) {
      return next(new AppError('Please provide an image'));
    }
    const updatedTeam = await Team.findByIdAndUpdate(
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
        team: updatedTeam
      }
    });
  });

  exports.updateTeamPassword = catchAsync(async (req, res, next) => {
    const filteredBody = filterObj(req.body, 'initialPassword', 'newPassword');
    const team = await Team.findById(req.user._id).select('+password');
    const isPasswordCorrect = await team.correctPassword(
      filteredBody.initialPassword,
      team.password
    );
    if (!isPasswordCorrect) {
      return next(new AppError('Password is not correct.'));
    }
    team.password = filteredBody.newPassword;
    await team.save();
   const newTeam = {
     ...team._doc,
     password: undefined,
     passwordChangedAt: undefined
   }
    res.status(200).json({
      status: 'success',
      data: {
        user: newTeam
      }
    });
  });
  
  
  exports.deleteTeam = catchAsync(async (req, res, next) => {
    await Team.findByIdAndUpdate(req.user._id, { isActive: false });
  
    res.status(204).json({
      status: 'success',
      data: null
    });
  });

exports.getTeam = factory.getOne(Team);

exports.getAllTeams = factory.getAll(Team);
