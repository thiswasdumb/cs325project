import { setupPlayer } from './player.js';
import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';

export function createLevel2(renderer, scene, camera, nextLevelCallback) {
    // Clear previous scene
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }

    // Player inventory
    let inventory = 0;
    let portalActivated = false;

    // Set up the cave floor with varied shades of green and blue
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

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 100; // Spread particles within the cave
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
        transparent: true,
        opacity: 0.7,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);


    // Ambient light for a dim cave atmosphere
    const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
    scene.add(ambientLight);

    // Point light to simulate glowing crystals
    const pointLight = new THREE.PointLight(0x00ffff, 1.5, 50);
    pointLight.position.set(0, 20, 0);
    scene.add(pointLight);

    const loader = new GLTFLoader();

    // Load glowing crystals for decoration
    const generateDecorativeCrystals = async () => {
        const crystalModel = await new Promise((resolve, reject) => {
            loader.load('../assets/decorative_crystal.glb', (gltf) => resolve(gltf.scene), undefined, reject);
        });

        for (let i = 0; i < 20; i++) {
            const crystal = crystalModel.clone();
            crystal.position.set(
                Math.random() * 80 - 40,
                0.5,
                Math.random() * 80 - 40
            );
            crystal.scale.set(1.5, 1.5, 1.5);
            scene.add(crystal);
        }
    };

    // Create the crystal wall puzzle
    const createCrystalWall = () => {
        const crystalWall = new THREE.Group(); // Group to hold the crystals
        const crystalPositions = [-2, -1, 0, 1, 2]; // X positions for the 5 crystals
        const tones = [200, 300, 400, 500, 600]; // Frequencies for the ascending tones
        let playerSequence = []; // Stores the player's input sequence
        let correctSequence = [0, 1, 2, 3, 4]; // Correct order of tones

        crystalPositions.forEach((x, index) => {
            const crystal = new THREE.Mesh(
                new THREE.CylinderGeometry(0.5, 0.5, 2, 32),
                new THREE.MeshStandardMaterial({ color: 0x87ceeb, emissive: 0x87ceeb, emissiveIntensity: 0.5 })
            );
            crystal.position.set(x, 1, 0); // Position crystals along the wall
            crystalWall.add(crystal);

            // Add interaction to the crystal
            crystal.userData = { index }; // Store the crystal's index for reference
            crystal.addEventListener("click", () => {
                handleCrystalClick(index, tones[index], crystal);
            });
        });

        crystalWall.position.set(0, 0, -20); // Position the wall deeper in the cave
        scene.add(crystalWall);

        // Handle crystal click
        const handleCrystalClick = (index, tone, crystal) => {
            playTone(tone); // Play the sound associated with the crystal
            playerSequence.push(index); // Add the pressed crystal to the player's sequence

            // Glow effect when pressed
            crystal.material.emissiveIntensity = 1;
            setTimeout(() => {
                crystal.material.emissiveIntensity = 0.5;
            }, 300);

            // Check if the sequence is correct
            if (!isSequenceCorrect(playerSequence, correctSequence)) {
                console.log("Wrong order! Resetting...");
                resetCrystals();
            } else if (playerSequence.length === correctSequence.length) {
                console.log("Puzzle solved! Portal unlocked.");
                unlockPortal();
            }
        };

        // Create a rocky enclosed environment
        const createRockyEnvironment = () => {
            const environment = new THREE.Group(); // Group to hold all elements

            const roomRadius = 10; // Radius of the rooms
            const tunnelRadius = 9; // Radius of the connecting tunnel
            const tunnelLength = 30; // Length of the connecting tunnel
            const secondRoomRadius = 15; // Larger radius for the second room


            const rockTexture = new THREE.TextureLoader().load('assets/rock_texture.jpg');

            // Material for rocky walls
            const rockyMaterial = new THREE.MeshStandardMaterial({
                map: rockTexture,
                side: THREE.BackSide, // Render the inside of the geometry
                roughness: 1.0,
                metalness: 0.0,
            });

            // Create the starting room as a hemisphere
            const startRoomGeometry = new THREE.SphereGeometry(roomRadius, 32, 32, 0, Math.PI, 0, Math.PI / 2); // Correct theta and phi ranges
            const startRoom = new THREE.Mesh(startRoomGeometry, rockyMaterial);
            startRoom.position.set(0, 0, 0); // Center the room
            startRoom.rotation.y = Math.PI * -0.65; // Rotate the hemisphere to face the tunnel
            environment.add(startRoom);

            // Create the connecting tunnel
            const tunnelGeometry = new THREE.CylinderGeometry(tunnelRadius, tunnelRadius, tunnelLength, 32, 32, true);
            const tunnel = new THREE.Mesh(tunnelGeometry, rockyMaterial);
            tunnel.rotation.z = Math.PI / 2; // Align the tunnel horizontally
            tunnel.position.set(roomRadius, 0, 0); // Position it to connect with the hemisphere
            environment.add(tunnel);


            // Add glowing purple specks to the tunnel
            addPurpleSpecks(tunnel, tunnelRadius, tunnelLength, 30);

            // Create the second room (flipped and larger)
            const secondRoomGeometry = new THREE.SphereGeometry(secondRoomRadius, 32, 32, 0, Math.PI, 0, Math.PI / 2); // Correct theta and phi ranges
            const secondRoom = new THREE.Mesh(secondRoomGeometry, rockyMaterial);
            secondRoom.position.set(roomRadius + tunnelLength - 10, 0, 0); // Position it at the end of the tunnel
            secondRoom.rotation.y = Math.PI * 0.65; // Flip the hemisphere to face the tunnel
            environment.add(secondRoom);

            // Add glowing purple specks to the second room
            addPurpleSpecks(secondRoom, secondRoomRadius, secondRoomRadius * 2, 50);

            // Add the environment to the scene
            scene.add(environment);

            // Add collision detection
            const collidableMeshes = [startRoom, tunnel, secondRoom];
            const boundingBoxes = collidableMeshes.map((mesh) => {
                const box = new THREE.Box3().setFromObject(mesh); // Generate bounding box
                return box;
            });

            function checkCollision(playerPosition) {
                for (const box of boundingBoxes) {
                    if (box.containsPoint(playerPosition)) {
                        return true; // Collision detected
                    }
                }
                return false;
            }

            // Hook collision check into player movement
            const movePlayer = (player) => {
                const newPosition = player.position.clone(); // Simulate movement
                if (!checkCollision(newPosition)) {
                    player.position.copy(newPosition); // Allow movement if no collision
                } else {
                    console.log("Collision detected!");
                }
            };

            // Simulate the player movement in your game loop here
        };

        // Function to add glowing purple specks to walls
        const addPurpleSpecks = (parent, radius, length, count) => {
            const speckGeometry = new THREE.SphereGeometry(0.2, 8, 8);
            const speckMaterial = new THREE.MeshStandardMaterial({
                emissive: new THREE.Color(0x800080), // Purple glow
                emissiveIntensity: 2.0,
            });

            for (let i = 0; i < count; i++) {
                const speck = new THREE.Mesh(speckGeometry, speckMaterial);

                // Generate random position inside the geometry
                const theta = Math.random() * Math.PI * 2; // Angle around the radius
                const y = Math.random() * length - length / 2; // Position along the length
                const x = radius * Math.cos(theta);
                const z = radius * Math.sin(theta);

                speck.position.set(x, y, z);
                parent.add(speck);
            }
        };

        createRockyEnvironment();

        // Reset crystals if the player gets the sequence wrong
        const resetCrystals = () => {
            playerSequence = [];
            crystalWall.children.forEach((crystal) => {
                crystal.material.emissiveIntensity = 0.5;
            });
        };

        // Check if the player's sequence matches the correct sequence so far
        const isSequenceCorrect = (playerSequence, correctSequence) => {
            for (let i = 0; i < playerSequence.length; i++) {
                if (playerSequence[i] !== correctSequence[i]) return false;
            }
            return true;
        };

        // Play a tone when a crystal is pressed
        const playTone = (frequency) => {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator.connect(audioContext.destination);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3); // Short tone duration
        };

        // Unlock the portal when the puzzle is solved
        const unlockPortal = () => {
            portalActivated = true;
            portalFrame.material.color.set(0x00ff00); // Turn portal green
            console.log("Portal activated! Step on it to transition to Level 3.");
        };
    };

    // Portal frame for exiting the level
    let portalFrame;
    loader.load('assets/portalframe', (gltf) => {
        portalFrame = gltf.scene;
        portalFrame.position.set(0, 0.01, -25); // Deeper in the cave
        portalFrame.material = new THREE.MeshStandardMaterial({ color: 0x87ceeb });
        scene.add(portalFrame);
    });

    // Add puzzle logic
    createCrystalWall();
    generateDecorativeCrystals();

    const movePlayer = setupPlayer(camera);

    // Game loop
    function animate() {
        requestAnimationFrame(animate);
        movePlayer();
        renderer.render(scene, camera);
    }

    animate();
}
