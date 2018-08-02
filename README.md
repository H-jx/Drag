
# Drag.js 📬

Drag & Drop



```javascript

new Drag(element);

```
```javascript
let element = document.getElementById('xx');
let head = element.querySelect('.head');

new Drag(element, {
    container: container,
    dragTarget: head, // only drag on head
    events: {
        onMove(ev, drag) {
            if (true) {
                return false; // stop move
            }
        }
    }
});
```
