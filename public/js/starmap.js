import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';

import StarMapAPI from './api.js';
const api = new StarMapAPI();

import MouseInput from './input.js';
const mouseInput = new MouseInput();

import SceneManager from './scenemgr.js';
const sceneManager = new SceneManager();

import GuiManager from './guimgr.js';
const guiManager = new GuiManager();

import StarManager from './starmgr.js';
const starManager = new StarManager();

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
    guiManager.showLoadingOverlay();

    const formData = new FormData();
    formData.append('file', file);
    api.post('upload-star-records', formData)
        .then((response) => {
            starManager.starRecords = response.data;
            sceneManager.clearMeshes();
            starManager.generateMeshes();
            sceneManager.addMeshes(starManager.meshes);
        })
        .catch((e) => {
            console.error(e);
        });
    
        guiManager.hideLoadingOverlay();
}

// Convert rgb values to hex
function rgbToHex(r, g, b) {
    let hex = (r << 16) + (g << 8) + b;
    return hex;
}

// Setup key input
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case ' ':
            sceneManager.controls.target.set(0, 0, 0);
            sceneManager.glideCameraToward(new THREE.Vector3(10, 50, 10));
            break;
        default:
            break;
    }
});

// Request sample star records and set up meshes in scene manager
guiManager.showLoadingOverlay();

const res = await api.get('example-star-records');
const exampleStarRecords = res.data;
starManager.starRecords = exampleStarRecords;

sceneManager.clearMeshes();
starManager.generateMeshes();
sceneManager.addMeshes(starManager.meshes);

guiManager.hideLoadingOverlay();


// Start render loop
function render() {
    // Update the scene
    sceneManager.update(guiManager.fMouseOnUiPanel);

    // Cast ray from screen to mouse cursor position
    sceneManager.raycast(mouseInput.cursor);

    // Update the gui
    guiManager.update(mouseInput.cursor, sceneManager.pointedObject);

    // Render frame
    requestAnimationFrame(render);
    sceneManager.render();
}
render();
