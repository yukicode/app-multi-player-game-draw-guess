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
    var rect, coord;
    event = event || window.event;
    //rect = document.getElementById("main-canvas").getBoundingClientRect();
    coord = getMousePosition(event);
    document.form1.posx.value = coord.X;
    document.form1.posy.value = coord.Y;
    $("#main-canvas").attr("style","cursor: pointer");
    
}

//add event listener
document.getElementById("main-canvas").addEventListener("mousemove", handleMouseMove, false);


