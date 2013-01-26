var http = module.require('http');
var express = require('express');
var io = module.require('socket.io');

var app = express();
var httpServer = http.createServer(app);
var sockServer = io.listen(httpServer);

app.use(express.static(__dirname + '/../public_html'));

sockServer.on('connection', function(client) {

});

httpServer.listen(80);