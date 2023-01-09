import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';

// Set up mouse input
class MouseInput {
    constructor() {
        this.fEnabled = true;
        this.cursor = new THREE.Vector2(0, 0);

        this.mouseDownPos = new THREE.Vector2(0, 0);
        this.mouseUpPos = new THREE.Vector2(0, 0);
        this.mouseDownTime = 0;
        this.mouseUpTime = 0;
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
}

const mouseInput = new MouseInput();

// Handle uploading file to server when selected
document.addEventListener("DOMContentLoaded", function (event) {
    const fileInput = document.querySelector('#file-input');

    // Clear file input value on click
    fileInput.addEventListener('click', (event) => {
        this.value = null;
    });

    // Upload file when selected
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        console.log("Uploading file " + file.name);

        uploadStarRecordsFile(file);
    });
});

// Upload star records file to be processed by the server
function uploadStarRecordsFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    fetch('/process-star-data', {
        method: 'POST',
        body: formData
    })
        .then((response) => response.json())
        .then((data) => {
            // Handle the response data as needed
            drawStarPoints(data.data);
        })
        .catch((error) => {
            console.error(error);
        });
}

// Convert rgb values to hex
function rgbToHex(r, g, b) {
    let hex = (r << 16) + (g << 8) + b;
    return hex;
}

// Draw mesh for each star in the star records
function drawStarPoints(starRecords = []) {
    console.log("Drawing star points...");

    // Set up star points geometry
    let stars = [];
    starRecords.forEach(record => {
        let position = new THREE.Vector3(record.position.x, record.position.y, record.position.z);
        stars.push({
            name: record.name,
            position: position,
            type: record.type,
            unk: record.unk10
        });
    });

    const whiteStarMaterial =   new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const redStarMaterial =     new THREE.MeshBasicMaterial({ color: 0xd36956 });
    const yellowStarMaterial =  new THREE.MeshBasicMaterial({ color: 0xe5bd72 });
    const blueStarMaterial =    new THREE.MeshBasicMaterial({ color: 0x64b3fc });
    const binaryStarMaterial =  new THREE.MeshBasicMaterial({ color: 0xd1d1f6 });
    const blackHoleMaterial =   new THREE.MeshBasicMaterial({ color: 0x0000FF });
    const protoDiskMaterial =   new THREE.MeshBasicMaterial({ color: 0xFF0000 });

    const starGeometry = new THREE.SphereGeometry(0.3, 6, 4);

    stars.forEach(star => {
        let material = whiteStarMaterial;
        switch (star.type) {
            case 6: // red
            case 12: // red-red
                material = redStarMaterial
                break;
            case 4: // yellow
            case 10: // yellow-yellow
                material = yellowStarMaterial;
                break;
            case 5: // blue
            case 7: // blue-blue
                material = blueStarMaterial;
                break;
            case 2: // black hole
                material = blackHoleMaterial;
                break;
            case 3: // proto-planetary disk
                material = protoDiskMaterial;
                break;
            case 8:
            case 9:
            case 11:
                material = binaryStarMaterial;
                break;
            default:
                break;
        }

        //material = new THREE.MeshBasicMaterial({ color: star.color }); // temp
        const mesh = new THREE.Mesh(starGeometry, material);
        mesh.position.set(star.position.x, star.position.z * 2, -star.position.y);
        mesh.userData = star;
        scene.add(mesh);
    });

    console.log("Done.");
}

// Set up a basic scene
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.far = 3500
camera.position.set(10, 50, 10);
camera.updateProjectionMatrix();

var controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.screenSpacePanning = false;

var cameraTargetPos; // set when camera needs to glide to a position
var fCameraGliding;

// Resize renderer on window resize
window.addEventListener('resize', (event) => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
});

// Set up raycasting
var raycaster = new THREE.Raycaster();
var fEnableRaycasting = true;

var tooltip = document.querySelector('#tooltip');
var propsPanel = document.querySelector('#properties-panel');
propsPanel.style.visibility = 'hidden';

// Disable raycasting while mouse is on ui panels
document.querySelector('.panel').addEventListener('mouseover', (event) => {
    fEnableRaycasting = false;
});

document.querySelector('.panel').addEventListener('mouseleave', (event) => {
    fEnableRaycasting = true;
});

// Track star pointed at by mouse cursor and show props panel on click
var pointedObject;
window.addEventListener('click', (event) => {
    if (mouseInput.wasLongClick() | !mouseInput.wasStationaryClick())
        return; // abort if long click or mouse moved during click

    if (pointedObject != null) {
        let starRecord = pointedObject.object.userData;
        document.querySelector('.value-name').innerHTML = starRecord.name;
        document.querySelector('.value-posx').innerHTML = starRecord.position.x.toFixed(3);
        document.querySelector('.value-posy').innerHTML = starRecord.position.y.toFixed(3);
        document.querySelector('.value-posz').innerHTML = starRecord.position.z.toFixed(3);
        document.querySelector('.value-type').innerHTML = starRecord.type;
        propsPanel.style.visibility = 'visible';
    } else {
        propsPanel.style.visibility = 'hidden';
    }
});

// Setup skybox
var texName = 'img/starfield.png'
var skyTextures = [
    texName,
    texName,
    texName,
    texName,
    texName,
    texName,
];

var textureCube = new THREE.CubeTextureLoader().load(skyTextures);
scene.background = textureCube;

// Request sample star data from server
var req = new XMLHttpRequest();
req.onload = function () {
    const response = JSON.parse(this.response);
    
    if (response.status == 'success') {
        drawStarPoints(response.data);
    }
};
req.open('POST', 'example-star-records');
req.send();

// Setup key input
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case ' ':
            controls.target.set(0, 0, 0);
            cameraTargetPos = new THREE.Vector3(10, 50, 10);
            fCameraGliding = true;
            break;
        default:
            break;
    }
});

// Render the scene
function render() {
    // Update camera controls
    controls.update();

    // Cast ray from camera to pointer to detect stars
    if (fEnableRaycasting) {
        raycaster.setFromCamera(mouseInput.cursor, camera);
        const intersects = raycaster.intersectObjects(scene.children, false);
    
        // Check if raycast hit a star
        if (intersects.length > 0) {
            pointedObject = intersects[0]
            let starName = pointedObject.object.userData.name;
    
            // Show tooltip with star name on mouseover
            tooltip.style.visibility = 'visible';
            tooltip.style.left = (mouseInput.cursor.x + 1) / 2 * window.innerWidth + 5 + 'px';
            tooltip.style.top = (-mouseInput.cursor.y + 1) / 2 * window.innerHeight - 30 + 'px';
            tooltip.innerHTML = starName;
    
            document.body.style.cursor = 'help';
    
        } else {
            pointedObject = null;
            tooltip.style.visibility = 'hidden';
            document.body.style.cursor = 'auto';
        }
    }

    // Update camera positoin if gliding to target
    if (fCameraGliding) {
        // Disable camera controls while gliding
        controls.enabled = false;

        // Lerp camera position towards target
        camera.position.lerp(cameraTargetPos, 0.05);
        camera.updateMatrix();

        if (camera.position.distanceTo(cameraTargetPos) < 1) {
            fCameraGliding = false;
            controls.enabled = true;
        }
    }

    requestAnimationFrame(render);
    renderer.render(scene, camera);
}
render();
