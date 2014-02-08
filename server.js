var express = require('express'),
	register = require('./regDev.js'),
	app = express(),
	loggedUsers = [];

app.use(express.logger());

// Configuration

app.configure(function() {
	app.set('views', __dirname + '/app');
	//app.set('view engine', 'jade');

	app.use(express.bodyParser());
	app.use(express.cookieParser('adgfasldfihDIJEoisdkcnasjfdhiwer38e'));
	app.use(express.session());
	app.use(express.methodOverride());
	app.use(express.static(__dirname + '/app'));
	app.use(app.router);
	//app.engine('html');
});

app.set("view options", {
	layout: false
});

app.get('/', function(request, response) {
	response.sendfile('app/index.html');
});

app.get('/webPart', function(request, response) {
	response.sendfile('app/webpart.html');
});

app.post('/login', function(request, response) {
	var username = request.body.username,
		password = request.body.password,
		user = {
			username: username,
			password: password
		};

	register.registerDevice()
		.then(function(device) {
			return register.getToken(device);
		})
		.then(function(cipherValue) {
			return register.getTokenLiveId(cipherValue, user);
		})
		.then(function(options) {
			if (options.KeyIdentifier !== "" && options.CiperValue0 !== "" && options.CiperValue1 !== "") {
				request.session.regenerate(function() {
					request.session.user = username;
					loggedUsers.push({
						username: username,
						options: options
					});
					response.send({
						logged: true
					});
				});
			} else {
				response.send({
					logged: false
				});
			}
		})
		.done();


	register.registerDevice(function(device) {
		register.getToken(device, function(cipherValue) {
			register.getTokenLiveId(cipherValue, user, function(options) {

				if (options.KeyIdentifier !== "" && options.CiperValue0 !== "" && options.CiperValue1 !== "") {
					request.session.regenerate(function() {
						request.session.user = username;
						loggedUsers.push({
							username: username,
							options: options
						});
						response.send({
							logged: true
						});
					});
				} else {
					response.send({
						logged: false
					});
				}
			});
		});
	});

});

app.get('/soap/entity/:entity/attribute/:attribute', restrict, function(request, response) {

	var options, i, len, userexists = false;

	for (i = 0, len = loggedUsers.length; i < len; i++) {
		if (loggedUsers[i].username === request.session.user) {
			options = loggedUsers[i].options;
			userexists = true;
			break;
		}
	}

	if (userexists) {
		options.EntityName = request.params.entity;
		options.ColumnSet = [request.params.attribute];
		register.retrieveMultiple(options, function(results) {
			response.send(results);
		});
	} else {
		response.send([{
			userfound: false
		}]);
	}
});

function restrict(request, response, next) {
	if (request.session.user) {
		next();
	} else {
		request.session.error = 'Access denied!';
		response.send("You must login");
	}
}


var port = process.env.PORT || 5000;

app.listen(port, function() {
	log('Listening on ' + port);
});

function log(mes) {
	process.stdout.write(mes + '\n');
}