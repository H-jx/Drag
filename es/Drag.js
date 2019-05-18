var isFunc = function (fn) {
    return typeof fn === 'function';
};
var getRegExp = function (prop) {
    return new RegExp("(" + prop + ")\\([0-9]+.?[0-9]*(px)\\)");
};
var getStyle = function (ele) {
    return getComputedStyle(ele, null);
};
/**
 * 解析Transform属性
 * @param transform
 */
var paserTransform = function (transform) {
    var translateXRegExp = getRegExp('translateX');
    var translateYRegExp = getRegExp('translateY');
    var translateRegExp = /(translate)\([0-9]+\.?[0-9]*(px)\,\s?[0-9]+\.?[0-9]*(px)\)/;
    var props = {
        translateX: 0,
        translateY: 0
    };
    var paserProp = function (regExp, str) {
        var resArr = regExp.exec(str);
        if (resArr === null) {
            return '';
        }
        var resStr = resArr[0];
        var value = resStr.substring(resStr.indexOf('(') + 1, resStr.indexOf(')'));
        return value;
    };
    if (translateXRegExp.test(transform)) {
        props.translateX = parseFloat(paserProp(translateXRegExp, transform));
    }
    if (translateYRegExp.test(transform)) {
        props.translateY = parseFloat(paserProp(translateYRegExp, transform));
    }
    if (translateRegExp.test(transform)) {
        var res = paserProp(translateRegExp, transform).split(',');
        props.translateX = parseFloat(res[0]);
        props.translateY = parseFloat(res[1]);
    }
    return props;
};
/**
 * 拖拽, 兼容触摸
 * @param {HTMLElement}
 * @param {Object} opts
 * @example
 * new Drag(element, {
 *  dragTarget: // element or el.childern
 * })
 */
var Drag = /** @class */ (function () {
    function Drag(el, opts) {
        this.x = 0; // 位移
        this.y = 0; // 位移
        this.events = {};
        // 位移差
        this.disX = 0;
        this.disY = 0;
        // 其他配置
        this.opts = opts || {};
        this.init(el);
    }
    Drag.prototype.destroy = function () {
        this.dragTarget.removeEventListener('mousedown', this.handleDown);
        this.dragTarget.removeEventListener('touchstart', this.handleDown);
    };
    /**
     * 初始化
     * @param {HTMLElement}
     */
    Drag.prototype.init = function (el) {
        if (!(el instanceof HTMLElement)) {
            throw Error('未传el[must be a HTMLHTMLElement]');
        }
        this.el = el;
        this.dragTarget = this.opts.dragTarget || el;
        this.opts.useTransform = this.opts.useTransform === undefined ? true : this.opts.useTransform;
        this.events = this.opts.events || {};
        this.x = this.opts.x || 0;
        this.y = this.opts.y || 0;
        this.handleMove = this.handleMove.bind(this);
        this.handleDown = this.handleDown.bind(this);
        this.handleUp = this.handleUp.bind(this);
        this.bindTouchStartEvents();
        if (!this.opts.useTransform && getStyle(this.el).position !== 'absolute') {
            this.el.style.position = 'absolute';
        }
    };
    /**
     * 添加点下事件
     */
    Drag.prototype.bindTouchStartEvents = function () {
        this.dragTarget.addEventListener('mousedown', this.handleDown, false);
        this.dragTarget.addEventListener('touchstart', this.handleDown, false);
    };
    /**
     * 添加移动事件
     */
    Drag.prototype.bindMoveEvents = function () {
        document.addEventListener('mousemove', this.handleMove, false);
        document.addEventListener('touchmove', this.handleMove, false);
    };
    /**
     * 点下时的处理
     * @param {Event} ev
     */
    Drag.prototype.handleDown = function (ev) {
        var clientX = 0;
        var clientY = 0;
        if (ev.type === 'touchstart') {
            var touche = ev.touches[0];
            clientX = touche.clientX;
            clientY = touche.clientY;
        }
        else {
            clientX = ev.clientX;
            clientY = ev.clientY;
        }
        if (this.opts.useTransform) {
            var translate = paserTransform(this.el.style.transform || '');
            this.disX = clientX - translate.translateX;
            this.disY = clientY - translate.translateY;
        }
        else {
            this.disX = clientX - this.el.offsetLeft;
            this.disY = clientY - this.el.offsetTop;
        }
        if (isFunc(this.events.onDown)) {
            if (this.events.onDown(ev, this) === false) {
                return;
            }
        }
        this.bindMoveEvents();
        document.addEventListener('mouseup', this.handleUp);
        document.addEventListener('touchend', this.handleUp);
    };
    /**
     * 移动时
     */
    Drag.prototype.handleMove = function (ev) {
        var self = this;
        if (ev.type === 'touchmove') {
            ev.preventDefault();
            var touche = ev.touches[0];
            self.x = touche.clientX - self.disX;
            self.y = touche.clientY - self.disY;
        }
        else {
            self.x = ev.clientX - self.disX;
            self.y = ev.clientY - self.disY;
        }
        // 限制范围
        if (this.opts.container instanceof HTMLElement) {
            var rect = this.opts.container.getBoundingClientRect();
            var width = this.el.clientWidth;
            var height = this.el.clientHeight;
            var _a = this.el.getBoundingClientRect(), x = _a.x, y = _a.y;
            // 左
            if (x < rect.left) {
                self.x = rect.left;
            }
            // 上
            if (y < rect.y) {
                self.y = rect.y;
            }
            // 下
            if (y > rect.bottom - height) {
                self.y = rect.bottom - height;
            }
            // 右
            if (x > rect.right - width) {
                self.x = rect.right - width;
            }
        }
        // 钩子
        if (isFunc(this.events.onMove)) {
            if (this.events.onMove(ev, self) === false) {
                return;
            }
        }
        if (this.opts.useTransform) {
            self.el.style.transform = "translate(" + self.x + "px," + self.y + "px)";
        }
        else {
            self.el.style.left = self.x + "px";
            self.el.style.top = self.y + "px";
        }
        ev.preventDefault();
    };
    Drag.prototype.handleUp = function (ev) {
        if (isFunc(this.events.onUp)) {
            if (this.events.onUp(ev, this) === false) {
                return;
            }
        }
        document.removeEventListener('mousemove', this.handleMove);
        document.removeEventListener('touchmove', this.handleMove);
        document.removeEventListener('mouseup', this.handleUp);
        document.removeEventListener('touchend', this.handleUp);
    };
    Drag.paserTransform = paserTransform;
    return Drag;
}());
export default Drag;
