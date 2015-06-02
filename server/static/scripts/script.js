(function($) {
    'use strict';

    var $header = $('header');
    var $body = $('body');
    var $window = $(window);
    //var steps = [
    //    $('#step1'),
    //    $('#step2'),
    //    $('#step3'),
    //    $('#step4')
    //];

    var steps = $('article[id^="step"]');

    var stepLinks = $('ol.nav-steps > li > a');

    $('a[href^="#"]').on('click',function (e) {
        e.preventDefault();

        scrollToTarget(this.hash);
    });

    $(window).scroll(function(e) {

        handleHeaderClass();
        handleActiveClass(e);
    });


    /**
     * animates scroll to target section
     * @param target
     */
    function scrollToTarget (target) {
        var $target = $(target);

        $('html, body').stop().animate({
            'scrollTop': $target.offset().top
        }, 900, 'swing', function () {
            window.location.hash = target;
        });
    }

    /**
     * handles toggle of 'scrolled' class to header
     */
    function handleHeaderClass() {
        if ($body.scrollTop() > $window.height() && !$header.hasClass('scrolled')) {
            $header.addClass('scrolled');

        } else if ($body.scrollTop() < $window.height() && $header.hasClass('scrolled')) {
            $header.removeClass('scrolled');
        }
    }

    /**
     * handles 'active' class on navbar items
     * @param e
     */
    function handleActiveClass(e) {
        var scrollTop = $body.scrollTop();

        steps.each(function(index, step) {
            var $step = $(step).parent('li');
            $(stepLinks[index]).removeClass('active');
            

            if (scrollTop < $step.offset().top + $step.outerHeight() - 40 && scrollTop > $step.offset().top - 40) {
                $(stepLinks[index]).addClass('active');
            }
        });
    }



})(window.jQuery);