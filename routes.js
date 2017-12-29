const uuidv4 = require('uuid/v4');

module.exports = function(app) {

  // get method for root URL:/
  app.get('/', function (req, resp, next) {
    var id = uuidv4();
    resp.redirect('/message/' + id);
  });

  // get method for messaging
  app.get('/message/:id', function (req, resp, next) {
    var id = req.params.id;
    var context = {
      title: 'Messaging',
      id: id
    };
    resp.render('message.hbs', context);
  });

  // get method for messaging
  app.post('/message', function (req, resp, next) {
    var id = req.body.id;
    resp.redirect('/message/' + id);
  });

}
