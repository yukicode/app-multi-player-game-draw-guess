var canvas = {
    "width": "800",
    "height": "480",
}

var myCanvas = document.getElementById("main-canvas"),
    myContext = myCanvas.getContext("2d"),
    tool;

myCanvas.width = canvas.width.toString();
myCanvas.height = canvas.height.toString();

//add event listener
function init(){
    tool = new Drawtool();
    document.select-weight.addEventListener("change", changeWeight, false);
    $("#clear-canvas").click(function(){
        socket.emit("clear canvas");
    });
    //add event listener to mouse for drawer
    if(_isDrawer === true){
        myCanvas.addEventListener("mousemove", handleDraw, false);
        myCanvas.addEventListener("mousedown", handleDraw, false);
        myCanvas.addEventListener("mouseup", handleDraw, false);
    }
}

function changeWeight(event){
    myContext.lineWidth = document.getElementById("weight").value;
    socket.emit("change width", myContext.lineWidth);
}

function handleDraw(event){
    var rect, coord;
    event = event || window.event;
    rect = myCanvas.getBoundingClientRect();
    event.rX = event.clientX - rect.left;
    event.rY = event.clientY - rect.top;
    // document.coordination.posx.value = event.rX;
    // document.coordination.posy.value = event.rY;
    if(tool[event.type]){
        tool[event.type](event);
        socket.emit(event.type, event);
    }
}

function clearCanvas(){
    myContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
}

function Drawtool(){
    var tool = this;
    this.started = false;
    this.mousedown = function(event){
        myContext.beginPath();
        myContext.moveTo(event.rX, event.rY);
        tool.started = true;
    }
    this.mousemove = function(event){
        if(tool.started){
            myContext.lineTo(event.rX, event.rY);
            myContext.stroke();
        }
    }
    this.mouseup = function(event){
        if(tool.started){
            tool.mousemove(event);
            tool.started = false;
        }
    }
}

socket.on("clear canvas", function(){
    clearCanvas();
});

socket.on("recive mousedown", function(event){
    tool.mousedown(event);
});
socket.on("recive mousemove", function(event){
    tool.mousemove(event);
});
socket.on("recive mouseup", function(event){
    tool.mouseup(event);
});
socket.on("recive change width", function(width){
    myContext.lineWidth = width;
});



