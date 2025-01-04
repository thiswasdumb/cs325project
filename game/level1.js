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

    const loader = new GLTFLoader();
    let fireflyModel = null;
    let treeModel = null;

    // Load models
    const loadModels = async () => {
        fireflyModel = await new Promise((resolve, reject) => {
            loader.load('../assets/firefly', (gltf) => resolve(gltf.scene), undefined, reject);
        });

        treeModel = await new Promise((resolve, reject) => {
            loader.load('../assets/tree', (gltf) => resolve(gltf.scene), undefined, reject);
        });

        generateFireflies();
        generateTrees();
    };

    // Generate fireflies
    const generateFireflies = () => {
        for (let i = 0; i < 40; i++) {
            const firefly = fireflyModel.clone();
            firefly.position.set(
                Math.random() * 80 - 40,
                Math.random() * 2.5 + 2,
                Math.random() * 80 - 40
            );
            firefly.scale.set(0.4, 0.4, 0.4);
            firefly.rotation.x = Math.random() * Math.PI / 2;

            const fireflyLight = new THREE.PointLight(0xffff00, 1, 13);
            fireflyLight.position.set(0, -0.5, 0);
            firefly.add(fireflyLight);

            scene.add(firefly);

            const speed = Math.random() * 0.005;
            const amplitude = Math.random() * 0.25;
            const initialY = firefly.position.y;

            const updateFirefly = () => {
                firefly.position.y = initialY + Math.sin(Date.now() * speed) * amplitude;
                requestAnimationFrame(updateFirefly);
            };
            updateFirefly();
        }
    };

    // Generate trees
    const generateTrees = () => {
        const portalRadius = 5;
        for (let x = -40; x <= 40; x += 7.5) {
            for (let z = -40; z <= 40; z += 7.5) {
                const distanceToPortal = Math.sqrt((x - portal.position.x) ** 2 + (z - portal.position.z) ** 2);
                if (distanceToPortal < portalRadius + 2 || Math.random() > 0.7) continue;

                const tree = treeModel.clone();
                tree.position.set(x, 0, z);
                tree.scale.set(2, 2, 2);
                tree.rotation.y = Math.random() * Math.PI * 2;

                scene.add(tree);
            }
        }
    };

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

    let portalActivated = false;

    // Handle puzzle piece collection
    function collectPuzzlePieces() {
        const playerPosition = camera.position;

        puzzlePieces.forEach((piece, index) => {
            if (piece && piece.position.distanceTo(playerPosition) < 2) {
                scene.remove(piece);
                puzzlePieces[index] = null;
                inventory++;
                console.log(`Collected piece ${index + 1}. Inventory: ${inventory}/4`);
            }
        });

        if (inventory === 4 && !portalActivated) {
            console.log("All pieces collected! Placing in slots...");
            slotPieces.forEach((slotPiece, index) => {
                slotPiece.visible = true;
                slotPiece.material.color.set(0x87ceeb);
            });
        }

        if (inventory === 4 && playerPosition.distanceTo(portal.position) < 6 && !portalActivated) {
            portal.material.color.set(0x00ff00);
            console.log("Portal activated! Step on it to transition to Level 2.");
            portalActivated = true;
        }

        if (portalActivated && playerPosition.distanceTo(portal.position) < 5) {
            console.log("Stepping on the portal! Transitioning to Level 2...");
            nextLevelCallback();
        }
    }

    const movePlayer = setupPlayer(camera);

    // Game loop
    function animate() {
        requestAnimationFrame(animate);
        movePlayer();
        collectPuzzlePieces();
        renderer.render(scene, camera);
    }

    animate();

    // Start loading models
    loadModels();
}
