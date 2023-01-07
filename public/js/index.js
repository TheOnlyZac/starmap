import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';
import { FlyControls } from 'FlyControls';
import { SphereGeometry } from 'three';

// Handle uploading file to server when selected
document.addEventListener("DOMContentLoaded", function(event) {
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

function drawStarPoints(starRecords=[]) {
    console.log("Drawing star points");
    
    // Set up star points geometry
    let points = [];
    starRecords.forEach(record => {
        points.push(new THREE.Vector3(record.position.x, record.position.y, record.position.z));
    });

    const pointsMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF
    });
    const pointsGeometry = new THREE.SphereGeometry(0.4, 8, 8);

    points.forEach(point => {
        const sphere = new THREE.Mesh(pointsGeometry, pointsMaterial);
        sphere.position.set(point.x, point.z * 2, -point.y);
        scene.add(sphere);
    });

    console.log("done");
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
req.onload = function(){
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
    controls.update();

    requestAnimationFrame(render);
    renderer.render(scene, camera);
}
render();
