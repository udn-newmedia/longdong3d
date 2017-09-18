var mob=(detectmob())?true:false;

if(mob){
    MOBloadScene();
}else{
    PCloadScene();
}

function MOBloadScene(){
    var src = "https://udn.com/upf/newmedia/2017_data/hk_handover_20/video/video1.mp4";
    var type = "video/mp4"
    var videoNode = document.createElement("VIDEO");
    var video = document.getElementById("g-graphic").appendChild(videoNode);
    var source = document.createElement('source');

    source.src = src;
    source.type = type;

    video.appendChild(source);
    video.play();
}

function PCloadScene(){
    //PC version
    var canvasNode = document.createElement("CANVAS");
    var canvas = document.getElementById("g-graphic").appendChild(canvasNode);
    var engine = new BABYLON.Engine(canvas, true);
    
    BABYLON.SceneLoader.Load("assets/0911-2/", "north-3D-new-09-2-1.babylon", engine, function (scene) {
        //Adding an Arc Rotate Camera
            var camera = new BABYLON.ArcRotateCamera("Camera1", -0.3, 0.9, 8, new BABYLON.Vector3.Zero(), scene);
            // camera.attachControl(canvas, false);
            camera.checkCollisions = true;
    
        //render loop
            engine.runRenderLoop(function () {
                scene.render();
            });
    });
}

// Resize
window.addEventListener("resize", function () {
    engine.resize();
});

function detectmob() {
    if (
        navigator.userAgent.match(/Android/i) ||
        navigator.userAgent.match(/webOS/i) ||
        navigator.userAgent.match(/iPhone/i) ||
        navigator.userAgent.match(/iPad/i) ||
        navigator.userAgent.match(/iPod/i) ||
        navigator.userAgent.match(/BlackBerry/i) ||
        navigator.userAgent.match(/Windows Phone/i)
    ) {
        return true;
    } else {
        return false;
    }
}