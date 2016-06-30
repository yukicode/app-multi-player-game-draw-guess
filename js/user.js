var name;

function setUp(event){
    if(event.which === 13){
        name = $("#username-input").val().trim();
        if(name){
            socket.emit("enter game", name);
            $("#username-form").fadeOut();
        }
    }
}

function initBoard(){
    window.addEventListener("keydown", setUp, false);
}

// socket.on("recive order", function(order){
//     setUser(name, order);
//     userString = "<p>" + user.name + " " + user.inlineOrder+ "</p>";
//     $("#result").append(userString);
// });

initBoard();