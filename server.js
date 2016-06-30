var express = require("express");
var app = express();
var port = 8888;

var http = require('http').Server(app);
var io = require('socket.io')(http);

var userCount = 0;
var userLimit = 4;
var userArray = [undefined, undefined, undefined, undefined];
var nextFill = 0;
var currentDrawer;

var User = function(name){
    this.isReady = false;
    this.name = name;
    this.isDrawer = false;
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

//game can start when there are more than 1 user and all users are ready
function canStartGame(){
    var canStartGame = userCount > 1 ? true : false ;
    for(var i=0; i<userLimit; i++){
        if(userArray[i] && !userArray[i].isReady){
            canStartGame = false;
        }
    }
    return canStartGame;
}

app.use(express.static(__dirname));

app.get("/", function(req, res){
    res.sendFile(__dirname + "/index.html");
});

io.on("connection", function(socket){
    var addUser = false,
        order;

    //display user-list when user connected
    socket.emit("user list", userArray);

    //display the canvas while drawer is drawing
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

    //generator new user when a user enters the game
    //update user-list
    //todo: name duplication check
    socket.on("enter game", function(name){
        order = addUserToArray(name);
        if(order != -1){
            addUser = true;
            userCount++;
        }else{
            console.log("failed adding user, slots are full");
        }
        io.emit("user list", userArray);
    });
    //delete user when disconnect
    //todo: handle disconnection during the game
    socket.on('disconnect', function(){
        if(addUser){
            delete userArray[order];
            userCount--;
            io.emit("user list", userArray);
        }
    });

    //update user status when user clicks ready button
    socket.on("user ready", function(){
        if(userArray[order]){
            userArray[order].isReady = true;
            io.emit("user list", userArray);
            if(canStartGame()){
                for(var j=0; j<userLimit; j++){
                    if(userArray[j]){
                        userArray[j].isDrawer = true;
                        currentDrawer = j;
                        break;
                    }
                }
                io.emit("user list", userArray);
                io.emit("game start", currentDrawer);
            }
        }
    });
});

http.listen(port, function(){
    console.log("listening on port " + port);
});