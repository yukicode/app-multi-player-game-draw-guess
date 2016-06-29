var express = require("express");
var app = express();
var port = 8888;

var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname));

app.get("/", function(req, res){
    res.sendFile(__dirname + "/canvasgame.html");
});

io.on("connection", function(socket){
    console.log("a user connected!");
});

http.listen(port, function(){
    console.log("listening on port " + port);
});