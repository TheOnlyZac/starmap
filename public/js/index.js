import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';

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
            console.log(data);
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
    console.log("Drawing star points");

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
}

// Pointer move event listener
function onPointerMove(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
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

// Resize renderer on window resize
window.addEventListener('resize', (event) => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
});

var controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.screenSpacePanning = false;

var raycaster = new THREE.Raycaster();
var tooltip = document.querySelector('#tooltip');

const pointer = new THREE.Vector2();
document.addEventListener('mousemove', onPointerMove);

// Track star pointed at by mouse cursor and show props panel on click
let pointedObject;
window.addEventListener('click', (event) => {
    if (pointedObject != null) {
        let starRecord = pointedObject.object.userData;
        document.querySelector('.value-name').innerHTML = starRecord.name;
        document.querySelector('.value-posx').innerHTML = starRecord.position.x.toFixed(3);
        document.querySelector('.value-posy').innerHTML = starRecord.position.y.toFixed(3);
        document.querySelector('.value-posz').innerHTML = starRecord.position.z.toFixed(3);
        document.querySelector('.value-type').innerHTML = starRecord.type;
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
    console.log(response);
    if (response.status == 'success') {
        drawStarPoints(response.data);
    }
};
req.open('POST', 'example-star-records');
req.send();

// Render the scene
function render() {
    // Update camera controls
    controls.update();

    // Cast ray from camera
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children, false);

    // Check if raycast hit a star
    if (intersects.length > 0) {
        pointedObject = intersects[0]
        let starName = pointedObject.object.userData.name;

        // Show tooltip with star name on mouseover
        tooltip.style.visibility = 'visible';
        tooltip.style.left = (pointer.x + 1) / 2 * window.innerWidth + 5 + 'px';
        tooltip.style.top = (-pointer.y + 1) / 2 * window.innerHeight - 30 + 'px';
        tooltip.innerHTML = starName;

        document.body.style.cursor = 'help';

    } else {
        pointedObject = null;
        tooltip.style.visibility = 'hidden';
        document.body.style.cursor = 'auto';
    }

    requestAnimationFrame(render);
    renderer.render(scene, camera);
}
render();
