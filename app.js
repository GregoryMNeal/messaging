// This is the main file of the messaging app. It initializes a new
// express.js instance, requires the config and routes files
// and listens on a port. Start the application by running
// 'node app.js' or 'nodemon app.js' in your terminal

const express = require('express');
const app = express();
const body_parser = require('body-parser');
const pgp = require('pg-promise')({});

// Database setup
const db = pgp(process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/messaging_test');

// Application setup
app.use(body_parser.urlencoded({extended: false}));

// Server setup
const port = process.env.PORT || 8000;

// Require the configuration and the routes files, and pass
// the app and io as arguments to the returned functions.

require('./config')(app);
require('./routes')(app);

// Listen for requests
app.listen(port, function() {
  console.log('* Listening on port ' + port + ' *' );
});
