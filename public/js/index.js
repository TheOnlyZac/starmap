import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';

var DISABLE_LOADING_SCREEN = false;

//todo make not global
var pointedObject;

var enumStarTypes = Object.freeze({
	None: 0,
	GalacticCore: 1,
	BlackHole: 2,
	ProtoPlanetary: 3,
	StarG: 4, // Yellow star
	StarO: 5, // Blue star
	StarM: 6, // Red star
	BinaryOO: 7, // Binary O-O (blue-blue) star system
	BinaryOM: 8, // Binary O-M (blue-red) star system
	BinaryOG: 9, // Binary O-G (blue-yellow) star system
	BinaryGG: 10, // Binary G-G (yellow-yellow) star system
	BinaryGM: 11, // Binary G-M (yellow-red) star system
	BinaryMM: 12 // Binary M-M (red-red) star system
});

// Set up mouse input
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
const mouseInput = new MouseInput();

class SceneManager {
    constructor() {
        // Setup renderer
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        // Setup scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        
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
        this.scene.background = textureCube;

        // Setup camera + orbitcontrols
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.far = 3500
        this.camera.position.set(10, 50, 10);
        this.camera.updateProjectionMatrix();

        this.cameraTargetPos = new THREE.Vector2(); // set when camera needs to glide to a position
        this.fCameraGliding = false;

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.screenSpacePanning = false;

        // Set up raycasting
        this.raycaster = new THREE.Raycaster();
        this.fEnableRaycasting = true;
    
        // Bind event listeners
        this.bindEventListeners();
    }

    bindEventListeners() {
        window.addEventListener('resize', this.onResize.bind(this));
    }

    onResize(event) {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    
        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }

    // Add the given meshes to the scene
    addMeshes(meshes) {
        console.log('Populating scene with meshes...');
        meshes.forEach(mesh => {
            sceneManager.scene.add(mesh);
        });
        console.log('Done.');
    }

    // Smoothly move the camera to the given position
    glideCameraToward(position) {
        this.fCameraGliding = true;
        this.cameraTargetPos = position;
    }

    // Update scene objects
    update() {
        // Update camera controls
        this.controls.update();

        // Update camera matrix
        this.camera.updateMatrix();

        // Update camera position if gliding to target
        if (this.fCameraGliding) {
            // Disable camera controls while gliding
            this.controls.enabled = false;

            // Lerp camera position towards target
            this.camera.position.lerp(this.cameraTargetPos, 0.05);

            // Keep making controls target the target pos until done gliding
            //this.controls.target.set(this.cameraTargetPos.x, this.cameraTargetPos.y*2, this.cameraTargetPos.z);

            if (this.camera.position.distanceTo(this.cameraTargetPos) < 1) {
                // Done gliding, re-enable camera controls
                this.fCameraGliding = false;
                this.controls.enabled = true;
            }
        }
    }

    raycast() {
        // Cast ray from camera to pointer to detect stars
        if (!this.fEnableRaycasting) return;

        this.raycaster.setFromCamera(mouseInput.cursor, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, false);
    
        // Check if raycast hit a star
        if (intersects.length > 0) {
            pointedObject = intersects[0]
            let starName = pointedObject.object.userData.name;
    
            // Show tooltip with star name on mouseover
            //TODO decouple from GuiManager
            guiManager.tooltip.style.visibility = 'visible';
            guiManager.tooltip.style.left = (mouseInput.cursor.x + 1) / 2 * window.innerWidth + 5 + 'px';
            guiManager.tooltip.style.top = (-mouseInput.cursor.y + 1) / 2 * window.innerHeight - 30 + 'px';
            guiManager.tooltip.innerHTML = starName;
    
            document.body.style.cursor = 'help';
    
        } else {
            pointedObject = null;
            guiManager.tooltip.style.visibility = 'hidden';
            document.body.style.cursor = 'auto';
        }
    }

    // Render single frame
    render() {
        this.renderer.render(this.scene, this.camera);
    }
}
const sceneManager = new SceneManager();

class GuiManager {
    constructor() {
        this.fLoading = false;
        this.tLastSpinnerUpdate = 0; // time spinner was last updated

        this.tooltip = document.querySelector('#tooltip');
        
        this.propsPanel = document.querySelector('#properties-panel');
        this.propsPanel.style.visibility = 'hidden'; // start hidden

        // Disable raycasting while mouse is on ui panels
        //TODO decouple from sceneManager class
        document.querySelector('.panel').addEventListener('mouseover', (event) => {
            sceneManager.fEnableRaycasting = false;
        });

        document.querySelector('.panel').addEventListener('mouseleave', (event) => {
            sceneManager.fEnableRaycasting = true;
        });

        document.querySelector('#fullscreen-btn').addEventListener('click', (event) => {
            //todo: support moz and webkit fullscreen requests
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                document.documentElement.requestFullscreen();
            }
        });

        this.bindEventListeners();
    }

    bindEventListeners() {
        window.addEventListener('click', this.onClick.bind(this));
    }
    
    // Mouse click event handler
    onClick(event) {
        if (mouseInput.wasLongClick() | !mouseInput.wasStationaryClick())
            return; // abort if long click or mouse moved during click

        // Show props panel for star pointed at by mouse cursor
        if (pointedObject != null) {
            let starRecord = pointedObject.object.userData;
            document.querySelector('.value-name').innerHTML = starRecord.name;

            let subtitleElement = document.querySelector('.panel-subtitle');
            let subtitle;
            switch (starRecord.type) {
                case enumStarTypes.GalacticCore:
                    subtitle = "Supermassive black hole";
                    break;
                case enumStarTypes.BlackHole:
                    subtitle = "Black hole";
                    break;
                case enumStarTypes.ProtoPlanetary:
                    subtitle = "Proto-planetary disk";
                    break;
                case enumStarTypes.StarG:
                    subtitle = 'Yellow star system';
                    break;
                case enumStarTypes.StarO:
                    subtitle = 'Blue star system';
                    break;
                case enumStarTypes.StarM:
                    subtitle = 'Red star system';
                    break;
                case enumStarTypes.BinaryOO:
                    subtitle = 'Blue-blue binary system';
                    break;
                case enumStarTypes.BinaryOM:
                    subtitle = 'Blue-red binary system';
                    break;
                case enumStarTypes.BinaryOG:
                    subtitle = 'Blue-yellow binary system';
                    break;
                case enumStarTypes.BinaryGG:
                    subtitle = 'Yellow-yellow binary system';
                    break;
                case enumStarTypes.BinaryGM:
                    subtitle = 'Yellow-red binary system';
                    break;
                case enumStarTypes.BinaryMM:
                    subtitle = 'Red-red binary system';
                    break;
                default:
                    console.error("Unrecognized star type", starRecord.type);
                    subtitle = "Unknown star type";
            }
            subtitleElement.innerHTML = subtitle;

            document.querySelector('.value-posx').innerHTML = starRecord.position.x.toFixed(3);
            document.querySelector('.value-posy').innerHTML = starRecord.position.y.toFixed(3);
            document.querySelector('.value-posz').innerHTML = starRecord.position.z.toFixed(3);
            this.propsPanel.style.visibility = 'visible';

            /* todo: double click star to focus on it 
            if (mouseInput.wasDoubleClick() && !sceneManager.fCameraGliding) {
                // need to convert starrecord position to a three vec3 so the math is mathing
                let starPos = new THREE.Vector3(starRecord.position.x, starRecord.position.y * 2, starRecord.position.z)
                let offset = new THREE.Vector3(0, 10, 0);
                let target = starPos.add(offset);

                console.log(starRecord.position, target);

                //sceneManager.controls.target.set(starPos.x, starPos.y*2, starPos.z);
                sceneManager.glideCameraToward(target)
            } */
        } else {
            this.propsPanel.style.visibility = 'hidden';
        }
    };

    showLoadingOverlay() {
        let loadingOverlay = document.querySelector('#loading-overlay');
        let spinner = document.querySelector('#spinner');
        
        spinner.innerHTML = 'Loading';
        loadingOverlay.style.display = 'block';
        loadingOverlay.style.opacity = 1.0;
        this.fLoading = true;
    }

    hideLoadingOverlay() {
        this.fLoading = false;
        document.querySelector('#spinner').innerHTML = 'Ready!';
        
        let loadingOverlay = document.querySelector('#loading-overlay');
        setTimeout(() => {
            loadingOverlay.style.opacity = 0.0;
        }, 250);
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
        }, 1250);
    }

    update() {
        // Debug flag to disable the loading screen
        if (DISABLE_LOADING_SCREEN) {
            this.fLoading = false;
            document.querySelector('#loading-overlay').style.display = 'none';
        }

        // Update spinner text if loading
        if (!this.fLoading) return; // abort if not loading
        
        let now = new Date().getTime();
        let dtSpinnerUpdate = now - this.tLastSpinnerUpdate;
        
        if (dtSpinnerUpdate > 500) {
            this.tLastSpinnerUpdate = now;
            let spinner = document.querySelector('#spinner');
            switch (spinner.innerHTML) {
                case 'Loading':
                    spinner.innerHTML = 'Loading.';
                    break;
                case 'Loading.':
                    spinner.innerHTML = 'Loading..';
                    break;
                case 'Loading..':
                    spinner.innerHTML = 'Loading...';
                    break;
                default:
                    spinner.innerHTML = 'Loading.'
                    break;
            }
        }
    }
}
const guiManager = new GuiManager();

class StarManager {
    constructor() {
        this.starRecords = [];
        this.meshes = [];
    }
    
    // Generate a mesh for each star record
    generateMeshes() {
        console.log("Generating star meshes...");
        this.meshes = [];
    
        // Set up star points geometry
        let stars = [];
        this.starRecords.forEach(record => {
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

            this.meshes.push(mesh);
        });
    
        console.log("Done.");
    }
}
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
    const formData = new FormData();
    formData.append('file', file);

    fetch('/process-star-data', {
        method: 'POST',
        body: formData
    })
        .then((response) => response.json())
        .then((data) => {
            // Handle the response data as needed
            generateStarMeshes(data.data);
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
guiManager.fLoading = true;

const req = new XMLHttpRequest();
req.open('POST', 'example-star-records');
req.onload = function() {
    const response = JSON.parse(this.responseText);
    
    if (response.status == 'success') {
        const starRecords = response.data;

        starManager.starRecords = starRecords;
        starManager.generateMeshes();

        sceneManager.addMeshes(starManager.meshes);

        guiManager.hideLoadingOverlay();
    } else {
        window.alert('When requesting a copy of the sample star data, the server responded with the following status: ', response.status);
    }
};
req.send();

// Render the scene
function render() {
    // Update camera controls
    sceneManager.update();
    sceneManager.raycast();

    guiManager.update();

    requestAnimationFrame(render);
    sceneManager.render();
}
render();
