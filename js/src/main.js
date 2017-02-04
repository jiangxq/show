;
define(["../libs/zepto.dev", "./api",], function($, Api) {

    var Main = function(options) {

        var defaults = {

            domWrapId: "",
            hostUrl: "",

        };

        this.opts = $.extend(true, {}, defaults, options);

        this._init();
    };

    Main.prototype._init = function() {
        this._renderLayout();
        this._bindEvent();
    };

    Main.prototype._renderLayout = function() {
        var optsObj = this.opts;
        optsObj.$wrapDom = $(optsObj.domWrapId);
        var html = '<div class="middle-panel"></div>' +
                   '<div class="footer-panel"><ul></ul></div>' +
                   '<canvas class="canvas-panel"></canvas>';
        optsObj.$wrapDom.html(html);
        optsObj.$footer = optsObj.$wrapDom.find(".footer-panel ul");
        optsObj.$footer.append($('<li>echarts</li><li>reader</li>'));
        optsObj.$canvas = optsObj.$wrapDom.find(".canvas-panel");
        optsObj.$middle = optsObj.$wrapDom.find(".middle-panel");
    };

    Main.prototype._bindEvent = function() {
        var optsObj = this.opts;
        var canvas = optsObj.$canvas[0];
        var ctx = canvas.getContext("2d");
        var left = optsObj.$middle.offset().left;
        var width = optsObj.$middle.width();
        var top = optsObj.$middle.offset().top;
        var height = optsObj.$footer.offset().top - top;
        optsObj.$middle.hide();
        optsObj.$footer.on('click', 'li', function() {
            $(this).toggleClass("active");
            optsObj.$middle.hide();
            canvas.width = optsObj.$canvas.width();
            canvas.height = height;
            optsObj.$canvas.css("z-index", 1);
            var s1 = left;
            var s2 = s1 + width;
            var p1 = $(this).offset().left;
            var p2 = p1 + $(this).width();
            if($(this).hasClass("active")) {
                $(this).siblings().removeClass("active");
                scale(s1, s2, p1, p2, "zoomin", function () {
                    canvas.style.zIndex = -1;
                    optsObj.$middle.show();
                });
            } else {
                optsObj.$middle.hide();
                scale(s1, s2, p1, p2, "zoomout", function () {
                    canvas.style.zIndex = -1;
                });
            }
        });
        /**
         * 绘制形状
         * @param s1 {Number} 起点一
         * @param s2 {Number} 起点二
         * @param p1 {Number} 结束点一
         * @param p2 {Number} 结束点二
         */
        function draw(s1, s2, p1, p2) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.moveTo(s1, 0);
            ctx.bezierCurveTo(s1, canvas.height * 0.2, p1, canvas.height * 0.6, p1, canvas.height);
            ctx.lineTo(p2, canvas.height);
            ctx.bezierCurveTo(p2, canvas.height * 0.6, s2, canvas.height * 0.2, s2, 0);
            ctx.lineTo(s1, 0);
            ctx.fillStyle = "rgba(0, 0, 0, .2)";
            ctx.fill();
        }
        /**
         * 擦除方式
         * @param y {Number}
         * @param speed {Number}
         * @param type 类型，放大或缩小 zoomin、zoomout
         */
        function clearRect(y, speed, type) {
            if(type === "zoomout") {
                ctx.clearRect(0, y, canvas.width, speed);
            } else if(type === "zoomin") {
                ctx.clearRect(0, 0, canvas.width, y);
            }
        }
        /**
         * 缩放效果
         * @param s1 {Number} 起点一
         * @param s2 {Number} 起点二
         * @param p1 {Number} 结束点一
         * @param p2 {Number} 结束点二
         * @param type {String} 类型，放大或缩小 zoomin、zoomout
         */
        function scale(s1, s2, p1, p2, type, callback) {
            var dist1 = Math.abs(p1 - s1);
            var dist2 = Math.abs(p2 - s2);
            var d1, d2, _p1, _p2, speed1, y, speed2;
            if(dist1 === 0 || dist2 === 0) {
                dist1 = 1;
                dist2 = 1;
            }
            speed1 = 30;
            speed2 = 30;
            if(type === "zoomout") {
                d1 = (p1 >= s1 && p1 < speed1) ? 0 : p1 < s1 ? -speed1 : speed1;
                d2 = p2 < s2 ? -speed1 * dist2 / dist1 : speed1 * dist2 / dist1;
                _p1 = s1;
                _p2 = s2;
                y = 0;
                var t = setInterval(function () {
                    if(_p2 - _p1 <= p2 - p1) {
                        clearInterval(t);
                        var timer = setInterval(function () {
                            if(y > canvas.height) {
                                clearInterval(timer);
                                callback && callback();
                            }
                            clearRect(y, speed2, type);
                            y += speed2;
                            speed2 += 1;
                        }, 17);
                    }
                    draw(s1, s2, _p1, _p2);
                    _p1 += d1;
                    _p2 += d2;
                    if((d1 < 0 && _p1 <= p1) || (d1 > 0 && _p1 >= p1)) {
                        _p1 = p1;
                    }
                    if((d2 < 0 && _p2 <= p2) || (d2 > 0 && _p2 >= p2)) {
                        _p2 = p2;
                    }
                }, 17);
            } else if(type === "zoomin") {
                d1 = (p1 >= s1 && p1 < speed1) ? 0 : p1 < s1 ? speed1 : -speed1;
                d2 = p2 < s2 ? speed1 * dist2 / dist1 : -speed1 * dist2 / dist1;
                _p1 = p1;
                _p2 = p2;
                y = canvas.height;
                var timer = setInterval(function () {
                    if(y <= 0) {
                        clearInterval(timer);
                        var t = setInterval(function () {
                            if(_p2 - _p1 >= s2 - s1) {
                                clearInterval(t);
                                callback && callback();
                            }
                            draw(s1, s2, _p1, _p2);
                            _p1 += d1;
                            _p2 += d2;
                        }, 17);
                    }
                    draw(s1, s2, _p1, _p2);
                    clearRect(y, speed2, type);
                    y -= speed2;
                    speed2 += 1;
                }, 17);
            }
        }
    };

    return Main;
});