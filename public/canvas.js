let penDown = false;
ctx.lineWidth = 4;
ctx.lineCap = "round";
ctx.lineJoin = "round";
let color = 'black';
let width = 4;
let stateStack = [];

class state {
    constructor(name, x, y, col, width) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.col = col;
        this.width = width;
    }
}

function changePencilWidth(elem) {
    width = elem.value;
    clientSocket.emit("widthChange", width);
}

function changePencilCol(val) {
    color = val;
    clientSocket.emit("colorChange", color);
}

board.addEventListener("mousedown", function (e) {
    // console.log("mouse Down");
    ctx.beginPath();
    let x = e.clientX;
    let y = e.clientY;
    ctx.moveTo(x, y);
    penDown = true;
    let stateObj = new state("md", x, y, ctx.strokeStyle, ctx.lineWidth);
    stateStack.push(stateObj);

    //emit mdown to server
    let stateObj_json = JSON.stringify(stateObj);
    clientSocket.emit("mdown", stateObj_json);
});
board.addEventListener("mousemove", function (e) {
    if (penDown) {
        // console.log("mouse moved");
        let x = e.clientX;
        let y = e.clientY;
        ctx.lineTo(x, y);
        ctx.stroke();
        let stateObj = new state("mm", x, y, ctx.strokeStyle, ctx.lineWidth);
        stateStack.push(stateObj);

        //emit mmove to server
        let stateObj_json = JSON.stringify(stateObj);
        clientSocket.emit("mmove", stateObj_json);
    }
});
window.addEventListener("mouseup", function () {
    // console.log("mouse up");
    penDown = false;

    //emit mup to server
    clientSocket.emit("mup", "false");
});

