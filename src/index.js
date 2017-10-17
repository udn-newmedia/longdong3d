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
var model1PosterOffset = [];
var waypoints = [];
var liteVersion = false;
var safari = (detectSafari())?true:false;

var read_progress = 10;
var total_height;

var canvas;

// d3.select("#indicator").style('opacity',0);
// d3.select('#head').style('opacity',0);
// d3.select("#article").style('opacity',0);


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

if(window.innerWidth/window.innerHeight<16/9 && !mob){
   d3.select('#movie-1').style("object-fit",'contain');
}


//mobile版load 影片代替
if(window.matchMedia("(max-width: 1199px)").matches){

    //mobile 版影片 & poster
    var cover_video = document.getElementById("movie-10");
    // cover_video.style.display = "block";
    d3.select('#movie-10').style("display","block");
    cover_video.setAttribute("src", cover_video.getAttribute("data-src"));
    // cover_video.setAttribute("poster", "./assets/images/mobile.jpg");

    var cover_poster;

    //填入 mobile video src
    var mobvideos = document.getElementsByClassName('mobVideo');

    [].forEach.call(mobvideos, function(el){
        el.setAttribute("src", el.getAttribute("data-src"));
    });

    var mob_posters;

}else {

    var cover_video = document.getElementById("movie-1");
    d3.select("#movie-1").style("display", "block");

    cover_video.setAttribute('src', cover_video.getAttribute("data-src"));

    var mobvideos = document.getElementsByClassName("slider-pic");

    [].forEach.call(mobvideos, function(el) {
      el.setAttribute("src", el.getAttribute("data-src"));
    });

}


//以行動裝置與否區分讀取的是模型或影片
    if(mob){
        d3.select("#article").style("display", "block");

        // document.getElementById("movie-1").play();

        videoHandler();

        // MOBloadScene();

        // window.addEventListener('scroll', MOBonScroll);

    }else{
           //nivoSlider
           $(window).on("load", function() {
             $("#slider").nivoSlider({
               effect: "fade",
               pauseTime: 2000,
               startSlide: 0,
               pauseOnHover: false,
               manualAdvance: false
             });
           });


           var canvasNode = document.createElement("CANVAS");
           var canvas = document
             .getElementById("g-graphic")
             .appendChild(canvasNode);
           canvas.width = 1920;
           canvas.height = 989;

           var engine = new BABYLON.Engine(canvas, true);



           document.getElementById("hd").addEventListener("click", function(){

                liteVersion = false;

                d3.select("#startPage").style("display", "none");
                d3.select("#article").style("display","block");

                total_height = document.querySelector("#article").getBoundingClientRect().bottom;

                document.getElementById('movie-1').play();

                PCloadScene1();

            });


           document.getElementById("lite").addEventListener("click", function(){

                liteVersion = true;

                d3.select("#startPage").style("display", "none");
                d3.select("#article").style("display","block");

                total_height = document.querySelector("#article").getBoundingClientRect().bottom;

                d3.select(".lite").style("display","block");
                d3.selectAll(".normal-in-lite").classed("narrow-in-pc", false);
                d3.selectAll(".bg_before_model").style("display", "block");

                document.getElementById('movie-1').play();

                //填入 mobile video src
                var litevideos = document.getElementsByClassName("liteVideo");

                [].forEach.call(litevideos, function(el){
                    el.setAttribute("src", el.getAttribute("data-src"));
                });

            });


//lite版第一個模型用影片代替 (替換影片src)


            videoHandler();

           // scroll event
           window.addEventListener("scroll", function() {
             if (!ticking) {
               requestAnimationFrame(onScroll);
               ticking = true;
             }
           });

           // Resize
           window.addEventListener("resize", function() {
             engine.resize();
           });

           engine.runRenderLoop(function() {
             RenderManager();
           });
         }

function onScroll(){

    // GA
    var cur_scroll = scroll_now / total_height * 100;

    for (; read_progress <= Math.floor(cur_scroll); read_progress += 10) {

        if(read_progress <=100){
            // console.log(read_progress + "%");

            ga("send", {
            hitType: "event",
            eventCategory: "read",
            eventAction: "scroll",
            eventLabel:
                "[" +
                platform +
                "] [" +
                document.title +
                "] [page read " +
                read_progress +
                "%]"
            });
        }
    }


    setSectionOffset();

    SceneManager();

    ticking = false;
}

//決定何時要重繪(第一層是換模型判斷點、第二層是換視角判斷點)
function RenderManager(){

    if(!scenes[activeScene]) return;

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
    } else if (scroll_now >= changeModelPointsOffset[2] * 1.1 && scroll_now < changeModelPointsOffset[4] * 1.1){
        scenes[activeScene].reRender = true;                        
    } else if (scroll_now >= changeModelPointsOffset[4] * 1.1) {
        scenes[activeScene].reRender = false;
    }
    
    if (scenes[activeScene] && scenes[activeScene].reRender) {
        // console.log('render');
        scenes[activeScene].renderLoop();
    }
}

function SceneManager() {

    modelLoader();
    viewChanger();
    setCanvasOpacityWithSection();

    if(liteVersion){
        setModel1Poster();
    }
}

function setModel1Poster(){
    
    if (window.pageYOffset >= model1PosterOffset[0] && window.pageYOffset < changeModelPointsOffset[1]) {
      d3.select("#bg_before_model2").style("opacity", "1");
    } else if (window.pageYOffset >= model1PosterOffset[1] && window.pageYOffset < changeModelPointsOffset[2]){
      d3.select("#bg_before_model3").style("opacity", "1");
    } else {
      d3.selectAll(".bg_before_model").style("opacity", "0");
    }
}

//轉換視角 & billboards控制(包含在billboard上畫線)
function viewChanger(){

    if (!liteVersion && activeScene === 0 && scenes[activeScene]) {

        //開頭旋轉隱藏billboards
        if (scroll_now < stopRotatingPointOffset){

            d3.selectAll(".g-label").classed("hidden", true);

            displayBillboards(false);

        } else if (scroll_now >= changeViewWaypointsOffset[0] && scroll_now < changeViewWaypointsOffset[0] * 1.1) {

            d3.selectAll(".g-label").classed("hidden", true);

            //第一個模型，第一個視角

            // changeView(waypoints[0], function() {
            //     displayBillboards([true, true, false, false]);
            // });
        
            if (!scenes[activeScene].cameraPara2.hasChanged){
                scenes[activeScene].cameraPara2.hasChanged = true;

                smoothSetTarget(waypoints[0].target,

                    moveCameraByAdjustingParameters(scenes[activeScene].cameraPara2, function(){

                        setTimeout(function(){
                            displayBillboards([true, true, false, false]);

                        },2000);
                    })

                );
            }

        } else if (scroll_now >= changeViewWaypointsOffset[1] && scroll_now < changeViewWaypointsOffset[1] * 1.1) {

            d3.selectAll(".g-label").classed("hidden", true);

            //第一個模型，第二個視角
            changeView(waypoints[1], function() {

                scenes[activeScene].cameraPara2.hasChanged = false;

                displayBillboards([false, false, false, true]);

                d3.selectAll('.g-label.model1')
                    .each(function (d, i) {
                        if (i === 0) {
                            d3.select(this)
                                .classed("hidden", false)
                                .style('display', 'inline');
                        } else {
                            d3.select(this)
                                .classed("hidden", true);
                        }
                    }
                );


                setTimeout(function() {
                    //等待change view

                    var billboard = scenes[activeScene].billboards[3];
                    var points = billboard.animTexture.points;
                    var style = billboard.animTexture.ctxStyle;

                    disableScroll();

                    animateTexturePlay(billboard, style, points, function() {
                        animFrame = 1;
                        enableScroll();


                        zoom_in_effect(4, function(){

                                // scrollAnimation(changeModelPointsOffset[1], 1000);
                                // d3.selectAll(".g-label.model1").classed("hidden", true);
                            }
                        )

                    });
                }, 3000);

            });
        } else if (scroll_now >= changeViewWaypointsOffset[5] && scroll_now < changeModelPointsOffset[2]) {
            //回到model1

            // Hide all of labels of model2
            d3.selectAll(".g-label").classed("hidden", true);

            //waypoints放模型1的第三個視角
            if (!waypoints[2].hasChanged) {
                displayBillboards(false);
            }

            changeView(waypoints[2], function() {

                waypoints[1].hasChanged = false;

                setTimeout(function() {
                    //等待change view

                    var billboard = scenes[activeScene].billboards[2];
                    var points = billboard.animTexture.points;
                    var style = billboard.animTexture.ctxStyle;

                    displayBillboards([false, false, true, false]);

                    d3.selectAll('.g-label.model1')
                        .each(function (d, i) {
                            if (i === 1) {
                                d3.select(this)
                                    .classed("hidden", false)
                                    .style('display', 'inline');
                            } else {
                                d3.select(this)
                                    .classed("hidden", true);
                            }
                        }
                    );

                    disableScroll();

                    animateTexturePlay(billboard, style, points, function() {
                    animFrame = 1;
                    enableScroll();

                        zoom_in_effect(1,function(){
                                // scrollAnimation(changeModelPointsOffset[2], 1000);
                                // d3.selectAll(".g-label.model1, .g-label.model2").classed("hidden", true);
                            }
                        )
                    });
                }, 2000);
            });
        } else if (scroll_now >= changeModelPointsOffset[4]) {
            //最後再回到model1

            d3.selectAll(".g-label").classed("hidden", true);

            displayBillboards(false);

            changeView(waypoints[3], function() {
                waypoints[2].hasChanged = false;
            });
        }

    } else if(liteVersion && activeScene===0){

            d3.selectAll('.g-label').classed("hidden", true);

            if(d3.select("#g-graphic").style("opacity")==='1'){
                d3.select("#g-graphic").style("opacity",0);
            }
    }


    if(activeScene===1 && scenes[activeScene]){


        if (d3.select("#g-graphic").style("opacity") === '0') {
            d3.select("#g-graphic").style("opacity", 1);
        }


        if (scroll_now >= changeViewWaypointsOffset[2] && scroll_now < changeViewWaypointsOffset[3]) {
            //第二個模型，第一個視角
            
            if (scenes[activeScene].billboards[0]) {

                if (!scenes[activeScene].cameraPara2.hasChanged){

                    scenes[activeScene].cameraPara2.hasChanged = true;
                    
                    // Hide all of labels
                        d3.selectAll('.g-label')
                            .classed("hidden", true);

                    moveCameraByAdjustingParameters(scenes[activeScene].cameraPara2, function () {
                                        
                        displayBillboards([true,false,false,false]);

                        // route labels
                            d3.selectAll('.g-label.model2')
                                .each(function (d, i) {
                                    if (i === 0) {
                                        d3.select(this)
                                            .classed("hidden", false)
                                            .style('display', 'inline');
                                    } else {
                                        d3.select(this)
                                            .classed("hidden", true);
                                    }
                                }
                            );

                    });
                }
            }

        } else if (scroll_now >= changeViewWaypointsOffset[3] && scroll_now < changeViewWaypointsOffset[4]) {
            //第二個模型，第二個視角

            if (!scenes[activeScene].cameraPara3.hasChanged) {

                scenes[activeScene].cameraPara3.hasChanged = true;

                scenes[activeScene].cameraPara2.hasChanged = false;

                scenes[activeScene].light0.intensity = 0.2;

                displayBillboards(false);

                // Hide all of labels
                    d3.selectAll('.g-label')
                        .classed("hidden", true);

                moveCameraByAdjustingParameters(scenes[activeScene].cameraPara3, function () {

                    displayBillboards([false, true, false, false]);

                    d3.selectAll('.g-label.model2')
                        .each(function (d, i) {
                            if (i === 1) {
                                d3.select(this)
                                    .classed("hidden", false)
                                    .style('display', 'inline')
                                    // .style('left', 920.6750358885913 + 'px')
                                    // .style('top', 318.67419401656275 + 'px');

                            }else if(i===2){

                                d3.select(this)
                                    .classed("hidden", false)
                                    .style('display', 'inline')
                                    // .style('left', 964 + 'px')
                                    // .style('top', 208 + 'px');

                            } else {
                                d3.select(this)
                                    .classed("hidden", true);
                            }
                        }
                    );

                });

            }

        } else if (scroll_now >= changeViewWaypointsOffset[4] && scroll_now < changeViewWaypointsOffset[5]) {
            //第二個模型，第三個視角

            if (!scenes[activeScene].cameraPara4.hasChanged) {
                
                scenes[activeScene].cameraPara4.hasChanged = true;

                scenes[activeScene].cameraPara3.hasChanged = false;


                displayBillboards(false);

                // Hide all of labels
                d3.selectAll('.g-label')
                    .classed("hidden", true);

                moveCameraByAdjustingParameters(scenes[activeScene].cameraPara4, function () {

                    displayBillboards([false, false, true, false]);

                    d3.selectAll('.g-label.model2')
                        .each(function (d, i) {
                            if (i === 3) {
                                d3.select(this)
                                    .classed("hidden", false)
                                    .style('display', 'inline')
                                    // .style('left', 809.4389298448883 + 'px')
                                    // .style('top', 388.2740448861042 + 'px');

                            } else {
                                d3.select(this)
                                    .classed("hidden", true);
                            }
                        }
                    );

                });
            }

        } else if (scroll_now >= changeViewWaypointsOffset[5] && scroll_now < changeModelPointsOffset[3]) {
            //第二個模型，第四個視角        

            if (!scenes[activeScene].cameraPara5.hasChanged) {
                
                scenes[activeScene].cameraPara5.hasChanged = true;

                scenes[activeScene].cameraPara4.hasChanged = false;

                displayBillboards(false);

                // Hide all of labels
                d3.selectAll('.g-label')
                    .classed("hidden", true);

                moveCameraByAdjustingParameters(scenes[activeScene].cameraPara5, function () {
                    
                    displayBillboards([false, false, false, true]);

                    d3.selectAll('.g-label.model2')
                        .each(function (d, i) {
                            if (i === 4) {
                                d3.select(this)
                                    .classed("hidden", false)
                                    .style('display', 'inline')
                            } else {
                                d3.select(this)
                                    .classed("hidden", true);
                            }
                        }
                    );

                }); 
            }
        }

    } 
    
    if(activeScene===2 && scenes[activeScene]){
        
        if (d3.select("#g-graphic").style("opacity") === "0") {
          d3.select("#g-graphic").style("opacity", 1);
        }

        if (scroll_now >= changeModelPointsOffset[2] && scroll_now < changeModelPointsOffset[2] + 2/3 * window.innerHeight) {
            //第三個模型，第一個視角

            //定點觸發動畫

            if (scenes[activeScene].billboards[0]) {

                if (!scenes[activeScene].cameraPara2.hasChanged) {

                    scenes[activeScene].cameraPara2.hasChanged = true;

                    scenes[activeScene-1].cameraPara5.hasChanged = true;


                    d3.selectAll('.g-label').classed("hidden", true);
                    
                        moveCameraByAdjustingParameters(scenes[activeScene].cameraPara2, function(){

                            displayBillboards([true, false]);

                            // x: 1003.3493523006468, y: 359.99608925403777, z: 0.9123074554590

                            // d3.selectAll('.g-label').attr("class", "g-label model3")
                            d3.selectAll(".g-label.model3")
                                .each(function (d, i) {
                                    if (i === 0) {
                                        d3.select(this)
                                            .classed("hidden", false)
                                            .style('display', 'inline')
                                            // 原始投影
                                            // .style('left', 1003.3493523006468 + 'px')
                                            // .style('top', 359.99608925403777 + 'px');
                                            .style('left', 1031 + 'px')
                                            .style('top', 198 + 'px');

                                    } else {
                                        d3.select(this)
                                            .classed("hidden", true);
                                    }
                                }
                            );

                        });
                    
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

        } else if (scroll_now >= changeModelPointsOffset[2] + 2 / 3 * window.innerHeight && scroll_now < changeModelPointsOffset[4]){

            //第三個模型，第二個視角
            if (!scenes[activeScene].cameraPara3.hasChanged){

                scenes[activeScene].cameraPara3.hasChanged = true;

                scenes[activeScene].cameraPara2.hasChanged = false;

                d3.selectAll('.g-label')
                    .classed("hidden", true);
                    
                    //定點觸發動畫
                moveCameraByAdjustingParameters(scenes[activeScene].cameraPara3, function () {

                        displayBillboards([false, false]);

                        setTimeout(function(){
                            displayBillboards([false, true]);
                        },300)

                        d3.selectAll(".g-label.model3")
                            .each(function (d, i) {
                                if (i === 1) {
                                    d3.select(this)
                                        .classed("hidden", false)
                                        .style('display', 'inline')
                                        .style('left', 846 + 'px')
                                        .style('top', 379 + 'px');

                                } else {
                                    d3.select(this)
                                        .classed("hidden", true);
                                }
                            }
                        );
                });
            }
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
function videoHandler() {

  var movie1 = document.getElementsByTagName("video")[0];

  movies.push(movie1);

  if(mob){

        //開頭影片結束下拉
    movies[0].addEventListener("ended", function() {

      var articleStart = document.getElementById("first_paragraph");
      var startOffset = articleStart.getBoundingClientRect().top + window.pageYOffset;

      scrollAnimation(startOffset, 500);
    });


  } else {

    movies[0].addEventListener("play", function() {
      engine.stopRenderLoop();
    });

    movies[0].addEventListener("pause", function() {
      engine.runRenderLoop(function() {
        RenderManager();
      });
    });

    //開頭影片結束下拉
    movies[0].addEventListener("ended", function() {

      var modelStart = document.getElementById("model1");
      var startOffset = modelStart.getBoundingClientRect().top + window.pageYOffset;

      scrollAnimation(startOffset, 500);
    });

  }

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
        var model2_4 = document.getElementById("movie-5");
        var model3 = document.getElementById('model3');

        var backTolongdong = document.getElementById('backTolongdong');
        var backTolongdongFinall = document.getElementById('backTolongdongBeforeEnd');


        changeModelPointsOffset[0] = model1.getBoundingClientRect().top + window.pageYOffset;
        changeModelPointsOffset[1] = model2.getBoundingClientRect().top + window.pageYOffset;
        changeModelPointsOffset[2] = model3.getBoundingClientRect().top + window.pageYOffset;
        changeModelPointsOffset[3] = model2_4.getBoundingClientRect().top + window.pageYOffset;
        changeModelPointsOffset[4] = backTolongdongFinall.getBoundingClientRect().top + window.pageYOffset;

    //waypoints
        //model1 longdong
        var changeViewWaypoint1 = document.getElementsByTagName("section")[2];
        changeViewWaypointsOffset[0] = changeViewWaypoint1.getBoundingClientRect().top + window.pageYOffset;

        var changeViewWaypoint2 = document.getElementsByTagName("section")[5];
        changeViewWaypointsOffset[1] = changeViewWaypoint2.getBoundingClientRect().top + window.pageYOffset;        

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

        if(liteVersion){
            var model1_bg_for_model2 = document.getElementById("nivoPics");
            model1PosterOffset[0] = model1_bg_for_model2.getBoundingClientRect().top + window.pageYOffset;

            var model1_bg_for_model3 = document.getElementById("movie-5");
            model1PosterOffset[1] = model1_bg_for_model3.getBoundingClientRect().top + window.pageYOffset;
        }

}

function whichModel() {

    if (window.pageYOffset >= 0 && window.pageYOffset < changeModelPointsOffset[1]) {
        return 'model1';
    } else if (window.pageYOffset >= changeModelPointsOffset[1] && window.pageYOffset < changeModelPointsOffset[3]) {
        return 'model2';
    } else if (window.pageYOffset >= changeModelPointsOffset[3] && window.pageYOffset < changeModelPointsOffset[2]){
        return 'model1';
    } else if (window.pageYOffset >= changeModelPointsOffset[2] && window.pageYOffset < changeModelPointsOffset[4]) {
        return 'model3';
    } else if (window.pageYOffset >= changeModelPointsOffset[4]){
        return 'model1';
    }
}

var opacityZero = false;

function setCanvasOpacityWithSection() {

    var canvas_style = window.getComputedStyle(canvas),
        canvas_opacity = canvas_style.getPropertyValue('opacity');

    //自動轉場
    if(window.pageYOffset < changeModelPointsOffset[1] * 0.99){
        if(opacityZero){
            canvas.style.opacity = 1;
            opacityZero = false;
        }

    } else if (window.pageYOffset >= changeModelPointsOffset[1] * 0.99 && window.pageYOffset < changeModelPointsOffset[1]) {
      if (!opacityZero) {
        canvas.style.opacity = 0;
        opacityZero = true;
        //   console.log("1:" + opacityZero);
      }
    } else if (window.pageYOffset >= changeModelPointsOffset[1] && window.pageYOffset < changeModelPointsOffset[2] * 0.99) {
      if (opacityZero) {
        canvas.style.opacity = 1;
        opacityZero = false;
        //   console.log("2:"+ opacityZero);
      }
    } else if (window.pageYOffset >= changeModelPointsOffset[2] * 0.99 && window.pageYOffset < changeModelPointsOffset[2]) {
      if (!opacityZero) {

        canvas.style.opacity = 0;
        opacityZero = true;
        // console.log("3:" + opacityZero);
      }
    } else if (window.pageYOffset >= changeModelPointsOffset[2] && window.pageYOffset < changeModelPointsOffset[2] * 1.01) {
      if (opacityZero) {
        canvas.style.opacity = 1;
        opacityZero = false;
        // console.log("4:" + opacityZero);  
      }
    } else if(window.pageYOffset > changeModelPointsOffset[2] * 1.01){
        if (!opacityZero) {
            opacityZero = !opacityZero;
            // console.log("5:" + opacityZero);
        }
    }


    //搭配滾動轉場
    
    // //第一個換模型點的透明度轉換

    // if (window.pageYOffset >= changeModelPointsOffset[1] * 0.95 && window.pageYOffset < changeModelPointsOffset[1]) {

    //     canvas.style.opacity = 1 - ((window.pageYOffset - changeModelPointsOffset[1] * 0.95) / (changeModelPointsOffset[1] - changeModelPointsOffset[1] * 0.95));

    // } 
    
    // else if (window.pageYOffset >= changeModelPointsOffset[1] && window.pageYOffset < changeModelPointsOffset[1] * 1.05) {

    //     canvas.style.opacity = (window.pageYOffset - changeModelPointsOffset[1]) / (changeModelPointsOffset[1] * 1.05 - changeModelPointsOffset[1]);

    // } 
    
    // else if (window.pageYOffset >= changeModelPointsOffset[1] * 1.05){

    //     canvas.style.opacity = 1;

    // }

    // //第二個換模型點的透明度轉換
    // if (window.pageYOffset >= changeModelPointsOffset[2] * 0.95 && window.pageYOffset < changeModelPointsOffset[2]) {

    //     canvas.style.opacity = 1 - ((window.pageYOffset - changeModelPointsOffset[2] * 0.95) / (changeModelPointsOffset[2] - changeModelPointsOffset[2] * 0.95));

    // } 
    
    // else if (window.pageYOffset >= changeModelPointsOffset[2] && window.pageYOffset < changeModelPointsOffset[2] * 1.05) {

    //     canvas.style.opacity = (window.pageYOffset - changeModelPointsOffset[2]) / (changeModelPointsOffset[2] * 1.05 - changeModelPointsOffset[2]);

    // } 
    
    // else if (window.pageYOffset >= changeModelPointsOffset[2] * 1.05) {

    //     canvas.style.opacity = 1;

    // }

}

function dynamicallyChangeBillboardsTexture(billboard,src){
    
    var ctx = billboard.animTexture._context;
    var canvasSize = 512;
    var img = new Image();

    img.onload = function(){

        var pattern = ctx.createPattern(img, "no-repeat");
        ctx.rect(0, 0, canvasSize, canvasSize);
        ctx.fillStyle = pattern;
        ctx.fill();

        billboard.animTexture.update();
    }
    
    img.src = src;
}

function displayBillboards(display){

    var scene = scenes[activeScene];

    if(!scene.billboards) return;

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

        // disableScroll()
        
        var point = waypoint;
        var target = point.target;
        
        smoothSetTarget(target, moveCameraWithGhostCam(point,function(){
            scenes[activeScene].reRender = false;  

            // enableScroll(); 

            callback();            
            })
        );
    }

}

var smoothSetTarget = function (obj, onEndcallback) {

    var camera = scenes[activeScene].camera;
    
    var targetX = obj.x;
    var targetY = obj.y;
    var targetZ = obj.z;

    //easing function
    var ease = new BABYLON.CubicEase();
    ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

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

    // gcamera.setTarget(new BABYLON.Vector3(obj.target.x, obj.target.y, obj.target.z));
    gcamera.setPosition(obj);

    // console.log('gcamera position:'+gcamera.position);
    // console.log("gcamera target:" + gcamera.target);
    // console.log("before:"+camera.position);

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

    scene.beginAnimation(camera, 0, 100, false, 2, function(){
        
        // console.log('position:'+camera.position);
        // console.log("target:" + camera.target);

        callback();
    });
}

var moveCameraByAdjustingParameters = function(newPara, callback){

    // if(newPara.hasChanged) return

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
        value: camera.position
    }, {
        frame: 100,
        value: obj
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
    var type = "video/mp4"
    var src = "https://udn.com/upf/newmedia/2017_data/hk_handover_20/video/video1.mp4";
    var videoNode = document.createElement("VIDEO");

    var video = document.getElementById("g-graphic").appendChild(videoNode);
    var source = document.createElement('source');

    source.src = src;
    source.type = type;

    video.appendChild(source);
    video.play();
}

function PCloadScene1(){

    // BABYLON.SceneLoader.ShowLoadingScreen = false;
	var loadingScreen = new MyLoadingScreen("loading...");
    engine.loadingScreen = loadingScreen;
    engine.displayLoadingUI();

    BABYLON.SceneLoader.Load("./assets/longdong/", "north-3D-new-09-final_edited.babylon", engine, function (scene) {

        engine.hideLoadingUI();

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

        var light0 = new BABYLON.PointLight("Omni", new BABYLON.Vector3(0, 2, 0), scene);
        light0.parent = camera; //light follows camera
        light0.intensity = 0.4;


            d3.select("#btn").on("click", function() {
            console.log("alpha:"+camera.alpha, "beta:"+camera.beta, "radius:"+camera.radius);
            console.log("position:"+camera.position);
            console.log("target:"+camera.target);
            });

        // var cameraPara2 = {
        //     alpha: -0.035397155561961866,
        //     beta: 1.6039559893175195,
        //     radius: 4.918235945541222,
        //     hasChanged: false
        // }

        var cameraPara2 = {
            alpha: -0.009031159459383743,
            beta: 1.592733513946694,
            radius: 6.169104762458093,
            hasChanged: false
        }


        // A ghost camera 
        var gcamera = new BABYLON.ArcRotateCamera("gCamera", camAlpha, camBeta*1.2, camRadius, new BABYLON.Vector3(0, 2, 0), scene);
        // camera.attachControl(canvas, false);
        gcamera.checkCollisions = true;
        gcamera.upperAlphaLimit = 1.1;
        gcamera.lowerAlphaLimit = -1.1;

        // 加上waypoints & target

            // var waypoint1 = {
            //     x:4.356770584721195,
            //     y:2.4610283946563616,
            //     z:-4.449836653593455
            // }

            // var target1 = {
            //     x:-0.5556824951778252,
            //     y:2.624085553041055,
            //     z:-4.27587712696757
            // }

            var waypoint1 = {
                x:5.611686396736883,
                y:2.4887636016440884,
                z:-4.331577133215217
            }

            var target1 = {
                x:-0.5556824951778252,
                y:2.624085553041055,
                z:-4.27587712696757
            }


            // var waypoint2 = {
            //     x:3.6829458901717187,
            //     y:3.369587763632281,
            //     z:6.051473963140251
            // }

            // var target2 = {
            //     x:-0.968912836726127,
            //     y:1.1287283044234226,
            //     z:1.311103877323937
            // }

            var waypoint2 = {
                x:5.300019122080537,
                y:2.738131456593628,
                z:6.622483851753247
            }

            var target2 = {
                x:0.18728063710686293,
                y:1.867918001514161,
                z:0.8039345225502077
            }

            // var waypoint3 = {
            //     x: 8.456247766015208,
            //     y: 4.396386762879213,
            //     z: -0.33063065358427535
            // }

            // var target3 = {
            //     x: 0.5750734529079948,
            //     y: 2.696798018254207,
            //     z: -2.0802502363811968
            // }

            // backdoor
            var waypoint3 = {
            x: 4.6514856135871945,
            y: 2.855898773317164,
            z: -2.0574045911431735
            }

            var target3 = {
            x: 1.169940323284372,
            y: 2.1951216031633156,
            z: -3.4430793071505112
            }

            // 最後回到 model1
            var waypoint4 = {
                x: 6.878846228549867,
                y: 5.624442667001714,
                z: 2.785135595239103
            }

            var target4 = {
                x: 0,
                y: 2,
                z: 0
            }

        // billboards
        
        //billboard1
            var boardTexture = new BABYLON.DynamicTexture("dynamic texture", 512, scene, true);

            var dynamicMaterial = new BABYLON.StandardMaterial('mat', scene);
            
            // dynamicMaterial.diffuseTexture = boardTexture;
            dynamicMaterial.opacityTexture = boardTexture;

            dynamicMaterial.specularColor = new BABYLON.Color3(0,0,0);
            dynamicMaterial.backFaceCulling = true;

            var plane1 = scene.getMeshByName("plane1");
            plane1.isVisible = false;
            var billboard1 = BABYLON.Mesh.CreatePlane('board1', 1.2, scene);
            billboard1.position = plane1.position;
            billboard1.material = dynamicMaterial;
            billboard1.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

        // var clearColor = "#555555";
            var font = "bold 50px Microsoft JhengHei";
            var color = "white"
            var shadowColor = "black";
            var shadowOffsetX = 1;
            var shadowOffsetY = 1;
            var shadowBlur = 3;

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
            context.shadowColor = shadowColor;
            context.shadowOffsetX = shadowOffsetX;
            context.shadowOffsetY = shadowOffsetY;
            context.shadowBlur = shadowBlur;
            context.fillText(text1, x, y1);
            // context.fillText(text2, x, y2);
            
            //draw line
            context.beginPath();
            context.moveTo(150, 100);
            context.lineTo(150, 440);
            context.lineWidth = 5;
            context.strokeStyle = '#ffffff';
            context.stroke();

            //draw circles
            context.fillStyle = "rgba(255, 255, 255, 0.2)";
            context.beginPath();
            context.arc(150, 440, 40, 0, Math.PI * 2,true);
            context.closePath();
            context.fill();
            
            context.fillStyle = "#ffffff";
            context.beginPath();
            context.arc(150, 440, 20, 0, Math.PI * 2,true);
            context.closePath();
            context.fill();
            

            boardTexture.hasAlpha = true;//必須要clearColor沒被定義
            boardTexture.update();

            billboard1.isVisible = false;

        // billboard2
            var boardTexture2 = new BABYLON.DynamicTexture("dynamic texture2", 512, scene, true);

            var dynamicMaterial2 = new BABYLON.StandardMaterial('mat2', scene);
            // dynamicMaterial2.diffuseTexture = boardTexture2;
            dynamicMaterial2.opacityTexture = boardTexture2;

            dynamicMaterial2.specularColor = new BABYLON.Color3(0, 0, 0);
            dynamicMaterial2.backFaceCulling = true;

            var plane2 = scene.getMeshByName("plane2");
            plane2.isVisible = false;
            var billboard2 = BABYLON.Mesh.CreatePlane('board2', 1.2, scene);
            billboard2.position = plane2.position;
            billboard2.material = dynamicMaterial2;
            billboard2.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

            // var clearColor = "#555555";
            // var font = "bold 40px Microsoft JhengHei";
            // var color = "yellow"

            var text3 = "造山運動形成";
            // var x = 10;
            // var y1 = 10 + 70;

            var text4 = "地層傾斜、節理與斷層";
            // var y2 = 10 + 70 + 70;

            var context2 = boardTexture2._context;
            var size2 = boardTexture2.getSize();

            // if(clearColor){
            //     context.fillStyle = clearColor;
            //     context.fillRect(0,0,size.width,size.height);
            // }

            context2.font = font;
            context2.fillStyle = color;
            context2.shadowColor = shadowColor;
            context2.shadowOffsetX = shadowOffsetX;
            context2.shadowOffsetY = shadowOffsetY;
            context2.shadowBlur = shadowBlur;
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


            // billboard3.animTexture.points = calcIntermediatepoints(vertices,20);
            // billboard3.animTexture.points = vertices;
            billboard3.animTexture.ctxStyle = {
                lineCap: "round",
                lineWidth: "20",
                strokeStyle: "#ffde2a",
                setLineDash: [10, 40]
            }


        // billboard4 (畫框框)

        var boardTexture4 = new BABYLON.DynamicTexture("dynamic texture4", 512, scene, true);
        boardTexture4.hasAlpha = true;//必須要clearColor沒被定義

        var dynamicMaterial4 = new BABYLON.StandardMaterial('mat4', scene);
        dynamicMaterial4.diffuseTexture = boardTexture4;
        dynamicMaterial4.specularColor = new BABYLON.Color3(0, 0, 0);
        dynamicMaterial4.backFaceCulling = true;

        var plane4 = scene.getMeshByName("plane4");
        plane4.isVisible = false;

        var billboard4 = BABYLON.Mesh.CreatePlane('board4', 1, scene);
        billboard4.position = plane4.position;
        billboard4.material = dynamicMaterial4;
        billboard4.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
        billboard4.isVisible = false;
        billboard4.animTexture = boardTexture4;

        // billboard4.animTexture.points = calcIntermediatepoints(vertices, 20);
        billboard4.animTexture.ctxStyle = {
            lineCap: "round",
            lineWidth: "20",
            strokeStyle: "#ffde2a",
            setLineDash: [10, 40]
        }

        // 設定waypoints和targets
        var wp1index = waypoints.push(waypoint1)-1;
        waypoints[wp1index].hasChanged = false;
        waypoints[wp1index].target = target1;

        var wp2index = waypoints.push(waypoint2) - 1;
        waypoints[wp2index].hasChanged = false;
        waypoints[wp2index].target = target2;

        var wp3index = waypoints.push(waypoint3) - 1;
        waypoints[wp3index].hasChanged = false;
        waypoints[wp3index].target = target3;

        var wp4index = waypoints.push(waypoint4) - 1;
        waypoints[wp4index].hasChanged = false;
        waypoints[wp4index].target = target3;


        //  封面的旋轉
        var stopRotating = false;
        var reachedUpperLimit = false;

        scene.registerBeforeRender(function(){

            // 封面的旋轉
            if(safari){
                stopRotating = true;
            }
            else if(stopRotatingPointOffset){
                stopRotating = (scroll_now <= stopRotatingPointOffset)?false:true;
            }

            // stopRotating = true;


            if (scenes[sceneIndex].reRender && !stopRotating){

                if(!reachedUpperLimit){
    
                    if (scene.activeCamera.alpha < camera.upperAlphaLimit){
                        scene.activeCamera.alpha += .005;
                        scene.gcamera.alpha = scene.activeCamera.alpha;
                    } else{
                        reachedUpperLimit = !reachedUpperLimit;
                    }
    
                }else{
    
                    if (scene.activeCamera.alpha > camera.lowerAlphaLimit) {
                        scene.activeCamera.alpha -= .005;
                        scene.gcamera.alpha = scene.activeCamera.alpha;
                    } else {
                        reachedUpperLimit = !reachedUpperLimit;
                    }
    
                }
            }
        })

        // var sceneIndex = scenes.push(scene) - 1;
        var sceneIndex = 0;
        scenes[sceneIndex] = scene;
        scenes[sceneIndex].reRender = true; 
        scenes[sceneIndex].camera = camera;
        scenes[sceneIndex].gcamera = gcamera;
        scenes[sceneIndex].cameraPara2 = cameraPara2;


        scenes[sceneIndex].billboards = [];
        scenes[sceneIndex].billboards.push(billboard1);
        scenes[sceneIndex].billboards.push(billboard2);        
        scenes[sceneIndex].billboards.push(billboard3);
        scenes[sceneIndex].billboards.push(billboard4);

        scenes[sceneIndex].renderLoop = function () {
            
            // setting labels
            var board3 = vectorProject(scenes[0].billboards[2].position);
            var board4 = vectorProject(scenes[0].billboards[3].position);


            d3.selectAll(".g-label.model1.board3")
                .each(function(d,i){
                    d3.select(this)
                        .style('left', board3.x+'px')
                        .style('top', board3.y+'px');
                });


            d3.selectAll('.g-label.model1.board4')
                .each(function(d,i){
                    d3.select(this)
                        .style('left', board4.x+'px')
                        .style('top', board4.y+'px');
                });


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

function animateTexturePlay(billboard, style, points, callback, start) {
    //用來畫線的animate texture

    var ctx = billboard.animTexture._context;

    var canvasSize = 512;
    var centerX = canvasSize/2;
    var centerY = canvasSize/2;
    var radius = canvasSize * 0.4;

    var timePerCircle = 100; //畫圓的時間
    var progress = start || 0;
    var drawSpeed = 15; // 15微秒畫一次

    ctx.lineCap = style.lineCap;
    ctx.lineWidth = style.lineWidth;
    ctx.strokeStyle = style.strokeStyle;
    ctx.setLineDash(style.setLineDash);

    // draw a circle
        var circle = progress / timePerCircle;

        if(circle<1){ 
            setTimeout(function () {
                progress+=drawSpeed;
                animateTexturePlay(billboard, style, points, callback, progress);
            },drawSpeed);
        }else{
            callback();
        }

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2 * Math.min(circle, 1));
        // ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();

    // draw a line
        // // draw a line segment from the last waypoint
        // // to the current waypoint

        // if (animFrame < points.length) {

        //     setTimeout(function(){
        //         animateTexturePlay(billboard, style, points, callback);
        //         animFrame++;
        //     },15)
            
        // } else {
        //     callback();
        // }

        // ctx.beginPath();
        // ctx.moveTo(points[animFrame - 1].x, points[animFrame - 1].y);
        // ctx.lineTo(points[animFrame].x, points[animFrame].y);
        // ctx.stroke();

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

function PCimportScene2(){
    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);

    var camAlpha = 0.2;
    var camBeta = Math.PI / 2;
    var camRadius = 20;

    var camera = new BABYLON.ArcRotateCamera("Camera2", camAlpha, camBeta, camRadius, new BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, false);
    camera.checkCollisions = true;

    var light0 = new BABYLON.PointLight("Omni", new BABYLON.Vector3.Zero(), scene);
    light0.parent = camera; //light follows camera
    light0.intensity = 0.4;
    scene.light0 = light0;

    var cameraPara2 = {
        alpha: camAlpha * 5.5,
        beta: camBeta * 1.2,
        radius: camRadius * 0.7,
        hasChanged: false
    }

    var cameraPara3 = {
        alpha: camAlpha * 3,
        // beta: camBeta * 0.9,
        beta: camBeta * 0.85,
        // radius: camRadius * 0.7,
        radius: camRadius * 0.8,
        hasChanged: false
    }

    var cameraPara4 = {
        alpha: camAlpha * 5.5,
        beta: camBeta * 1.2,
        radius: camRadius * 0.7,
        hasChanged: false
    }

    var cameraPara5 = {
        alpha: camAlpha * 3,
        beta: camBeta * 0.825,
        radius: camRadius * 0.79,
        hasChanged: false
    }    


    var light = new BABYLON.HemisphericLight("hemi2", new BABYLON.Vector3(0, 1, 0), scene);

    // The first parameter can be used to specify which mesh to import. Here we import all meshes
    BABYLON.SceneLoader.ImportMesh("", "./assets/golden-stone/new/", "golden-stone.babylon", scene, function (newMeshes) {

        newMeshes[0].position = new BABYLON.Vector3(5, -6, 7);
        newMeshes[0].rotation = new BABYLON.Vector3(-Math.PI/2*1.1, Math.PI/2, Math.PI);

    //billboards
        // for route1
        // var billboard1 = BABYLON.Mesh.CreatePlane('board5', 1.8, scene);
        var billboard1 = BABYLON.Mesh.CreatePlane("board5", 1.3, scene);

        billboard1.position = new BABYLON.Vector3(newMeshes[0].position.x - 2.5, newMeshes[0].position.y + 2.3, newMeshes[0].position.z + 1.5);

        var route1 = new BABYLON.StandardMaterial("route1", scene);
        route1.diffuseTexture = new BABYLON.Texture("./assets/golden-stone/golden-stone-route1.png", scene);
        route1.diffuseTexture.hasAlpha = true;
        route1.useAlphaFromDiffuseTexture = true;

        billboard1.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
        billboard1.isVisible = false;
        billboard1.material = route1;

        //如果需要淡入淡出->使用dynamicMaterial
        // billboard1.material = dynamicMaterial1;
        // billboard1.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
        // billboard1.isVisible = true;
        // billboard1.animTexture = boardTexture1;

        // for route2
        var billboard2 = BABYLON.Mesh.CreatePlane('board6', 3, scene);

        // billboard2.position = new BABYLON.Vector3(newMeshes[0].position.x - 2.5, newMeshes[0].position.y + 7, newMeshes[0].position.z - 0.2);
        billboard2.position = new BABYLON.Vector3(newMeshes[0].position.x - 2.5, newMeshes[0].position.y + 6.3, newMeshes[0].position.z - 0.2);


        var route2 = new BABYLON.StandardMaterial("route2", scene);
        route2.diffuseTexture = new BABYLON.Texture("./assets/golden-stone/golden-stone-route2.png", scene);
        route2.diffuseTexture.hasAlpha = true;
        route2.useAlphaFromDiffuseTexture = true;

        billboard2.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
        billboard2.isVisible = false;
        billboard2.material = route2;

        // for route3
        // var billboard3 = BABYLON.Mesh.CreatePlane('board7', 1.6, scene);
        var billboard3 = BABYLON.Mesh.CreatePlane("board7", 1.3, scene);

        // billboard3.position = new BABYLON.Vector3(newMeshes[0].position.x + 4, newMeshes[0].position.y - 2, newMeshes[0].position.z + 2.6);
        billboard3.position = new BABYLON.Vector3(newMeshes[0].position.x - 2.5, newMeshes[0].position.y + 2.5, newMeshes[0].position.z + 2.6);


        var route3 = new BABYLON.StandardMaterial("route3", scene);
        route3.diffuseTexture = new BABYLON.Texture("./assets/golden-stone/golden-stone-route3.png", scene);
        route3.diffuseTexture.hasAlpha = true;
        route3.useAlphaFromDiffuseTexture = true;

        billboard3.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
        billboard3.isVisible = false;
        billboard3.material = route3;

        // for route4
        // var billboard4 = BABYLON.Mesh.CreatePlane('board8', 5.5, scene);
        var billboard4 = BABYLON.Mesh.CreatePlane("board8", 4, scene);

        billboard4.position = new BABYLON.Vector3(newMeshes[0].position.x - 1, newMeshes[0].position.y + 6.4, newMeshes[0].position.z + 1);

        var route4 = new BABYLON.StandardMaterial("route4", scene);
        route4.diffuseTexture = new BABYLON.Texture("./assets/golden-stone/golden-stone-route4.png", scene);
        route4.diffuseTexture.hasAlpha = true;
        route4.useAlphaFromDiffuseTexture = true;

        billboard4.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
        billboard4.isVisible = false;
        billboard4.material = route4;

        scenes[sceneIndex].billboards = [];
        scenes[sceneIndex].billboards.push(billboard1);
        scenes[sceneIndex].billboards.push(billboard2);
        scenes[sceneIndex].billboards.push(billboard3);
        scenes[sceneIndex].billboards.push(billboard4);

    });

    modelLoaded[1] = !modelLoaded[1];

    // var sceneIndex = scenes.push(scene) - 1;
    var sceneIndex = 1;
    scenes[sceneIndex] = scene;
    scenes[sceneIndex].reRender = true;
    scenes[sceneIndex].camera = camera;
    scenes[sceneIndex].cameraPara2 = cameraPara2;
    scenes[sceneIndex].cameraPara3 = cameraPara3;
    scenes[sceneIndex].cameraPara4 = cameraPara4;
    scenes[sceneIndex].cameraPara5 = cameraPara5;

    scenes[sceneIndex].renderLoop = function () {

        // setting labels
        var board1 = vectorProject(scenes[1].billboards[0].position);
        var board2 = vectorProject(scenes[1].billboards[1].position);
        var board3 = vectorProject(scenes[1].billboards[2].position);
        var board4 = vectorProject(scenes[1].billboards[3].position);


        d3.selectAll('.g-label.model2.board1')
            .each(function(d,i){
                d3.select(this)
                    .style('left', board1.x+'px')
                    .style('top', board1.y+'px');
            });


        d3.selectAll('.g-label.model2.board2')
            .each(function(d,i){

                if(i===0){
                    d3.select(this)
                        .style('left', board2.x+'px')
                        .style('top', board2.y+'px');
                }else if(i===1){
                    d3.select(this)
                        .style('left', board2.x*1.03 +'px')
                        .style('top', board2.y*0.8+'px');                    
                }
            });

        d3.selectAll('.g-label.model2.board3')
            .each(function(d,i){

                d3.select(this)
                    .style('left', board3.x*0.8+'px')
                    .style('top', board3.y+'px');

            });

        d3.selectAll('.g-label.model2.board4')
            .each(function(d,i){
                d3.select(this)
                    .style('left', board4.x*0.85+'px')
                    .style('top', board4.y+'px');
            });

        this.render();
    }

    return scene;
}

function PCimportScene3(){

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

    // var light0 = new BABYLON.PointLight("Omni", new BABYLON.Vector3.Zero(), scene);
    // light0.parent = camera; //light follows camera
    // light0.intensity = 0.4;
    // scene.light0 = light0;

    // var cameraPara2 = {
    //     alpha: camAlpha,
    //     beta: camBeta * 0.95,
    //     radius: camRadius * 0.05,
    //     hasChanged: false
    // }

    var cameraPara2 = {
        alpha: camAlpha,
        beta: camBeta * 0.95,
        radius: camRadius * 0.6,
        hasChanged: false
    }

    // var cameraPara3 = {
    //     alpha: camAlpha * 1.1,
    //     // beta: camBeta * 1.3,
    //     beta: camBeta * 1.25,
    //     // radius: camRadius * 0.3,
    //     radius: camRadius * 0.00001,
    //     hasChanged: false
    // }

    var cameraPara3 = {
        alpha: camAlpha * 1.1,
        beta: camBeta * 1.25,
        radius: camRadius * 0.3,
        hasChanged: false
    }

    // var light = new BABYLON.HemisphericLight("hemi3", new BABYLON.Vector3(0, 1, 0), scene);

    var light = new BABYLON.HemisphericLight("hemi3", new BABYLON.Vector3(0, 0.5, -0.5), scene);

    // The first parameter can be used to specify which mesh to import. Here we import all meshes
    BABYLON.SceneLoader.ImportMesh("1", "./assets/backdoor/new/", "backdoor.babylon", scene, function (newMeshes) {

        newMeshes[0].position = BABYLON.Vector3.Zero();
        
        var wall = scene.getMeshByName("1");

        // wall.position = new BABYLON.Vector3(10, 2, 15);
        wall.position = new BABYLON.Vector3(3, -7.5, -3);

    //billboards
        // for route1
        // var billboard1 = BABYLON.Mesh.CreatePlane('board9', 7.5, scene);
        var billboard1 = BABYLON.Mesh.CreatePlane("board9", 4.5, scene);

        billboard1.position = new BABYLON.Vector3(wall.position.x - 0.5, wall.position.y + 5.5, wall.position.z + 9);

        var route1 = new BABYLON.StandardMaterial("route5", scene);
        route1.diffuseTexture = new BABYLON.Texture("./assets/backdoor/backdoor-route1.png", scene);
        route1.diffuseTexture.hasAlpha = true;
        route1.useAlphaFromDiffuseTexture = true;

        billboard1.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
        billboard1.isVisible = false;
        billboard1.material = route1;

        // for route2
        // var billboard2 = BABYLON.Mesh.CreatePlane("board10", 4.5, scene);
        var billboard2 = BABYLON.Mesh.CreatePlane("board10", 4, scene);
        
        // billboard2.position = new BABYLON.Vector3(wall.position.x +0.5 , wall.position.y + 8.5, wall.position.z+10);
        // billboard2.position = new BABYLON.Vector3(wall.position.x - 0.5, wall.position.y + 8.5, wall.position.z + 10);
        billboard2.position = new BABYLON.Vector3(wall.position.x, wall.position.y + 8.7, wall.position.z + 10);


        var route2 = new BABYLON.StandardMaterial("route11", scene);
        route2.diffuseTexture = new BABYLON.Texture("./assets/backdoor/backdoor-route2.png", scene);
        route2.diffuseTexture.hasAlpha = true;
        route2.useAlphaFromDiffuseTexture = true;

        billboard2.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
        billboard2.isVisible = false;
        billboard2.material = route2;


        billboard2.labels = [];
        billboard2.labels.push(billboard2.position); //route1

        scenes[sceneIndex].billboards = [];
        scenes[sceneIndex].billboards.push(billboard1);
        scenes[sceneIndex].billboards.push(billboard2);
    });    
    
    modelLoaded[2] = !modelLoaded[2];    

    // var sceneIndex = scenes.push(scene) - 1;
    var sceneIndex = 2;
    scenes[sceneIndex] = scene;
    scenes[sceneIndex].reRender = true;
    scenes[sceneIndex].camera = camera;
    scenes[sceneIndex].cameraPara2 = cameraPara2;
    scenes[sceneIndex].cameraPara3 = cameraPara3;

    scenes[sceneIndex].renderLoop = function () {

    // setting labels
        var board1 = vectorProject(scenes[2].billboards[0].position);
        var board2 = vectorProject(scenes[2].billboards[1].position);

        d3.selectAll('.g-label.model3.board1')
            .each(function(d,i){
                d3.select(this)
                    .style('left', board1.x+'px')
                    .style('top', board1.y+'px');
            });


        d3.selectAll('.g-label.model3.board2')
            .each(function(d,i){
                d3.select(this)
                    .style('left', board2.x * 0.9+'px')
                    .style('top', board2.y+'px');
            });



        this.render();
    }    
    
    return scene;
}

function zoom_in_effect(variation, callback){
    var zoominAnimation = new BABYLON.Animation("zoomIn", "radius", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

    var camera = scenes[activeScene].activeCamera;

    var keys1 = [{
        frame: 0,
        value: camera.radius
    }, {
        frame: 100,
        value: camera.radius-variation
    }];

    zoominAnimation.setKeys(keys1);

    // Empty the animation array
    camera.animations.splice(0, camera.animations.length);

    camera.animations.push(zoominAnimation);
    scenes[activeScene].beginAnimation(camera, 0, 100, false, 1, callback);
}

function zoom_out_effect(callback){
    var zoomoutAnimation = new BABYLON.Animation("zoomIn", "radius", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

    var keys2 = [{
        frame: 0,
        value: camera.radius
    }, {
        frame: 100,
        value: camera.radius + 5
    }];

    zoomoutAnimation.setKeys(keys2);

    // Empty the animation array
    camera.animations.splice(0, camera.animations.length);

    camera.animations.push(zoomoutAnimation);                
    scene.beginAnimation(camera, 0, 100, false, 1, callback);
}


function MyLoadingScreen(text) {
  //init the loader
  this.loadingUIText = text;
}

MyLoadingScreen.prototype.displayLoadingUI = function() {
    //   alert(this.loadingUIText);
    d3.select("#waiting").style("display","block");
};

MyLoadingScreen.prototype.hideLoadingUI = function() {
    //   alert("Loaded!");
    d3.select("#waiting").style("display", "none");
};



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

    /*1. unproject vector : 2d->3d*/

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
        var scene = scenes[activeScene]; 
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

    
    
    /* 2. unproject vector : 3d->2d */
    
    function vectorProject(vector) {
        // var vector = vector || new BABYLON.Vector3(0, 0, 0);
        var scene = scenes[activeScene];
        var camera = scene.activeCamera;
        
        var renderWidth = engine.getRenderWidth(true) * engine.getHardwareScalingLevel();
        var renderHeight = engine.getRenderHeight(true) * engine.getHardwareScalingLevel();

        var p = BABYLON.Vector3.Project(vector,
            BABYLON.Matrix.Identity(),
            scene.getTransformMatrix(),
            camera.viewport.toGlobal(renderWidth, renderHeight));
            
        // console.log(p);

        return {x:p.x,y:p.y};
    }
        
    // canvas.addEventListener("pointerdown", vectorProject, false);