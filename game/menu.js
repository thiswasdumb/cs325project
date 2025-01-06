// Main function to create the game's main menu
export function createMenu(startGameCallback) {
    // The menu overlay serves as a fullscreen interface for the game menu.
    // It contains options to start the game or view instructions.
    const menuOverlay = document.createElement('div')
    menuOverlay.id = 'menu'
    menuOverlay.style.position = 'fixed'
    menuOverlay.style.top = '0'
    menuOverlay.style.left = '0'
    menuOverlay.style.width = '100vw'
    menuOverlay.style.height = '100vh'
    menuOverlay.style.display = 'flex'
    menuOverlay.style.justifyContent = 'center'
    menuOverlay.style.alignItems = 'center'
    menuOverlay.style.color = 'white'
    menuOverlay.style.fontFamily = 'Arial, sans-serif'
    menuOverlay.style.textAlign = 'center'
    menuOverlay.style.flexDirection = 'column'

    // The background canvas adds a dynamic starry visual effect with shooting stars to fall in theme with the mystic and etheral feeling of the game.
    const canvas = document.createElement('canvas')
    canvas.style.position = 'absolute'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.zIndex = '-1'
    menuOverlay.appendChild(canvas)

    const ctx = canvas.getContext('2d')
    const stars = []
    const shootingStars = []
    const blurRadius = 2

    // Adjust canvas size with the window to ensure fullscreen coverage.
    function resizeCanvas() {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Generate stars for a night sky effect and set their motion.
    for (let i = 0; i < 150; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * blurRadius,
            speed: Math.random() * 0.5 + 0.2,
        })
    }

    // Add shooting stars that occasionally streak across the screen.
    function spawnShootingStar() {
        shootingStars.push({
            x: Math.random() * canvas.width,
            y: (Math.random() * canvas.height) / 2,
            length: Math.random() * 200 + 100,
            speed: Math.random() * 3 + 2,
            angle: Math.PI / 4,
            opacity: Math.random() * 0.5 + 0.5,
        })
        setTimeout(spawnShootingStar, Math.random() * 3000 + 1000)
    }
    spawnShootingStar()

    // Render static stars and ensure they reset after moving off-screen.
    function drawStars() {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
        for (const star of stars) {
            ctx.beginPath()
            ctx.arc(star.x, star.y, star.radius, 0, 2 * Math.PI)
            ctx.fill()
            star.y += star.speed
            if (star.y > canvas.height) star.y = 0
        }
    }

    // Render and animate shooting stars with fading trails.
    function drawShootingStars() {
        for (let i = shootingStars.length - 1; i >= 0; i--) {
            const star = shootingStars[i]
            ctx.beginPath()
            const gradient = ctx.createLinearGradient(
                star.x,
                star.y,
                star.x - star.length * Math.cos(star.angle),
                star.y - star.length * Math.sin(star.angle),
            )
            gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`)
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
            ctx.strokeStyle = gradient
            ctx.lineWidth = 2
            ctx.moveTo(star.x, star.y)
            ctx.lineTo(
                star.x - star.length * Math.cos(star.angle),
                star.y - star.length * Math.sin(star.angle),
            )
            ctx.stroke()

            star.x += star.speed * Math.cos(star.angle)
            star.y += star.speed * Math.sin(star.angle)
            star.opacity -= 0.01

            if (star.opacity <= 0) {
                shootingStars.splice(i, 1)
            }
        }
    }

    // Combine static and shooting stars into an animated background loop.
    function animateBackground() {
        drawStars()
        drawShootingStars()
        requestAnimationFrame(animateBackground)
    }
    animateBackground()

    // Display the title as a video for an engaging intro to the game.
    const videoTitle = document.createElement('video')
    videoTitle.src = 'assets/title.mp4'
    videoTitle.autoplay = true
    videoTitle.loop = false
    videoTitle.muted = true
    videoTitle.style.width = '60%'
    videoTitle.style.height = 'auto'
    videoTitle.style.marginBottom = '20px'
    menuOverlay.appendChild(videoTitle)

    // Add the "Start Game" button to begin the gameplay.
    const startButton = document.createElement('button')
    startButton.textContent = 'Start Game'
    startButton.style.padding = '10px 20px 0px 20px'
    startButton.style.fontSize = '18px'
    startButton.style.cursor = 'pointer'
    startButton.addEventListener('click', () => {
        menuOverlay.remove()
        startGameCallback()
    })
    menuOverlay.appendChild(startButton)

    // Add an "Instructions" button to provide gameplay guidance.
    const instructionsButton = document.createElement('button')
    instructionsButton.textContent = 'Instructions'
    instructionsButton.style.padding = '10px 20px 0px 20px'
    instructionsButton.style.fontSize = '18px'
    instructionsButton.style.marginTop = '10px'
    instructionsButton.style.cursor = 'pointer'
    instructionsButton.addEventListener('click', () =>
        showInstructions(menuOverlay),
    )
    menuOverlay.appendChild(instructionsButton)

    // Attach the menu overlay to the webpage.
    document.body.appendChild(menuOverlay)
}

// Show instructions which includes basic game controls and a back button.
function showInstructions(menuOverlay) {
    menuOverlay.style.display = 'none'

    const instructionsOverlay = document.createElement('div')
    instructionsOverlay.style.position = 'fixed'
    instructionsOverlay.style.top = '0'
    instructionsOverlay.style.left = '0'
    instructionsOverlay.style.width = '100vw'
    instructionsOverlay.style.height = '100vh'
    instructionsOverlay.style.display = 'flex'
    instructionsOverlay.style.justifyContent = 'center'
    instructionsOverlay.style.alignItems = 'center'
    instructionsOverlay.style.color = 'white'
    instructionsOverlay.style.fontFamily = '"Borel", sans-serif'
    instructionsOverlay.style.textAlign = 'center'
    instructionsOverlay.style.flexDirection = 'column'
    instructionsOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'

    const instructionsText = document.createElement('div')
    instructionsText.style.fontSize = '18px'
    instructionsText.style.marginBottom = '20px'

    // Each sentence is added as a paragraph for enhanced readability.
    const sentences = [
        'Use the WASD keys to move around the game world.',
        "Press 'Esc' to unlock the mouse and interact with buttons.",
        'Instructions will be provided at each level.',
        'Enjoy this simple game!',
    ]
    sentences.forEach((sentence) => {
        const sentenceElement = document.createElement('p')
        sentenceElement.textContent = sentence
        sentenceElement.style.margin = '5px 0' // Add spacing between lines
        instructionsText.appendChild(sentenceElement)
    })

    instructionsOverlay.appendChild(instructionsText)

    // Add a "Back" button to return to the menu.
    const backButton = document.createElement('button')
    backButton.textContent = 'Back'
    backButton.style.padding = '10px 20px'
    backButton.style.fontSize = '18px'
    backButton.style.cursor = 'pointer'
    backButton.addEventListener('click', () => {
        instructionsOverlay.remove()
        menuOverlay.style.display = 'flex'
    })
    instructionsOverlay.appendChild(backButton)

    // Attach the instructions overlay to the webpage.
    document.body.appendChild(instructionsOverlay)
}
