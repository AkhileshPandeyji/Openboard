clientSocket.on("pColorChange", function (data) {
    ctx.strokeStyle = data;
});
clientSocket.on("pWidthChange", function (data) {
    ctx.lineWidth = data;
});
clientSocket.on("mdownC", function (data) {
    let stateObj = JSON.parse(data);
    ctx.beginPath();
    let x = stateObj.x;
    let y = stateObj.y;
    ctx.moveTo(x,y);
    penDown = true;
    stateStack.push(stateObj);
});
clientSocket.on("mmoveC",function(data){
    let stateObj = JSON.parse(data);
    if (penDown) {
        // console.log("mouse moved");
        let x = stateObj.x;
        let y = stateObj.y;
        ctx.lineTo(x, y);
        ctx.stroke();        
        stateStack.push(stateObj);
    }
});
clientSocket.on("mupC",function(data){
    penDown = false;
});
clientSocket.on("eraseClickC",function(){
    ctx.strokeStyle = "#ffffff";
    body.style.cursor = "pointer";
    addRemoveClass(this);
    removeOptions();
    erase.addEventListener("click", function () {
        showOptions(this);
    });
});
clientSocket.on("closeClickC",function(){
    let canvas = document.querySelector("canvas");
    removeOptions();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    stateStack = [];
    redoStack = [];
});