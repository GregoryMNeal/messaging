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

  // get method for prompting for the to user id
  app.get('/new', function (req, resp, next) {
    let from_id = req.query.from_id;
    let q = 'SELECT * FROM users \
    WHERE id = $1';
    db.any(q, from_id)
      .then(function (results) {
        let from_name = results[0].name;
        let context = {
          title: 'New Message',
          from_id: from_id,
          from_name: from_name
        };
        resp.render('new.hbs', context);
      })
      .catch(next);
  });

  // get method for a list of conversations
  app.get('/conversations', function (req, resp, next) {
    let from_id = req.query.from_id;
    let q = 'SELECT * FROM conversations \
    LEFT JOIN users ON users.id = conversations.to_userid \
    WHERE from_userid = $1';
    db.any(q, from_id)
      .then(function (results) {
        let context = {
          title: 'Conversations',
          from_id: from_id,
          conversation: results
        };
        resp.render('conversations.hbs', context);
      })
      .catch(next);
  });

  // post method for root URL:/
  app.post('/new', function (req, resp, next) {
    // get conversation key
    let select_data = {
      from_id: req.body.from_id,
      to_id: req.body.to_id
    };
    let q = 'SELECT * FROM conversations \
    WHERE from_userid = ${from_id} OR to_userid = ${from_id} \
    AND from_userid = ${to_id} OR to_userid = ${to_id}';
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
            to_id: req.body.to_id
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

  // get method for messaging
  app.get('/message', function (req, resp, next) {
    let key = req.query.key;
    let from_id = req.query.from;
    let q = 'SELECT * FROM messages \
    LEFT JOIN users ON users.id = messages.sent_by \
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

  // post method for messaging
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
