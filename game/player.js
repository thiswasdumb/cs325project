import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js'

// The function that sets up the player controls, including camera movement and keyboard input.
export function setupPlayer(camera) {
    const keysPressed = {} // Tracks the state of WASD keys for movement
    let pitch = 0 // Vertical rotation of the camera
    let yaw = 0 // Horizontal rotation of the camera
    // The above two just following naming conventions
    const groundLevel = 2 // Fixed height for the player's position
    let pointerLocked = false // Indicates whether the mouse pointer is locked to the game

    // Configure the camera's rotation order to 'YXZ' for proper orientation control.
    camera.rotation.order = 'YXZ'

    // Adds a crosshair to the center of the screen for better aiming and orientation.
    function createCrosshair() {
        const crosshair = document.createElement('div')
        crosshair.style.position = 'absolute'
        crosshair.style.top = '50%'
        crosshair.style.left = '50%'
        crosshair.style.width = '8px'
        crosshair.style.height = '8px'
        crosshair.style.backgroundColor = 'purple'
        crosshair.style.borderRadius = '50%' // Make it a dot
        crosshair.style.transform = 'translate(-50%, -50%)'
        crosshair.style.zIndex = '1000' // Ensure it appears above everything
        document.body.appendChild(crosshair)
    }

    // Initialize the crosshair on the screen.
    createCrosshair()

    // Registers key presses to track player movement with WASD keys.
    document.addEventListener('keydown', (event) => {
        keysPressed[event.key.toLowerCase()] = true
    })

    document.addEventListener('keyup', (event) => {
        keysPressed[event.key.toLowerCase()] = false
    })

    // Enables mouse pointer lock to allow full control over camera rotation during gameplay.
    document.body.addEventListener('click', () => {
        if (!pointerLocked) {
            document.body.requestPointerLock()
        }
    })

    // Updates pointer lock status and adjusts the cursor visibility accordingly.
    document.addEventListener('pointerlockchange', () => {
        pointerLocked = document.pointerLockElement === document.body
        document.body.style.cursor = pointerLocked ? 'none' : 'default'
    })

    // Listens to mouse movement and adjusts the camera's pitch and yaw based on pointer movements.
    document.addEventListener('mousemove', (event) => {
        if (pointerLocked) {
            const sensitivity = 0.002 // Controls the speed of rotation
            yaw -= event.movementX * sensitivity // Adjust yaw (left/right)
            pitch -= event.movementY * sensitivity // Adjust pitch (up/down)

            // Ensures the player cannot look too far up or down by clamping pitch values.
            pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch))
        }
    })

    // Updates the camera's orientation based on pitch and yaw values.
    function updateCameraOrientation() {
        camera.rotation.set(pitch, yaw, 0)
    }

    // Handles player movement using WASD keys, applying movement relative to the camera's orientation.
    function movePlayer() {
        const speed = 0.1 // Speed of player movement
        const direction = new THREE.Vector3()

        // Determine movement direction based on active keys.
        if (keysPressed['w']) direction.z -= speed // Forward
        if (keysPressed['s']) direction.z += speed // Backward
        if (keysPressed['a']) direction.x -= speed // Left
        if (keysPressed['d']) direction.x += speed // Right

        // Adjust movement direction to align with the camera's current rotation.
        direction.applyEuler(camera.rotation)
        camera.position.add(direction)

        // Maintain a constant height above the ground.
        camera.position.y = groundLevel
    }

    // Returns a function that combines player movement and camera orientation updates effectively.
    return function update() {
        movePlayer()
        updateCameraOrientation()
    }
}
