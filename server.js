var express = require('express');

var app = express();
app.use(express.logger());

// Configuration

app.configure(function () {
	app.set('views', __dirname + '/app');
	//app.set('view engine', 'jade');

	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.static(__dirname + '/app'));
	app.use(app.router);
	//app.engine('html');
});


app.get('/', function (request, response) {
	response.render('index.html');
});


var port = process.env.PORT || 5000;

app.listen(port, function () {
	log('Listening on ' + port);
});

function log(mes) {
    process.stdout.write(mes + '\n');
}