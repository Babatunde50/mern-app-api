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

// exports.restrictTo = (...roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//       return next(
//         new AppError("You don't have permission to perform this action", 403)
//       );
//     }
//     next();
//   };
// };

// exports.forgotPassword = catchAsync(async (req, res, next) => {
//   const user = await User.findOne({ email: req.body.email });
//   if (!user) {
//     return next(new AppError('There is no user with that email address', 404));
//   }
//   const resetToken = user.createPasswordResetToken();
//   await user.save({ validateBeforeSave: false });

//   const resetURL = `${req.protocol}://${req.get(
//     'host'
//   )}/api/v1/users/reset-password/${resetToken}`;

//   try {
//     await new Email(user, resetURL).sendPasswordReset();
//     res.status(200).json({
//       status: 'success',
//       message: 'Token sent to email'
//     });
//   } catch (err) {
//     user.passwordResetToken = undefined;
//     user.passwordResetExpires = undefined;

//     await user.save({ validateBeforeSave: false });

//     return next(
//       new AppError(
//         'There was an error sending the email, plese try again later',
//         500
//       )
//     );
//   }
// });

// exports.resetPassword = catchAsync(async (req, res, next) => {
//   const hashedToken = crypto
//     .createHash('sha256')
//     .update(req.params.token)
//     .digest('hex');

//   const user = await User.findOne({
//     passwordResetToken: hashedToken,
//     passwordResetExpires: { $gt: Date.now() }
//   });

//   if (!user) {
//     return next(new AppError('Token is invalid or has expired.', 400));
//   }
//   user.password = req.body.password;
//   user.passwordConfirm = req.body.passwordConfirm;
//   user.passwordResetToken = undefined;
//   user.passwordResetExpires = undefined;
//   await user.save();

//   createSendToken(user, 200, res);
// });

// exports.updatePassword = catchAsync(async (req, res, next) => {
//   const { currentPassword, newPassword, newPasswordConfirm } = req.body;
//   const foundUser = await User.findOne({ _id: req.user._id }).select(
//     '+password'
//   );
//   if (!foundUser) {
//     return next(
//       new AppError(
//         'You need to be logged in in order to perform this action',
//         401
//       )
//     );
//   }
//   const isMatch = await foundUser.correctPassword(
//     currentPassword,
//     foundUser.password
//   );
//   if (!isMatch) {
//     return next(
//       new AppError('Password do not match with previous password', 400)
//     );
//   }

//   foundUser.password = newPassword;
//   foundUser.passwordConfirm = newPasswordConfirm;
//   await foundUser.save();

//   createSendToken(foundUser, 200, req, res);
// });
