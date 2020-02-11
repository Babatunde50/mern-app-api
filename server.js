const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', err => {
  console.log(err.name, err.message, err);
  console.log('UNHANDLED REJECTION! shutting down...');
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

// const DB = process.env.DATABASE.replace(
//   '<PASSWORD>',
//   process.env.DATABASE_PASSWORD
// );

const DB = process.env.DATABASE_LOCAL;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('DB connection was successful!');
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () =>
  console.log(`App listening on port ${port}!`)
);

process.on('unhandledRejection', err => {
  console.log(err.name, err.message, err);
  server.close(() => {
    console.log('UNHANDLED REJECTION! shutting down...');
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('sigterm received. Shutting down gracefully.');
  server.close(() => {
    console.log('Shutting down');
  });
});
