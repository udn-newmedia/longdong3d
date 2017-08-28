var express = require('express')

var app = express();
var db;

app.use(express.static('.'));

var server = app.listen(3000, function() {
	var port = server.address().port;
	console.log("Started server at port", port);
});
