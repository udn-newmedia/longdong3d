$(document).ready(function () {

    //nivoSlider
    $(window).on('load', function () {
        $('#slider').nivoSlider({
            effect: 'fade',
            pauseTime: 2000, 
            startSlide: 0, 
            manualAdvance: false,
        });
    }); 

});

