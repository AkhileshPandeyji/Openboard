let erase = document.querySelector("#eraser");
let draw = document.querySelector("#draw");
let sticky = document.querySelector("#sticky");
let move = document.querySelector("#move");
let undo = document.querySelector("#undo");
let redo = document.querySelector("#redo");
let upload = document.querySelector("#upload");
let download = document.querySelector("#download");
let close = document.querySelector(".close");

let isOpen = false;
let isImgOpen = false;
let redoStack = []
let redoCount = 0;
let exceed1 = 0;
let fileCount = 0;

erase.addEventListener("click", function () {
    ctx.lineWidth = width;
    ctx.strokeStyle = "#ffffff";
    body.style.cursor = "pointer";
    addRemoveClass(this);
    removeOptions();
    erase.addEventListener("click", function () {
        showOptions(this);
    });
    clientSocket.emit("eraseClick");
});

draw.addEventListener("click", function () {
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    body.style.cursor = "pointer";
    addRemoveClass(this);
    removeOptions();
    draw.addEventListener("click", function () {
        showOptions(this);
    });
});

sticky.addEventListener("click", function () {
    addRemoveClass(this);
    removeOptions();
    createSticky();
});

move.addEventListener("click", function () {
    addRemoveClass(this);
    removeOptions();
});

undo.addEventListener("click", function () {
    addRemoveClass(this);
    removeOptions();
    undoLast();
});

redo.addEventListener("click", function () {
    addRemoveClass(this);
    removeOptions();
    redoFirst();
});

upload.addEventListener("click", function () {
    addRemoveClass(this);
    removeOptions();
    fileInput();
});

download.addEventListener("click", function () {
    addRemoveClass(this);
    removeOptions();
    fileCount++;
    downloadCanvas(`canvas-file-${fileCount}`)
});

close.addEventListener("click", function () {
    let canvas = document.querySelector("canvas");
    removeOptions();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    stateStack = [];
    redoStack = [];
    clientSocket.emit("closeClick");
});

function addRemoveClass(elem) {
    let allElem = document.querySelectorAll(".toolbar .tool");
    for (let i = 0; i < allElem.length; i++) {
        allElem[i].classList.remove("selected");
    }
    elem.classList.add("selected");
}
function removeOptions() {
    let allElem = document.querySelectorAll(".tool .tool-options");
    for (let i = 0; i < allElem.length; i++) {
        allElem[i].style.visibility = "hidden";
    }
}

function showOptions(elem) {
    let currElem = elem.querySelector(".tool-options");
    currElem.style.visibility = "visible";
}
function createSticky() {
    let body = document.querySelector("body");
    let stickyPad = document.createElement("div");
    let navbar = document.createElement("div");
    let min = document.createElement("div");
    let cut = document.createElement("div");
    let textbox = document.createElement("div");
    let textArea = document.createElement("textarea");

    navbar.appendChild(min);
    navbar.appendChild(cut);
    textbox.appendChild(textArea);
    stickyPad.appendChild(navbar);
    stickyPad.appendChild(textbox);
    body.appendChild(stickyPad);

    stickyPad.setAttribute("class", "stickyPad");
    navbar.setAttribute("class", "navbar");
    min.setAttribute("class", "min");
    cut.setAttribute("class", "cut");
    textbox.setAttribute("class", "textbox");

    min.setAttribute("onclick", "minimize()");
    cut.setAttribute("onclick", "exit()");

    let xi = null;
    let yi = null;
    let stickyDown = false;

    navbar.addEventListener("mousedown", function (e) {
        xi = e.clientX;
        yi = e.clientY;
        stickyDown = true;
    });
    navbar.addEventListener("mousemove", function (e) {
        if (stickyDown) {
            let xf = e.clientX;
            let yf = e.clientY;
            let dx = xf - xi;
            let dy = yf - yi;
            let { top, left } = stickyPad.getBoundingClientRect();
            stickyPad.style.left = left + dx + "px";
            stickyPad.style.top = top + dy + "px";
            xi = xf;
            yi = yf
        }
    });
    navbar.addEventListener("mouseup", function (e) {
        if (stickyDown) {
            let xf = e.clientX;
            let yf = e.clientY;
            let dx = xf - xi;
            let dy = yf - yi;
            let { top, left } = stickyPad.getBoundingClientRect();
            stickyPad.style.left = left + dx + "px";
            stickyPad.style.top = top + dy + "px";
            xi = xf;
            yi = yf
        }
        stickyDown = false;
    })
    navbar.addEventListener("mouseleave", function (e) {
        if (stickyDown) {
            let xf = e.clientX;
            let yf = e.clientY;
            let dx = xf - xi;
            let dy = yf - yi;
            let { top, left } = stickyPad.getBoundingClientRect();
            stickyPad.style.left = left + dx + "px";
            stickyPad.style.top = top + dy + "px";
            xi = xf;
            yi = yf
        }      
    });
    isOpen = true;
}

function minimize() {
    let textb = document.querySelector(".stickyPad .textbox");
    if (isOpen) {
        textb.style.visibility = "hidden";
    }
    else {
        textb.style.visibility = "visible";
    }

    isOpen = !isOpen;
}
function exit() {
    let allElem = document.querySelectorAll(".toolbar .tool");
    for (let i = 0; i < allElem.length; i++) {
        allElem[i].classList.remove("selected");
    }
    let stickyPad = document.querySelector(".stickyPad");
    document.body.removeChild(stickyPad);
    isOpen = false;
}

function minimize_img() {
    let textbox = document.body.querySelector(".image-frame .textbox");
    if (isImgOpen) {
        textbox.style.visibility = "hidden";
    }
    else {
        textbox.style.visibility = "visible";
    }
    isImgOpen = !isImgOpen;
}
function exit_img() {
    let allElem = document.querySelectorAll(".toolbar .tool");
    for (let i = 0; i < allElem.length; i++) {
        allElem[i].classList.remove("selected");
    }
    let imageFrame = document.body.querySelector(".image-frame");
    document.body.removeChild(imageFrame);
    isImgOpen = false;
}

function fileInput() {
    let upDiv = document.createElement("div");
    upDiv.setAttribute("class", "upDiv");
    let fileInput = document.createElement("input");
    fileInput.setAttribute("type", "file");
    fileInput.setAttribute("class", "fileInput");
    upDiv.appendChild(fileInput);
    document.body.appendChild(upDiv);
    fileInput.click();
    fileInput.addEventListener("change", function () {
        let fileObj = this.files[0];
        let fileURL = URL.createObjectURL(fileObj);
        createImageFrame(fileURL);
    });
}
function createImageFrame(fileBlob) {
    let imageFrame = document.createElement("div");
    let navbar2 = document.createElement("div");
    let min = document.createElement("div");
    let cut = document.createElement("div");
    let textbox = document.createElement("div");
    let img = document.createElement("img");

    img.setAttribute("src", fileBlob);

    navbar2.setAttribute("class", "navbar");
    imageFrame.setAttribute("class", "image-frame");
    min.setAttribute("class", "min");
    cut.setAttribute("class", "cut");
    textbox.setAttribute("class", "textbox");

    navbar2.appendChild(min);
    navbar2.appendChild(cut);
    textbox.appendChild(img);
    imageFrame.appendChild(navbar2);
    imageFrame.appendChild(textbox);
    document.body.appendChild(imageFrame);

    min.setAttribute("onclick", "minimize_img()");
    cut.setAttribute("onclick", "exit_img()");

    let xi = null;
    let yi = null;
    let imageFrameDown = false;

    navbar2.addEventListener("mousedown", function (e) {
        xi = e.clientX;
        yi = e.clientY;
        imageFrameDown = true;
    });
    navbar2.addEventListener("mousemove", function (e) {
        if (imageFrameDown) {
            let xf = e.clientX;
            let yf = e.clientY;
            let dx = xf - xi;
            let dy = yf - yi;
            let { top, left } = imageFrame.getBoundingClientRect();
            imageFrame.style.left = left + dx + "px";
            imageFrame.style.top = top + dy + "px";
            xi = xf;
            yi = yf
        }
    });
    navbar2.addEventListener("mouseup", function (e) {
        if (imageFrameDown) {
            let xf = e.clientX;
            let yf = e.clientY;
            let dx = xf - xi;
            let dy = yf - yi;
            let { top, left } = imageFrame.getBoundingClientRect();
            imageFrame.style.left = left + dx + "px";
            imageFrame.style.top = top + dy + "px";
            xi = xf;
            yi = yf
        }
        imageFrameDown = false;
    })
    navbar2.addEventListener("mouseleave", function (e) {
        if (imageFrameDown) {
            let xf = e.clientX;
            let yf = e.clientY;
            let dx = xf - xi;
            let dy = yf - yi;
            let { top, left } = imageFrame.getBoundingClientRect();
            imageFrame.style.left = left + dx + "px";
            imageFrame.style.top = top + dy + "px";
            xi = xf;
            yi = yf
        }       
    });

    isImgOpen = true;
}
// minimize and close multiple problem-----------------------------------

function undoLast(){
    let temp = [];
    if(stateStack.length == 0){
        return;
    }
    //pop
    while(stateStack[stateStack.length-1].name != "md"){
        redoStack.push(stateStack.pop());
    }    
    redoStack.push(stateStack.pop());
    //clear
    ctx.clearRect(0,0,board.width,board.height);
    //redraw;
    for(let i=0;i<stateStack.length;i++){
        let stateObj = stateStack[i];
        if(stateObj.name == "md" ){
            ctx.beginPath();
            ctx.strokeStyle = stateObj.col;
            ctx.lineWidth = stateObj.width;
            ctx.moveTo(stateObj.x,stateObj.y);
        }
        else if(stateObj.name == "mm"){
            ctx.lineTo(stateObj.x,stateObj.y);
            ctx.stroke();
        }
    }
}

function redoFirst(){
    if(redoStack.length == 0){
        return;
    }
    let stateObj = redoStack.pop();
    stateStack.push(stateObj);
    ctx.beginPath();
    ctx.strokeStyle = stateObj.col;
    ctx.lineWidth = stateObj.width;
    ctx.moveTo(stateObj.x,stateObj.y);
    
    while(redoStack.length > 0){
        stateObj = redoStack.pop();
        if(stateObj.name == "md"){
            redoStack.push(stateObj);
            break;
        }
        stateStack.push(stateObj);
        ctx.lineTo(stateObj.x,stateObj.y);
        ctx.stroke();
    }
}

function downloadCanvas(filename){
    let a = document.createElement("a");
    a.download = filename+".png";
    let link = board.toDataURL("image/png;base64");
    a.href = link;
    a.click();
    a.remove();
}