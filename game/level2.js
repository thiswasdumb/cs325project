import { setupPlayer } from './player.js';
import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';


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

    // Load and place music crystals
    const musicCrystals = [
        { model: '../assets/musiccrystal1', sound: '../assets/sounds/C4.mp3' },
        { model: '../assets/musiccrystal2', sound: '../assets/sounds/D4.mp3' },
        { model: '../assets/musiccrystal3', sound: '../assets/sounds/E4.mp3' },
        { model: '../assets/musiccrystal4', sound: '../assets/sounds/F4.mp3' },
        { model: '../assets/musiccrystal5', sound: '../assets/sounds/G4.mp3' }
    ];

    const crystalGroup = new THREE.Group(); // Group to hold all music crystals

    musicCrystals.forEach((crystalData, index) => {
        loader.load(
            crystalData.model,
            (gltf) => {
                const crystal = gltf.scene;

                // Position the crystals side by side at the end of the tunnel
                crystal.position.set(index * 1.5 + 40, 1, -50); // Adjust X for spacing
                crystal.scale.set(1.5, 1.5, 1.5);

                // Add neon blue light source to each crystal
                const crystalLight = new THREE.PointLight(0x00ffff, 1.5, 10); // Neon blue light
                crystalLight.position.set(0, 0.75, 0); // Light originates slightly above the crystal
                crystal.add(crystalLight);

                // Add click event listener to play the note
                crystal.userData = { note: crystalData.note }; // Store note in userData
                crystal.userData.clicked = false;
                crystal.addEventListener('click', () => {
                    if (!crystal.userData.clicked) {
                        const audio = new Audio(crystal.userData.sound); // Load the sound
                        audio.play(); // Play the sound
                        console.log(`Played sound: ${crystal.userData.sound}`);
                        crystal.userData.clicked = true;
                    }
                });

                crystalGroup.add(crystal); // Add to group
            },
            undefined,
            (error) => {
                console.error(`Error loading music crystal model (${crystalData.model}):`, error);
            }
        );
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

    // Set up the raycaster and mouse position
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseClick = (event) => {
        // Convert mouse position to normalized device coordinates
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Update the raycaster
        raycaster.setFromCamera(mouse, camera);

        // Check for intersections with the music crystals
        const intersects = raycaster.intersectObjects(crystalGroup.children, true);

        if (intersects.length > 0) {
            const clickedCrystal = intersects[0].object.parent; // Get the clicked crystal's parent (model group)

            if (!clickedCrystal.userData.clicked) {
                const audio = new Audio(clickedCrystal.userData.sound); // Load the sound
                audio.play(); // Play the sound
                console.log(`Played sound: ${clickedCrystal.userData.sound}`);
                clickedCrystal.userData.clicked = true; // Mark as clicked
            }
        }
    };

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
