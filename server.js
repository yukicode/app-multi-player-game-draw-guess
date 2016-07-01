var express = require("express");
var app = express();
var port = 8888;

var fs = require("fs");
var words;

var http = require('http').Server(app);
var io = require('socket.io')(http);

var userCount = 0;
var userLimit = 4;
var userArray = [undefined, undefined, undefined, undefined];
var nextFill = 0;
var currentDrawer;
var currentWord;

fs.readFile("words.txt", "utf8", function(err, data){
    words = data.toString().split("\r\n");
});

function getWord(){
    return words[Math.floor(Math.random()*words.length)];
}

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

function assignDrawer(){
    var gussers = [],
        drawers = [];
    for(var i=0; i<userLimit; i++){
        if(userArray[i]){
            if(userArray[i].isDrawer === true){
                drawers.push(i);
            }else{
                gussers.push(i);
            }
        }
    }
    if(gussers.length<1){
        console.log("error! There is less than one gusser");
        return -1;
    }
    if(drawers.length>1){
        console.log("error! There are more than one drawers!");
        return -1;
    }else if(drawers.length === 1){
        userArray[drawers[0]].isDrawer = false;
        for(var j=0, l=gussers.length; j< l; j++){
            if(gussers[j]>drawer[0]){
                userArray[gussers[j]].isDrawer = true;
                return j;
            }
        }
    }
    return gussers[0];
}

function unreadyUser(){
    for(var i=0; i<userCount; i++){
        if(userArray[i]){userArray[i].isReady = false;}
    }
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
            if(userCount === 2){
                unreadyUser();
                io.emit("back to waiting room");
            }else if(userArray[order].isDrawer){
                currentDrawer = assignDrawer();
                io.emit("next round", currentDrawer);
            }
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
                console.log(userArray);
                currentDrawer = assignDrawer();
                currentWord = getWord();
                io.emit("user list", userArray);
                io.emit("game start", {"drawerId": currentDrawer, "word": currentWord});
            }
        }
    });

    socket.on("user unready", function(){
        if(userArray[order]){
            userArray[order].isReady = false;
            io.emit("user list", userArray);
        }
    });

    socket.on("request new word", function(){
        io.emit("get new word", getWord());
    });

    socket.on("clear canvas", function(){
        io.emit("clear canvas");
    });
});

http.listen(port, "192.168.1.88", function(){
    console.log("listening on port " + port);
});