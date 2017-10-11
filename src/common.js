var w = window.innerWidth;

var scroll_now;
var read_progress = 10;
var isMob = detectmob();
var platform = isMob == true ? "Mob" : "PC";

function detectmob() { 
	 if( navigator.userAgent.match(/Android/i)
	 || navigator.userAgent.match(/webOS/i)
	 || navigator.userAgent.match(/iPhone/i)
	 || navigator.userAgent.match(/iPad/i)
	 || navigator.userAgent.match(/iPod/i)
	 || navigator.userAgent.match(/BlackBerry/i)
	 || navigator.userAgent.match(/Windows Phone/i)
	 ){
		return true;
	  }
	 else {
		return false;
	  }
}

function detectIE() {
  var ua = window.navigator.userAgent;

  // Test values; Uncomment to check result ��

  // IE 10
  // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

  // IE 11
  // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

  // Edge 12 (Spartan)
  // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

  // Edge 13
  // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

  var msie = ua.indexOf("MSIE ");
  if (msie > 0) {
    // IE 10 or older => return version number
    return parseInt(ua.substring(msie + 5, ua.indexOf(".", msie)), 10);
  }

  var trident = ua.indexOf("Trident/");
  if (trident > 0) {
    // IE 11 => return version number
    var rv = ua.indexOf("rv:");
    return parseInt(ua.substring(rv + 3, ua.indexOf(".", rv)), 10);
  }

  var edge = ua.indexOf("Edge/");
  if (edge > 0) {
    // Edge (IE 12+) => return version number
    return parseInt(ua.substring(edge + 5, ua.indexOf(".", edge)), 10);
  }

  // other browser
  return false;
}

function iOSversion() {
  if (/iP(hone|od|ad)/.test(navigator.userAgent)) {
    // supports iOS 2.0 and later: <http://bit.ly/TJjs1V>
    var v = navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);
    return [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
  }
}

function detectSafari(){

  var isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);

  return isSafari;
}

$(document).ready(function() {
  var h = $(window).height();
  var total_height = $("body").height() - h;
  var title = $("title").text();

  $("a").click(function() {
    ga("send", {
      hitType: "event",
      eventCategory: "超連結點擊",
      eventAction: "click",
      eventLabel:
        "[" + platform + "] [" + title + "] [" + $(this).attr("href") + "]"
    });
  });

  $("#scroll-down").click(function() {
    ga("send", {
      hitType: "event",
      eventCategory: "ham bar",
      eventAction: "click",
      eventLabel: "[" + platform + "] [" + title + "] [scroll down]"
    });
  });

  $(".line-share").click(function(e) {
    ga("send", {
      hitType: "event",
      eventCategory: "Line Share",
      eventAction: "click",
      eventLabel: "[" + platform + "] [" + title + "] [line share]"
    });
  });

  $("#menu>.fa").click(function() {
    ga("send", {
      hitType: "event",
      eventCategory: "ham open/close",
      eventAction: "click",
      eventLabel: "[" + platform + "] [" + title + "] [ham open/close]"
    });
  });

  $(".hbutton").click(function() {
    ga("send", {
      hitType: "event",
      eventCategory: "ham bar",
      eventAction: "click",
      eventLabel:
        "[" + platform + "] [" + title + "] [ham click" + $(this).text() + "]"
    });
  });

  $(".line-share").click(function(e) {
    ga("send", {
      hitType: "event",
      eventCategory: "Line Share",
      eventAction: "click",
      eventLabel: "[" + platform + "] [" + title + "] [line share]"
    });
  });

  // $(window).scroll(function() {
  //   scroll_now = $(window).scrollTop();

  //   var cur_scroll = scroll_now / total_height * 100;

  //   for (; read_progress <= Math.floor(cur_scroll); read_progress += 10) {
  //     // console.log(read_progress + "%");

  //     ga("send", {
  //       hitType: "event",
  //       eventCategory: "read",
  //       eventAction: "scroll",
  //       eventLabel:
  //         "[" +
  //         platform +
  //         "] [" +
  //         title +
  //         "] [page read " +
  //         read_progress +
  //         "%]"
  //     });
  //   }
  // });

  $(".line-share").click(function(e) {
    if (detectmob()) {
      //手機
      window.location.href = "//line.me/R/msg/text/?" + title + "%0D%0A%0D%0A" + $('meta[property="og:description"]').attr("content") + "%0D%0A%0D%0A" + window.location.href;
    } else {
      window.open("https://lineit.line.me/share/ui?url=" + window.location.href);
    }
  });
  
}); 

