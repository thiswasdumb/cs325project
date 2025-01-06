import { setupPlayer } from './player.js'
import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js'
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js'
import { createLevel2 } from './level2.js'

export function createLevel1(renderer, scene, camera) {
    // Displays an introductory message to the player to inform them of the goal in the level.
    function showIntroMessage() {
        const messageBox = document.createElement('div')
        messageBox.style.position = 'fixed'
        messageBox.style.top = '20px'
        messageBox.style.left = '50%'
        messageBox.style.transform = 'translateX(-50%)'
        messageBox.style.width = '60%'
        messageBox.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'
        messageBox.style.color = 'white'
        messageBox.style.padding = '20px'
        messageBox.style.borderRadius = '10px'
        messageBox.style.fontFamily = '"Borel", sans-serif'
        messageBox.style.fontSize = '18px'
        messageBox.style.textAlign = 'center'
        messageBox.style.zIndex = '1000'
        messageBox.style.pointerEvents = 'auto'
        document.body.appendChild(messageBox)

        const message =
            'Go around and find the illuminating puzzle pieces and collect them. Bring them back to the portal to proceed to the next level. Best of luck traveller!'
        let index = 0

        function typeMessage() {
            if (index < message.length) {
                messageBox.textContent += message[index]
                index++
                setTimeout(typeMessage, 50)
            } else {
                const okayButton = document.createElement('button')
                okayButton.textContent = 'Okay'
                okayButton.style.marginTop = '20px'
                okayButton.style.padding = '10px 20px 0px 20px'
                okayButton.style.fontSize = '16px'
                okayButton.style.cursor = 'pointer'
                okayButton.style.border = 'none'
                okayButton.style.borderRadius = '5px'
                okayButton.style.backgroundColor = '#6b12ca'
                okayButton.style.color = 'white'
                okayButton.style.transition = 'background-color 0.3s'
                okayButton.addEventListener('mouseenter', () => {
                    okayButton.style.backgroundColor = '#9a30e1'
                })
                okayButton.addEventListener('mouseleave', () => {
                    okayButton.style.backgroundColor = '#6b12ca'
                })
                okayButton.addEventListener('click', () => {
                    messageBox.style.pointerEvents = 'none' // Ensure it no longer blocks interaction
                    messageBox.remove()
                })
                messageBox.appendChild(document.createElement('br')) // Add spacing
                messageBox.appendChild(okayButton)
            }
        }

        typeMessage()
    }

    // Clears any existing objects from the previous scene and initializes the level.
    while (scene.children.length > 0) {
        scene.remove(scene.children[0])
    }

    showIntroMessage() // Show the introduction message when the level starts.

    let inventory = 0 // Tracks the number of collected puzzle pieces.

    // Configures the game environment by creating a procedurally colored and textured ground.
    const planeGeometry = new THREE.PlaneGeometry(100, 100, 50, 50)
    const planeMaterial = new THREE.MeshStandardMaterial({
        vertexColors: true,
        metalness: 0.0,
        roughness: 1.0,
    })

    const colors = []
    for (let i = 0; i < planeGeometry.attributes.position.count; i++) {
        const shade = Math.random() * 0.4 + 0.4
        colors.push(0, shade, 0) /
    }

    planeGeometry.setAttribute(
        'color',
        new THREE.Float32BufferAttribute(colors, 3),
    )

    for (let i = 0; i < planeGeometry.attributes.position.count; i++) {
        const vertex = planeGeometry.attributes.position.array
        vertex[i * 3 + 2] += Math.random() * 0.5 + 0.2 // Add noise to Z (height)
    }
    planeGeometry.attributes.position.needsUpdate = true // Update the geometry

    const plane = new THREE.Mesh(planeGeometry, planeMaterial)
    plane.rotation.x = -Math.PI / 2
    scene.add(plane)

    // Adds minimal ambient lighting to create a dim environment.
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1)
    scene.add(ambientLight)

    const loader = new GLTFLoader()
    let fireflyModel = null
    let treeModel = null
    let portalFrame = null
    let portalActivated = false

    const puzzlePieces = []
    const slotPieces = []

    // Loads models asynchronously for environmental elements. (THIS WAS DONE BECAUSE IT WAS LAGGING HORRIBLY WHEN NOT DONE ASYNCHRONOUSLY)
    const loadModels = async () => {
        fireflyModel = await new Promise((resolve, reject) => {
            loader.load(
                '../assets/firefly',
                (gltf) => resolve(gltf.scene),
                undefined,
                reject,
            )
        })

        treeModel = await new Promise((resolve, reject) => {
            loader.load(
                '../assets/tree',
                (gltf) => resolve(gltf.scene),
                undefined,
                reject,
            )
        })

        //generateFireflies();
        //generateTrees();
    }

    // Generates fireflies that move dynamically.
    const generateFireflies = () => {
        for (let i = 0; i < 40; i++) {
            const firefly = fireflyModel.clone()
            firefly.position.set(
                Math.random() * 80 - 40,
                Math.random() * 2.5 + 2,
                Math.random() * 80 - 40,
            )
            firefly.scale.set(0.4, 0.4, 0.4)
            firefly.rotation.x = (Math.random() * Math.PI) / 2

            const fireflyLight = new THREE.PointLight(0xffff00, 1, 13)
            fireflyLight.position.set(0, -0.5, 0)
            firefly.add(fireflyLight)

            scene.add(firefly)

            const speed = Math.random() * 0.005
            const amplitude = Math.random() * 0.25
            const initialY = firefly.position.y

            const updateFirefly = () => {
                firefly.position.y = initialY + Math.sin(Date.now() * speed) * amplitude
                requestAnimationFrame(updateFirefly)
            }
            updateFirefly()
        }
    }

    // Generates trees around the environment with constraints near the portal to avoid overlapping.
    const generateTrees = () => {
        const portalRadius = 5
        for (let x = -40; x <= 40; x += 7.5) {
            for (let z = -40; z <= 40; z += 7.5) {
                if (!portalFrame) continue // Ensure portalFrame is loaded
                const distanceToPortal = Math.sqrt(
                    (x - portalFrame.position.x) ** 2 + (z - portalFrame.position.z) ** 2,
                )
                if (distanceToPortal < portalRadius + 2 || Math.random() > 0.7) continue

                const tree = treeModel.clone()
                tree.position.set(x, 0, z)
                tree.scale.set(2, 2, 2)
                tree.rotation.y = Math.random() * Math.PI * 2

                scene.add(tree)
            }
        }
    }

    // Configures the portal and its glowing effects (light source).
    loader.load('assets/portalframe', (gltf) => {
        portalFrame = gltf.scene
        portalFrame.rotation.x = 0
        portalFrame.position.set(0, 1, 0)
        scene.add(portalFrame)

        // Adds glowing light effects to the portal.
        loader.load('assets/portallight', (gltfLight) => {
            const portalLight = gltfLight.scene
            portalLight.position.set(0, 0, 0)
            portalFrame.add(portalLight)

            // Configures emissive properties for a glowing effect.
            portalLight.traverse((child) => {
                if (child.isMesh) {
                    child.material.emissive = new THREE.Color(0x00ffff)
                    child.material.emissiveIntensity = 4
                }
            })

            // Adds a point light above the portal for additional illumination.
            const pointLight = new THREE.PointLight(0x00ffff, 1.5, 7) // More intense and larger range
            pointLight.castShadow = true // Enable shadows for better depth perception
            pointLight.position.set(0, 1, 0) // Positioned slightly above the portal frame
            portalFrame.add(pointLight)
        })
    })

    // Sets up slots for puzzle pieces, initially hidden.
    for (let i = 0; i < 4; i++) {
        const slotPiece = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshStandardMaterial({ color: 0x000000 }),
        )
        slotPiece.visible = false // Hidden initially
        slotPieces.push(slotPiece)
    }

    // Loads and positions puzzle pieces in the scene.
    for (let i = 0; i < 4; i++) {
        loader.load('assets/piece', (gltfPiece) => {
            const piece = gltfPiece.scene
            piece.position.set(
                /*Math.random() * 80 - 40, // Random X position
                        0.5, // Slightly above the ground to avoid clipping
                        Math.random() * 80 - 40 // Random Z position*/
                10,
                1,
                i,
            )
            piece.scale.set(1, 1, 1)
            scene.add(piece)
            puzzlePieces.push(piece)

            // Adds light effects to each puzzle piece (light source).
            loader.load('assets/piecelight', (gltfLight) => {
                const piecelight = gltfLight.scene
                piecelight.position.set(0, 0, 0)
                piecelight.scale.set(1, 1, 1)
                piece.add(piecelight)

                // Configures glowing properties for the piece.
                piecelight.traverse((child) => {
                    if (child.isMesh) {
                        child.material.emissive = new THREE.Color(0x00ffff)
                        child.material.emissiveIntensity = 1.5
                    }
                })

                // Adds a point light to make the light effect visible.
                const pointLight = new THREE.PointLight(0x00ffff, 1.5, 7)
                pointLight.castShadow = true
                pointLight.position.set(0, 0.5, 0)
                piece.add(pointLight)
            })
        })
    }

    // Checks proximity to puzzle pieces for collection and handles game progression.
    function collectPuzzlePieces() {
        const playerPosition = camera.position

        // Detects and removes collected pieces from the scene.
        puzzlePieces.forEach((piece, index) => {
            if (piece && piece.position.distanceTo(playerPosition) < 2) {
                scene.remove(piece)
                inventory++
                console.log(`Collected piece ${index + 1}. Inventory: ${inventory}/4`)
            }
        })

        // Activates the portal when all pieces are collected.
        if (
            inventory >= 4 &&
            portalFrame &&
            playerPosition.distanceTo(portalFrame.position) < 5 &&
            !portalActivated
        ) {
            console.log('All pieces collected! Placing above the portal...')

            const positions = [
                { x: 5.5, y: 1, z: 5.5 },
                { x: 0, y: 1, z: 5.25 },
                { x: 0, y: 1, z: 0.25 },
                { x: 5.75, y: 1, z: 0.25 },
            ]

            // Positions the collected pieces around the portal.
            puzzlePieces.forEach((piece, index) => {
                if (piece) {
                    const pos = positions[index]
                    piece.position.set(pos.x, pos.y, pos.z)


                    const rotationAngle = ((3 * Math.PI) / 2) * index + Math.PI
                    piece.rotation.set(0, rotationAngle, 0)

                    piece.visible = true
                    scene.add(piece)
                }
            })

            portalActivated = true

            // Delays transition to Level 2 after all pieces are placed so the pieces in their slots can be seen.
            setTimeout(() => {
                console.log('Transitioning to Level 2...')

                createLevel2(renderer, scene, camera)
            }, 5000)
        }
    }

    const movePlayer = setupPlayer(camera)

    // Main game loop to update player actions and render the scene.
    function animate() {
        requestAnimationFrame(animate)
        movePlayer()
        collectPuzzlePieces()
        renderer.render(scene, camera)
    }

    animate()

    // Begins loading models asynchronously.
    loadModels()
}
