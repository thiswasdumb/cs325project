import * as THREE from '../node_modules/three/build/three.module.js';

export function setupPlayer(camera) {
    const keysPressed = {};
    let pitch = 0; // Up/Down rotation (rotation.x)
    let yaw = 0;   // Left/Right rotation (rotation.y)
    const groundLevel = 2; // Fixed height for the player above the ground

    // Track key presses for WASD movement
    document.addEventListener('keydown', (event) => {
        keysPressed[event.key.toLowerCase()] = true;
    });

    document.addEventListener('keyup', (event) => {
        keysPressed[event.key.toLowerCase()] = false;
    });

    // Enable pointer lock for unlimited mouse movement
    document.body.addEventListener('click', () => {
        document.body.requestPointerLock();
    });

    // Mouse movement to adjust camera orientation
    document.addEventListener('mousemove', (event) => {
        if (document.pointerLockElement === document.body) {
            const sensitivity = 0.002; // Adjust to control turning speed
            yaw -= event.movementX * sensitivity; // Left/right movement
            pitch -= event.movementY * sensitivity; // Up/down movement

            // Clamp pitch to prevent looking too far up or down
            pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
        }
    });

    // Update camera orientation
    function updateCameraOrientation() {
        camera.rotation.set(pitch, yaw, 0); // Set roll (z-axis rotation) to 0
    }

    // Move the camera using WASD keys
    function movePlayer() {
        const speed = 0.1; // Movement speed
        const direction = new THREE.Vector3();

        // Forward/Backward
        if (keysPressed['w']) direction.z -= speed;
        if (keysPressed['s']) direction.z += speed;

        // Left/Right
        if (keysPressed['a']) direction.x -= speed;
        if (keysPressed['d']) direction.x += speed;

        // Apply movement direction relative to the camera's orientation
        direction.applyEuler(camera.rotation);
        camera.position.add(direction);

        // Keep the player on the ground
        camera.position.y = groundLevel;
    }

    return function update() {
        movePlayer();
        updateCameraOrientation();
    };
}
