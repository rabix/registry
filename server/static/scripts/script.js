(function($) {
    'use strict';

    var $header = $('header');
    var $body = $('body');
    var $document = $(document);
    var $window = $(window);
    var $loginBtn = $('.login-button');
    var $rightNav = $('.login-button-nav');

    $('a[href^="#"]').on('click',function (e) {
        e.preventDefault();

        scrollToTarget(this.hash);
    });

    $(window).scroll(function() {
        handleHeaderClass();
    });

    /**
     * initiates scrollspy
     */
    $body.scrollspy({target: '#navbar'});

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
        if ($document.scrollTop() > $window.height() && !$header.hasClass('scrolled')) {
            $header.addClass('scrolled');

        } else if ($document.scrollTop() < $window.height() && $header.hasClass('scrolled')) {
            $header.removeClass('scrolled');
        }
    }

    /**
     * handle login button
     */
    $.get('/api/user', function (data) {
        if (data && data.user) {
            $loginBtn.remove();
            var $gotoBtn = $('<a class="go-to-apps pull-right" href="/rbx">Go to Apps</a>');
            var $avatar = $('<img class="user-avatar"/>');

            $avatar.attr('src', data.user.avatar_url);
            $gotoBtn.prepend($avatar);

            $rightNav.find('li').append($gotoBtn);
        }
    }).fail(function () {
        $loginBtn.css('display', 'block');
    });

})(window.jQuery);