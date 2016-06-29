var canvas = {
    "id": "main-canvas",
    "width": "512",
    "height": "480",
}

var cursor = {
    "default": "pointer",
}

var myCanvas = document.createElement("canvas");
myCanvas.width = canvas.width.toString();
myCanvas.height = canvas.height.toString();
$("main").append(myCanvas);
$("canvas").attr("id", canvas.id);
$("canvas").addClass("outline");

myCanvas = document.getElementById("main-canvas");
var myContext = myCanvas.getContext("2d");
var tool;
//add event listener
function init(){
    tool = new Drawtool();
    document.getElementById("main-canvas").addEventListener("mousemove", handleDraw, false);
    document.getElementById("main-canvas").addEventListener("mousedown", handleDraw, false);
    document.getElementById("main-canvas").addEventListener("mouseup", handleDraw, false);
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

function handleMouseMove(event) {
    var coord;
    event = event || window.event;
    coord = getMousePosition(event);
    document.form1.posx.value = coord.X;
    document.form1.posy.value = coord.Y;
    $("#main-canvas").attr("style","cursor: pointer");
}

function handleDraw(event){
    var rect, coord;
    event = event || window.event;
    rect = myCanvas.getBoundingClientRect();
    coord = getMousePosition(event);
    event.rX = coord.X - rect.left;
    event.rY = coord.Y - rect.top;
    document.form1.posx.value = event.rX;
    document.form1.posy.value = event.rY;
    if(tool[event.type]){
        tool[event.type](event);
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

init();



