import Drag from '../src/Drag';


test('paserTransform', () => {
    const transform = Drag.paserTransform('transform: translate(289px, 313px)');
    expect(transform.translateX).toBe(289);
    expect(transform.translateY).toBe(313);
});
