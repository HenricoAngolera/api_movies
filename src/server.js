require('express-async-errors');

const migrationsRun = require('./database/sqlite/migrations');

const AppError = require('./utils/AppError');

const uploadConfig = require('./config/upload')

const cors = require('cors')
const express = require('express');

const routes = require('./routes');

migrationsRun();

const app = express();
app.use(cors())

app.use(express.json());

app.use("/files", express.static(uploadConfig.UPLOAD_FOLDER))
app.use(routes);

app.use(( error, request, response, next ) => {
  if( error instanceof AppError ){
    return response.status(error.statusCode).json({
      error: "error",
      message: error.message
    })
  }

  console.error(error)

  return response.status(500).json({
    error: "error",
    message: "Internal server error."
  })
})

const PORT = 3322;

app.listen(PORT, () => console.log('Server is running on port ' + PORT));
