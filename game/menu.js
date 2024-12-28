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
    menuOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    menuOverlay.style.color = 'white';
    menuOverlay.style.fontFamily = 'Arial, sans-serif';
    menuOverlay.style.textAlign = 'center';
    menuOverlay.style.flexDirection = 'column';

    // Title
    const title = document.createElement('h1');
    title.textContent = 'Mystic Forest Adventure';
    title.style.marginBottom = '20px';

    // Start Button
    const startButton = document.createElement('button');
    startButton.textContent = 'Start Game';
    startButton.style.padding = '10px 20px';
    startButton.style.fontSize = '18px';
    startButton.style.cursor = 'pointer';
    startButton.addEventListener('click', () => {
        menuOverlay.remove(); // Remove the menu from the DOM
        startGameCallback(); // Start the game
    });

    // Instructions
    const instructions = document.createElement('p');
    instructions.textContent = 'Use WASD to move around and explore the forest.';

    // Append to menu
    menuOverlay.appendChild(title);
    menuOverlay.appendChild(startButton);
    menuOverlay.appendChild(instructions);

    // Add to the DOM
    document.body.appendChild(menuOverlay);
}
