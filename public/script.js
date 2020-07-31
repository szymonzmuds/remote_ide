var socket = io.connect('http://localhost:3000');

var root = document.getElementById("root");
//to root, to show active file / directory
var active_id = null;
//active button - to display file content
var active_button = null;


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
            var disp = document.createElement("div");
            disp.className = "disp";
            b.innerText = dir[i];
            disp.appendChild(b);
            tmp.appendChild(disp);
            root.appendChild(tmp);
        }
    }
    for(var i = 0; i < files.length; i++){
        if(files[i][0] != "."){
            var tmp = document.createElement("div");
            tmp.id = files[i];
            tmp.className = "file";
            var disp = document.createElement("div");
            disp.className = "disp";
            disp.innerText = files[i];
            tmp.appendChild(disp);
            tmp.addEventListener("click", check_file);
            root.appendChild(tmp);
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
                var disp = document.createElement("div");
                disp.className = "disp";
                b.innerText = dir[i];
                disp.appendChild(b);
                div.appendChild(disp);
                div.className = "dir";
                parent.appendChild(div);
            }
        }
        for(var i = 0; i< files.length; i++){
            if(files[i][0] != "."){
                var div = document.createElement("div");
                div.id = files[i];
                var disp = document.createElement("div");
                disp.innerText = files[i];
                disp.className = "disp";
                div.appendChild(disp);
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

socket.on('img', function(data){
    /*
    displaying img
    */
    var menu = document.getElementById("disp_menu");
    var display = document.getElementById("display");
    //first create button to disp
    /*
    menu button ids - file name + "_menu"
    file display - file name + "_file"
    */ 
    var menu_but = document.createElement("div");
    menu_but.id = data["parent"] + "_menu";
    menu_but.innerText = data["parent"];
    menu_but.alt = data["parent"];

    var x_button = document.createElement("button");
    x_button.innerText = "x";
    x_button.addEventListener("click", remove_file);
    menu_but.appendChild(x_button);
    menu_but.className = "active_but_menu";

    menu.appendChild(menu_but);
    //menu_but.addEventListener("click", set_disp);
    /*
    while(display.childNodes.length > 1){
        var tmp = display.lastChild;
        display.removeChild(tmp);
    }
    */
    //alert(data["path"]);

    var div = document.createElement("div");
    var img = document.createElement("img");
    img.src = data["path"];
    div.id = data["parent"] + "_file";
    div.appendChild(img);
    if(active_button != null){
        var prev_but = document.getElementById(active_button+"_menu");
        prev_but.classList.remove("active_but_menu");
        var prev_file =  document.getElementById(active_button+"_file");
        prev_file.className = "hide_file";
        prev_but.addEventListener("click", set_disp);
    }
    active_button = data["parent"];
    div.className = "active_file";
    display.appendChild(div);
});





function file_explorer_onclick(){
    /*
    on click send req to server
    asking for files in directory
    */
    this.removeEventListener("click", file_explorer_onclick);
    if(active_id == null){
        active_id = this.id;
        this.firstChild.className = "active";
    }
    else{
        var prev = document.getElementById(active_id);
        active_id = this.id;
        prev.firstChild.className = "disp";
        this.firstChild.className = "active";
    }
    console.log(active_id);
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
    this.className = "disp";
    //alert(this.className);
    active_id = null;
    var b = document.createElement("b");
    while(element.childNodes.length > 1){
        var tmp = element.lastChild;
        element.removeChild(tmp);
    }
    console.log(active_id);
    window.setTimeout("element.addEventListener('click', file_explorer_onclick);", 150);
}

function check_file(){
    /*
    TODO:
    create file checking system
    and then displaying some files, like jpeg, png, txt, py, .c etc
    */
   this.removeEventListener("click", check_file);
   
   if(active_id == null){
        active_id = this.id;
        this.firstChild.className = "active";
    }
    else{
        var prev = document.getElementById(active_id);
        active_id = this.id;
        prev.firstChild.className = "disp";
        this.firstChild.className = "active";
    }
    var name = this.innerText; 
    var path =  "/" + this.innerText;
    var el = this.parentElement;
    var id = el.id;
    while(el.id != 'root'){
        path = "/" + el.id + path;
        el = el.parentElement;
    }
    var data = {};
    data["path"] = path;
    data["parent"] = this.id;
    socket.emit('file', data);
}

function set_disp(){
    var prev_but = document.getElementById(active_button + "_menu");
    var prev_file = document.getElementById(active_button + "_file");

    var tmp = "";
    var i = 0;
    while(i < this.id.length-5){
        tmp = tmp + this.id[i];
        i++;
    }
    active_button = tmp;
    var act_but = document.getElementById(active_button + "_menu");
    var act_file = document.getElementById(active_button + "_file");

    prev_but.classList.remove("active_but_menu");
    act_but.className = "active_but_menu";

    prev_file.className = "hide_file";
    act_file.className = "active_file";
    this.removeEventListener("click", set_disp);
    prev_but.addEventListener("click", set_disp);
}


function remove_file(){
    alert("work");
}