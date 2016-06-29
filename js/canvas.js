var canvas = {
    "width": "512",
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
    myCanvas.addEventListener("mousemove", handleDraw, false);
    myCanvas.addEventListener("mousedown", handleDraw, false);
    myCanvas.addEventListener("mouseup", handleDraw, false);
}

function changeWeight(event){
    myContext.lineWidth = document.getElementById("weight").value;
    socket.emit("change width", myContext.lineWidth);
}

function getMousePosition(event){
    // If pageX/Y aren't available and clientX/Y are,
    // calculate pageX/Y - logic taken from jQuery.
    // (This is to support old IE)
    if (event.pageX == null && event.clientX != null) {
        eventDoc = (event.target && event.target.ownerDocument) || document;
        doc = eventDoc.documentElement;
        body = eventDoc.body;

        event.pageX = event.clientX +
            (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
            (doc && doc.clientLeft || body && body.clientLeft || 0);
        event.pageY = event.clientY +
            (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
            (doc && doc.clientTop  || body && body.clientTop  || 0 );
    }
    return {
        "X": event.pageX,
        "Y": event.pageY,
    };
}

function handleDraw(event){
    var rect, coord;
    event = event || window.event;
    rect = myCanvas.getBoundingClientRect();
    coord = getMousePosition(event);
    event.rX = coord.X - rect.left;
    event.rY = coord.Y - rect.top;
    document.coordination.posx.value = event.rX;
    document.coordination.posy.value = event.rY;
    if(tool[event.type]){
        tool[event.type](event);
        socket.emit(event.type, event);
    }
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

init();



