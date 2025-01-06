export function createMenu(startGameCallback) {
    // Create a fullscreen overlay for the menu
    const menuOverlay = document.createElement('div');
    menuOverlay.id = 'menu';
    menuOverlay.style.position = 'fixed';
    menuOverlay.style.top = '0';
    menuOverlay.style.left = '0';
    menuOverlay.style.width = '100vw';
    menuOverlay.style.height = '100vh';
    menuOverlay.style.display = 'flex';
    menuOverlay.style.justifyContent = 'center';
    menuOverlay.style.alignItems = 'center';
    menuOverlay.style.color = 'white';
    menuOverlay.style.fontFamily = 'Arial, sans-serif';
    menuOverlay.style.textAlign = 'center';
    menuOverlay.style.flexDirection = 'column';

    // Create a canvas for the background
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    menuOverlay.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const stars = [];
    const shootingStars = [];
    const blurRadius = 2;

    // Resize canvas to fill the screen
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Generate stars
    for (let i = 0; i < 150; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * blurRadius,
            speed: Math.random() * 0.5 + 0.2,
        });
    }

    // Add shooting stars
    function spawnShootingStar() {
        shootingStars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height / 2,
            length: Math.random() * 200 + 100,
            speed: Math.random() * 3 + 2,
            angle: Math.PI / 4,
            opacity: Math.random() * 0.5 + 0.5,
        });
        setTimeout(spawnShootingStar, Math.random() * 3000 + 1000);
    }
    spawnShootingStar();

    // Draw stars
    function drawStars() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        for (const star of stars) {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, 2 * Math.PI);
            ctx.fill();
            star.y += star.speed;
            if (star.y > canvas.height) star.y = 0; // Reset star position when it goes off-screen
        }
    }

    // Draw shooting stars
    function drawShootingStars() {
        for (let i = shootingStars.length - 1; i >= 0; i--) {
            const star = shootingStars[i];
            ctx.beginPath();
            const gradient = ctx.createLinearGradient(
                star.x,
                star.y,
                star.x - star.length * Math.cos(star.angle),
                star.y - star.length * Math.sin(star.angle)
            );
            gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(
                star.x - star.length * Math.cos(star.angle),
                star.y - star.length * Math.sin(star.angle)
            );
            ctx.stroke();

            star.x += star.speed * Math.cos(star.angle);
            star.y += star.speed * Math.sin(star.angle);
            star.opacity -= 0.01;

            if (star.opacity <= 0) {
                shootingStars.splice(i, 1);
            }
        }
    }

    // Animation loop
    function animateBackground() {
        drawStars();
        drawShootingStars();
        requestAnimationFrame(animateBackground);
    }
    animateBackground();

    // Video Title
    const videoTitle = document.createElement('video');
    videoTitle.src = 'assets/title.mp4';
    videoTitle.autoplay = true;
    videoTitle.loop = false;
    videoTitle.muted = true;
    videoTitle.style.width = '60%';
    videoTitle.style.height = 'auto';
    videoTitle.style.marginBottom = '20px';
    menuOverlay.appendChild(videoTitle);

    // Start Button
    const startButton = document.createElement('button');
    startButton.textContent = 'Start Game';
    startButton.style.padding = '10px 20px 0px 20px';
    startButton.style.fontSize = '18px';
    startButton.style.cursor = 'pointer';
    startButton.addEventListener('click', () => {
        menuOverlay.remove(); // Remove the menu from the DOM
        startGameCallback(); // Start the game
    });
    menuOverlay.appendChild(startButton);

    document.body.appendChild(menuOverlay);
}
