import * as THREE from 'three';

class MouseInput {
    constructor() {
        this.fEnabled = true;
        this.cursor = new THREE.Vector2(0, 0);

        this.mouseDownPos = new THREE.Vector2(0, 0);
        this.mouseUpPos = new THREE.Vector2(0, 0);
        this.mouseDownTime = 0;
        this.mouseUpTime = 0;
        this.lastMouseUpTime = 0;
        this.clickDurMs = 0;

        this.bindEventListeners();
    }

    bindEventListeners() {
        document.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
        document.addEventListener('mousemove', this.onPointerMove.bind(this));
    }

    // Mouse down event listener
    onMouseDown(event) {
        if (!this.fEnabled) return;
        this.mouseDownTime = new Date().getTime();
        this.mouseDownPos.set(event.x, event.y);
    };
    
    // Mouse up event listener
    onMouseUp(event) {
        if (!this.fEnabled) return;
        this.lastMouseUpTime = this.mouseUpTime;
        this.mouseUpTime = new Date().getTime();
        this.mouseUpPos.set(event.x, event.y);
        this.clickDurMs = this.mouseUpTime - this.mouseDownTime;
    }

    // Pointer move event listener
    onPointerMove(event) {
        if (!this.fEnabled) return;
        this.cursor.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.cursor.y = - (event.clientY / window.innerHeight) * 2 + 1;
    }

    // Checks if click was longer than the threshold for a long click
    wasLongClick() {
        return this.clickDurMs > 250 ? true : false;
    }

    // Checks if the mouse moved during the last time it was clicked
    wasStationaryClick() {
        let dx = this.mouseUpPos.x - this.mouseDownPos.x;
        let dy = this.mouseUpPos.y - this.mouseDownPos.y;
        return (dx == 0 && dy == 0) ? true : false;
    }

    // Checks if the last mouse click was the second click of a double-click
    wasDoubleClick() {
        let dtClicks = this.mouseUpTime - this.lastMouseUpTime;
        return dtClicks < 250 ? true : false;
    }
}

export default MouseInput;
