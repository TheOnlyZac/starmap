import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';

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
        this.pointedObject = null;
    
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
            this.scene.add(mesh);
        });
        console.log('Done.');
    }

    // Clears all meshes from the scene
    clearMeshes() {
        console.log('Clearing all meshes from scene...');
        for (let i = this.scene.children.length - 1; i >= 0; i--) {
            let child = this.scene.children[i];
            if(child.type === "Mesh") {
                child.geometry.dispose();
                child.material.dispose();
                this.scene.remove(child);
            }
        }
        console.log('Done.');
    }

    // Smoothly move the camera to the given position
    glideCameraToward(position) {
        this.fCameraGliding = true;
        this.cameraTargetPos = position;
    }

    // Update scene objects
    update(fMouseOnUiPanel) {
        // Update camera controls
        this.controls.update();

        // Update camera matrix
        this.camera.updateMatrix();

        // Disable raycasting if mouse is on a UI panel
        if (fMouseOnUiPanel) {
            this.fEnableRaycasting = false;
        } else {
            this.fEnableRaycasting = true;
        }

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

    raycast(cursor) {
        // Cast ray from camera to pointer to detect stars
        if (!this.fEnableRaycasting) return;

        this.raycaster.setFromCamera(cursor, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, false);
    
        // Check if raycast hit a star
        if (intersects.length > 0) {
            this.pointedObject = intersects[0]
    
        } else {
            this.pointedObject = null;
        }
    }

    // Render single frame
    render() {
        this.renderer.render(this.scene, this.camera);
    }
}

export default SceneManager;
