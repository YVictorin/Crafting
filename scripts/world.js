import * as THREE from 'three';
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js';
import { RNG } from './rng';
import { blocks, resources } from './blocks';

const geometry = new THREE.BoxGeometry();


export class World extends THREE.Group {
    /**
     * @type {{
     * id: number,
     * instanceId: number
     * [][][]}}
     */
    data = [];

    params = {
        seed: 0,
        terrain: {
            scale:30,
            magnitude: 0.5,
            offset: 0.2
        }
    };

    constructor(size ={ width: 64, height: 32 }) {
     super();
     this.size = size;
    }
    /* Generates all the world data and meshes
    */
    generate(){
        const rng = new RNG(this.params.seed);
        this.initializeTerrain();
        this.generateResources(rng);
        this.generateTerrain(rng);
        this.generateMeshes();
    }
    /**
     * Initializing the world terrain data
     */
    initializeTerrain(){
        this.data = [];
        for(let x = 0; x < this.size.width; x++){
            const slice = [];
            for (let y = 0;  y < this.size.height; y ++){
                const row = [];
                for (let z = 0; z < this.size.width; z++){
                    row.push({
                        id: blocks.empty.id,
                        instanceId: null
                    });
                }
                slice.push(row);
            }
            this.data.push(slice);
        }
    }
    /** 
     * Generates the resources(coal, dirt, etc.)
     */

    generateResources(rng){
        const simplex = new SimplexNoise(rng);
        resources.forEach(resource => {
        for (let x = 0; x < this.size.width; x++){
            for (let y = 0; y < this.size.height; y++){
                for (let z = 0; z < this.size.width; z++){
                    const value = simplex.noise3d(
                    x / resource.scale.x, 
                    y / resource.scale.y, 
                    z / resource.scale.z);
                    if (value > blocks.stone.scarcity) {
                        this.setBlockId(x, y, z, blocks.stone.id);
                    }
                
                }
            
            }
        }
    });
    }


    /**
     * Generates the terrain data for the world using simplex noise
     */

    generateTerrain(rng){
        const simplex = new SimplexNoise(rng);
        for (let x = 0; x < this.size.width; x++) {
            for (let z = 0; z < this.size.width; z++) {
              
               // Creates terrain that is affected by noise 
                const value = simplex.noise(
                    x / this.params.terrain.scale,
                    z / this.params.terrain.scale
                    );

                //Scale the noise based on the magnitude and offset
                const scaledNoise = this.params.terrain.offset +
                 this.params.terrain.magnitude * value;
                    
                //Find the height of the terrain at its x, z location
                 let height = Math.floor(this.size.height * scaledNoise);
                
                 //Clamping height between 0 and the max height
                 height = Math.max(0, Math.min(height, this.size.height - 1));

                 //Fill in all the blocks at or below the terrain height
                 for (let y = 0; y <= this.size.height; y++){
                  if (y < height && this.getBlock(x, y, z).id === blocks.empty.id) {
                    this.setBlockId(x, y, z, blocks.dirt.id);
                  } else if(y === height) {
                    this.setBlockId(x, y, z, blocks.grass.id)
                  } else if (y > height){
                    this.setBlockId(x, y, z, blocks.empty.id);
                  }
                 }
            }
        }
    }
    /**
     * Generates the 3D version of the world from the world data
     */
    generateMeshes(){
        this.clear();
        const maxCount = this.size.width * this.size.width * this.size.height;
        const mesh = new THREE.InstancedMesh(geometry, material, maxCount)
        mesh.count = 0;

        const matrix = new THREE.Matrix4();
        for (let x = 0; x < this.size.width; x++) {
            for (let y = 0; y < this.size.height; y++) {
                for (let z = 0 ; z < this.size.width; z++){
                    const blockId = this.getBlock(x,y,z).id;
                    const blockType = Object.values(blocks).find(x => x.id === blockId)
                    const instanceId = mesh.count;

                    if (blockId != blocks.empty.id && !this.isBlockObscured(x, y, z)){
                    matrix.setPosition(x + 0.5, y + 0.5, z + 0.5);
                    mesh.setMatrixAt(mesh.count++, matrix);
                    mesh.setColorAt(instanceId, new THREE.Color(blockType.color));
                    this.setBlockInstanceId(x,y,z,instanceId);
                    mesh.count++;

                }
            }
        }
    }
    this.add(mesh);
    }


  
//Some Helper methods below!


/**
 * Gets the block data at (x, y, z)
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @returns {{id: number, instanceId: number}}
 */

getBlock(x, y, z) {
    if (this.inBounds(x, y, z)) {
        return this.data[x][y][z]
    } else {
        return null;
    }
}


/**
 * Sets the block data at (x, y, z)
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} id
 */
setBlockId(x, y, z, id){
    if (this.inBounds(x, y, z)) {
        this.data[x][y][z].id = id;
    }
}

/**
 * Sets the block instance id for a block at (x, y, z)
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} instanceId
 */

setBlockInstanceId(x, y, z, instanceId) {
    if(this.inBounds(x, y, z)){
        this.data[x][y][z].instanceId = instanceId;
    }
}


/**
 * Checks if the (x,y,z) coordirnates are in bounds
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @returns {boolean}
 */
inBounds(x, y, z) {
    if (x >= 0 && x < this.size.width &&
       y >= 0 && y < this.size.height &&
       z >=0 && z < this.size.width) {
        return true;
       } else { 
        return false;
       }
    }


    /**
     * Returns true if the block is completely obsurced
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     * @returns {boolean}
     */
    isBlockObscured(x, y, z) {
        const up = this.getBlock(x, y + 1, z)?.id ?? blocks.empty.id;
        const down = this.getBlock(x, y - 1, z)?.id ?? blocks.empty.id;
        const left = this.getBlock(x + 1, y , z)?.id ?? blocks.empty.id;
        const right = this.getBlock(x - 1, y , z)?.id ?? blocks.empty.id;
        const foward = this.getBlock(x, y , z + 1)?.id ?? blocks.empty.id;
        const back = this.getBlock(x, y , z - 1)?.id ?? blocks.empty.id;

        if(up == blocks.empty.id ||
           down == blocks.empty.id ||
           left == blocks.empty.id ||
           right == blocks.empty.id ||
           foward == blocks.empty.id ||
           back == blocks.empty.id ){
            return false;
           } else {
            return true;
           }
    }

}

