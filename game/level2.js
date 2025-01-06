import { setupPlayer } from './player.js';
import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
import { EventDispatcher } from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';

// Initialize a Map to track sounds
const soundMap = new Map();

export function createLevel2(renderer, scene, camera, nextLevelCallback) {
    // Clear previous scene
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }

    // Set up the cave floor
    const planeGeometry = new THREE.PlaneGeometry(100, 100, 50, 50);
    for (let i = 0; i < planeGeometry.attributes.position.count; i++) {
        const vertex = planeGeometry.attributes.position.array;
        vertex[i * 3 + 2] += Math.random() * 1.0 - 0.5; // Add height variation
    }
    planeGeometry.attributes.position.needsUpdate = true;

    const planeMaterial = new THREE.MeshStandardMaterial({
        vertexColors: true,
        metalness: 0.0,
        roughness: 1.0,
    });

    // Add colors to the cave floor
    const colors = [];
    for (let i = 0; i < planeGeometry.attributes.position.count; i++) {
        const shade = Math.random() * 0.3 + 0.3; // Shades between 0.3 and 0.6
        colors.push(0, shade, Math.random() * 0.3 + 0.2); // Green-blue shades
    }
    planeGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const caveFloor = new THREE.Mesh(planeGeometry, planeMaterial);
    caveFloor.rotation.x = -Math.PI / 2;
    scene.add(caveFloor);

    // Ambient light for a dim cave atmosphere
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const loader = new GLTFLoader();

    // Set up the raycaster and mouse position
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Load and place music crystals
    const musicCrystals = [
        { model: '../assets/musiccrystal1', sound: '../assets/sounds/C4.mp3' },
        { model: '../assets/musiccrystal2', sound: '../assets/sounds/D4.mp3' },
        { model: '../assets/musiccrystal3', sound: '../assets/sounds/E4.mp3' },
        { model: '../assets/musiccrystal4', sound: '../assets/sounds/F4.mp3' },
        { model: '../assets/musiccrystal5', sound: '../assets/sounds/G4.mp3' }
    ];

    // Track player's click sequence
    let playerClickOrder = [];
    const correctOrder = ['C4', 'D4', 'E4', 'F4', 'G4']; // Ascending order of notes

    const crystalGroup = new THREE.Group(); // Group to hold all music crystals
    function handleMouseClick(event) {
        // Convert mouse position to normalized device coordinates
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Update the raycaster
        raycaster.setFromCamera(mouse, camera);

        // Check for intersections
        const intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects.length > 0) {
            let clickedObject = intersects[0].object;

            // Traverse up the parent hierarchy to find a mapped object
            while (clickedObject && !soundMap.has(clickedObject)) {
                clickedObject = clickedObject.parent;
            }

            if (clickedObject && soundMap.has(clickedObject)) {
                const soundPath = soundMap.get(clickedObject);
                const audio = new Audio(soundPath);
                audio.play();

                const note = soundPath.match(/\/(\w+)\.mp3$/)[1]; // Extract note (e.g., "C4" from "../assets/sounds/C4.mp3")
                console.log(`Played sound: ${note}`);

                // Check order
                if (note === correctOrder[playerClickOrder.length]) {
                    playerClickOrder.push(note);
                    console.log(`Correct click! Current sequence: ${playerClickOrder.join(', ')}`);
                    if (playerClickOrder.length === correctOrder.length) {
                        console.log("You solved the puzzle!");
                        alert("Congratulations! You solved the puzzle!");
                    }
                } else {
                    console.log("Incorrect click. Resetting...");
                    playerClickOrder = []; // Reset progress
                }
            } else {
                console.log('Clicked object is not mapped to a sound.');
            }
        } else {
            console.log('No object clicked.');
        }
    } w


    window.addEventListener('click', handleMouseClick);

    musicCrystals.sort(() => Math.random() - 0.5);

    musicCrystals.forEach((crystalData, index) => {
        loader.load(
            crystalData.model,
            (gltf) => {
                const crystal = gltf.scene;

                // Add sound mapping
                soundMap.set(crystal, crystalData.sound);

                // Position and scale the crystal
                crystal.position.set(index * 1.5 + 40, 1, -50);
                crystal.scale.set(1.5, 1.5, 1.5);

                // Add neon blue light source
                const crystalLight = new THREE.PointLight(0x00ffff, 1.5, 10);
                crystalLight.position.set(0, 1.5, 0);
                crystal.add(crystalLight);

                // Add crystal to the group
                crystalGroup.add(crystal);
            },
            undefined,
            (error) => {
                console.error(`Error loading model ${crystalData.model}:`, error);
            }
        );
    });

    const intersectableObjects = [];
    crystalGroup.traverse((child) => {
        if (child.isMesh) {
            intersectableObjects.push(child);
        }
    });


    crystalGroup.position.set(95, 0, 43); // Position the group at the end of the tunnel
    crystalGroup.rotation.y = Math.PI / 2; // Rotate 90 degrees in the X direction

    scene.add(crystalGroup);

    // Purple crystals generator
    function addPurpleCrystals(parent, count, radius, length, isTunnel = false) {
        const crystalPaths = ['../assets/crystal1', '../assets/crystal2', '../assets/crystal3'];
        const crystalModels = [];

        // Preload all crystal models
        const preloadPromises = crystalPaths.map((path) =>
            new Promise((resolve, reject) => {
                loader.load(
                    path,
                    (gltf) => resolve(gltf.scene),
                    undefined,
                    (error) => reject(`Error loading ${path}: ${error}`)
                );
            })
        );

        Promise.all(preloadPromises)
            .then((loadedModels) => {
                crystalModels.push(...loadedModels);

                for (let i = 0; i < count; i++) {
                    const randomModel = crystalModels[Math.floor(Math.random() * crystalModels.length)].clone();

                    let x, y, z;
                    if (isTunnel) {
                        // Position along the walls of the tunnel
                        const theta = Math.random() * Math.PI * 2; // Random angle around the tunnel
                        x = radius * Math.cos(theta); // X on the circular wall
                        z = radius * Math.sin(theta); // Z on the circular wall
                        y = Math.random() * length - length / 2; // Spread along the tunnel's length
                    } else {
                        // Position along the walls of the room (hemisphere)
                        const phi = Math.random() * Math.PI; // Random polar angle
                        const theta = Math.random() * Math.PI * 2; // Random azimuthal angle
                        x = radius * Math.sin(phi) * Math.cos(theta);
                        y = radius * Math.sin(phi) * Math.sin(theta);
                        z = radius * Math.cos(phi);
                    }

                    randomModel.position.set(x, y, z);

                    // Random rotation for the crystals
                    randomModel.rotation.x = Math.random() * Math.PI * 2;
                    randomModel.rotation.y = Math.random() * Math.PI * 2;
                    randomModel.rotation.z = Math.random() * Math.PI * 2;

                    // Add a light source to each crystal
                    const crystalLight = new THREE.PointLight(0x800080, 2, 10); // Soft purple light
                    crystalLight.position.set(0, 0.5, 0); // Slightly above the crystal's tip
                    randomModel.add(crystalLight);

                    // Add the crystal to the parent
                    parent.add(randomModel);
                }
            })
            .catch((error) => console.error('Error preloading models:', error));
    }

    // Create a rocky enclosed environment
    const createRockyEnvironment = () => {
        const environment = new THREE.Group(); // Group to hold all elements

        const roomRadius = 10; // Radius of the rooms
        const tunnelRadius = 8.5; // Radius of the connecting tunnel
        const tunnelLength = 60; // Length of the connecting tunnel

        function createBumpyMaterial(color) {
            return new THREE.MeshStandardMaterial({
                color: color,
                side: THREE.BackSide, // Render the inside of the geometry
                roughness: 1.0, // Fully rough for rocky look
                metalness: 0.0, // No metallic shine
            });
        }

        // Material for rocky walls
        const rockyMaterial = createBumpyMaterial(0x808080); // Grey rocky material

        // Add procedural bumpiness to a geometry
        function addBumpiness(geometry, intensity = 0.5) {
            for (let i = 0; i < geometry.attributes.position.count; i++) {
                const vertex = geometry.attributes.position.array;
                const noise = (Math.random() - 0.5) * intensity; // Adjust intensity for more/less bumpiness
                vertex[i * 3] += noise; // X
                vertex[i * 3 + 1] += noise; // Y
                vertex[i * 3 + 2] += noise; // Z
            }
            geometry.attributes.position.needsUpdate = true; // Notify Three.js of changes
        }

        // Create the starting room as a hemisphere
        const startRoomGeometry = new THREE.SphereGeometry(roomRadius, 32, 32, 0, Math.PI * 0.8, 0, Math.PI / 2);
        addBumpiness(startRoomGeometry, 0.4); // Add bumpiness to the starting room
        const startRoom = new THREE.Mesh(startRoomGeometry, rockyMaterial);
        startRoom.position.set(0, 0, 0); // Center the room
        startRoom.rotation.y = Math.PI * -0.45; // Rotate the hemisphere to face the tunnel
        environment.add(startRoom);

        // Add purple crystals to the start room
        //addPurpleCrystals(startRoom, 15, roomRadius, null, false); // Crystals only on the hemisphere walls

        // Create the connecting tunnel
        const tunnelGeometry = new THREE.CylinderGeometry(
            tunnelRadius,
            tunnelRadius,
            tunnelLength,
            32,
            32,
            true
        );
        addBumpiness(tunnelGeometry, 0.8); // Add bumpiness to the tunnel
        const tunnel = new THREE.Mesh(tunnelGeometry, rockyMaterial);
        tunnel.rotation.z = Math.PI / 2; // Align the tunnel horizontally
        tunnel.position.set(roomRadius + 10, 0, 0); // Position it to connect with the hemisphere
        environment.add(tunnel);

        // Add purple crystals to the tunnel
        //addPurpleCrystals(tunnel, 60, tunnelRadius, tunnelLength, true); // Crystals on the tunnel walls

        // Add the environment to the scene
        scene.add(environment);
    };

    createRockyEnvironment();

    // Add the mouse click event listener
    window.addEventListener('click', handleMouseClick);

    // Player movement
    const movePlayer = setupPlayer(camera);

    // Game loop
    function animate() {
        requestAnimationFrame(animate);
        movePlayer();
        renderer.render(scene, camera);
    }

    animate();
}
