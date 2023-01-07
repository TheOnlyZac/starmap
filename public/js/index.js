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

        uploadStarRecordsFile(file)
    });
});

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

function drawStarPoints(starRecords = []) {
    console.log("Drawing star points");

    // Set up star points geometry
    let stars = [];
    starRecords.forEach(record => {
        let position = new THREE.Vector3(record.position.x, record.position.y, record.position.z);
        stars.push({
            name: record.name,
            position: position,
            type: record.type
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
        const mesh = new THREE.Mesh(starGeometry, material);
        mesh.position.set(star.position.x, star.position.z * 2, -star.position.y);
        mesh.userData = { name: star.name };
        scene.add(mesh);
    });

    console.log("done");
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
camera.position.x = 500;
camera.position.y = 400;
camera.position.z = 500;
camera.updateProjectionMatrix();

var controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.screenSpacePanning = false;

var raycaster = new THREE.Raycaster();
var tooltip = document.querySelector('#tooltip');

const pointer = new THREE.Vector2();
document.addEventListener('mousemove', onPointerMove);

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

    if (intersects.length > 0) {
        let starName = intersects[0].object.userData.name;

        tooltip.style.visibility = 'visible';
        tooltip.style.left = (pointer.x + 1) / 2 * window.innerWidth + 5 + 'px';
        tooltip.style.top = (-pointer.y + 1) / 2 * window.innerHeight - 30 + 'px';
        tooltip.innerHTML = starName;
    } else {
        tooltip.style.visibility = 'hidden';
    }

    requestAnimationFrame(render);
    renderer.render(scene, camera);
}
render();
