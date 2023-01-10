import * as THREE from 'three';

const enumStarTypes = Object.freeze({
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

console.log(enumStarTypes);

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

export default StarManager;
export { enumStarTypes };