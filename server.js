var express = require("express");
var app = express();
var port = 8888;

var http = require('http').Server(app);
var io = require('socket.io')(http);

var userCount = 0;
var userLimit = 4;
var userArray = [undefined, undefined, undefined, undefined];
var nextFill = 0;

var User = function(name){
    this.isDrawer = false;
    this.isReady = false;
    this.name = name;
}

function addUserToArray(name){
    if(userCount === userLimit){
        return -1;
    }
    while(userArray[nextFill]){
        nextFill++;
        if(nextFill > 3){
            nextFill = 0;
        }
    }
    userArray[nextFill] = new User(name);
    return nextFill;
}

app.use(express.static(__dirname));

app.get("/", function(req, res){
    res.sendFile(__dirname + "/index.html");
});

io.on("connection", function(socket){
    var addUser = false,
        order;
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

    socket.on("enter game", function(name){
        order = addUserToArray(name);
        if(order != -1){
            addUser = true;
            userCount++;
        }else{
            console.log("failed adding user, slots are full");
        }
        console.log(userArray);
    });
    socket.on('disconnect', function(){
        if(addUser){
            delete userArray[order];
            userCount--;
            console.log(userArray);
        }
    });
});

http.listen(port, function(){
    console.log("listening on port " + port);
});