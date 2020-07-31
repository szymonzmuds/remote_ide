const os = require('os');
const fs = require('fs');
const pathh = require('path');
const express = require('express');
const socket = require('socket.io');
const https = require('https');
const { setInterval } = require('timers');


var app = express();
var server = app.listen(3000, function () {
    console.log("listen to port 3000");
});

//variable with all user
var user_list = {};
var user_loop = false;


app.use(express.static('public'));
app.use(express.static(pathh.join(__dirname, "/public/tmp")));

var io = socket(server);


io.on('connection', function (socket) {
    console.log(`${socket.id} is connect to the server`);
    var user = {};
    user["id"] = socket.id;
    user["fotos"] = {};
    user["alive"] = true;
    user_list[socket.id] = user;
    var id = socket.id;
    if(user_loop == false){
        user_loop = true;
        setInterval(is_user_alive, 60000);
    }
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
    socket.on('file', function(data){
        var path = data["path"];
        if(path.endsWith(".png") || path.endsWith(".jpg")){
            var public = __dirname + "/public";
            var img_path = os.homedir() + path;
            var img_p = os.homedir() + path;
            var img_path = pathh.relative(public, img_path);
            console.log(data["name"]);
            path = os.homedir() + path;
            var dir_name = __dirname;
            var num_slash = 0;
            for(var i = 0; i<dir_name.length; i++){
                if(dir_name[i]=='/'){
                    num_slash++;
                }
            }
            var tmp = "";
            for(var i = 0; i < num_slash; i++){
                tmp += "/.."
            }

            var new_path = __dirname + "/public" + "/tmp/" + data["parent"];

            fs.copyFile(img_p, new_path, fs.constants.COPYFILE_EXCL, function(){
                var new_data = {};
                var img_path = "../tmp/" + data["parent"];
                new_data["path"] = img_path;
                new_data["parent"] = data["parent"];
                io.to(id).emit('img', new_data);
                console.log("send img " + data["parent"]);
            });


            
            var rel_path = pathh.relative(__dirname, img_p);
            console.log(pathh.join(__dirname, rel_path, "/.."));
            
            path = ".." + tmp + path;
            
            //sleep(500);
            
            
        }
    })
});


function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}


function is_user_alive(){
    console.log(user_list);
    /*
    for(const user of user_list){
        console.log(user);
    }
    */
}


