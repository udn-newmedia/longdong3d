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

d3.select("#indicator").style('opacity',0);
d3.select('#head').style('opacity',0);

d3.select(".article").style('opacity',0);


//labels for model2
var labels = d3.selectAll(".g-label");
var labelData = [];

labels.each(function () {
    labelData.push(d3.select(this));
});


// variable to hold how many frames have elapsed in the animation
var animFrame = 1;

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

//決定何時要重繪(第一層是換模型判斷點、第二層是換視角判斷點)
function RenderManager(){

    if (scroll_now >= 0 && scroll_now < stopRotatingPointOffset){

        scenes[activeScene].reRender = true;

    } else if (scroll_now >= stopRotatingPointOffset && scroll_now < changeModelPointsOffset[1]*0.9){

        if (scroll_now >= changeViewWaypointsOffset[0] * 0.9 && scroll_now < changeViewWaypointsOffset[0]*1.1){
            scenes[activeScene].reRender = true;        
        } else if (scroll_now >= changeViewWaypointsOffset[1] * 0.9 && scroll_now < changeViewWaypointsOffset[1] * 1.1){
            scenes[activeScene].reRender = true;        
        } else{
            scenes[activeScene].reRender = false;                    
        }
    } else if (scroll_now >= changeModelPointsOffset[0] && scroll_now < changeModelPointsOffset[1] * 0.9){
        scenes[activeScene].reRender = false;        
    } else if (scroll_now >= changeModelPointsOffset[1]*0.9 && scroll_now < changeModelPointsOffset[1]*1.1){
        scenes[activeScene].reRender = true;                
    } else if (scroll_now >= changeModelPointsOffset[1] * 1.1 && scroll_now < changeModelPointsOffset[3] * 0.9){
        // scenes[activeScene].reRender = false;  

    } else if (scroll_now >= changeModelPointsOffset[3] * 0.9 && scroll_now < changeModelPointsOffset[3] * 1.1){
        scenes[activeScene].reRender = true;                
    } else if (scroll_now >= changeModelPointsOffset[3] * 1.1 && scroll_now < changeModelPointsOffset[2] * 0.9){

        // scenes[activeScene].reRender = false;                        
    } else if (scroll_now >= changeModelPointsOffset[2] * 0.9 && scroll_now < changeModelPointsOffset[2] * 1.1) {
        scenes[activeScene].reRender = true;                        
    } else if (scroll_now >= changeModelPointsOffset[2] * 1.1){
        // scenes[activeScene].reRender = false;                        
    }   

    if (scenes[activeScene] && scenes[activeScene].reRender) {
        // console.log('render');
        scenes[activeScene].renderLoop();
    }
}

function SceneManager() {

    modelLoader();
    viewChanger();
    // setCanvasOpacityWithSection();
}

//轉換視角 & billboards控制(包含在billboard上畫線)

function viewChanger(){
    //開頭旋轉隱藏billboards
    if (scroll_now < stopRotatingPointOffset && scenes[activeScene].billboards[0].isVisible){
        scenes[activeScene].billboards[0].isVisible = false;
        displayBillboards(false);
    } 

    if (scroll_now >= changeViewWaypointsOffset[0] && scroll_now < changeViewWaypointsOffset[0] * 1.1) {
        //第一個模型，第一個視角

        changeView(waypoints[0], function() {
          // displayBillboards([true,true,false]);
        });

    } else if (scroll_now >= changeViewWaypointsOffset[1] && scroll_now < changeViewWaypointsOffset[1] * 1.1) {

        d3.selectAll(".g-label").style("opacity",0);

        //第一個模型，第二個視角    
        changeView(waypoints[1], function () {

            displayBillboards([false, false, false, true]);


            setTimeout(function(){
                var billboard = scenes[activeScene].billboards[3];
                var points = billboard.animTexture.points;
                var style = billboard.animTexture.ctxStyle;

                disableScroll();

                animateTexturePlay(billboard,style,points,function(){
                    animFrame = 1;
                    enableScroll();
                    scrollAnimation(changeModelPointsOffset[1], 1000);
                });

            },3000);
        });
    } else if (scroll_now >= changeViewWaypointsOffset[2] && scroll_now < changeViewWaypointsOffset[3]) {
        //第二個模型，第一個視角
        
        // d3.selectAll(".g-label")
        //     .style("opacity", 0);

        // d3.select(".g-label .model2-1").style("opacity",1);

        if (scenes[activeScene].billboards[0]) {

            if (!scenes[activeScene].cameraPara2.hasChanged){


                scenes[activeScene].cameraPara2.hasChanged = true;
    
                moveCameraByAdjustingParameters(scenes[activeScene].cameraPara2, function () {
                
                    var billboard = scenes[activeScene].billboards[0];
                    var style = billboard.animTexture.ctxStyle1;
                    var points = billboard.animTexture.points1;
            
                    // displayBillboards(true);
    
                    // animateTexturePlay(billboard, style, points, function () {
                    //     animFrame = 1;
                    //     // showTextFlipped(billboard, billboard.animTexture.text1);

                    //     for (var i = 0; i < labelData.length; i++) {
                    //         if (i === 0) {
                    //             labelData[i].style('opacity', 1);
                    //         } else {
                    //             labelData[i].style('opacity', 0);
                    //         }
                    //     }

                    // });
                });
            }
        }

    } else if (scroll_now >= changeViewWaypointsOffset[3] && scroll_now < changeViewWaypointsOffset[4]) {
        //第二個模型，第二個視角

        if (!scenes[activeScene].cameraPara3.hasChanged) {

            scenes[activeScene].cameraPara3.hasChanged = true;


            moveCameraByAdjustingParameters(scenes[activeScene].cameraPara3, function () {
        
                var billboard = scenes[activeScene].billboards[0];
                var ctxStyle2 = billboard.animTexture.ctxStyle2;
                var ctxStyle3 = billboard.animTexture.ctxStyle3;
                var points2 = billboard.animTexture.points2;
                var points3 = billboard.animTexture.points3;
                
                billboard.animTexture._context.clearRect(0, 0, 512, 512);

                // animateTexturePlay(billboard, ctxStyle2, points2, function () {
                //     animFrame = 1;
                //     // showText(billboard, billboard.animTexture.text2);
                //     // showText(billboard, billboard.animTexture.text3);

                //     for (var i = 0; i < labelData.length; i++) {
                //         if (i === 1 || i === 2) {
                //             labelData[i].style('opacity', 1);
                //         } else {
                //             labelData[i].style('opacity', 0);
                //         }
                //     }

                // });

                // animateTexturePlay(billboard, ctxStyle3, points3, function () {
                //     animFrame = 1;
                //     // showText(billboard, billboard.animTexture.text4);
                //     // showText(billboard, billboard.animTexture.text5);
                // });


            });

        }

    } else if (scroll_now >= changeViewWaypointsOffset[4] && scroll_now < changeViewWaypointsOffset[5]) {
        //第二個模型，第三個視角

        if (!scenes[activeScene].cameraPara4.hasChanged) {
            
            scenes[activeScene].cameraPara4.hasChanged = true;


            moveCameraByAdjustingParameters(scenes[activeScene].cameraPara4, function () {
    
                var billboard = scenes[activeScene].billboards[0];
                var style = billboard.animTexture.ctxStyle4;
                var points = billboard.animTexture.points4;

                billboard.animTexture._context.clearRect(0, 0, 512, 512);

                // animateTexturePlay(billboard, style, points, function () {
                //     animFrame = 1;
                //     // showText(billboard, billboard.animTexture.text6);
                //     // showText(billboard, billboard.animTexture.text7);

                //     for (var i = 0; i < labelData.length; i++) {
                //         if (i === 3) {
                //             labelData[i].style('opacity', 1);
                //         } else {
                //             labelData[i].style('opacity', 0);
                //         }
                //     }

                // });
            });
        }


    } else if (scroll_now >= changeViewWaypointsOffset[5] && scroll_now < changeModelPointsOffset[3]) {
        //第二個模型，第四個視角        

        if (!scenes[activeScene].cameraPara5.hasChanged) {
            
            scenes[activeScene].cameraPara5.hasChanged = true;

        
            
            moveCameraByAdjustingParameters(scenes[activeScene].cameraPara5, function () {
                
                var billboard = scenes[activeScene].billboards[0];
                var style = billboard.animTexture.ctxStyle5;
                var points = billboard.animTexture.points5;

                billboard.animTexture._context.clearRect(0, 0, 512, 512);

                // animateTexturePlay(billboard, style, points, function () {
                //     animFrame = 1;
                //     // showText(billboard, billboard.animTexture.text8);
                //     // showText(billboard, billboard.animTexture.text9);

                //     for (var i = 0; i < labelData.length; i++) {
                //         if (i === 4) {
                //             labelData[i].style('opacity', 1);
                //         } else {
                //             labelData[i].style('opacity', 0);
                //         }
                //     }

                // });
            }); 
        }

    } else if (scroll_now >= changeViewWaypointsOffset[5] && scroll_now < changeModelPointsOffset[2]){

        // d3.selectAll(".g-label").style("opacity", 0);
        displayBillboards([false, false, true, false]);

          var billboard = scenes[activeScene].billboards[2];
          var points = billboard.animTexture.points;
          var style = billboard.animTexture.ctxStyle;

          disableScroll();

          animateTexturePlay(billboard, style, points, function() {
            animFrame = 1;
            enableScroll();
            scrollAnimation(changeModelPointsOffset[2], 1000);
          });

    } else if (scroll_now >= changeModelPointsOffset[2] && scroll_now < changeModelPointsOffset[2] + 2/3 * window.innerHeight) {
        //第三個模型，第一個視角

        //定點觸發動畫
        if (scroll_now < changeModelPointsOffset[2]+ 1/3 * window.innerHeight){
            
            if (scenes[activeScene].billboards[0] && !scenes[activeScene].cameraPara2.hasChanged){

                scenes[activeScene].cameraPara2.hasChanged = true;

                moveCameraByAdjustingParameters(scenes[activeScene].cameraPara2, function(){
    
                    var billboard = scenes[activeScene].billboards[0];
                    var style = billboard.animTexture.ctxStyle1;
                    var points = billboard.animTexture.points1;
    
                    // displayBillboards(true);

                    // animateTexturePlay(billboard,style,points,function(){
                    //     animFrame = 1;
                    //     showText(billboard, billboard.animTexture.text1);
                    // });
                });
            
            }

        } else {

            var billboard = scenes[activeScene].billboards[0];
            
            if (!billboard.animTexture.ctxStyle2.draw) {

                billboard.animTexture.ctxStyle2.draw = true;

                var style = billboard.animTexture.ctxStyle2;
                var points = billboard.animTexture.points2;

                // animateTexturePlay(billboard, style, points, function () {
                //     animFrame = 1;
                //     showText(billboard, billboard.animTexture.text2);
                //     showText(billboard, billboard.animTexture.text3);
                // });
            }

        }

        
        //跟著scroll長線
        // if (scenes[activeScene].billboards[0]) {
        //     if (!scenes[activeScene].billboards[0].isVisible) {
        //         moveCameraByAdjustingParameters(scenes[activeScene].cameraPara2,function(){
        //             displayBillboards(true);
        //             scenes[activeScene].cameraPara2.hasChanged = true;
        //         });

        //     }else{

        //         var start = changeModelPointsOffset[2];
        //         var middlePoint1 = changeModelPointsOffset[2] + window.innerHeight * 1/3;
        //         var middlePoint2 = changeModelPointsOffset[2] + window.innerHeight * 2/3;
        //         var end = changeModelPointsOffset[2] + window.innerHeight;

        //         var billboard = scenes[activeScene].billboards[0];

        //         // start, end, billboard, points, style
        //         // drawLineWithScroll(start, end, billboard, points, style);

        //         if (scroll_now > start && scroll_now < middlePoint1){

        //             var points = billboard.animTexture.points1;
        //             var style = billboard.animTexture.ctxStyle1;

        //             drawLineWithScroll(start, middlePoint1, billboard, points, style);
        //         } 
        //         else if (scroll_now >= middlePoint1 && scroll_now < middlePoint2) {

        //             animFrame = 1;
        //             var points = billboard.animTexture.points2;
        //             var style = billboard.animTexture.ctxStyle2;

        //             showText(billboard, billboard.animTexture.text1);

        //             drawLineWithScroll(middlePoint1, middlePoint2, billboard, points, style);
        //         }
        //         else if (scroll_now >= middlePoint2 && scroll_now < end){

        //             showText(billboard, billboard.animTexture.text2);
        //             showText(billboard, billboard.animTexture.text3);

        //             if(!scenes[activeScene].cameraPara3.hasChanged){
        //                 moveCameraByAdjustingParameters(scenes[activeScene].cameraPara3, function () {
        //                     scenes[activeScene].cameraPara3.hasChanged = true;
        //                 });
        //             }
        //             animFrame = 1;
        //             var points = billboard.animTexture.points3;
        //             var style = billboard.animTexture.ctxStyle3;
        //             drawLineWithScroll(middlePoint2, end, billboard, points, style);
        //         } 
        //     }
        // }
    } else if (scroll_now >= changeModelPointsOffset[2] + 2 / 3 * window.innerHeight && scroll_now < changeModelPointsOffset[2] + window.innerHeight){

        //第三個模型，第二個視角
        if (!scenes[activeScene].cameraPara3.hasChanged){

            scenes[activeScene].cameraPara3.hasChanged = true;

            //定點觸發動畫
            moveCameraByAdjustingParameters(scenes[activeScene].cameraPara3, function () {
    
                var billboard = scenes[activeScene].billboards[0];
                var style = billboard.animTexture.ctxStyle3;
                var points = billboard.animTexture.points3;
    
                // animateTexturePlay(billboard, style, points, function () {
                //     animFrame = 1;
                // });
            });
        }

    }
}

function linearScaleFunc(domainArray,rangeArray){

    // var sectionScale = d3.scaleLinear()
    //     .domain(sectionData.map(function (d) {
    //         return d.top;
    //     }))
    //     .range(d3.range(sectionData.length))
    //     .clamp(true);
    
    //domain跟range要有同樣多的刻度
    var scaleFunction = d3.scaleLinear()
        .domain(domainArray)
        .range(d3.range(rangeArray.length))
        .clamp(true);


    return scaleFunction;
}

function showTextFlipped(billboard,text){

    var context = billboard.animTexture._context;
    context.font = text.font;
    context.fillStyle = text.color;
    context.fillText(text.text, text.x, text.y);
    billboard.animTexture.update();    
}

function showText(billboard,text){

    var context = billboard.animTexture._context;
    context.font = text.font;
    context.fillStyle = text.color;
    context.fillText(text.text, text.x, text.y);

    billboard.animTexture.update();

}

function drawLineWithScroll(start,end,billboard,points,style) {

    var offset = scroll_now - start;
    // var points = billboard.animTexture.points;
    var targetFrame = Math.ceil((offset/(end-start))*(points.length));

    var ctx = billboard.animTexture._context;
    // var style = billboard.animTexture.ctxStyle;

    ctx.lineCap = style.lineCap;
    ctx.lineWidth = style.lineWidth;
    ctx.strokeStyle = style.strokeStyle;

    if (animFrame < points.length - 1) {

        while (animFrame < targetFrame){
            ctx.beginPath();
            ctx.moveTo(points[animFrame - 1].x, points[animFrame - 1].y);
            ctx.lineTo(points[animFrame].x, points[animFrame].y);
            ctx.stroke();

            setTimeout(function(){
                billboard.animTexture.update();
            },15);

            animFrame++;
        }
            
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

    // console.log(model);

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

        var backTolongdong = document.getElementById('backTolongdong');

        changeModelPointsOffset[0] = model1.getBoundingClientRect().top + window.pageYOffset;
        changeModelPointsOffset[1] = model2.getBoundingClientRect().top + window.pageYOffset;
        changeModelPointsOffset[2] = model3.getBoundingClientRect().top + window.pageYOffset;
        changeModelPointsOffset[3] = backTolongdong.getBoundingClientRect().top + window.pageYOffset;

    //waypoints
        //model1 longdong
        var changeViewWaypoint1 = document.getElementsByTagName("section")[2];
        changeViewWaypointsOffset[0] = changeViewWaypoint1.getBoundingClientRect().top + window.pageYOffset;

        var changeViewWaypoint2 = document.getElementsByTagName("section")[5];
        changeViewWaypointsOffset[1] = changeViewWaypoint2.getBoundingClientRect().top + window.innerHeight + window.pageYOffset;        

        //model2
        var changeViewWaypoint3 = document.getElementById("model2-1");
        changeViewWaypointsOffset[2] = changeViewWaypoint3.getBoundingClientRect().top + window.pageYOffset;

        var changeViewWaypoint4 = document.getElementById("model2-2");
        changeViewWaypointsOffset[3] = changeViewWaypoint4.getBoundingClientRect().top + window.pageYOffset;

        var changeViewWaypoint5 = document.getElementById("model2-3");
        changeViewWaypointsOffset[4] = changeViewWaypoint5.getBoundingClientRect().top + window.pageYOffset;

        var changeViewWaypoint6 = document.getElementById("model2-4");
        changeViewWaypointsOffset[5] = changeViewWaypoint6.getBoundingClientRect().top + window.pageYOffset;

    //other points
        var stopRotatingPoint = document.getElementsByTagName("section")[1];
        stopRotatingPointOffset = stopRotatingPoint.getBoundingClientRect().top + window.pageYOffset;
}

function whichModel() {

    if (window.pageYOffset >= 0 && window.pageYOffset < changeModelPointsOffset[1]) {
        return 'model1';
    } else if (window.pageYOffset >= changeModelPointsOffset[1] && window.pageYOffset < changeModelPointsOffset[3]) {
        return 'model2';
    } else if (window.pageYOffset >= changeModelPointsOffset[3] && window.pageYOffset < changeModelPointsOffset[2]){
        return 'model1';
    } else if (window.pageYOffset >= changeModelPointsOffset[2]) {
        return 'model3';
    }
}

function setCanvasOpacityWithSection() {

    var canvas_style = window.getComputedStyle(canvas),
        canvas_opacity = canvas_style.getPropertyValue('opacity');

    //第一個換模型點的透明度轉換

    // if (window.pageYOffset >= changeModelPointsOffset[1] * 0.9 && window.pageYOffset < changeModelPointsOffset[1]) {

    //     canvas.style.opacity = 1 - ((window.pageYOffset - changeModelPointsOffset[1] * 0.9) / (changeModelPointsOffset[1] - changeModelPointsOffset[1] * 0.9));

    // } else if (window.pageYOffset >= changeModelPointsOffset[1] && window.pageYOffset < changeModelPointsOffset[1] * 1.1) {

    //     canvas.style.opacity = (window.pageYOffset - changeModelPointsOffset[1]) / (changeModelPointsOffset[1] * 1.1 - changeModelPointsOffset[1]);

    // } else if (window.pageYOffset >= changeModelPointsOffset[1]){

    //     canvas.style.opacity = 1;

    // }

    //第二個換模型點的透明度轉換
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

    if(Array.isArray(display)){
        // console.log(scene.billboards.length);
        for(var i=0;i<scene.billboards.length;i++){
            scene.billboards[i].isVisible = display[i];
        }
    }else{
        // console.log(display);
        scene.billboards.forEach(function (board) {
            board.isVisible = display;
        });
    }
    
}

function changeView(waypoint, callback){

    if (waypoint.hasChanged){
        return;
    }else{
        waypoint.hasChanged = true;

        // console.log('changeView');
        disableScroll()
        
        var point = waypoint;
        var target = point.target;
        
        smoothSetTarget(target, moveCameraWithGhostCam(point,function(){
            scenes[activeScene].reRender = false;  
            enableScroll();      
            callback();            
            })
        );

    }

}

var smoothSetTarget = function (obj, onEndcallback) {

    var camera = scenes[activeScene].camera;

    // var provTargetX = camera.getTarget().x;
    // var provTargetY = camera.getTarget().y;
    // var provTargetZ = camera.getTarget().z;

    var provTargetX = camera.target.x;
    var provTargetY = camera.target.x;
    var provTargetZ = camera.target.x;

//    camera.setTarget(obj.position);
    camera.setTarget(new BABYLON.Vector3(obj.x,obj.y,obj.z));

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

    // gcamera.setPosition(obj.position);
    gcamera.setPosition(obj);

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

    camera.animations.push(alphaAnimation);  
    camera.animations.push(betaAnimation);
    camera.animations.push(radiusAnimation);

    scene.beginAnimation(camera, 0, 100, false, 2, callback);
}

var moveCameraByAdjustingParameters = function(newPara, callback){

    // if(newPara.hasChanged) return;

    var scene = scenes[activeScene];
    var camera = scene.activeCamera;

    var radiusAnimation = new BABYLON.Animation("camRadius", "radius", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    var alphaAnimation = new BABYLON.Animation("camAlpha", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    var betaAnimation = new BABYLON.Animation("camBeta", "beta", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

    var keys1 = [{
        frame: 0,
        value: camera.radius
    }, {
        frame: 100,
        value: newPara.radius
    }];

    var keys2 = [{
        frame: 0,
        value: camera.alpha
    }, {
        frame: 100,
        value: newPara.alpha
    }];

    var keys3 = [{
        frame: 0,
        value: camera.beta
    }, {
        frame: 100,
        value: newPara.beta
    }];

    radiusAnimation.setKeys(keys1);
    alphaAnimation.setKeys(keys2);
    betaAnimation.setKeys(keys3);

    camera.animations.splice(0, camera.animations.length);
    camera.animations.push(betaAnimation);
    camera.animations.push(alphaAnimation);
    camera.animations.push(radiusAnimation);

    scene.beginAnimation(camera, 0, 100, false, 3, function(){
        // newPara.hasChanged = true;
        callback();
    });
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

        scene.clearColor = new BABYLON.Color3.FromHexString("#28253a");

        //Adding an Arc Rotate Camera
        // var camAlpha = -0.3;
        // var camBeta = 0.9;
        // var camRadius = 7;

        //New parameter
        var camAlpha = -Math.PI/4;
        var camBeta = Math.PI * 0.4;
        var camRadius = 7;

        var camera = new BABYLON.ArcRotateCamera("Camera1", camAlpha, camBeta, camRadius, new BABYLON.Vector3(0, 2, 0), scene);
        camera.attachControl(canvas, false);
        camera.checkCollisions = true;
        camera.upperAlphaLimit = 1.1;
        camera.lowerAlphaLimit = -1.1;



d3.select("#btn").on("click", function() {
//   console.log("alpha:"+camera.alpha, "beta:"+camera.beta, "radius:"+camera.radius);
  console.log("position:"+camera.position);
  console.log("target:"+camera.target);
});



        // A ghost camera 
        var gcamera = new BABYLON.ArcRotateCamera("gCamera", camAlpha, camBeta, camRadius, new BABYLON.Vector3(0, 2, 0), scene);
        // camera.attachControl(canvas, false);
        gcamera.checkCollisions = true;
        gcamera.upperAlphaLimit = 1.1;
        gcamera.lowerAlphaLimit = -1.1;

        // 加上waypoints & target
            // var waypoint1 = scene.getMeshByName("waypoint1");
            // var target1 = scene.getMeshByName("target1");
            // var waypoint2 = scene.getMeshByName("waypoint2");

            // waypoint1.isVisible = false;
            // target1.isVisible = false;
            // waypoint2.isVisible = false;


            var waypoint1 = {
                x:6.878846228549867,
                y:5.624442667001714,
                z:2.785135595239103
            }

            var target1 = {
                x:0,
                y:2,
                z:0
            }

            var waypoint2 = {
                x:4.01723914000348,
                y:2.6102516854780466,
                z:6.705014908367961
            }

            var target2 = {
                x:0.6099509019598574,
                y:1.25727781865985,
                z:0.010512437642007032
            }

        // billboards
        
        //billboard1
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
            boardTexture.update();

            billboard1.isVisible = false;

        // billboard2
            var boardTexture2 = new BABYLON.DynamicTexture("dynamic texture2", 512, scene, true);

            var dynamicMaterial2 = new BABYLON.StandardMaterial('mat2', scene);
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
            boardTexture2.update();

            billboard2.isVisible = false;


        // billboard3 (畫框框)
            var boardTexture3 = new BABYLON.DynamicTexture("dynamic texture3", 512, scene, true);
            boardTexture3.hasAlpha = true;//必須要clearColor沒被定義

            var dynamicMaterial3 = new BABYLON.StandardMaterial('mat3', scene);
            dynamicMaterial3.diffuseTexture = boardTexture3;
            dynamicMaterial3.specularColor = new BABYLON.Color3(0, 0, 0);
            dynamicMaterial3.backFaceCulling = true;

            var plane3 = scene.getMeshByName("plane3");
            plane3.isVisible = false;

            var billboard3 = BABYLON.Mesh.CreatePlane('board3', 1, scene);
            billboard3.position = plane3.position;
            billboard3.material = dynamicMaterial3;
            billboard3.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
            billboard3.isVisible = false;
            billboard3.animTexture = boardTexture3;
            
            // define the path to plot
            var vertices = [];
                
                vertices.push({
                    x: 10,
                    y: 10
                });
                vertices.push({
                    x: 10+400,
                    y: 10
                });
                vertices.push({
                    x: 10+400,
                    y: 10+400
                });
                vertices.push({
                    x: 10,
                    y: 10+400
                });
                vertices.push({
                    x: 10,
                    y: 10
                });


            billboard3.animTexture.points = calcIntermediatepoints(vertices,20);
            // billboard3.animTexture.points = vertices;
            billboard3.animTexture.ctxStyle = {
                lineCap: "round",
                lineWidth: "10",
                strokeStyle: "yellow"
            }


        // billboard4 (畫框框)

        var boardTexture4 = new BABYLON.DynamicTexture("dynamic texture4", 512, scene, true);
        boardTexture4.hasAlpha = true;//必須要clearColor沒被定義

        var dynamicMaterial4 = new BABYLON.StandardMaterial('mat4', scene);
        dynamicMaterial4.diffuseTexture = boardTexture4;
        dynamicMaterial4.specularColor = new BABYLON.Color3(0, 0, 0);
        dynamicMaterial4.backFaceCulling = true;

        var plane4 = scene.getMeshByName("plane4");
        plane4.isVisible = true;

        var billboard4 = BABYLON.Mesh.CreatePlane('board4', 1, scene);
        billboard4.position = plane4.position;
        billboard4.material = dynamicMaterial4;
        billboard4.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
        billboard4.isVisible = false;
        billboard4.animTexture = boardTexture4;

        billboard4.animTexture.points = calcIntermediatepoints(vertices, 20);
        billboard4.animTexture.ctxStyle = {
            lineCap: "round",
            lineWidth: "10",
            strokeStyle: "yellow"
        }

        // 設定waypoints和targets
        var wp1index = waypoints.push(waypoint1)-1;
        waypoints[wp1index].hasChanged = false;
        waypoints[wp1index].target = target1;

        var wp2index = waypoints.push(waypoint2) - 1;
        waypoints[wp2index].hasChanged = false;
        waypoints[wp2index].target = target2;

        //  封面的旋轉
        var stopRotating = false;
        var reachedUpperLimit = false;

        scene.registerBeforeRender(function(){

            // 封面的旋轉
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
        scenes[sceneIndex].billboards.push(billboard3);
        scenes[sceneIndex].billboards.push(billboard4);

        scenes[sceneIndex].renderLoop = function () {
                this.render();
        }

    });

    modelLoaded[0] = !modelLoaded[0];

}

function scrollAnimation(destination,scrollDuration) {
    var scrollStep = (destination - window.pageYOffset) / (scrollDuration / 15),
        scrollInterval = setInterval(function () {
            if (window.pageYOffset <= destination) {
                window.scrollBy(0, scrollStep);
            }
            else clearInterval(scrollInterval);
        }, 15);
}

function animateTexturePlay(billboard, style, points, callback) {

    var ctx = billboard.animTexture._context;
    // var points = billboard.animTexture.points;
    // var style = billboard.animTexture.ctxStyle;

    ctx.lineCap = style.lineCap;
    ctx.lineWidth = style.lineWidth;
    ctx.strokeStyle = style.strokeStyle;
    

    if (animFrame < points.length) {

        setTimeout(function(){
            animateTexturePlay(billboard, style, points, callback);
            animFrame++;
        },15)
        
    } else {
        callback();
    }

    // draw a line segment from the last waypoint
    // to the current waypoint
    ctx.beginPath();
    ctx.moveTo(points[animFrame - 1].x, points[animFrame - 1].y);
    ctx.lineTo(points[animFrame].x, points[animFrame].y);
    ctx.stroke();
    billboard.animTexture.update();
}

// calc waypoints traveling along vertices
function calcIntermediatepoints(vertices,num) {
    var waypoints = [];
    for (var i = 1; i < vertices.length; i++) {
        var pt0 = vertices[i - 1];
        var pt1 = vertices[i];
        var dx = pt1.x - pt0.x;
        var dy = pt1.y - pt0.y;
        for (var j = 0; j < num; j++) {
            var x = pt0.x + dx * j / num;
            var y = pt0.y + dy * j / num;
            waypoints.push({
                x: x,
                y: y
            });
        }
    }
    return (waypoints);
}

function PCimportScene2_multi(){

    //multi-texture
    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);

    var camera = new BABYLON.ArcRotateCamera("Camera2", 0.2, Math.PI / 2, 20, new BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, false);
    camera.checkCollisions = true;

    var light = new BABYLON.HemisphericLight("hemi2", new BABYLON.Vector3(0, 1, 0), scene);

    var sphere2 = BABYLON.Mesh.CreateSphere("Sphere2", 16.0, 10.0, scene);
    sphere2.position = new BABYLON.Vector3(0, 0, 7);

    // MATERIALS
    var bumpMaterial = new BABYLON.StandardMaterial("texture1", scene);
    bumpMaterial.diffuseColor = new BABYLON.Color3(0, 0, 1);//Blue

    var simpleMaterial = new BABYLON.StandardMaterial("texture2", scene);
    simpleMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);//Red

    // Multimaterial
    var multimat = new BABYLON.MultiMaterial("multi", scene);
    multimat.subMaterials.push(simpleMaterial);
    multimat.subMaterials.push(bumpMaterial);
    // multimat.subMaterials.push(textMat);

    sphere2.subMeshes = [];

    var verticesCount = sphere2.getTotalVertices();

    console.log(verticesCount);

    sphere2.subMeshes.push(new BABYLON.SubMesh(0, 0, verticesCount, 0, 400, sphere2));
    sphere2.subMeshes.push(new BABYLON.SubMesh(1, 0, verticesCount, 400, 400, sphere2));
    
    // sphere2.subMeshes.push(new BABYLON.SubMesh(1, 0, verticesCount, 900, 1800, sphere2));
    // sphere2.subMeshes.push(new BABYLON.SubMesh(2, 0, verticesCount, 1800, 2088, sphere2));

    sphere2.material = multimat;

    // // The first parameter can be used to specify which mesh to import. Here we import all meshes
    // BABYLON.SceneLoader.ImportMesh("", "assets/golden-stone/0922/", "golden-stone.babylon", scene, function (newMeshes) {

    //     newMeshes[0].position = new BABYLON.Vector3(0, 0, 7);

    //     var material1 = new BABYLON.StandardMaterial("texture1", scene);
    //     material1.diffuseTexture = new BABYLON.Texture("assets/golden-stone/golden-stone1.png", scene);
    //     // material1.diffuseTexture.hasAlpha = true;
    //     // material1.diffuseColor = new BABYLON.Color3(1, 0, 0);
    //     material1.diffuseTexture.wAng = Math.PI / 2;
    //     // newMeshes[0].material = material1;

    //     var material2 = new BABYLON.StandardMaterial("texture2", scene);
    //     material2.diffuseTexture = new BABYLON.Texture("assets/golden-stone/golden-stone2.png", scene);
    //     // material2.diffuseTexture.hasAlpha = true;        
    //     // material2.diffuseColor = new BABYLON.Color3(0, 0, 1);
    //     material2.diffuseTexture.wAng = Math.PI / 2;

    //     var multimat = new BABYLON.MultiMaterial("multi", scene);
    //     multimat.subMaterials.push(material1);
    //     multimat.subMaterials.push(material2);


    //     newMeshes[0].subMeshes = [];

    //     var totalVertices = newMeshes[0].getTotalVertices();
        
    //     console.log(toalVertices); //56675

    //     // var breakpoint = 50000;

    //     // newMeshes[0].subMeshes.push(new BABYLON.SubMesh(0, 0, totalVertices, 0, breakpoint, newMeshes[0]));
    //     // newMeshes[0].subMeshes.push(new BABYLON.SubMesh(1, 0, totalVertices, breakpoint, totalVertices, newMeshes[0]));
    // });

    modelLoaded[1] = !modelLoaded[1];

    var sceneIndex = scenes.push(scene) - 1;
    scenes[sceneIndex].reRender = true;
    scenes[sceneIndex].renderLoop = function () {
        this.render();
    }

    return scene;
}

function PCimportScene2(){
    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);

    var camAlpha = 0.2;
    var camBeta = Math.PI / 2;
    var camRadius = 20;

    var camera = new BABYLON.ArcRotateCamera("Camera2", camAlpha, camBeta, camRadius, new BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, false);
    camera.checkCollisions = true;

    var cameraPara2 = {
        alpha: camAlpha * 5.5,
        beta: camBeta * 1.1,
        radius: camRadius * 0.7,
        hasChanged: false
    }

    var cameraPara3 = {
        alpha: camAlpha * 3,
        beta: camBeta * 0.9,
        radius: camRadius * 0.7,
        hasChanged: false
    }

    var cameraPara4 = {
        alpha: camAlpha * 5.5,
        beta: camBeta * 1.1,
        radius: camRadius * 0.7,
        hasChanged: false
    }

    var cameraPara5 = {
        alpha: camAlpha,
        beta: camBeta,
        radius: camRadius * 0.8,
        hasChanged: false
    }    

    var light = new BABYLON.HemisphericLight("hemi2", new BABYLON.Vector3(0, 1, 0), scene);

    // console.log('import2');

    // The first parameter can be used to specify which mesh to import. Here we import all meshes
    BABYLON.SceneLoader.ImportMesh("", "assets/golden-stone/0922/", "golden-stone.babylon", scene, function (newMeshes) {
        // newMeshes[0].position = BABYLON.Vector3.Zero();
        // newMeshes[0].position = new BABYLON.Vector3(0.5,2,-3);

        newMeshes[0].position = new BABYLON.Vector3(0, 0, 7);
        newMeshes[0].rotation = new BABYLON.Vector3(-Math.PI/2*1.1, Math.PI/2, Math.PI);

        var materialStone = new BABYLON.StandardMaterial("texture1", scene);
        materialStone.diffuseTexture = new BABYLON.Texture("assets/golden-stone/golden-stone.png", scene);
        materialStone.diffuseTexture.hasAlpha = true;

        // materialStone.diffuseTexture.uOffset = 0.05;
        // materialStone.diffuseTexture.vOffset = 0.05; //vertical offset 0f 10%

        // materialStone.diffuseTexture.uAng = Math.PI;
        // materialStone.diffuseTexture.vAng = Math.PI;
        materialStone.diffuseTexture.wAng = Math.PI / 2;

        // materialStone.diffuseTexture.uScale = 1.2;        
        // materialStone.diffuseTexture.vScale = 0.9;

        materialStone.diffuseTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
        materialStone.diffuseTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;

        newMeshes[0].material = materialStone;

        var boardTexture2 = new BABYLON.DynamicTexture("dynamic texture5", 512, scene, true);
        boardTexture2.hasAlpha = true; //必須要clearColor沒被定義

        var dynamicMaterial2 = new BABYLON.StandardMaterial('mat5', scene);
        dynamicMaterial2.diffuseTexture = boardTexture2;
        dynamicMaterial2.specularColor = new BABYLON.Color3(0, 0, 0);
        dynamicMaterial2.backFaceCulling = true;

        var billboard2 = BABYLON.Mesh.CreatePlane('board5', 10, scene);
        billboard2.position = new BABYLON.Vector3(newMeshes[0].position.x + 4, newMeshes[0].position.y, newMeshes[0].position.z);
        // billboard2.rotation = new BABYLON.Vector3(Math.PI, Math.PI / 2, -Math.PI);
        billboard2.rotation = new BABYLON.Vector3(Math.PI, Math.PI / 2, 0);


        billboard2.material = dynamicMaterial2;
        // billboard2.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
        billboard2.isVisible = true;
        billboard2.animTexture = boardTexture2;

        // define the path to plot
        var vertices1 = [];
        var vertices2 = [];
        var vertices3 = [];
        var vertices4 = [];
        var vertices5 = [];


        vertices1.push({
            x: 220,
            y: 200
        });
        vertices1.push({
            x: 180,
            y: 80
        });
    
        vertices2.push({
            x: 255,
            y: 170
        });
        vertices2.push({
            x: 265,
            y: 343
        });

        vertices3.push({
            x: 265,
            y: 345
        });
        vertices3.push({
            x: 275,
            y: 400
        });

        vertices4.push({
            x: 150,
            y: 100
        });
        vertices4.push({
            x: 160,
            y: 190
        });

        vertices5.push({
            x: 260,
            y: 190
        });
        vertices5.push({
            x: 275,
            y: 400
        });

        // billboard1.animTexture.points1 = calcIntermediatepoints(vertices1, 10);
        // billboard1.animTexture.points2 = calcIntermediatepoints(vertices2, 10);
        // billboard1.animTexture.points3 = calcIntermediatepoints(vertices3, 10);

        billboard2.animTexture.points1 = vertices1;
        billboard2.animTexture.points2 = vertices2;
        billboard2.animTexture.points3 = vertices3;
        billboard2.animTexture.points4 = vertices4;
        billboard2.animTexture.points5 = vertices5;

        // billboard1.animTexture.points = vertices;
        billboard2.animTexture.ctxStyle1 = {
            lineCap: "round",
            lineWidth: "1",
            strokeStyle: "blue",
            draw: false
        }
    
        billboard2.animTexture.ctxStyle2 = {
            lineCap: "round",
            lineWidth: "1",
            strokeStyle: "blue",
            draw: false
        }

        billboard2.animTexture.ctxStyle3 = {
            lineCap: "round",
            lineWidth: "1",
            strokeStyle: "red",
            draw: false
        }

        billboard2.animTexture.ctxStyle4 = {
            lineCap: "round",
            lineWidth: "1",
            strokeStyle: "red",
            draw: false
        }

        billboard2.animTexture.ctxStyle5 = {
            lineCap: "round",
            lineWidth: "1",
            strokeStyle: "blue",
            draw: false
        }

        //文字部分
        var font = "12px Microsoft JhengHei";
        var color = "yellow"

        //第一個視角
        var text1 = "翻越2組小天花板地形";
        var x1 = 280;
        var y1 = 300;

        //第二個視角
        var text2 = "大角度攀爬";
        var x2 = 260;
        var y2 = 190;

        var text3 = "手跟腳都延伸到極致";
        var x3 = 260;
        var y3 = 170;

        var text4 = "無確保的2公尺";
        var x4 = 275;
        var y4 = 400;

        var text5 = "極容易大幅度墜落";
        var x5 = 275;
        var y5 = 420;

        var text6 = "最難的是翻過天花板地形";
        var x6 = 160;
        var y6 = 190;

        var text7 = "我練了3個月單槓才成功";
        var x7 = 160;
        var y7 = 170;

        var text8 = "這是條傳攀路線";
        var x8 = 260;
        var y8 = 190;

        var text9 = "每次都能設計不同爬法";
        var x9 = 260;
        var y9 = 170;

        billboard2.animTexture.text1 = {
            font: font,
            color: color,
            text: text1,
            x: x1,
            y: y1
        }    

        billboard2.animTexture.text2 = {
            font: font,
            color: color,
            text: text2,
            x: x2,
            y: y2
        }

        billboard2.animTexture.text3 = {
            font: font,
            color: color,
            text: text3,
            x: x3,
            y: y3
        }

        billboard2.animTexture.text4 = {
            font: font,
            color: color,
            text: text4,
            x: x4,
            y: y4
        }

        billboard2.animTexture.text5 = {
            font: font,
            color: color,
            text: text5,
            x: x5,
            y: y5
        }

        billboard2.animTexture.text6 = {
            font: font,
            color: color,
            text: text6,
            x: x6,
            y: y6
        }

        billboard2.animTexture.text7 = {
            font: font,
            color: color,
            text: text7,
            x: x7,
            y: y7
        }

        billboard2.animTexture.text8 = {
            font: font,
            color: color,
            text: text8,
            x: x8,
            y: y8
        }

        billboard2.animTexture.text9 = {
            font: font,
            color: color,
            text: text9,
            x: x9,
            y: y9
        }

        // var clearColor;
        // billboard2.animTexture.drawText(text1, x1, y1, font, color, clearColor, true, true);
        // billboard2.animTexture.hasAlpha = true;

        scenes[sceneIndex].billboards = [];
        scenes[sceneIndex].billboards.push(billboard2);

    });

    modelLoaded[1] = !modelLoaded[1];

    var sceneIndex = scenes.push(scene) - 1;
    scenes[sceneIndex].reRender = true;
    scenes[sceneIndex].camera = camera;
    scenes[sceneIndex].cameraPara2 = cameraPara2;
    scenes[sceneIndex].cameraPara3 = cameraPara3;
    scenes[sceneIndex].cameraPara4 = cameraPara4;
    scenes[sceneIndex].cameraPara5 = cameraPara5;

    scenes[sceneIndex].renderLoop = function () {
        this.render();
    }

    return scene;
}

function PCimportScene3(){
    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);

    //Adding an Arc Rotate Camera
    var camAlpha = -Math.PI / 2;
    var camBeta = Math.PI / 2;
    var camRadius = 6;

    var camera = new BABYLON.ArcRotateCamera("Camera1", camAlpha, camBeta, camRadius, new BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, false);
    camera.checkCollisions = true;
    // camera.upperAlphaLimit = 1.5;
    // camera.lowerAlphaLimit = -1.5;

    var cameraPara2 = {
        alpha: camAlpha,
        beta: camBeta,
        radius: camRadius * 0.5,
        hasChanged: false
    }

    var cameraPara3 = {
        alpha: camAlpha,
        beta: camBeta * 1.3,
        radius: camRadius * 0.3,
        hasChanged: false
    }

    // var camera = new BABYLON.ArcRotateCamera("Camera3", -Math.PI / 2, Math.PI / 2, 6, new BABYLON.Vector3.Zero(), scene);
    // camera.attachControl(canvas, false);
    // camera.checkCollisions = true;

    var light = new BABYLON.HemisphericLight("hemi3", new BABYLON.Vector3(0, 1, 0), scene);

    // var billboard1;

    // The first parameter can be used to specify which mesh to import. Here we import all meshes
    BABYLON.SceneLoader.ImportMesh("", "assets/backdoor/0922/", "backdoor.babylon", scene, function (newMeshes) {

        newMeshes[0].position = BABYLON.Vector3.Zero();
        // newMeshes[0].position = new BABYLON.Vector3(10, 1, 15);
        
        var wall = scene.getMeshByName("1");
        var ground = scene.getMeshByName("2");
        var board1 = scene.getMeshByName("billboard1");

        board1.isVisible = false;
        ground.isVisible = false;

        wall.position = new BABYLON.Vector3(10, 2, 15);

        var materialStone = new BABYLON.StandardMaterial("texture2", scene);
        materialStone.diffuseTexture = new BABYLON.Texture("assets/backdoor/backdoor.png", scene);
        materialStone.diffuseTexture.hasAlpha = true;
    
        // materialStone.diffuseTexture.vOffset = -0.05; //vertical offset 0f 10%
        materialStone.diffuseTexture.uOffset = -0.4;
    
        materialStone.diffuseTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
        materialStone.diffuseTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
    
        // materialStone.diffuseTexture.uAng = -Math.PI * 0.01;
        // materialStone.diffuseTexture.vAng = Math.PI * 1.1;
        materialStone.diffuseTexture.vAng = 3.555555;
        materialStone.diffuseTexture.wAng = Math.PI / 2;
    
        // materialStone.bumpTexture = new BABYLON.Texture("assets/NormalMap.jpg",scene);
    
        wall.material = materialStone;

        //用動畫來找參數
        // scene.beforeRender = function () {
        //     materialStone.diffuseTexture.wAng += .001;
        //     // outputplaneTexture.uOffset += .001;
    
        //     // console.log(materialStone.diffuseTexture.wAng);
        // };

        var boardTexture1 = new BABYLON.DynamicTexture("dynamic texture4", 512, scene, true);
        boardTexture1.hasAlpha = true; //必須要clearColor沒被定義
    
        var dynamicMaterial1 = new BABYLON.StandardMaterial('mat4', scene);
        dynamicMaterial1.diffuseTexture = boardTexture1;
        dynamicMaterial1.specularColor = new BABYLON.Color3(0, 0, 0);
        dynamicMaterial1.backFaceCulling = true;
    
        var billboard1 = BABYLON.Mesh.CreatePlane('board4', 10, scene);
        // billboard1.position = new BABYLON.Vector3(board1.position.x + 2.5, board1.position.y, board1.position.z);
        // billboard1.position = new BABYLON.Vector3(0.07737434613873993+2, 3.096316808221121-4, 2.2394179552192908);
        billboard1.position = new BABYLON.Vector3(wall.position.x-5, wall.position.y-2.5, wall.position.z-4);
        billboard1.material = dynamicMaterial1;
        // billboard1.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
        billboard1.isVisible = false;
        billboard1.animTexture = boardTexture1;

        // define the path to plot
        var vertices1 = [];
        var vertices2 = [];
        var vertices3 = [];

        vertices1.push({
            x: 250,
            y: 500
        });
        vertices1.push({
            x: 270,
            y: 290
        });
    
        vertices2.push({
            x: 270,
            y: 290
        });
        vertices2.push({
            x: 320,
            y: 100
        });

        vertices3.push({
            x: 320,
            y: 100
        });
        vertices3.push({
            x: 370,
            y: 0
        });

        // billboard1.animTexture.points1 = calcIntermediatepoints(vertices1, 20);
        // billboard1.animTexture.points2 = calcIntermediatepoints(vertices2, 20);
        // billboard1.animTexture.points3 = calcIntermediatepoints(vertices3, 20);

        billboard1.animTexture.points1 = vertices1;
        billboard1.animTexture.points2 = vertices2;
        billboard1.animTexture.points3 = vertices3;

        // billboard1.animTexture.points = vertices;
        billboard1.animTexture.ctxStyle1 = {
            lineCap: "round",
            lineWidth: "5",
            strokeStyle: "blue",
            draw: false
        }
    
        billboard1.animTexture.ctxStyle2 = {
            lineCap: "round",
            lineWidth: "5",
            strokeStyle: "red",
            draw: false
        }

        billboard1.animTexture.ctxStyle3 = {
            lineCap: "round",
            lineWidth: "3",
            strokeStyle: "blue",
            draw: false
        }

        //文字部分
        var font = "16px Microsoft JhengHei";
        var color = "yellow"

        var text1 = "最易墜落的凹槽段";
        var x1 = 140;
        var y1 = 200;

        var text2 = "大平面攀爬";
        var x2 = 190;
        var y2 = 80;

        var text3 = "需要力量與技巧";
        var x3 = 190;
        var y3 = 100;

        billboard1.animTexture.text1 = {
            font: font,
            color: color,
            text: text1,
            x: x1,
            y: y1
        }

        billboard1.animTexture.text2 = {
            font: font,
            color: color,
            text: text2,
            x: x2,
            y: y2
        }

        billboard1.animTexture.text3 = {
            font: font,
            color: color,
            text: text3,
            x: x3,
            y: y3
        }

        scenes[sceneIndex].billboards = [];
        scenes[sceneIndex].billboards.push(billboard1);

    });    
    
    modelLoaded[2] = !modelLoaded[2];    

    var sceneIndex = scenes.push(scene) - 1;
    scenes[sceneIndex].reRender = true;
    scenes[sceneIndex].camera = camera;
    scenes[sceneIndex].cameraPara2 = cameraPara2;
    scenes[sceneIndex].cameraPara3 = cameraPara3;

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
    
