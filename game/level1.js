import { setupPlayer } from './player.js';
import * as THREE from '../node_modules/three/build/three.module.js';

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
    const fireflyMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 }); // Yellow light
    for (let i = 0; i < 20; i++) {
        const firefly = new THREE.Mesh(new THREE.SphereGeometry(0.2), fireflyMaterial);
        firefly.position.set(Math.random() * 80 - 40, Math.random() * 5 + 3, Math.random() * 80 - 40); // Random positions

        // Add light to the firefly
        const fireflyLight = new THREE.PointLight(0xffff00, 1, 10); // Yellow light with small radius
        fireflyLight.position.set(0, 0, 0); // Light follows firefly
        firefly.add(fireflyLight);
        scene.add(firefly);

        // Animate fireflies
        const speed = Math.random() * 0.02 + 0.01;
        const amplitude = Math.random() * 2 + 1;

        const updateFirefly = () => {
            firefly.position.y += Math.sin(Date.now() * speed) * amplitude * 0.001; // Up and down movement
            requestAnimationFrame(updateFirefly);
        };
        updateFirefly();
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
