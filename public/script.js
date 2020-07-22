var socket = io.connect('http://localhost:3000');

var root = document.getElementById("root");


window.onload = function () {
    /*
    when widnow onload send first req to server 
    */
    socket.emit('start', {
    });
}


socket.on('start', function (data) {
    /*
    with first data from server
    displaying all files on the computer in root directory
    it will be possible to change root for choosen directory (workspace)
    */
    dir = data["dir"];
    files = data["file"];
    for(var i = 0; i< dir.length; i++){
        if(dir[i][0] != "."){
            var tmp = document.createElement("div");
            var b = document.createElement("b");
            tmp.addEventListener("click", file_explorer_onclick);
            tmp.id = dir[i];
            tmp.className = "dir";
            b.innerText = dir[i];
            tmp.appendChild(b);
            root.appendChild(tmp);
            var br = document.createElement("br");
            root.appendChild(br);
        }
    }
    for(var i = 0; i < files.length; i++){
        if(files[i][0] != "."){
            var tmp = document.createElement("div");
            tmp.id = files[i];
            tmp.className = "file";
            tmp.innerText = files[i];
            tmp.addEventListener("click", check_file);
            root.appendChild(tmp);
            var br = document.createElement("br");
            root.appendChild(br);
        }
    }

});


socket.on('explorer', function(data) {
    /*
    display all files in file explorer
    */
    if(data["dir"] != "0"){
        var parent = document.getElementById(data["parent"]);
        parent.firstChild.addEventListener("click", remove_children);
        var dir = data["dir"];
        var files = data["file"];
        for(var i = 0; i< dir.length; i++){
            if(dir[i][0] != "."){
                var div = document.createElement("div");
                var b = document.createElement("b");
                div.addEventListener("click", file_explorer_onclick);
                div.id = dir[i];
                b.innerText = dir[i];
                div.appendChild(b);
                div.className = "dir";
                parent.appendChild(div);
            }
        }
        for(var i = 0; i< files.length; i++){
            if(files[i][0] != "."){
                var div = document.createElement("div");
                div.id = files[i];
                div.innerText = files[i];
                div.addEventListener("click", check_file);
                div.className = "file";
                parent.appendChild(div);
            }
        }
    }
    else{
        var parent = document.getElementById(data["parent"]);
        var div = document.createElement("div");
        div.innerText = "...";
        div.className = "file";
        parent.appendChild(div);
    }
});



function file_explorer_onclick(){
    /*
    on click send req to server
    asking for files in directory
    */
    this.removeEventListener("click", file_explorer_onclick);
    var name = this.innerText; 
    var path =  "/" + this.innerText;
    var el = this.parentElement;
    var id = el.id;
    while(el.id != 'root'){
        path = "/" + el.id + path;
        el = el.parentElement;
    }
    data = {};
    data["parent"] = this.id;
    data["path"] = path;
    socket.emit('explorer', data);
}

function remove_children(){
    /*
    removing children for Node from file explorer
    */
    element = this.parentElement;
    var b = document.createElement("b");
    while(element.childNodes.length > 1){
        var tmp = element.lastChild;
        element.removeChild(tmp);
    }
    window.setTimeout("element.addEventListener('click', file_explorer_onclick);", 150);
}

function check_file(){
    /*
    TODO:
    create file checking system
    and then displaying some files, like jpeg, png, txt, py, .c etc
    */
}
