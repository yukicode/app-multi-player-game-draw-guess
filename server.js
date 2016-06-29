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
    socket.on("mousedown", function(msg){
        socket.broadcast.emit("recive mousedown", msg);
    });
    socket.on("mousemove", function(msg){
        socket.broadcast.emit("recive mousemove", msg);
    });
    socket.on("mouseup", function(msg){
        socket.broadcast.emit("recive mouseup", msg);
    });
    socket.on("change width", function(msg){
        socket.broadcast.emit("recive change width", msg);
    });
});

http.listen(port, function(){
    console.log("listening on port " + port);
});