const os = require('os');
const fs = require('fs');
const express = require('express');
const socket = require('socket.io');
const https = require('https');


var app = express();
var server = app.listen(3000, function () {
    console.log("listen to port 3000");
});
//const path = os.homedir();
//console.log(path);

app.use(express.static('public'));

var io = socket(server);


io.on('connection', function (socket) {
    console.log(`${socket.id} is connect to the server`);
    var id = socket.id;
    socket.on('start', function (data) {
        /*
        get data about workspace (default root) and send to website
        */
        directories = [];
        other = []
        console.log("start");
        
        fs.readdir(os.homedir(), (err, files) => {
            var count = files.length;
            var i = 0;
            files.forEach(file => {
                    fs.lstat(os.homedir() + "/" + file, (err, stat) => {
                        if(stat.isDirectory()){
                            directories.push(file);
                            i++;
                            if(i == count){
                                datas = {};
                                datas["dir"] = directories;
                                datas["file"] = other;
                                console.log("start emited");
                                console.log("");
                                io.to(id).emit("start", datas);
                            }
                        }
                        else{
                            other.push(file);
                            i++;
                            if(i == count){
                                datas = {};
                                console.log(directories);
                                datas["dir"] = directories;
                                datas["file"] = other;
                                console.log("start emited");
                                console.log("");
                                io.to(id).emit("start", datas);
                            }
                        }
                    });
             });
            
        });
    });
    
    socket.on('explorer', function(data){
        /*
        get data about directory and send to website
        */
        console.log(data["parent"]);
        var directories = [];
        var other = [];
        fs.readdir(os.homedir() + data["path"], (err, files) => {
            if(files != null){
                var count = files.length;
                var i = 0;
                if(files.length > 0){
                    files.forEach(file => {
                        fs.lstat(os.homedir() + data["path"] + "/" + file, (err, stat) => {
                            if(stat.isDirectory()){
                                i++;
                                directories.push(file);
                                if(i == count){
                                    new_data = {};
                                    new_data["parent"] = data["parent"];
                                    new_data["dir"] = directories;
                                    new_data["file"] = other;
                                    console.log("send");
                                    console.log("");
                                    io.to(id).emit("explorer", new_data);
                                }
                            }
                            else{
                                i++;
                                other.push(file);
                                if(i == count){
                                    new_data = {};
                                    new_data["parent"] = data["parent"];
                                    new_data["dir"] = directories;
                                    new_data["file"] = other;
                                    console.log("send");
                                    console.log("");
                                    io.to(id).emit("explorer", new_data);
                                }
                            }
                        });
                    });
            }
            else{
                new_data = {};
                new_data["dir"] = "0";
                console.log("send");
                console.log("");
                new_data["parent"] = data["parent"];
                io.to(id).emit('explorer', new_data);
            }
            }
            
             
        });
    });
});


