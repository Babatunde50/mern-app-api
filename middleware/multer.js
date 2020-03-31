const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../utils/app-errors');
const catchAsync = require('../utils/catch-async');

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

exports.resizeUserPhoto = photoType =>
  catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `${photoType}-${req.user._id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/${photoType}/${req.file.filename}`);

    next();
  });
