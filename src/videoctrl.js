var mob = detectmob() ? true : false;

$(document).ready(function () {
    var scroll_now;
    var progress = [];
    var movie_progress = [null];
    var w = $(window).width();
    var h = $(window).height();
    var total_height = $("body").height() - h;
    var headTop = w >= 768 ? "6px" : "4px";
    var title = $("title").text();

//video controller
    function moviePlay(id) {

        $('.fa-spinner[data-target="' + id + '"]').css("opacity", 0);

        $("#movie-" + id).get(0).play();

        // console.log("play: movie-"+id);

        if (progress[id - 1] == null) {
            progress[id - 1] = setInterval(function () {
                var curTime = $("#movie-" + id).get(0).currentTime;
                var temp = curTime / $("#movie-" + id).get(0).duration * 100;
                if (temp > 0.6) {
                    $('.video-play[data-target="' + id + '"]').css("opacity", 0);
                }
                if (Math.floor(curTime / 5) > movie_progress) {
                    movie_progress = Math.floor(curTime / 5);
                }

                $("#progress-bar-" + id).css("width", temp + "%");
            }, 600);
        }
    }

    function moviePause(id) {
        $("#movie-" + id).get(0).pause();
        $('.video-play[data-target="' + id + '"]').css("opacity", 1);
        if (progress[id - 1]) {
            clearInterval(progress[id - 1]);
            progress[id - 1] = null;
        }
    }

    function movieReplay(id) {
        $("#movie-" + id).get(0).currentTime = 0;
        $("#movie-" + id).get(0).play();
        $(".progress-bar").css("width", 0);
        clearInterval(progress[id - 1]);
        progress[id - 1] = setInterval(function () {
            var temp = $("#movie-" + id).get(0).currentTime / $("#movie-" + id).get(0).duration * 100;
            $("#progress-bar-" + id).css("width", temp + "%");
        }, 600);
    }

    function movieVolume(id) {
        if ($("#movie-" + id).get(0).muted == true) {
            $("#movie-" + id).get(0).muted = false;
            $('.volume[data-target="' + id + '"]')
                .removeClass("fa-volume-off")
                .addClass("fa-volume-up");
            $('.volume-text[data-target="' + id + '"]').text("點按關聲音");
        } else {
            $("#movie-" + id).get(0).muted = true;
            $('.volume[data-target="' + id + '"]')
                .removeClass("fa-volume-up")
                .addClass("fa-volume-off");
            $('.volume-text[data-target="' + id + '"]').text("點按開聲音");
        }
    }

    //for video operation
    $('video').on('waiting', function () {
        var tar = $(this).data('target')
        $('.video-play[data-target="' + tar + '"]').css('opacity', 0)
        $('.fa-spinner[data-target="' + tar + '"]').css('opacity', 1)
        // console.log('wait' + $(this).data('target'))
    })

    $('video').on('canplay', function () {
        var tar = $(this).data('target')
        $('.fa-spinner[data-target="' + tar + '"]').css('opacity', 0)
        // console.log('canplay' + $(this).data('target'))
    })

    $('video').click(function () {

        if(!mob)    return;

        var tar = $(this).data('target')

        // if (tar === 1 && mob) {
        //   if ($(this).get(0).muted == true) {
        //     $(this).get(0).muted = false;
        //     $('.volume[data-target="' + tar + '"]')
        //       .removeClass("fa-volume-off")
        //       .addClass("fa-volume-up");

        //     $('.volume-text[data-target="' + tar + '"]').text("點按關聲音");
        //   } else {
        //     $(this).get(0).muted = true;
        //     $('.volume[data-target="' + tar + '"]')
        //       .addClass("fa-volume-off")
        //       .removeClass("fa-volume-up");

        //     $('.volume-text[data-target="' + tar + '"]').text("點按開聲音");
        //   }
        // } else {

          if ($(this).get(0).paused == true) {
            moviePlay(tar);
            if ($(this).get(0).muted == true) {
              $(this).get(0).muted = false;
              $('.volume[data-target="' + tar + '"]')
                .removeClass("fa-volume-off")
                .addClass("fa-volume-up");
              $('.volume-text[data-target="' + tar + '"]').text("點按關聲音");
            }
          } else {
            $(this)
              .get(0)
              .pause();
            moviePause(tar);
          }
        // }

        ga("send", {
            "hitType": "event",
            "eventCategory": "movie click",
            "eventAction": "click",
            "eventLabel": "[" + platform + "] [" + title + "] [movie " + tar + " click]"
        });
    });

    $('.replay').click(function () {
        var tar = $(this).data('target')
        movieReplay(tar)
        ga("send", {
            "hitType": "event",
            "eventCategory": "movie replay",
            "eventAction": "click",
            "eventLabel": "[" + platform + "] [" + title + "] [movie " + tar + " replay]"
        });
    })

    $('.volume').click(function () {
        var tar = $(this).data('target');
        movieVolume(tar);
        ga("send", {
            "hitType": "event",
            "eventCategory": "movie volume",
            "eventAction": "click",
            "eventLabel": "[" + platform + "] [" + title + "] [movie " + tar + " volume]"
        });
    });

    $('.volume-text').click(function () {
        var tar = $(this).data('target');
        movieVolume(tar);
        ga("send", {
            "hitType": "event",
            "eventCategory": "movie volume text",
            "eventAction": "click",
            "eventLabel": "[" + platform + "] [" + title + "] [movie " + tar + " volume text]"
        });
    });

    //行動版預設靜音
    if (mob) {
        $('video').prop('muted', 'true');
    } 

    $(window).on('scroll', function () {

        scroll_now = $(window).scrollTop();

        var movie1 = scroll_now - $("#movie-1").offset().top + h;
        var movie1_mob = scroll_now - $("#movie-10").offset().top + h;        
        var movie1_2 = scroll_now - $("#movie-9").offset().top + h;
        var movie1_1 = scroll_now - $("#movie-8").offset().top + h;
        var movie2 = scroll_now - $("#movie-2").offset().top + h;
        var movie3 = scroll_now - $("#movie-3").offset().top + h;
        var movie4 = scroll_now - $("#movie-4").offset().top + h;
        var movie5 = scroll_now - $("#movie-5").offset().top + h;
        var movie6 = scroll_now - $("#movie-6").offset().top + h;
        var movie7 = scroll_now - $("#movie-7").offset().top + h;


        if (movie1 > h / 3 && movie1 < h + 200) {
            if ($("#movie-1").get(0).paused == true) {
                moviePlay(1);
            }
        } else {
            if ($("#movie-1").get(0).paused == false) {
                moviePause(1);
            }
        }

        if (movie1_mob > h / 3 && movie1_mob < h + 200) {
          if ($("#movie-10").get(0).paused == true) {
            moviePlay(10);
          }
        } else {
          if ($("#movie-10").get(0).paused == false) {
            moviePause(10);
          }
        }

        if (movie1_2 > h / 3 && movie1_2 < h + 200) {
          if ($("#movie-9").get(0).paused == true) {
            moviePlay(9);
          }
        } else {
          if ($("#movie-9").get(0).paused == false) {
            moviePause(9);
          }
        }

        if (movie1_1 > h / 3 && movie1_1 < h + 200) {
          if ($("#movie-8").get(0).paused == true) {
            moviePlay(8);
          }
        } else {
          if ($("#movie-8").get(0).paused == false) {
            moviePause(8);
          }
        }

        if (movie2 > h / 3 && movie2 < h + 200) {

            if ($("#movie-2").get(0).paused == true) {
                moviePlay(2);
            }
        } else {
            if ($("#movie-2").get(0).paused == false) {
                moviePause(2);
            }
        }

        if (movie3 > h / 3 && movie3 < h + 200) {
            if ($("#movie-3").get(0).paused == true) {
                moviePlay(3);
            }
        } else {
            if ($("#movie-3").get(0).paused == false) {
                moviePause(3);
            }
        }

        if (movie4 > h / 3 && movie4 < h + 200) {
          if ($("#movie-4").get(0).paused == true) {
            moviePlay(4);
          }
        } else {
          if ($("#movie-4").get(0).paused == false) {
            moviePause(4);
          }
        }

        if (movie5 > h / 3 && movie5 < h + 200) {
          if ($("#movie-5").get(0).paused == true) {
            moviePlay(5);
          }
        } else {
          if ($("#movie-5").get(0).paused == false) {
            moviePause(5);
          }
        }

        if (movie6 > h / 3 && movie6 < h + 200) {
          if ($("#movie-6").get(0).paused == true) {
            moviePlay(6);
          }
        } else {
          if ($("#movie-6").get(0).paused == false) {
            moviePause(6);
          }
        }

        if (movie7 > h / 3 && movie7 < h + 200) {
          if ($("#movie-7").get(0).paused == true) {
            moviePlay(7);
          }
        } else {
          if ($("#movie-7").get(0).paused == false) {
            moviePause(7);
          }
        }


    });
});