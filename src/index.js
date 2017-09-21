var mob=(detectmob())?true:false;
var modelLoaded = [false,false,false];
var scenes = [];
var activeScene = 0;
var ticking = false;
var changeModelPointsOffset = [];
var stopRotatingPointOffset;
var movies = [];
var scroll_now = 0;
var changeViewWaypointsOffset = [];
var waypoints = [];

var canvas;

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

    //決定何時要重繪(第一層是換模型判斷點、第二層是換視角判斷點)
    if (scroll_now >= 0 && scroll_now < stopRotatingPointOffset){

        scenes[activeScene].reRender = true;
    } else if (scroll_now >= stopRotatingPointOffset && scroll_now < changeModelPointsOffset[1]*0.9){

        if (scroll_now >= changeViewWaypointsOffset[0] * 0.9 && scroll_now < changeViewWaypointsOffset[0]*1.1){
            scenes[activeScene].reRender = true;        
        }else{
            scenes[activeScene].reRender = false;                    
        }
    } else if (scroll_now >= changeModelPointsOffset[0] && scroll_now < changeModelPointsOffset[1] * 0.9){
        scenes[activeScene].reRender = false;        
    } else if (scroll_now >= changeModelPointsOffset[1]*0.9){
        scenes[activeScene].reRender = true;                
    }

    if (scenes[activeScene] && scenes[activeScene].reRender) {
        // console.log('render');
        scenes[activeScene].renderLoop();
    }
}

function SceneManager() {

    modelLoader();
    setCanvasOpacityWithSection();
    viewChanger();

}

function viewChanger(){
    //轉換視角
    if (scroll_now < stopRotatingPointOffset){
        displayBillboards(false);
    }

    if (scroll_now >= changeViewWaypointsOffset[0] && scroll_now < changeViewWaypointsOffset[0] * 1.1) {
        changeView(function () {
            displayBillboards(true);
        });
    }
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
            PCimportScene2();        
        }

    } else if (model === "model2") {
        activeScene = 1;

        if (!modelLoaded[2]) {
            //load model2
            PCimportScene3();
        }


    } else if (model === 'model3') {
        activeScene = 2;
    }

}

function setSectionOffset() {

    scroll_now = window.pageYOffset;

    //model 
        var model1 = document.getElementById("model1");
        var model2 = document.getElementById("model2");
        var model3 = document.getElementById('model3');

        changeModelPointsOffset[0] = model1.getBoundingClientRect().top + window.pageYOffset;
        changeModelPointsOffset[1] = model2.getBoundingClientRect().top + window.pageYOffset;
        changeModelPointsOffset[2] = model3.getBoundingClientRect().top + window.pageYOffset;

    //waypoints
        var changeViewWaypoint1 = document.getElementsByTagName("section")[2];
        changeViewWaypointsOffset[0] = changeViewWaypoint1.getBoundingClientRect().top + window.pageYOffset;

    //other points
        var stopRotatingPoint = document.getElementsByTagName("section")[1];
        stopRotatingPointOffset = stopRotatingPoint.getBoundingClientRect().top + window.pageYOffset;
}

function whichModel() {

    if (window.pageYOffset >= 0 && window.pageYOffset < changeModelPointsOffset[1]) {
        return 'model1';
    } else if (window.pageYOffset >= changeModelPointsOffset[1] && window.pageYOffset < changeModelPointsOffset[2]) {
        return 'model2';
    } else if (window.pageYOffset >= changeModelPointsOffset[2]) {
        return 'model3';
    } else {
        return;
    }
}

function setCanvasOpacityWithSection() {

    var canvas_style = window.getComputedStyle(canvas),
        canvas_opacity = canvas_style.getPropertyValue('opacity');

    // for(var i=1;i<=2;i++){
    // }
    
    if (window.pageYOffset >= changeModelPointsOffset[1] * 0.9 && window.pageYOffset < changeModelPointsOffset[1]) {

        canvas.style.opacity = 1 - ((window.pageYOffset - changeModelPointsOffset[1] * 0.9) / (changeModelPointsOffset[1] - changeModelPointsOffset[1] * 0.9));

    } else if (window.pageYOffset >= changeModelPointsOffset[1] && window.pageYOffset < changeModelPointsOffset[1] * 1.1) {

        canvas.style.opacity = (window.pageYOffset - changeModelPointsOffset[1]) / (changeModelPointsOffset[1] * 1.1 - changeModelPointsOffset[1]);

    } else if (window.pageYOffset >= changeModelPointsOffset[1] * 1.1){

        canvas.style.opacity = 1;

    }


    if (window.pageYOffset >= changeModelPointsOffset[2] * 0.9 && window.pageYOffset < changeModelPointsOffset[2]) {

        canvas.style.opacity = 1 - ((window.pageYOffset - changeModelPointsOffset[2] * 0.9) / (changeModelPointsOffset[2] - changeModelPointsOffset[2] * 0.9));

    } else if (window.pageYOffset >= changeModelPointsOffset[2] && window.pageYOffset < changeModelPointsOffset[2] * 1.1) {

        canvas.style.opacity = (window.pageYOffset - changeModelPointsOffset[2]) / (changeModelPointsOffset[2] * 1.1 - changeModelPointsOffset[2]);

    } else if (window.pageYOffset >= changeModelPointsOffset[2] * 1.1) {

        canvas.style.opacity = 1;

    }


}

function displayBillboards(display){

    var scene = scenes[activeScene];
    
    scene.billboards.forEach(function (board) {
        board.isVisible = display;
    });
}

function changeView(callback){

    if (waypoints[0].hasChanged){
        return;
    }else{
        waypoints[0].hasChanged = true;

        // console.log('changeView');
        disableScroll()
        
        var waypoint = waypoints[0];
        var target = waypoint.target;
        
        smoothSetTarget(target, moveCameraWithGhostCam(waypoint,function(){
            scenes[activeScene].reRender = false;  
            enableScroll();      
            callback();            
            })
        );

    }

}

var smoothSetTarget = function (obj, onEndcallback) {

    var camera = scenes[0].camera;

    var provTargetX = camera.getTarget().x;
    var provTargetY = camera.getTarget().y;
    var provTargetZ = camera.getTarget().z;

    camera.setTarget(obj.position);
    targetX = camera.target.x;
    targetY = camera.target.y;
    targetZ = camera.target.z;

    //easing function
    // var ease = new BABYLON.CubicEase();
    // ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

    var ease = new BABYLON.SineEase();
    ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

    camera.setTarget(new BABYLON.Vector3(provTargetX, provTargetY, provTargetZ));

    // Empty the animation array
    camera.animations.splice(0, camera.animations.length);

    var anim = BABYLON.Animation.CreateAndStartAnimation("CamTaranim", camera, "target", 30, 120, camera.target,
        new BABYLON.Vector3(targetX, targetY, targetZ), 2, ease, onEndcallback);

};

var moveCameraWithGhostCam = function (obj, callback) {

    var scene = scenes[activeScene];
    var camera = scenes[activeScene].camera;
    var gcamera = scenes[activeScene].gcamera;

    gcamera.setPosition(obj.position);

    var radiusAnimation = new BABYLON.Animation("camRadius", "radius", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    var alphaAnimation = new BABYLON.Animation("camAlpha", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    var betaAnimation = new BABYLON.Animation("camBeta", "beta", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

    var keys1 = [{
        frame: 0,
        value: camera.radius
    }, {
        frame: 100,
        value: gcamera.radius
    }];

    var keys2 = [{
        frame: 0,
        value: camera.alpha
    }, {
        frame: 100,
        value: gcamera.alpha
    }];

    var keys3 = [{
        frame: 0,
        value: camera.beta
    }, {
        frame: 100,
        value: gcamera.beta
    }];

    radiusAnimation.setKeys(keys1);
    alphaAnimation.setKeys(keys2);
    betaAnimation.setKeys(keys3);

    camera.animations.push(radiusAnimation);
    camera.animations.push(alphaAnimation);
    camera.animations.push(betaAnimation);

    scene.beginAnimation(camera, 0, 100, false, 2, callback);

}

var moveCamera = function (obj, callback) {

    var scene = scenes[activeScene];
    var camera = scene.camera;

    var positionAnimation = new BABYLON.Animation("camPos", "position", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

    var key = [{
        frame: 0,
        value: obj.position
    }, {
        frame: 100,
        value: obj.position
    }];

    positionAnimation.setKeys(key);
    //easing function
    var ease = new BABYLON.CubicEase();
    ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    positionAnimation.setEasingFunction(ease);

    // Empty the animation array
    camera.animations.splice(0, camera.animations.length);

    camera.animations.push(positionAnimation);
    scene.beginAnimation(camera, 0, 100, false, 1, callback);
    scene.onBeforeRenderObservable.add(forceRebuild);

}

//Since using arcrotatecamera, the alpha, beta, radius must be
//rebuild after the camera moving
var forceRebuild = function () {
    var camera = scenes[activeScene].camera;
    camera.rebuildAnglesAndRadius();
};


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

    // BABYLON.SceneLoader.Load("assets/09-finall/", "north-3D-new-09-final.babylon", engine, function (scene) {
    BABYLON.SceneLoader.Load("assets/09-finall/", "north-3D-new-09-final_edited.babylon", engine, function (scene) {

        //Adding an Arc Rotate Camera
        var camAlpha = -0.3;
        var camBeta = 0.9;
        var camRadius = 7;

        var camera = new BABYLON.ArcRotateCamera("Camera1", camAlpha, camBeta, camRadius, new BABYLON.Vector3.Zero(), scene);
        // camera.attachControl(canvas, false);
        camera.checkCollisions = true;
        camera.upperAlphaLimit = 1.5;
        camera.lowerAlphaLimit = -1.5;

        // A ghost camera 
        var gcamera = new BABYLON.ArcRotateCamera("gCamera", camAlpha, camBeta, camRadius, new BABYLON.Vector3.Zero(), scene);
        // camera.attachControl(canvas, false);
        gcamera.checkCollisions = true;

        // 加上waypoints
        var waypoint1 = scene.getMeshByName("waypoint1");
        var target1 = scene.getMeshByName("target1");
        // var waypoint1 = BABYLON.Mesh.CreateBox("box1", 0.01, scene);
        // var target1 = BABYLON.Mesh.CreateSphere("sphere1", 0.01, 0.01, scene);
        // waypoint1.position = new BABYLON.Vector3(4, 3.78345073141672, -1.0032810597619022);
        // target1.position = new BABYLON.Vector3(4.294345366846326, 3.820366305622412, -1.7780033698026012);
        
        waypoint1.isVisible = false;
        target1.isVisible = false;


        // billboards
        var boardTexture = new BABYLON.DynamicTexture("dynamic texture", 512, scene, true);

        var dynamicMaterial = new BABYLON.StandardMaterial('mat', scene);
        dynamicMaterial.diffuseTexture = boardTexture;
        dynamicMaterial.specularColor = new BABYLON.Color3(0,0,0);
        dynamicMaterial.backFaceCulling = true;

        var plane1 = scene.getMeshByName("plane1");
        plane1.isVisible = false;
        var billboard1 = BABYLON.Mesh.CreatePlane('board1', 1, scene);
        billboard1.position = plane1.position;
        billboard1.material = dynamicMaterial;
        billboard1.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

        // var clearColor = "#555555";
        var font = "bold 40px Microsoft JhengHei";
        var color = "yellow"
        var update = true;

        var text1 = "沉積灰岩後變質";
        var x = 10;
        var y1 = 10+70;
        
        var text2 = "形成堅硬的四稜砂岩";
        var y2 = 10+70+70;

        var context = boardTexture._context;
        var size = boardTexture.getSize();

        // if(clearColor){
        //     context.fillStyle = clearColor;
        //     context.fillRect(0,0,size.width,size.height);
        // }

        
        // if(x===null){
            //     var textSize = boardTexture._context.measureText(text1);
            //     x = (size.width - textSize.width) / 2;
            // }
            
        context.font = font;
        context.fillStyle = color;
        context.fillText(text1, x, y1);
        context.fillText(text2, x, y2);
        
        //draw line
        context.beginPath();
        context.moveTo(150, 200);
        context.lineTo(150, 500);
        context.lineWidth = 10;
        context.strokeStyle = '#ff0000';
        context.stroke();
        
        boardTexture.hasAlpha = true;//必須要clearColor沒被定義
        boardTexture.update(update);

        billboard1.isVisible = false;

        // billboards
        var boardTexture2 = new BABYLON.DynamicTexture("dynamic texture", 512, scene, true);

        var dynamicMaterial2 = new BABYLON.StandardMaterial('mat', scene);
        dynamicMaterial2.diffuseTexture = boardTexture2;
        dynamicMaterial2.specularColor = new BABYLON.Color3(0, 0, 0);
        dynamicMaterial2.backFaceCulling = true;

        var plane2 = scene.getMeshByName("plane2");
        plane2.isVisible = false;
        var billboard2 = BABYLON.Mesh.CreatePlane('board2', 1, scene);
        billboard2.position = plane2.position;
        billboard2.material = dynamicMaterial2;
        billboard2.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

        // var clearColor = "#555555";
        // var font = "bold 40px Microsoft JhengHei";
        // var color = "yellow"
        // var update = true;

        var text3 = "造山運動形成";
        // var x = 10;
        // var y1 = 10 + 70;

        var text4 = "地層傾斜、結理及斷層";
        // var y2 = 10 + 70 + 70;

        var context2 = boardTexture2._context;
        var size2 = boardTexture2.getSize();

        // if(clearColor){
        //     context.fillStyle = clearColor;
        //     context.fillRect(0,0,size.width,size.height);
        // }

        context2.font = font;
        context2.fillStyle = color;
        context2.fillText(text3, x, y1);
        context2.fillText(text4, x, y2);

        boardTexture2.hasAlpha = true;//必須要clearColor沒被定義
        boardTexture2.update(update);

        billboard2.isVisible = false;


        // 設定waypoints和targets
        var wp1index = waypoints.push(waypoint1)-1;
        waypoints[wp1index].hasChanged = false;
        waypoints[wp1index].target = target1;

        
        //  封面的旋轉
        var stopRotating = false;
        var reachedUpperLimit = false;

        scene.registerBeforeRender(function(){
            
            if(stopRotatingPointOffset){
                stopRotating = (scroll_now <= stopRotatingPointOffset)?false:true;
            }

            if (scenes[sceneIndex].reRender && !stopRotating){

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
        scenes[sceneIndex].camera = camera;
        scenes[sceneIndex].gcamera = gcamera;
        scenes[sceneIndex].billboards = [];
        scenes[sceneIndex].billboards.push(billboard1);
        scenes[sceneIndex].billboards.push(billboard2);        
        scenes[sceneIndex].renderLoop = function () {
                this.render();
        }

    });

    modelLoaded[0] = !modelLoaded[0];

}

function PCimportScene2(){
    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);

    var camera = new BABYLON.ArcRotateCamera("Camera2", 0.2, Math.PI/2, 20, new BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, false);
    camera.checkCollisions = true;

    var light = new BABYLON.HemisphericLight("hemi2", new BABYLON.Vector3(0, 1, 0), scene);

    // console.log('import2');

    // The first parameter can be used to specify which mesh to import. Here we import all meshes
    BABYLON.SceneLoader.ImportMesh("", "assets/golden-stone/", "golden-stone.babylon", scene, function (newMeshes) {
        // newMeshes[0].position = BABYLON.Vector3.Zero();
        // newMeshes[0].position = new BABYLON.Vector3(0.5,2,-3);

        newMeshes[0].position = new BABYLON.Vector3(0, 0, 7);

        var materialStone = new BABYLON.StandardMaterial("texture1", scene);
        materialStone.diffuseTexture = new BABYLON.Texture("assets/golden-stone/golden-stone.png", scene);
        materialStone.diffuseTexture.hasAlpha = true;
        materialStone.diffuseTexture.vOffset = 0.05; //vertical offset 0f 10%
        materialStone.diffuseTexture.uOffset = 0.05;

        materialStone.diffuseTexture.vAng = Math.PI;
        materialStone.diffuseTexture.wAng = Math.PI / 2;

        materialStone.diffuseTexture.vScale = 0.8;
        materialStone.diffuseTexture.uScale = 0.8;        

        // materialStone.bumpTexture = new BABYLON.Texture("assets/NormalMap.jpg",scene);

        newMeshes[0].material = materialStone;

    });

    modelLoaded[1] = !modelLoaded[1];

    var sceneIndex = scenes.push(scene) - 1;
    scenes[sceneIndex].reRender = true;
    scenes[sceneIndex].renderLoop = function () {
        this.render();
    }

    return scene;
}

function PCimportScene3(){
    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);

    var camera = new BABYLON.ArcRotateCamera("Camera3", -Math.PI / 2, Math.PI / 2, 5, new BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, false);
    camera.checkCollisions = true;

    var light = new BABYLON.HemisphericLight("hemi3", new BABYLON.Vector3(0, 1, 0), scene);

    // console.log('import3');

    // The first parameter can be used to specify which mesh to import. Here we import all meshes
    BABYLON.SceneLoader.ImportMesh("", "assets/backdoor/", "backdoor.babylon", scene, function (newMeshes) {
        // newMeshes[0].position = BABYLON.Vector3.Zero();
        newMeshes[0].position = new BABYLON.Vector3(10, 1, 15);
        // newMeshes[1].isVisible = false;

        var wall = scene.getMeshByName("1");
        var ground = scene.getMeshByName("2");
        // wall.position = new BABYLON.Vector3(2, 1, 30);
        ground.isVisible = false;

        var materialStone = new BABYLON.StandardMaterial("texture2", scene);
        materialStone.diffuseTexture = new BABYLON.Texture("assets/backdoor/backdoor.png", scene);

        // materialStone.diffuseTexture.vOffset = -0.05; //vertical offset 0f 10%
        // materialStone.diffuseTexture.uOffset = 0.05;

        // materialStone.diffuseTexture.vAng = Math.PI;
        // materialStone.diffuseTexture.wAng = Math.PI / 2;

            // materialStone.bumpTexture = new BABYLON.Texture("assets/NormalMap.jpg",scene);

        wall.material = materialStone;

    });

    modelLoaded[2] = !modelLoaded[2];

    var sceneIndex = scenes.push(scene) - 1;
    scenes[sceneIndex].reRender = true;
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

//disable scrolling

var keys = { 37: 1, 38: 1, 39: 1, 40: 1 };

function preventDefault(e) {
    e = e || window.event;
    if (e.preventDefault)
        e.preventDefault();
    e.returnValue = false;
}

function preventDefaultForScrollKeys(e) {
    if (keys[e.keyCode]) {
        preventDefault(e);
        return false;
    }
}

function disableScroll() {
    if (window.addEventListener) // older FF
        window.addEventListener('DOMMouseScroll', preventDefault, false);
    window.onwheel = preventDefault; // modern standard
    window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
    window.ontouchmove = preventDefault; // mobile
    document.onkeydown = preventDefaultForScrollKeys;
}

function enableScroll() {
    if (window.removeEventListener)
        window.removeEventListener('DOMMouseScroll', preventDefault, false);
    window.onmousewheel = document.onmousewheel = null;
    window.onwheel = null;
    window.ontouchmove = null;
    document.onkeydown = null;
}



/***Tools***/

    /*1. unproject vector*/

    var clickPos = [];
    var clickVector = new BABYLON.Vector3(1, 0, 0);

    var positionUnproject = function (evt) {
        var scene = scenes[0];

        if (evt.button !== 0) {
            return;
        }

        clickPos[0] = scene.pointerX;
        clickPos[1] = scene.pointerY;

        clickVector = vectorUnproject(new BABYLON.Vector3(clickPos[0], clickPos[1], 0));

        console.log('screen vector:' + clickPos);
        console.log('world vector:' + clickVector);
    }

    function vectorUnproject(screenVector) {
        var scene = scenes[0]; 
        var camera = scene.camera;

        //camera unproject test
        var pMScene = camera.getProjectionMatrix();
        // var pMScene = scene.getProjectionMatrix();
        var vMScene = camera.getViewMatrix();
        // var vMScene = scene.getViewMatrix();
        var wMCamera = BABYLON.Matrix.Identity();
        // var wMCamera = scene.activeCamera.getWorldMatrix();
        var globalView = scene.activeCamera.viewport.toGlobal(window.innerWidth, window.innerHeight);
        // var globalView = scene.activeCamera.viewport.toGlobal(engine);
    
        // var screenVector = new BABYLON.Vector3(1,0,0); //z=0 means near plane
    
        // static Unproject(source, viewportWidth, viewportHeight, world, view, projection) → Vector3
        var worldVector = BABYLON.Vector3.Unproject(screenVector, globalView.width, globalView.height, wMCamera, vMScene, pMScene);
    
        return worldVector;
    }

    // canvas.addEventListener("pointerdown", positionUnproject, false);
    
