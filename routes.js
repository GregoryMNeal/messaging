// Tools for accessing the database
const pgp = require('pg-promise')({});
const db = pgp(process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/messaging');

// Tool for assigning a unique id
const uuidv4 = require('uuid/v4');

// Tool for retrieving current date/time
var moment = require('moment');

module.exports = function(app) {

  // get method for root URL:/
  app.get('/', function (req, resp, next) {
    var key = uuidv4();
    resp.redirect('/message/' + key);
  });

  // get method for messaging
  app.get('/message/:key', function (req, resp, next) {
    var key = req.params.key;
    var q = 'SELECT * FROM messages \
    LEFT JOIN users ON users.id = messages.users_id \
    WHERE message_key = $1 \
    ORDER BY datetime_sent DESC';
    db.any(q, key)
      .then(function (results) {
        var context = {
          title: 'Messaging',
          key: key,
          messages: results
        };
        resp.render('message.hbs', context);
      })
      .catch(next);
  });

  // post method for messaging
  app.post('/message', function (req, resp, next) {
    var key = req.body.key;
    var now = moment();
    var table_data = {
      message_key: key,
      message: req.body.message,
      datetime_sent: now
    };
    var q = 'INSERT INTO messages \
    VALUES (default, ${message_key}, ${message}, ${datetime_sent})';
    db.any(q, table_data)
      .then(function (results) {
        resp.redirect('/message/' + key);
      })
      .catch(next);
  });

}
