var mob=(detectmob())?true:false;
var modelLoaded = [false,false,false];
var scenes = [];
var activeScene = 0;
var ticking = false;
var sectionPageOffset = [];
var movies = [];

//jquery
// $(document).ready(function(){
// });

//以行動裝置與否區分讀取的是模型或影片
    if(mob){
        // MOBloadScene();
        // window.addEventListener('scroll', MOBonScroll);
    }else{

        var canvasNode = document.createElement("CANVAS");
        var canvas = document.getElementById("g-graphic").appendChild(canvasNode);
        var engine = new BABYLON.Engine(canvas, true);

        PCloadScene1();

        window.addEventListener('scroll', function(){
            if(!ticking){
                requestAnimationFrame(onScroll);
                ticking = true;
            }
        });
        
        engine.runRenderLoop(function(){
            RenderManager()
        });

        engineStopRenderOnVideoPlaying();

    }

function onScroll(){

    setSectionOffset();
    
    SceneManager();

    ticking = false;
}

function RenderManager(){
    if (scenes[activeScene]) {
        scenes[activeScene].renderLoop();
    }
}

function SceneManager() {

    modelLoader();
    setCanvasOpacityWithSection();
}

//只要有video在播，就停止render
function engineStopRenderOnVideoPlaying(){

    var movie1 = document.getElementsByTagName('video')[0];
    var movieIndex = movies.push(movie1) - 1;

    movies[0].addEventListener("play",function(){
        engine.stopRenderLoop();
    });

    movies[0].addEventListener("pause",function(){
        engine.runRenderLoop(function(){
            RenderManager();
        });
    });
}

function modelLoader() {

    var section = whichSection();

    // console.log(section);

    if (section === 'section1') {
        activeScene = 0;

        if (!modelLoaded[1]) {
            //load model2
            PCimportScene2(engine);        
        }

    } else if (section === "section2") {
        activeScene = 1;
    }

}

//設置換模型的分界點    
function setSectionOffset() {

    var section1 = document.getElementById("section1");
    var section2 = document.getElementById("section2");
    // var section3;

    sectionPageOffset[0] = section1.getBoundingClientRect().top + window.pageYOffset;
    sectionPageOffset[1] = section2.getBoundingClientRect().top + window.pageYOffset;
    // sectionPageOffset[2] = section3.getBoundingClientRect().top + window.pageYOffset;
}

function whichSection() {

    if (window.pageYOffset >= 0 && window.pageYOffset < sectionPageOffset[1]) {
        return 'section1';
    } else if (window.pageYOffset >= sectionPageOffset[1]) {
        return 'section2';
    } else {
        return;
    }
}

function setCanvasOpacityWithSection() {

    var canvas_style = window.getComputedStyle(canvas),
        canvas_opacity = canvas_style.getPropertyValue('opacity');

    if (window.pageYOffset >= sectionPageOffset[1] * 0.9 && window.pageYOffset < sectionPageOffset[1]) {

        canvas.style.opacity = 1 - ((window.pageYOffset - sectionPageOffset[1] * 0.9) / (sectionPageOffset[1] - sectionPageOffset[1] * 0.9));

    } else if (window.pageYOffset >= sectionPageOffset[1] && window.pageYOffset < sectionPageOffset[1] * 1.1) {

        canvas.style.opacity = (window.pageYOffset - sectionPageOffset[1]) / (sectionPageOffset[1] * 1.1 - sectionPageOffset[1]);

    } else if (window.pageYOffset >= sectionPageOffset[1] * 1.1){

        canvas.style.opacity = 1;

    }

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

function PCloadScene1(){

    // console.log('load1');

    BABYLON.SceneLoader.ShowLoadingScreen = false;

    // BABYLON.SceneLoader.Load("assets/0911-2/", "north-3D-new-09-2-1.babylon", engine, function (scene) {
    BABYLON.SceneLoader.Load("assets/09-finall/", "north-3D-new-09-final.babylon", engine, function (scene) {
        //Adding an Arc Rotate Camera
            var camera = new BABYLON.ArcRotateCamera("Camera1", -0.3, 0.9, 8, new BABYLON.Vector3.Zero(), scene);
            // camera.attachControl(canvas, false);
            camera.checkCollisions = true;
    
            var sceneIndex = scenes.push(scene) - 1;
            scenes[sceneIndex].renderLoop = function () {
                this.render();
            }
    });

    modelLoaded[0] = !modelLoaded[0];

    // Resize
    window.addEventListener("resize", function () {
        engine.resize();
    });

}

function PCimportScene2(){
    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);

    var camera = new BABYLON.ArcRotateCamera("Camera1", Math.PI*1.1, Math.PI/2, 10, new BABYLON.Vector3.Zero(), scene);
    // camera.attachControl(canvas, false);
    camera.checkCollisions = true;

    var light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);

    // console.log('import2');

    // The first parameter can be used to specify which mesh to import. Here we import all meshes
    BABYLON.SceneLoader.ImportMesh("", "assets/golden-stone/", "golden-stone.babylon", scene, function (newMeshes) {
        // newMeshes[0].position = BABYLON.Vector3.Zero();
        newMeshes[0].position = new BABYLON.Vector3(0.5,2,-3);
    });

    modelLoaded[1] = !modelLoaded[1];

    var sceneIndex = scenes.push(scene) - 1;
    scenes[sceneIndex].renderLoop = function () {
        this.render();
    }

    return scene;
}

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




