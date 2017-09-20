var mob=(detectmob())?true:false;
var modelLoaded = [false,false,false];
var scenes = [];
var activeScene = 0;
var ticking = false;
var changeModelPointsOffset = [];
var stopRotatingPointOffset;
var movies = [];
var scroll_now = 0;

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

        // Resize
        window.addEventListener("resize", function () {
            engine.resize();
        });

        engineStopRenderOnVideoPlaying();
        
        engine.runRenderLoop(function(){
            RenderManager()
        });

    }

function onScroll(){

    setSectionOffset();

    SceneManager();

    ticking = false;
}

function RenderManager(){

    //決定要不要重繪
    if (scroll_now >= 0 && scroll_now < stopRotatingPointOffset){
        scenes[activeScene].reRender = true;
    } else if (scroll_now >= stopRotatingPointOffset){
        scenes[activeScene].reRender = false;        
    }

    if (scenes[activeScene] && scenes[activeScene].reRender) {
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

    var model = whichModel();

    // console.log(section);

    if (model === 'model1') {
        activeScene = 0;

        if (!modelLoaded[1]) {
            //load model2
            PCimportScene2(engine);        
        }

    } else if (model === "model2") {
        activeScene = 1;
    }

}

function setSectionOffset() {

    scroll_now = window.pageYOffset;
    var model1 = document.getElementById("model1");
    var model2 = document.getElementById("model2");
    // var model3;

    var stopRotatingPoint = document.getElementsByTagName("section")[1];

    changeModelPointsOffset[0] = model1.getBoundingClientRect().top + window.pageYOffset;
    changeModelPointsOffset[1] = model2.getBoundingClientRect().top + window.pageYOffset;
    // changeModelPointsOffset[2] = model3.getBoundingClientRect().top + window.pageYOffset;

    stopRotatingPointOffset = stopRotatingPoint.getBoundingClientRect().top + window.pageYOffset;
}

function whichModel() {

    if (window.pageYOffset >= 0 && window.pageYOffset < changeModelPointsOffset[1]) {
        return 'model1';
    } else if (window.pageYOffset >= changeModelPointsOffset[1]) {
        return 'model2';
    } else {
        return;
    }
}

function setCanvasOpacityWithSection() {

    var canvas_style = window.getComputedStyle(canvas),
        canvas_opacity = canvas_style.getPropertyValue('opacity');

    if (window.pageYOffset >= changeModelPointsOffset[1] * 0.9 && window.pageYOffset < changeModelPointsOffset[1]) {

        canvas.style.opacity = 1 - ((window.pageYOffset - changeModelPointsOffset[1] * 0.9) / (changeModelPointsOffset[1] - changeModelPointsOffset[1] * 0.9));

    } else if (window.pageYOffset >= changeModelPointsOffset[1] && window.pageYOffset < changeModelPointsOffset[1] * 1.1) {

        canvas.style.opacity = (window.pageYOffset - changeModelPointsOffset[1]) / (changeModelPointsOffset[1] * 1.1 - changeModelPointsOffset[1]);

    } else if (window.pageYOffset >= changeModelPointsOffset[1] * 1.1){

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
        var camAlpha = -0.3;
        var camBeta = 0.9;
        var camRadius = 7;

        var camera = new BABYLON.ArcRotateCamera("Camera1", camAlpha, camBeta, camRadius, new BABYLON.Vector3.Zero(), scene);
        // camera.attachControl(canvas, false);
        camera.checkCollisions = true;
        camera.upperAlphaLimit = 1.5;
        camera.lowerAlphaLimit = -1.5;

        var reachedUpperLimit = false;

        // 若要加停止前的補間動畫
            // var reachedStopRotatingPoint = false;

        scene.registerBeforeRender(function(){

            // 若要加停止前的補間動畫
                // if(scroll_now>0){
                //     reachedStopRotatingPoint = (scroll_now <= stopRotatingPointOffset)?false:true;
                // }

            if (scenes[sceneIndex].reRender){

                if(!reachedUpperLimit){
    
                    if (scene.activeCamera.alpha < camera.upperAlphaLimit){
                        scene.activeCamera.alpha += .01;
                    } else{
                        reachedUpperLimit = !reachedUpperLimit;
                    }
    
                }else{
    
                    if (scene.activeCamera.alpha > camera.lowerAlphaLimit) {
                        scene.activeCamera.alpha -= .01;
                    } else {
                        reachedUpperLimit = !reachedUpperLimit;
                    }
    
                }
            }
        })

        var sceneIndex = scenes.push(scene) - 1;
        scenes[sceneIndex].reRender = true; 
        scenes[sceneIndex].renderLoop = function () {
                this.render();
        }

    });

    modelLoaded[0] = !modelLoaded[0];

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




