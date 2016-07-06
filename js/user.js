var name,
    _word,
    _userArray,
    _isDrawer = false,
    counter;
var printUserImg = '<div class="user-slot col-sm-3"><img class="img-responsive" src="%data%"><h4 class="text-center">%name%</h4></div>'

function initBoard(){
    $("#submit-name").click(function(){
        name = $("#username-input").val().trim();
        if(name){
            socket.emit("enter name", name);
            $("#username-form-div").slideUp();
            $("#ready-unready").removeClass("hide");
        }
    });
    $("#send-ready").click(function(){
        $("#send-ready").attr("disabled", "disabled");
        $("#send-unready").removeAttr("disabled");
        socket.emit("user ready");
    });
    $("#send-unready").click(function(){
        $("#send-unready").attr("disabled", "disabled");
        $("#send-ready").removeAttr("disabled");
        socket.emit("user unready");
    });
    $(window).keydown(function(event){
        if (event.which === 13) {
            if (name) {
                sendGuess();
            }
        }
    });
    $("#change-word").click(function(){
        socket.emit("request new word");
        socket.emit("clear canvas");
    });
}

function print(){
    console.log("name: " + name);
    console.log("_word: " + _word);
    console.log("_isDrawer: " + _isDrawer);
    console.log("_userArray: " + _userArray);
}

function reset(){
    clearCanvas();
    name = "";
    _word = "";
    _userArray =[];
    _isDrawer = false;
    clearChat();
    if(counter) { clearInterval(counter); }
}

function clearChat(){
    $('#messages').empty();
}
function sendGuess(){
    var _guess = $("#guess-input").val().trim();
    if(_guess){
        socket.emit("guess message", _guess);
        $("#guess-input").val("");
    }
}

function countdown(seconds){
    if(seconds <0) {return;}
    $("#countdown h4:last").text(seconds);
    counter = setInterval(timer, 1000);
    function timer(){
        seconds--;
        $("#countdown h4:last").text(seconds);
        if(counter && seconds <=0){
            clearInterval(counter);
            return;
        }
    }
}

function startRound(drawerId){
    if(_userArray[drawerId].name === name){
        _isDrawer = true;
        addCanvasListeners();
        $(".drawer-only").removeClass("hide");
        $("#word").text(_word);
        socket.emit("start round");
    }else{
        _isDrawer = false;
    }
    if(counter) { clearInterval(counter); }
    countdown(60);
}

function startgame(drawerId){
    startRound(drawerId);
    initCanvas();
    $("#ready-unready").addClass("hide");
    $("#title").slideUp();
    $("#game").removeClass("hide");
}

//update user list
socket.on("user list", function(userArray){
    $("#user-list").empty();
    for(var i=0, length = userArray.length; i< length; i++){
        if(userArray[i]){
            if(userArray[i].name === name){
                $("#user-list").append(printUserImg.replace("%data%", "./images/user-red.svg").replace("%name%", userArray[i].name));
            }else{
                $("#user-list").append(printUserImg.replace("%data%", "./images/user-green.svg").replace("%name%", userArray[i].name));
            }
            if(userArray[i].isReady){$(".user-slot img:last").addClass("ready");}
            
        }else{
            $("#user-list").append(printUserImg.replace("%data%", "./images/empty.svg").replace("%name%", ""));
        }
    }
    _userArray = userArray;
});

socket.on("game start", function(msg){
    _word = msg.word;
    startgame(msg.drawerId);
});

socket.on("back to waiting room", function(){
    $("#send-unready").attr("disabled", "disabled");
    $("#send-ready").removeAttr("disabled");
    $("#game").addClass("hide");
    $("#title").slideDown();
    $("#username-form-div").slideDown();
    $("#countdown").addClass("hide");
    reset();
});

socket.on("get new word", function(newWord){
    _word = newWord;
    if(_isDrawer){
        $("#word").text(_word);
    }
});

socket.on("guess message", function(msg){
    $('#messages').append($('<li>').text(msg.user + ": " + msg.guess));
    $("#messages")[0].scrollTop = $("#messages")[0].scrollHeight;
});

socket.on("count down", function(seconds){
    $("#countdown").removeClass("hide");
    countdown(seconds);
});

socket.on("cancel starting game", function(order){
    if(_userArray[order] === name){
        $("#send-unready").attr("disabled", "disabled");
        $("#send-ready").removeAttr("disabled");
    }
    $("#countdown").addClass("hide");
});

socket.on("start new round", function(msg){
    clearChat();
    socket.emit("clear canvas");
    if(_isDrawer){
        removeCanvasListeners();
        $(".drawer-only").addClass("hide");
    }
    _word = msg.word;
    startRound(msg.drawerId);
});

initBoard();