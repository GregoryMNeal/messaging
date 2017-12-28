// This file handles the configuration of the app.
// It is required by app.js

var express = require('express');

module.exports = function(app){

	// use handlebars for template rendering
  app.set('view engine', 'hbs');

	// Tell express where it can find the templates
	app.set('views', __dirname + '/views');

	// Make the files in the public folder available to the world
	app.use(express.static(__dirname + '/public'));

};
