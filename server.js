var net = require('net');
var url = require('url');

var JsonSocket = require('json-socket');

var port = 9838;
var server = net.createServer();
server.listen(port);
server.on('connection', function(socket) { //This is a standard net.Socket
    socket = new JsonSocket(socket); //Now we've decorated the net.Socket to be a JsonSocket

    socket.on('message', function(message) {
       // var result = message.a + message.b;
        console.log(message);
        socket.sendEndMessage(message);
    });
});