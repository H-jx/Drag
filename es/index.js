import Drag from './Drag';
var element = document.getElementById('drag');
var head = element.querySelector('.head');
new Drag(element, {
    dragTarget: head,
    useTransform: false,
    events: {
    // onMove(ev, drag) {
    //     if (true) {
    //         return false; // stop move
    //     }
    // }
    }
});
