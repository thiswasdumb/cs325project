import { setupPlayer } from './player.js'
import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js'
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js'

// Initialize a map to track sounds associated with objects in the scene.
const soundMap = new Map()

export function createLevel2(renderer, scene, camera) {
    // Display an introduction message for the level with instructions on how to complete the level.
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
            'Approach the crystals and click them for notes. In order to complete the puzzle, you must correctly click the crystals in ascending order of notes.'
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
                    messageBox.style.pointerEvents = 'none'
                })
                messageBox.appendChild(document.createElement('br'))
                messageBox.appendChild(okayButton)
            }
        }

        typeMessage()
    }

    // Clears any previous level elements.
    while (scene.children.length > 0) {
        scene.remove(scene.children[0])
    }

    // Display the introduction message.
    showIntroMessage()

    // Creates a bumpy cave floor using vertex manipulation.
    const planeGeometry = new THREE.PlaneGeometry(100, 100, 50, 50)
    for (let i = 0; i < planeGeometry.attributes.position.count; i++) {
        const vertex = planeGeometry.attributes.position.array
        vertex[i * 3 + 2] += Math.random() * 1.0 - 0.5
    }
    planeGeometry.attributes.position.needsUpdate = true

    const planeMaterial = new THREE.MeshStandardMaterial({
        vertexColors: true,
        metalness: 0.0,
        roughness: 1.0,
    })

    // Adds green-blue shades to the cave floor for ethereal feeling.
    const colors = []
    for (let i = 0; i < planeGeometry.attributes.position.count; i++) {
        const shade = Math.random() * 0.3 + 0.3
        colors.push(0, shade, Math.random() * 0.3 + 0.2)
    }
    planeGeometry.setAttribute(
        'color',
        new THREE.Float32BufferAttribute(colors, 3),
    )

    const caveFloor = new THREE.Mesh(planeGeometry, planeMaterial)
    caveFloor.rotation.x = -Math.PI / 2
    scene.add(caveFloor)

    // Adds dim ambient light for the cave environment.
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4)
    scene.add(ambientLight)

    const loader = new GLTFLoader()

    // Raycaster setup for detecting mouse interactions with objects.
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    // Load and place music crystals in the scene.
    const musicCrystals = [
        { model: '../assets/musiccrystal1', sound: '../assets/sounds/C4.mp3' },
        { model: '../assets/musiccrystal2', sound: '../assets/sounds/D4.mp3' },
        { model: '../assets/musiccrystal3', sound: '../assets/sounds/E4.mp3' },
        { model: '../assets/musiccrystal4', sound: '../assets/sounds/F4.mp3' },
        { model: '../assets/musiccrystal5', sound: '../assets/sounds/G4.mp3' },
    ]

    // Tracks player interaction sequence and the correct order for the puzzle.
    let playerClickOrder = []
    const correctOrder = ['C4', 'D4', 'E4', 'F4', 'G4']

    const crystalGroup = new THREE.Group()

    // Handles mouse clicks to interact with crystals.
    function handleMouseClick(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

        raycaster.setFromCamera(mouse, camera)

        const intersects = raycaster.intersectObjects(scene.children, true)

        if (intersects.length > 0) {
            let clickedObject = intersects[0].object

            // Traverse up the parent hierarchy to find a mapped object
            while (clickedObject && !soundMap.has(clickedObject)) {
                clickedObject = clickedObject.parent
            }

            if (clickedObject && soundMap.has(clickedObject)) {
                const soundPath = soundMap.get(clickedObject)
                const audio = new Audio(soundPath)
                audio.play()

                const note = soundPath.match(/\/(\w+)\.mp3$/)[1]
                console.log(`Played sound: ${note}`)

                // Check order
                if (note === correctOrder[playerClickOrder.length]) {
                    playerClickOrder.push(note)
                    console.log(
                        `Correct click! Current sequence: ${playerClickOrder.join(', ')}`,
                    )
                    if (playerClickOrder.length === correctOrder.length) {
                        console.log('You solved the puzzle!')
                        alert('Congratulations! You solved the puzzle!')
                    }
                } else {
                    console.log('Incorrect click. Resetting...')
                    playerClickOrder = [] // Reset progress
                }
            } else {
                console.log('Clicked object is not mapped to a sound.')
            }
        } else {
            console.log('No object clicked.')
        }
    }

    window.addEventListener('click', handleMouseClick)

    // Randomizes crystal order for the puzzle.
    musicCrystals.sort(() => Math.random() - 0.5)

    // Loads crystal models and places them in the scene.
    musicCrystals.forEach((crystalData, index) => {
        loader.load(
            crystalData.model,
            (gltf) => {
                const crystal = gltf.scene

                soundMap.set(crystal, crystalData.sound)

                crystal.position.set(index * 1.5 + 40, 1, -50)
                crystal.scale.set(1.5, 1.5, 1.5)

                const crystalLight = new THREE.PointLight(0x00ffff, 1.5, 10)
                crystalLight.position.set(0, 1.5, 0)
                crystal.add(crystalLight)

                crystalGroup.add(crystal)
            },
            undefined,
            (error) => {
                console.error(`Error loading model ${crystalData.model}:`, error)
            },
        )
    })

    const intersectableObjects = []
    crystalGroup.traverse((child) => {
        if (child.isMesh) {
            intersectableObjects.push(child)
        }
    })

    crystalGroup.position.set(95, 0, 43)
    crystalGroup.rotation.y = Math.PI / 2

    scene.add(crystalGroup)

    // Purple crystals generator to place them randomly along the walls of the cave.
    function addPurpleCrystals(parent, count, radius, length, isTunnel = false) {
        const crystalPaths = [
            '../assets/crystal1',
            '../assets/crystal2',
            '../assets/crystal3',
        ]
        const crystalModels = []

        const preloadPromises = crystalPaths.map(
            (path) =>
                new Promise((resolve, reject) => {
                    loader.load(
                        path,
                        (gltf) => resolve(gltf.scene),
                        undefined,
                        (error) => reject(`Error loading ${path}: ${error}`),
                    )
                }),
        )

        Promise.all(preloadPromises)
            .then((loadedModels) => {
                crystalModels.push(...loadedModels)

                for (let i = 0; i < count; i++) {
                    const randomModel =
                        crystalModels[
                            Math.floor(Math.random() * crystalModels.length)
                        ].clone()

                    let x, y, z
                    if (isTunnel) {
                        const theta = Math.random() * Math.PI * 2
                        x = radius * Math.cos(theta)
                        z = radius * Math.sin(theta)
                        y = Math.random() * length - length / 2
                    } else {
                        const phi = Math.random() * Math.PI
                        const theta = Math.random() * Math.PI * 2
                        x = radius * Math.sin(phi) * Math.cos(theta)
                        y = radius * Math.sin(phi) * Math.sin(theta)
                        z = radius * Math.cos(phi)
                    }

                    randomModel.position.set(x, y, z)

                    // Random rotation for the crystals
                    randomModel.rotation.x = Math.random() * Math.PI * 2
                    randomModel.rotation.y = Math.random() * Math.PI * 2
                    randomModel.rotation.z = Math.random() * Math.PI * 2

                    const crystalLight = new THREE.PointLight(0x800080, 2, 10)
                    crystalLight.position.set(0, 0.5, 0)
                    randomModel.add(crystalLight)

                    parent.add(randomModel)
                }
            })
            .catch((error) => console.error('Error preloading models:', error))
    }

    // Generates a rocky environment with procedurally modified geometry.
    const createRockyEnvironment = () => {
        const environment = new THREE.Group()

        const roomRadius = 10
        const tunnelRadius = 8.5
        const tunnelLength = 60

        function createBumpyMaterial(color) {
            return new THREE.MeshStandardMaterial({
                color: color,
                side: THREE.BackSide,
                roughness: 1.0,
                metalness: 0.0,
            })
        }

        const rockyMaterial = createBumpyMaterial(0x808080) // Grey rocky material

        function addBumpiness(geometry, intensity = 0.5) {
            for (let i = 0; i < geometry.attributes.position.count; i++) {
                const vertex = geometry.attributes.position.array
                const noise = (Math.random() - 0.5) * intensity
                vertex[i * 3] += noise
                vertex[i * 3 + 1] += noise
                vertex[i * 3 + 2] += noise
            }
            geometry.attributes.position.needsUpdate = true
        }

        const startRoomGeometry = new THREE.SphereGeometry(
            roomRadius,
            32,
            32,
            0,
            Math.PI * 0.8,
            0,
            Math.PI / 2,
        )
        addBumpiness(startRoomGeometry, 0.4)
        const startRoom = new THREE.Mesh(startRoomGeometry, rockyMaterial)
        startRoom.position.set(0, 0, 0)
        startRoom.rotation.y = Math.PI * -0.45
        environment.add(startRoom)

        const tunnelGeometry = new THREE.CylinderGeometry(
            tunnelRadius,
            tunnelRadius,
            tunnelLength,
            32,
            32,
            true,
        )
        addBumpiness(tunnelGeometry, 0.8)
        const tunnel = new THREE.Mesh(tunnelGeometry, rockyMaterial)
        tunnel.rotation.z = Math.PI / 2
        tunnel.position.set(roomRadius + 10, 0, 0)
        environment.add(tunnel)

        //addPurpleCrystals(tunnel, 60, tunnelRadius, tunnelLength, true); // Crystals on the tunnel walls

        scene.add(environment)
    }

    createRockyEnvironment()

    window.addEventListener('click', handleMouseClick)

    document.removeEventListener('keydown', existingKeyDownHandler)
    document.removeEventListener('keyup', existingKeyUpHandler)

    // Player movement and game rendering loop.
    const movePlayer = setupPlayer(camera)

    // Game loop
    function animate() {
        requestAnimationFrame(animate)
        movePlayer()
        renderer.render(scene, camera)
    }

    animate()
}
