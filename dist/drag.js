'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * 拖拽, 兼容触摸
 * @param {Element}
 * @param {Object} opts
 * opts = {
 *      container: Element 父级容器，如果有，则会限制活动范围
 *      dragTarget?: Element [点击对象，点它才会拖拽,默认为el],
 *      position?: [Number, Number]   [x, y]
 *      events?: {
 *          onDown: (Event) => {},
 *          onMove: (Event, Drag) => {},
 *          onUp: (Event) => {},
 *      }
 * }
 * @example
 * new Drag(element, {
 *  dragTarget: // element or el.childern
 *  position: [10, 10]
 * })
 */
var Drag = function () {
    function Drag(el, opts) {
        _classCallCheck(this, Drag);

        this.x = 0;
        this.y = 0;
        this.opts = opts || {};
        this.init(el);
    }
    /**
     * 初始化
     * @param {Element}
     */


    _createClass(Drag, [{
        key: 'init',
        value: function init(el) {
            if (!(el instanceof HTMLElement)) {
                throw Error('未传el[must be a HTMLElement]');
            }
            this.el = el;
            this.dragTarget = this.opts.dragTarget || el;
            this.useTransform = this.opts.useTransform === true;
            this.events = this.opts.events || {};
            if (Array.isArray(this.opts.position)) {
                this.x = this.opts.position[0];
                this.y = this.opts.position[1];
            }
            // 绑定this，为了可以remove事件，所以重复赋值
            this.handleMove = this.handleMove.bind(this);
            this.onDown();
        }
        /**
         * 添加点下事件
         */

    }, {
        key: 'onDown',
        value: function onDown() {
            this.dragTarget.addEventListener('mousedown', this.handleDown.bind(this), false);
            this.dragTarget.addEventListener('touchstart', this.handleDown.bind(this), false);
        }
        /**
         * 添加移动事件
         */

    }, {
        key: 'onMove',
        value: function onMove() {
            document.addEventListener('mousemove', this.handleMove, false);
            document.addEventListener('touchmove', this.handleMove, false);
        }
        /**
         * 点下时的处理
         * @param {Event} ev
         */

    }, {
        key: 'handleDown',
        value: function handleDown(ev) {
            if (ev.type === 'touchstart') {
                var touche = ev.touches[0];
                this.diffX = touche.clientX - this.x;
                this.diffY = touche.clientY - this.y;
            } else {
                this.diffX = this.useTransform ? ev.clientX - this.x : ev.clientX - this.el.offsetLeft;
                this.diffY = this.useTransform ? ev.clientY - this.y : ev.clientY - this.el.offsetTop;
            }
            if (this.events.onDown) {
                if (this.events.onDown(ev) === false) {
                    return;
                }
            }
            this.onMove();
            document.addEventListener('mouseup', this.handleUp.bind(this));
            document.addEventListener('touchend', this.handleUp.bind(this));
        }
        /**
         * 移动时
         */

    }, {
        key: 'handleMove',
        value: function handleMove(ev) {
            var self = this;
            if (ev.type === 'touchmove') {
                ev.preventDefault();
                var touche = ev.touches[0];
                self.x = touche.clientX - self.diffX;
                self.y = touche.clientY - self.diffY;
            } else {
                self.x = ev.clientX - self.diffX;
                self.y = ev.clientY - self.diffY;
            }

            // 限制范围
            if (this.opts.container instanceof HTMLElement) {
                var rect = this.opts.container.getBoundingClientRect();
                var width = this.el.clientWidth;
                var height = this.el.clientHeight;
                // 左
                if (self.x < rect.left) {
                    self.x = rect.left;
                }
                // 上
                if (self.y < rect.y) {
                    self.y = rect.y;
                }
                // 下
                if (self.y > rect.bottom - height) {
                    self.y = rect.bottom - height;
                }
                // 右
                if (self.x > rect.right - width) {
                    self.x = rect.right - width;
                }
            }
            // 钩子
            if (this.events.onMove) {
                if (this.events.onMove(ev, self) === false) {
                    return;
                }
            }

            if (this.useTransform) {
                self.el.style.transform = 'translate(' + self.x + 'px,' + self.y + 'px)';
            } else {
                self.el.style.left = self.x + 'px';
                self.el.style.top = self.y + 'px';
            }
            ev.preventDefault();
        }
    }, {
        key: 'handleUp',
        value: function handleUp(ev) {
            if (this.events.onUp) {
                if (this.events.onUp(ev) === false) {
                    return;
                }
            }
            document.removeEventListener('mousemove', this.handleMove);
            document.removeEventListener('touchmove', this.handleMove);
            document.removeEventListener('mouseup', this.handleUp);
            document.removeEventListener('touchend', this.handleUp);
        }
    }]);

    return Drag;
}();

exports.default = Drag;