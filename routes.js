// Tools for accessing the database
const pgp = require('pg-promise')({});
const db = pgp(process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/messaging');

// Tool for formatting urls
const url = require('url');

// Tool for assigning a unique conversation id
const uuidv4 = require('uuid/v4');

// Tool for retrieving current date/time
const moment = require('moment');

module.exports = function(app) {

  // get method for prompting for the from user id
  app.get('/prompt', function (req, resp, next) {
    let context = {
      title: 'Messaging App'
    };
    resp.render('prompt.hbs', context);
  });

  // get method for displaying a list of conversations
  app.get('/conversations', function (req, resp, next) {
    let from_id = req.query.from_id;
    let q = 'SELECT conversation_key, from_userid, \
    from_user.screen_name AS from_screen_name, \
    to_user.screen_name AS to_screen_name FROM conversations \
    JOIN users AS from_user ON from_userid = from_user.userid \
    JOIN users AS to_user ON to_userid = to_user.userid \
    WHERE from_userid = $1 OR to_userid = $1 AND last_message != NULL \
    ORDER BY last_message DESC';
    db.any(q, from_id)
      .then(function (results) {
        for (var i = 0; i < results.length; i++) {
          if (results[i].from_userid == from_id) {
            results[i].screen_name = results[i].to_screen_name;
          } else {
            results[i].screen_name = results[i].from_screen_name;
          }
          results[i].from_id = from_id;
        }
        let context = {
          title: 'Conversations',
          from_id: from_id,
          conversation: results
        };
        resp.render('conversations.hbs', context);
      })
      .catch(next);
  });

  // get method for intiating a new message
  app.get('/new', function (req, resp, next) {
    let from_id = req.query.from_id;
    let q = 'SELECT * FROM users \
    WHERE userid = $1';
    db.any(q, from_id)
      .then(function (results) {
        let screen_name = results[0].screen_name;
        let context = {
          title: 'New Message',
          from_id: from_id,
          screen_name: screen_name
        };
        resp.render('new.hbs', context);
      })
      .catch(next);
  });

  // post method for initiating a new message
  app.post('/new', function (req, resp, next) {
    // get conversation key
    let select_data = {
      from_id: req.body.from_id,
      to_id: req.body.to_id
    };
    let q = 'SELECT * FROM conversations \
    WHERE from_userid = ${from_id} AND to_userid = ${to_id} \
    OR from_userid = ${to_id} AND to_userid = ${from_id}';
    db.any(q, select_data)
      .then(function(results){
        if(results.length !== 0) {
          // continue an existing conversation
          var key = results[0].conversation_key;
          resp.redirect(url.format({
            pathname: "/message",
            query: {
              "key": key,
              "from": req.body.from_id
            }
          }));
        } else {
          // start a new conversation
          let key = uuidv4();
          let insert_data = {
            conversation_key: key,
            from_id: req.body.from_id,
            to_id: req.body.to_id,
          };
          let q = 'INSERT INTO conversations \
          VALUES (default, ${conversation_key}, ${from_id}, ${to_id})';
          db.any(q, insert_data)
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
        }
      })
      .catch(function(e){
        console.log(e);
      });
  });

  // get method for sending messages
  app.get('/message', function (req, resp, next) {
    let key = req.query.key;
    let from_id = req.query.from;
    let q = 'SELECT * FROM messages \
    LEFT JOIN users ON users.userid = messages.sent_by \
    WHERE conversation_key = $1 \
    ORDER BY datetime_sent DESC';
    db.any(q, key)
      .then(function (results) {
        let context = {
          title: 'Messaging',
          key: key,
          from_id: from_id,
          message: results
        };
        resp.render('message.hbs', context);
      })
      .catch(next);
  });

  // post method for sending messages
  app.post('/message', function (req, resp, next) {
    let key = req.body.key;
    let now = moment();
    let insert_data = {
      conversation_key: key,
      message: req.body.message,
      datetime_sent: now,
      sent_by: req.body.from_id
    };
    let q = 'INSERT INTO messages \
    VALUES (default, ${conversation_key}, ${message}, ${datetime_sent}, NULL, ${sent_by})';
    db.any(q, insert_data)
      .then(function () {
        // update conversation with date/time of latest message
        let update_data = {
          now: now,
          key: key
        };
        let q = 'UPDATE conversations SET last_message = ${now} WHERE conversation_key = ${key}';
        db.any(q, update_data)
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
      })
      .catch(next);
  });

}
