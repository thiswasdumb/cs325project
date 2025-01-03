import { setupPlayer } from './player.js';
import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';

export function createLevel1(renderer, scene, camera, nextLevelCallback) {
    // Clear previous scene
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }

    // Player inventory for puzzle pieces
    let inventory = 0;

    // Set up the ground
    const planeGeometry = new THREE.PlaneGeometry(100, 100);
    const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 }); // Green ground
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);

    // Reduce ambient light for darkness
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1); // Very dim light
    scene.add(ambientLight);

    // Add fireflies with light sources
    const loader = new GLTFLoader();

    for (let i = 0; i < 20; i++) {
        loader.load('../assets/firefly', (gltf) => {
            const firefly = gltf.scene;

            // Randomly position the firefly in the scene
            firefly.position.set(
                Math.random() * 80 - 40, // X position
                Math.random() * 5 + 3,   // Y position (floating height)
                Math.random() * 80 - 40  // Z position
            );

            // Scale the firefly model (adjust if needed)
            firefly.scale.set(0.4, 0.4, 0.4);

            // Add random rotation in the x-direction
            firefly.rotation.x = Math.random() * Math.PI / 2; // Random rotation between 0 and 360 degrees

            // Add a light source to the bottom of the firefly
            const fireflyLight = new THREE.PointLight(0xffff00, 1, 13); // Yellow light with slightly smaller radius
            fireflyLight.position.set(0, -0.5, 0); // Move light slightly below the model
            firefly.add(fireflyLight); // Add the light to the firefly so it moves with it

            // Add the firefly to the scene
            scene.add(firefly);

            // Animate fireflies to float up and down with bigger bobbing
            const speed = Math.random() * 0.02; // Random speed
            const amplitude = Math.random() * 0.5;   // Increased amplitude for bigger bobbing

            const initialY = firefly.position.y; // Store the initial Y position

            const updateFirefly = () => {
                // Make the firefly float up and down with a bigger amplitude
                firefly.position.y = initialY + Math.sin(Date.now() * speed) * amplitude * 0.5;
                requestAnimationFrame(updateFirefly); // Recursive animation
            };
            updateFirefly();
        },
            undefined,
            (error) => {
                console.error('An error occurred while loading the firefly model:', error);
            });
    }


    // Portal and slots
    const portal = new THREE.Mesh(new THREE.CircleGeometry(5, 32), new THREE.MeshBasicMaterial({ color: 0x0000ff })); // Blue portal
    portal.rotation.x = -Math.PI / 2;
    portal.position.set(0, 0.01, 0);
    scene.add(portal);

    const slots = [];
    const slotPieces = [];
    for (let i = 0; i < 4; i++) {
        const slot = new THREE.Mesh(new THREE.CircleGeometry(1, 32), new THREE.MeshBasicMaterial({ color: 0x808080 })); // Gray slots
        slot.rotation.x = -Math.PI / 2;
        const angle = (i / 4) * Math.PI * 2;
        slot.position.set(Math.cos(angle) * 6, 0.02, Math.sin(angle) * 6);
        scene.add(slot);
        slots.push(slot);

        const slotPiece = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0x000000 })); // Initially black
        slotPiece.visible = false; // Hidden initially
        slotPiece.position.set(slot.position.x, 1, slot.position.z);
        scene.add(slotPiece);
        slotPieces.push(slotPiece);
    }

    // Create puzzle pieces
    const puzzlePieces = [];
    const puzzleMaterial = new THREE.MeshStandardMaterial({ color: 0x87ceeb, emissive: 0x87ceeb });
    for (let i = 0; i < 4; i++) {
        const piece = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), puzzleMaterial);
        piece.position.set(Math.random() * 80 - 40, 1, Math.random() * 80 - 40);
        scene.add(piece);
        puzzlePieces.push(piece);
    }

    // Add trees as walls
    const treeMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 }); // Brown trunks
    const portalRadius = 5;
    for (let x = -40; x <= 40; x += 5) {
        for (let z = -40; z <= 40; z += 5) {
            const distanceToPortal = Math.sqrt((x - portal.position.x) ** 2 + (z - portal.position.z) ** 2);
            if (distanceToPortal < portalRadius + 2) {
                continue; // Skip placing trees too close to the portal
            }

            if (Math.random() > 0.7) { // Randomly skip some to create paths
                const tree = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 10), treeMaterial);
                tree.position.set(x, 5, z); // Trees are 10 units tall
                scene.add(tree);
            }
        }
    }

    let portalActivated = false;

    // Handle puzzle piece collection
    function collectPuzzlePieces() {
        const playerPosition = camera.position;

        // Check if player collects a puzzle piece
        puzzlePieces.forEach((piece, index) => {
            if (piece && piece.position.distanceTo(playerPosition) < 2) {
                scene.remove(piece);
                puzzlePieces[index] = null;
                inventory++;
                console.log(`Collected piece ${index + 1}. Inventory: ${inventory}/4`);
            }
        });

        // Show collected pieces in slots
        if (inventory === 4 && !portalActivated) {
            console.log("All pieces collected! Placing in slots...");
            slotPieces.forEach((slotPiece, index) => {
                slotPiece.visible = true; // Make slot pieces visible
                slotPiece.material.color.set(0x87ceeb); // Set to puzzle piece color
            });
        }

        // Activate portal if player is near and all pieces are collected
        if (inventory === 4 && playerPosition.distanceTo(portal.position) < 6 && !portalActivated) {
            portal.material.color.set(0x00ff00); // Turn portal green
            console.log("Portal activated! Step on it to transition to Level 2.");
            portalActivated = true;
        }

        // Check if player steps on the portal
        if (portalActivated && playerPosition.distanceTo(portal.position) < 5) {
            console.log("Stepping on the portal! Transitioning to Level 2...");
            nextLevelCallback(); // Transition to Level 2
        }
    }

    // Player controls
    const movePlayer = setupPlayer(camera);

    // Game loop
    function animate() {
        requestAnimationFrame(animate);
        movePlayer();
        collectPuzzlePieces();
        renderer.render(scene, camera);
    }

    animate();
}
