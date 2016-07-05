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
var correctGuess = 0;
var gameStartCountdown;
//game status
//0: not ready
//1: counting down to start
//2: in game 
var gameStatus = 0;

//load words for the game
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
    this.score = 0;
}

function addUserToArray(name){
    if(gameStatus){ return -1;}
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
    var canStartGame = userCount > 1 ? true : false;
    for(var i=0; i<userLimit; i++){
        if(userArray[i] && !userArray[i].isReady){
            canStartGame = false;
        }
    }
    return canStartGame;
}

function startGame(){
    currentDrawer = assignDrawer();
    currentWord = getWord();
    io.emit("user list", userArray);
    io.emit("count down", 5);
    gameStatus = 1;
    gameStartCountdown = setTimeout(function(){
        io.emit("game start", {"drawerId": currentDrawer, "word": currentWord});
        gameStatus = 2;
    }, 5000);
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
            if(gussers[j]>drawers[0]){
                userArray[gussers[j]].isDrawer = true;
                return j;
            }
        }
    }
    userArray[gussers[0]].isDrawer = true;
    return gussers[0];
}

function reset(){
    userCount = 0;
    userLimit = 4;
    userArray = [undefined, undefined, undefined, undefined];
    nextFill = 0;
    currentDrawer;
    currentWord;
    correctGuess=0;
}

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
    socket.on("enter name", function(name){
        order = addUserToArray(name);
        if(order != -1){
            addUser = true;
            userCount++;
        }else{
            console.log("failed adding user, slots are full or other players are in game");
        }
        io.emit("user list", userArray);
    });

    //delete user when disconnect
    //todo: handle disconnection during the game
    socket.on('disconnect', function(){
        if(addUser){
            if(gameStatus === 2 && userCount === 2){
                reset();
                addUser = false;
                order = -1;
                gameStatus = 0;
                io.emit("back to waiting room");
            }else if(gameStatus === 2 && userArray[order].isDrawer){
                currentDrawer = assignDrawer();
                delete userArray[order];
                userCount--;
                io.emit("next round", currentDrawer);
            }else{
                if(gameStatus === 1){
                    clearTimeout(gameStartCountdown);
                    gameStatus = 0;
                }
                delete userArray[order];
                userCount--;
                if(canStartGame()){
                    startGame();
                }
            }
            io.emit("user list", userArray);
        }
    });

    //update user status when user clicks ready button
    //start game when all users are ready and there are two or more players
    socket.on("user ready", function(){
        if(userArray[order]){
            userArray[order].isReady = true;
            io.emit("user list", userArray);
            if(canStartGame()){
                startGame();
            }
        }
    });

    socket.on("user unready", function(){
        if(userArray[order]){
            if(gameStatus === 1){
                clearTimeout(gameStartCountdown);
                gameStatus = 0;
            }
            userArray[order].isReady = false;
            io.emit("user list", userArray);
            io.emit("cancel starting game", order);
        }
    });

    socket.on("request new word", function(){
        io.emit("get new word", getWord());
    });

    socket.on("clear canvas", function(){
        io.emit("clear canvas");
    });

    socket.on("guess message", function(guess){
        if(currentWord === guess.toLowerCase()){
            io.emit("guess message", {"guess": "IS CORRECT!", "user": userArray[order].name});
            if(++correctGuess === userCount-1){
                currentDrawer = assignDrawer();
                correctGuess = 0;
                currentWord = "";
                io.emit("next round", currentDrawer);
            }
        }else{
            io.emit("guess message", {"guess": guess, "user": userArray[order].name});
        }
    });
});

app.use(express.static(__dirname));

app.get("/", function(req, res){
    res.sendFile(__dirname + "/index.html");
});

http.listen(port, "192.168.1.88", function(){
    console.log("listening on port " + port);
});