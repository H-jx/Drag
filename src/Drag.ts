
export interface Events {
    [eventName: string]: (ev: Event, drag: Drag) => boolean | void;
}
export interface Optional {
    x?: number;
    y?: number;
    container?: HTMLElement; // 父级容器，如果有，则会限制活动范围
    dragTarget?: HTMLElement; // 点击对象，点它才会拖拽,默认为el
    useTransform?: boolean;
    events?: Events;
}

const isFunc = function (fn) {
    return typeof fn === 'function';
};
const getRegExp = function (prop) {
    return new RegExp(`(${prop})\\([0-9]+\.?[0-9]*(px)\\)`);
};

/**
 * 解析Transform属性
 * @param transform
 */
const paserTransform = function (transform: string) {
    const translateXRegExp = getRegExp('translateX');
    const translateYRegExp = getRegExp('translateY');
    const translateRegExp = /(translate)\([0-9]+\.?[0-9]*(px)\,\s?[0-9]+\.?[0-9]*(px)\)/;

    let props = {
        translateX: 0,
        translateY: 0,
    } as {
        translateX: number;
        translateY: number;
        // translate?: number;
    };
    const paserProp = function (regExp, str) {
        let resArr = regExp.exec(str);
        if (resArr === null) {
            return '';
        }
        let resStr = resArr[0];
        let value = resStr.substring(resStr.indexOf('(') + 1, resStr.indexOf(')'));
        return value;
    };
    if (translateXRegExp.test(transform)) {
        props.translateX = Number.parseFloat(paserProp(translateXRegExp, transform));
    }
    if (translateYRegExp.test(transform)) {
        props.translateY = Number.parseFloat(paserProp(translateYRegExp, transform));
    }
    if (translateRegExp.test(transform)) {
        let res = paserProp(translateRegExp, transform).split(',');
        props.translateX = Number.parseFloat(res[0]);
        props.translateY = Number.parseFloat(res[1]);
    }
    return props;
};
/**
 * 拖拽, 兼容触摸
 * @param {Element}
 * @param {Object} opts
 * @example
 * new Drag(element, {
 *  dragTarget: // element or el.childern
 * })
 */
class Drag {
    static paserTransform = paserTransform;
    x: number; // 位移
    y: number; // 位移
    disX: number; // onTouchStart与offsetX的差
    disY: number; // onTouchStart与offsetY的差
    opts: Optional;
    events: Events;
    el: HTMLElement;
    dragTarget: HTMLElement;
    constructor(el: HTMLElement, opts: Optional) {
        // 位移差
        this.disX = 0;
        this.disY = 0;
        // 其他配置
        this.opts = opts || {};
        this.init(el);
    }
    destroy() {
        this.dragTarget.removeEventListener('mousedown', this.handleDown);
        this.dragTarget.removeEventListener('touchstart', this.handleDown);
    }
    /**
     * 初始化
     * @param {Element}
     */
    init(el) {
        if (!(el instanceof HTMLElement)) {
            throw Error('未传el[must be a HTMLElement]');
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
    }
    /**
     * 添加点下事件
     */
    bindTouchStartEvents() {
        this.dragTarget.addEventListener('mousedown', this.handleDown, false);
        this.dragTarget.addEventListener('touchstart', this.handleDown, false);
    }
    /**
     * 添加移动事件
     */
    bindMoveEvents() {
        document.addEventListener('mousemove', this.handleMove, false);
        document.addEventListener('touchmove', this.handleMove, false);
    }
    /**
     * 点下时的处理
     * @param {Event} ev
     */
    handleDown(ev) {
        let clientX = 0;
        let clientY = 0;
        if (ev.type === 'touchstart') {
            const touche = ev.touches[0];
            clientX = touche.clientX;
            clientY = touche.clientY;
        } else {
            clientX = ev.clientX;
            clientY = ev.clientY;
        }
        if (this.opts.useTransform) {
            let translate = paserTransform(this.el.style.transform || '');
            this.disX = clientX - translate.translateX;
            this.disY = clientY - translate.translateY;
        } else {
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
    }
    /**
     * 移动时
     */
    handleMove(ev) {
        const self = this;
        if (ev.type === 'touchmove') {
            ev.preventDefault();
            const touche = ev.touches[0];
            self.x = touche.clientX - self.disX;
            self.y = touche.clientY - self.disY;
        } else {
            self.x = ev.clientX - self.disX;
            self.y = ev.clientY - self.disY;
        }
        // 限制范围
        if (this.opts.container instanceof HTMLElement) {
            const rect = this.opts.container.getBoundingClientRect() as DOMRect;
            const width = this.el.clientWidth;
            const height = this.el.clientHeight;
            const { x, y } = this.el.getBoundingClientRect() as DOMRect;
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
            self.el.style.transform = `translate(${self.x}px,${self.y}px)`;
        } else {
            self.el.style.left = `${self.x}px`;
            self.el.style.top = `${self.y}px`;
        }
        ev.preventDefault();
    }

    handleUp(ev) {
        if (isFunc(this.events.onUp)) {
            if (this.events.onUp(ev, this) === false) {
                return;
            }
        }
        document.removeEventListener('mousemove', this.handleMove);
        document.removeEventListener('touchmove', this.handleMove);
        document.removeEventListener('mouseup', this.handleUp);
        document.removeEventListener('touchend', this.handleUp);
    }
}

export default Drag;
