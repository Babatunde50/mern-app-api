const axios = require('axios');

const AppError = require('./app-errors');

const getCoordsForAddress = async address => {
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${process.env.GOOGLE_API_KEY}`
  );

  const data = response.data;
  if (!data || data.response === 'ZERO_RESULTS') {
    return next(
      new AppError('Could not find location for the specified address', 422)
    );
  }
  const coordinates = data.results[0].geometry.location;
  return coordinates;
};

module.exports = getCoordsForAddress;
