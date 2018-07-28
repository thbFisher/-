//Touch events are from zepto/touch.js
(function($) {
    var touch = {},
    touchTimeout;

    function parentIfText(node) {
        return 'tagName' in node ? node: node.parentNode;
    }

    function swipeDirection(x1, x2, y1, y2) {
        var xDelta = Math.abs(x1 - x2),
        yDelta = Math.abs(y1 - y2);
        if (xDelta >= yDelta) {
            return (x1 - x2 > 0 ? 'Left': 'Right');
        } else {
            return (y1 - y2 > 0 ? 'Up': 'Down');
        }
    }

    var longTapDelay = 750;
    function longTap() {
        if (touch.last && (Date.now() - touch.last >= longTapDelay)) {
            touch.el.trigger('longTap');
            touch = {};
        }
    }
    $(document).ready(function() {
        $(document.body).bind('touchstart', function(e) {
            e = e.originalEvent; 
            var now = Date.now(),
            delta = now - (touch.last || now);
            touch.el = $(parentIfText(e.touches[0].target));
            touchTimeout && clearTimeout(touchTimeout);
            touch.x1 = e.touches[0].pageX;
            touch.y1 = e.touches[0].pageY;
            if (delta > 0 && delta <= 250) touch.isDoubleTap = true;
            touch.last = now;
            setTimeout(longTap, longTapDelay);
        }).bind('touchmove', function(e) {
            e = e.originalEvent; 
            touch.x2 = e.touches[0].pageX;
            touch.y2 = e.touches[0].pageY;
        }).bind('touchend', function(e) {
            e = e.originalEvent; 
            if (!touch.el) {
                touch = {};
                return;
            }
            if (touch.isDoubleTap) {
                touch.el.trigger('doubleTap');
                touch = {};
            } else if (Math.abs(touch.x1 - touch.x2) > 5 || Math.abs(touch.y1 - touch.y2) > 5) { (Math.abs(touch.x1 - touch.x2) > 30 || Math.abs(touch.y1 - touch.y2) > 30) && touch.el.trigger('swipe') && touch.el.trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)));
            touch.x1 = touch.x2 = touch.y1 = touch.y2 = touch.last = 0;
            touch = {};
            } else if ('last' in touch) {
                touch.el.trigger('tap');
                touchTimeout = setTimeout(function() {
                    touchTimeout = null;
                    if (touch.el) touch.el.trigger('singleTap');
                    touch = {};
                },
                250);
            }
        }).bind('touchcancel', function() {
            touch = {}
        });
    });

    ['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown', 'doubleTap', 'tap', 'singleTap', 'longTap'].forEach(function(m) {
        $.fn[m] = function(callback) {
            return this.bind(m, callback)
        }
    });
})(jQuery);

(function($) {
    redirectMouseToTouch = function(type, originalEvent) {

        //stop propagation, and remove default behavior for everything but INPUT, TEXTAREA & SELECT fields
        // originalEvent.stopPropagation();
        if (originalEvent.target.tagName.toUpperCase().indexOf("SELECT") == - 1 && originalEvent.target.tagName.toUpperCase().indexOf("TEXTAREA") == - 1 && originalEvent.target.tagName.toUpperCase().indexOf("INPUT") == - 1) //SELECT, TEXTAREA & INPUT
            {
                originalEvent.stopPropagation();
            }

            var touchevt = document.createEvent("Event");
            touchevt.initEvent(type, true, true);
            touchevt.touches = new Array();
            touchevt.touches[0] = new Object();
            touchevt.touches[0].pageX = originalEvent.pageX;
            touchevt.touches[0].pageY = originalEvent.pageY;
            touchevt.touches[0].target = originalEvent.target;
            touchevt.changedTouches = touchevt.touches; //for jqtouch
            touchevt.targetTouches = touchevt.touches; //for jqtouch
            touchevt.target = originalEvent.target;
            originalEvent.target.dispatchEvent(touchevt);
            return touchevt;
    }

    emulateTouchEvents = function() {
        var ee = document;

        document.mouseMoving = false;

        document.addEventListener("mousedown", function(e) {
            try {
                this.mouseMoving = true;
                var touchevt = redirectMouseToTouch("touchstart", e);
                if (document.ontouchstart) document.ontouchstart(touchevt);
                if (e.target.ontouchstart) e.target.ontouchstart(e);

            } catch(e) {}
        });

        //ee[x].onmouseup=function(e)
        document.addEventListener("mouseup", function(e) {
            try {
                this.mouseMoving = false;

                var touchevt = redirectMouseToTouch("touchend", e);
                if (document.ontouchend) document.ontouchend(touchevt);
                if (e.target.ontouchend) e.target.ontouchend(e);
            }
            catch(e) {}
        });
        //ee[x].onmousemove=function(e)
        document.addEventListener("mousemove", function(e) {
            try {
                if (!this.mouseMoving) return;
                var touchevt = redirectMouseToTouch("touchmove", e);
                if (document.ontouchmove) document.ontouchmove(touchevt);
                if (e.target.ontouchmove) e.target.ontouchmove(e);
            }
            catch(e) {}
        });
    }
    if(!((window.DocumentTouch && document instanceof DocumentTouch) || 'ontouchstart' in window)){
        emulateTouchEvents();
        window.addEventListener("resize", function() {
            var touchevt = document.createEvent("Event");
            touchevt.initEvent("orientationchange", true, true);
            document.dispatchEvent(touchevt);
        },
        false);
    }
})(jQuery);
