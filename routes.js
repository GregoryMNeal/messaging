// Tools for accessing the database
const pgp = require('pg-promise')({});
const db = pgp(process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/messaging');

// Tool for formatting urls
const url = require('url');

// Tool for assigning a unique conversation id
const uuidv4 = require('uuid/v4');

// Tool for retrieving current date/time
var moment = require('moment');

module.exports = function(app) {

  // get method for root URL:/
  app.get('/', function (req, resp, next) {
    var context = {
      title: 'Messaging App'
    };
    resp.render('index.hbs', context);
  });

  // post method for root URL:/
  app.post('/', function (req, resp, next) {
    var from_id = req.body.from_id;
    var to_id = req.body.to_id;
    // get conversation key
    var q = 'SELECT * FROM conversations \
    WHERE from_userid = $1 OR to_userid = $1 \
    AND from_userid = $2 OR to_userid = $2';
    db.any(q, from_id, to_id)

    // assign a unique conversation key
    var key = uuidv4();
    var table_data = {
      conversation_key: key,
      from_id: req.body.from_id,
      to_id: req.body.to_id
    };
    var q = 'INSERT INTO conversations \
    VALUES (default, ${conversation_key}, ${from_id}, ${to_id})';
    db.any(q, table_data)
      .then(function () {
        resp.redirect(url.format({
          pathname: "/message",
          query: {
            "key": key,
            "from": req.body.from_id
          }
        }));
      })
      .catch(next);
  });

  // get method for messaging
  app.get('/message', function (req, resp, next) {
    var key = req.query.key;
    var from_id = req.query.from;
    var q = 'SELECT * FROM messages \
    LEFT JOIN users ON users.id = messages.sent_by \
    WHERE conversation_key = $1 \
    ORDER BY datetime_sent DESC';
    db.any(q, key)
      .then(function (results) {
        var context = {
          title: 'Messaging',
          key: key,
          from_id: from_id,
          message: results
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
      conversation_key: key,
      message: req.body.message,
      datetime_sent: now,
      sent_by: req.body.from_id
    };
    var q = 'INSERT INTO messages \
    VALUES (default, ${conversation_key}, ${message}, ${datetime_sent}, ${sent_by})';
    db.any(q, table_data)
      .then(function () {
        resp.redirect(url.format({
          pathname: "/message",
          query: {
            "key": key,
            "from": req.body.from_id
          }
        }));
      })
      .catch(next);
  });

}
