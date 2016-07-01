var name,
    _word,
    _userArray,
    _isDrawer = false;
var printUser = '<p>%name% %order% <span class="gray">IsReady</span></p>';

function initBoard(){
    $("#submit-name").click(function(){
        name = $("#username-input").val().trim();
        if(name){
            socket.emit("enter game", name);
            $("#username-form").hide();
            $("#ready").toggleClass("hide");
        }
    });
    $("#send-ready").click(function(){
        socket.emit("user ready");
    });
    $(window).keydown(function(event){
        if (event.which === 13) {
            if (name) {
                sendGuess();
            }
        }
    });
}

function sendGuess(){
    var _guess = $("#guess-input").val().trim();
    $("#guess-input").val("");
    if(_guess){
        if(_guess === _word){
            $("#judge").text("Guess is correct!");
        }else{
            $("#judge").text("Guess is wrong.");
        }
    }
}

function startgame(drawerId){
    if(_userArray[drawerId].name === name){
        _isDrawer = true;
        $(".drawer-only").removeClass("hide");
        $("#word").append("<p>"+ _word + "</p>");
    }else{
        _isDrawer = false;
    }
    init();
    $("#ready").addClass("hide");
    $("#canvas").removeClass("hide");
}

socket.on("user list", function(userArray){
    $("#user-list").empty();
    for(var i=0, length = userArray.length; i< length; i++){
        if(userArray[i]){
            $("#user-list").append(printUser.replace("%name%", userArray[i].name).replace("%order%", i+1));
            if(userArray[i].isReady){$(".gray:last").attr("class", "green");}
            if(userArray[i].name === name){
                $("#user-list p:last-child").addClass("red");
            }
        }
    }
    _userArray = userArray;
});

socket.on("game start", function(msg){
    _word = msg.word;
    startgame(msg.drawerId);
});

socket.on("back to waiting room", function(){
    $("#ready").removeClass("hide");
    $("#canvas").addClass("hide");
});

socket.on("next round", function(){
    //tobe implemented
});

initBoard();