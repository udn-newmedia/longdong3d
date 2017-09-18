var canvas = document.getElementById("renderCanvas");
var engine = new BABYLON.Engine(canvas, true);

BABYLON.SceneLoader.Load("assets/", "longdong_level5.babylon", engine, function (scene) {

    // //Adding an Arc Rotate Camera
    var camera = new BABYLON.ArcRotateCamera("Camera1", 0, 0.5, 10, new BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, false);
    camera.checkCollisions = true;

    // A ghost camera 
    var gcamera = new BABYLON.ArcRotateCamera("gCamera", 0, 0.5, 10, new BABYLON.Vector3.Zero(), scene);
    // camera.attachControl(canvas, false);
    gcamera.checkCollisions = true;


    // set waypoints
    var cube1 = scene.getMeshByName("Cube1");
    var cube2 = scene.getMeshByName("Cube2");
    var plane = scene.getMeshByName("Plane");
    cube1.isVisible = false;
    cube2.isVisible = false;
    plane.isVisible = false;

    var waypointsContainer = [];
    waypointsContainer[0] = cube1;
    waypointsContainer[1] = cube2;

    // make plane in billboardMode
    var plane1 = BABYLON.Mesh.CreatePlane('plane1', 1, scene);
    // plane1.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    plane1.material = new BABYLON.StandardMaterial("plane1", scene);
    plane1.position = plane.position;

    // camera.setTarget(plane1);

    //2d-text on the plane
    //BJS dynamic texture is using an html canvas to draw the text
    var plane1_texture = new BABYLON.DynamicTexture("dynamic texture", 512, scene, true);
    plane1.material.diffuseTexture = plane1_texture;
    plane1.material.specularColor = new BABYLON.Color3(0, 0, 0);
    plane1.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
    plane1.material.backFaceCulling = true; //True to not render material on back face

    //styles of texts
    var clearColor = "#555555";
    var font = "bold 70px Segoe UI";
    var invertY = true;
    var text = "test";
    var color = "white"
    var x = 10;
    var y = 70 + 10;

    plane1_texture.getContext().clearRect(0, 140, 512, 512);
    plane1_texture.drawText(text, x, y, font, color, clearColor);
    // plane1_texture.drawText(text, x, y, font, color);
    // plane1_texture.hasAlpha = true;//必須要clearColor沒被定義

    // change camera's position when clicking
    // var switchCam = true;
    // window.addEventListener("click", function(){
    //     if(switchCam){
    //         // camera.setPosition(cube1.absolutePosition);
    //         camera.setPosition(cube1.position);
    //         camera.setTarget(plane);
    //     } else {
    //         // camera.setPosition(cube2.absolutePosition);
    //         camera.setPosition(cube2.position);
    //         camera.setTarget(cube1);
    //     }
    //     switchCam = !switchCam;
    // });

    // Changing camera's position by animation when clicking
    var switchCam = true;

    window.addEventListener("click", function () {

        console.log(switchCam);

        var target = (switchCam) ? cube1 : plane1;

        //先target, 再移動 `[OK]`
        // smoothSetTarget(target,moveCamera(cube1,cube2));                    

        //先target, 再zoom in `[OK]`
        // smoothSetTarget(target, zoomInCamera);

        //先移動, 再zoom in `[OK]`
        moveCameraWithGhostCam(cube1, cube2, zoomInCamera);

        //先target, 再移動, 再zoom in
        smoothSetTarget(target, moveCameraWithGhostCam(cube1, cube2, zoomInCamera));

        //旋轉

        switchCam = !switchCam;
    });

    //Since using arcrotatecamera, the alpha, beta, radius must be
    //rebuild after the camera moving
    var forceRebuild = function () {
        camera.rebuildAnglesAndRadius();
    };

    //Smoothing camera targeting by adding rotate animation
    var smoothSetTarget = function (obj, onEndcallback) {

        var provTargetX = camera.getTarget().x;
        var provTargetY = camera.getTarget().y;
        var provTargetZ = camera.getTarget().z;

        camera.setTarget(obj.position);
        targetX = camera.target.x;
        targetY = camera.target.y;
        targetZ = camera.target.z;

        //easing function
        var ease = new BABYLON.CubicEase();
        ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

        camera.setTarget(new BABYLON.Vector3(provTargetX, provTargetY, provTargetZ));

        // Empty the animation array
        camera.animations.splice(0, camera.animations.length);

        var anim = BABYLON.Animation.CreateAndStartAnimation("CamTaranim", camera, "target", 60, 100, camera.target,
            new BABYLON.Vector3(targetX, targetY, targetZ), 2, ease, onEndcallback);

    };

    //Moving camera to specific positions
    var moveCamera = function (obj1, obj2, callback) {

        var positionAnimation = new BABYLON.Animation("camPos", "position", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

        var keys1 = [{
            frame: 0,
            value: obj1.position
        }, {
            frame: 100,
            value: obj2.position
        }];

        var keys2 = [{
            frame: 0,
            value: obj2.position
        }, {
            frame: 100,
            value: obj1.position
        }];

        var key = (switchCam) ? keys1 : keys2;

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

    //Move camera with the assisting of ghost camera
    var moveCameraWithGhostCam = function (obj1, obj2, callback) {

        var obj = (switchCam) ? obj1 : obj2;

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
        scene.beginAnimation(camera, 0, 100, false, 1, callback);
    }

    //Zoom in
    var zoomInCamera = function (callback) {

        var zoominAnimation = new BABYLON.Animation("zoomIn", "radius", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        var curRadius = camera.radius;

        var keys1 = [{
            frame: 0,
            value: curRadius
        }, {
            frame: 100,
            value: curRadius - 5
        }];

        zoominAnimation.setKeys(keys1);

        // Empty the animation array
        camera.animations.splice(0, camera.animations.length);

        camera.animations.push(zoominAnimation);
        scene.beginAnimation(camera, 0, 100, false, 1, callback);
    }

    //render loop
    engine.runRenderLoop(function () {
        scene.render();
    });
});

// Resize
window.addEventListener("resize", function () {
    engine.resize();
});

