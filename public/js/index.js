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

        processStarRecords(file)
    });
});

function processStarRecords(file) {
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
    const pointsGeometry = new THREE.SphereGeometry(0.3, 8, 8);

    points.forEach(point => {
        const sphere = new THREE.Mesh(pointsGeometry, pointsMaterial);
        sphere.position.set(point.x, point.z, -point.y);
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
camera.far = 1

camera.position.x = 200;
camera.position.y = 200;
camera.position.z = 200;
camera.lookAt(0, 0, 0);

var controls = new OrbitControls(camera, renderer.domElement);

// Add test cube at origin
/* const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
var cube = new THREE.Mesh(cubeGeometry, material);
scene.add(cube); */

// Request sample star data from server
var req = new XMLHttpRequest();
req.onload = function(){
    console.log(this.responseText);
};
req.open('POST', 'example-star-records');
req.send();

// Render the scene
function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}
render();
