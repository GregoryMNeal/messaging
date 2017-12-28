module.exports = {

  // get method for root URL:/
  app.get('/', function (req, resp, next) {
    var context = {
      title: 'Messaging App',
    };
    resp.render('index.hbs', context);
  });

}
