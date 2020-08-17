const express = require("express");
const app = express();
const path = require("path");


//webSocket 
//1. httpServer
const httpServer = require("http").createServer(app);

//3. socketServer
// npm install socket.io
// connect with httpServer
const serverSocket = require("socket.io")(httpServer);

app.use(express.static("public"));

// how to add routes
// routes : GET POST PATCH DEL

// app.get("/home",function(req,res){
//     res.end("Hello World");
//     // res.sendStatus(200);
//     console.log(res.statusCode);
// });

//4. connection listener -> server socket reference
serverSocket.on("connection",function(socket){
    console.log("New Client added :"+socket.id);
    //5. listen client socket events 
    socket.on("colorChange",function(data){
        // console.log(data);
        socket.broadcast.emit("pColorChange",data);
    });
    socket.on("widthChange",function(data){
        // console.log(data);
        socket.broadcast.emit("pWidthChange",data);
    });
    socket.on("mdown",function(data){
        // console.log(data);
        socket.broadcast.emit("mdownC",data);
    });
    socket.on("mmove",function(data){
        // console.log(data);
        socket.broadcast.emit("mmoveC",data);
    });
    socket.on("mup",function(data){
        // console.log(data);
        socket.broadcast.emit("mupC",data);
    });
    socket.on("eraseClick",function(){
        socket.broadcast.emit("eraseClickC");
    });
    socket.on("closeClick",function(){
        socket.broadcast.emit("closeClickC");
    });
});

const port = process.env.PORT || 3000;
//2. app.listen -> httpServer.listen
httpServer.listen(port,function(){
    console.log(`Application Server running on Port : ${port}`);
});