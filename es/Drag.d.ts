export interface Events {
    [eventName: string]: (ev: Event, drag: Drag) => boolean | void;
}
export interface Optional {
    x?: number;
    y?: number;
    container?: HTMLElement;
    dragTarget?: HTMLElement;
    useTransform?: boolean;
    events?: Events;
}
/**
 * 解析Transform属性
 * @param transform
 */
export declare const paserTransform: (transform: string) => {
    translateX: number;
    translateY: number;
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
declare class Drag {
    static paserTransform: (transform: string) => {
        translateX: number;
        translateY: number;
    };
    x: number;
    y: number;
    disX: number;
    disY: number;
    opts: Optional;
    events: Events;
    el: HTMLElement;
    dragTarget: HTMLElement;
    constructor(el: HTMLElement, opts: Optional);
    destroy(): void;
    /**
     * 初始化
     * @param {HTMLElement}
     */
    init(el: HTMLElement): void;
    /**
     * 添加点下事件
     */
    bindTouchStartEvents(): void;
    /**
     * 添加移动事件
     */
    bindMoveEvents(): void;
    /**
     * 点下时的处理
     * @param {Event} ev
     */
    handleDown(ev: TouchEvent | MouseEvent): void;
    /**
     * 移动时
     */
    handleMove(ev: TouchEvent | MouseEvent): void;
    handleUp(ev: TouchEvent | MouseEvent): void;
}
export { Drag };
export default Drag;
