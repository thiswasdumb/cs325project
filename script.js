import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { createMenu } from './game/menu.js';
import { createLevel1 } from './game/level1.js';
//import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';

console.log(THREE);
//console.log(GLTFLoader);

// Basic Setup
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Start the Game
function startGame() {
    createLevel1(renderer, scene, camera, () => {
        alert("You completed Level 1! Add a transition to Level 2 here.");
    });
}

// Show the Menu
createMenu(startGame);
