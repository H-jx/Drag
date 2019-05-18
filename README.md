
# Drag.js 📬

Drag & Drop

## Installation
```bash
npm install h-drag
```

```javascript

new Drag(element);

```

## drag on box's head, move box
```javascript
let container = document.getElementById('box');
let head = element.querySelect('.head');

new Drag(container, {
    dragTarget: head, // only drag on head
    events: {
        // onMove(ev, drag) {
        //     if (true) {
        //         return false; // stop move
        //     }
        // }
    }
});
```
