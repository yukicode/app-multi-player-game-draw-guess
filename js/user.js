var name,
    _userArray;
var printUser = '<p>%name% %order% <span class="gray">IsReady</span></p>';

function setUp(event){
    if(event.which === 13){
        name = $("#username-input").val().trim();
        if(name){
            socket.emit("enter game", name);
            $("#username-form").hide();
            $("#ready").toggleClass("hide");
        }
    }
}

function startgame(drawerId){
    if(!_userArray){console.log("There are no players"); return;}
    if(_userArray[drawerId].name === name){
        console.log("I'm the drawer!");
    }else{
        console.log("I'm the guesser!");
    }
}

function initBoard(){
    window.addEventListener("keydown", setUp, false);
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

socket.on("game start", function(drawerId){startgame(drawerId)});

$("#send-ready").click(function(){
    socket.emit("user ready");
});

initBoard();