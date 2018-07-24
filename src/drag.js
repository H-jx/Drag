
/**
 * 拖拽, 兼容触摸
 * @param {Element}
 * @param {Object} opts
 * opts = {
 *      dragTarget:{Element} [点击对象，点它才会拖拽,默认为el],
 *      position: {Array}   [x, y]
 * }
 */
class Drag {
    constructor (el, opts) {
        this.x = 0
        this.y = 0
        this.opts = opts || {}
        this.init(el)
    }
    /**
     * 初始化
     * @param {Element}
     */
    init (el) {
        if (!(el instanceof HTMLElement)) {
            throw Error('未传el[must be a HTMLElement]');
        }
        this.el = el
        this.dragTarget = this.opts.dragTarget || el
        this.useTransform = this.opts.useTransform === true
        if (Array.isArray(this.opts.position)) {
            this.x = this.opts.position[0]
            this.y = this.opts.position[1]
        }
        // 绑定this，为了可以remove事件，所以重复赋值
        this.handleMove = this.handleMove.bind(this);
        this.onDown();
    }
    /**
     * 添加点下事件
     */
    onDown () {
        this.dragTarget.addEventListener('mousedown', this.handleDown.bind(this), false);
        this.dragTarget.addEventListener('touchstart', this.handleDown.bind(this), false);
    }
    /**
     * 添加移动事件
     */
    onMove () {
        document.addEventListener('mousemove', this.handleMove, false);
        document.addEventListener('touchmove', this.handleMove, false);
    }
    /**
     * 点下时的处理
     * @param {Event} ev
     */
    handleDown (ev) {
        if (ev.type === 'touchstart') {
            var touche = ev.touches[0];
            this.diffX = touche.clientX - this.x
            this.diffY = touche.clientY - this.y;
        } else {
            this.diffX = this.useTransform ? (ev.clientX - this.x) : (ev.clientX - this.el.offsetLeft)
            this.diffY = this.useTransform ? (ev.clientY - this.y) : (ev.clientY - this.el.offsetTop)
        }
        this.onMove();
        document.addEventListener('mouseup', this.handleUp.bind(this));
        document.addEventListener('touchend', this.handleUp.bind(this));
    }
    /**
     * 移动时
     */
    handleMove (ev) {
        var self = this;
        if (ev.type === 'touchmove') {
            ev.preventDefault();
            var touche = ev.touches[0];
            self.x = touche.clientX - self.diffX
            self.y = touche.clientY - self.diffY
        } else {
            self.x = ev.clientX - self.diffX
            self.y = ev.clientY - self.diffY
        }
        // l t限制在这写
        if (this.useTransform) {
            self.el.style.transform = 'translate(' + self.x + 'px,' + self.y + 'px)'
        } else {
            self.el.style.left = self.x + 'px'
            self.el.style.top = self.y + 'px'
        }
        ev.preventDefault()
    }

    handleUp (ev) {
        document.removeEventListener('mousemove', this.handleMove);
        document.removeEventListener('touchmove', this.handleMove);
        document.removeEventListener('mouseup', this.handleUp);
        document.removeEventListener('touchend', this.handleUp);
    }
}

export default Drag;