# WebGL Puzzle Adventure Game

## Introduction
This project is a WebGL-based 3D puzzle game built using [Three.js](https://threejs.org/). It offers players an immersive experience across two unique levels, each designed with distinct environments and interactive gameplay mechanics. With a focus on visual aesthetics, user experience, and technical implementation, the game demonstrates the integration of advanced web technologies and creative design.

---

## Features
### Gameplay
- **Level 1**: A magical forest environment where players collect glowing puzzle pieces to activate a portal.
- **Level 2**: A cave environment featuring a musical puzzle, requiring players to interact with crystals to solve the sequence.

### Visual Design
- Custom `.glb` models for key elements such as fireflies, portals, and crystals.
- Procedural terrain generation with added noise for natural aesthetics.
- Dynamic lighting including ambient, neon, and point light sources to enhance immersion.

### User Interaction
- **Mouse-Controlled Camera**: Smooth, first-person navigation using pointer lock for seamless gameplay.
- **Main Menu**:
  - Start the game.
  - Instructions on controls and gameplay mechanics.

### Sound Integration
- Each crystal in Level 2 emits unique sounds upon interaction, providing auditory feedback for puzzle solving.

---

## Technical Details
### Technology Stack
- **WebGL**: Core rendering technology.
- **Three.js**: Framework for 3D graphics and scene management.
- **GLTFLoader**: For loading and rendering `.glb` models.

### Architecture
The project is modular, with distinct JavaScript files for different functionalities:
- **menu.js**: Handles the main menu and navigation.
- **level1.js**: Manages gameplay for the first level.
- **level2.js**: Implements mechanics and logic for the second level.
- **player.js**: Handles player movement and camera controls.

### Performance Optimization
- Lightweight models and textures for efficient rendering.
- Procedural generation techniques reduce reliance on heavy assets while maintaining visual quality.

---

## Installation and Usage
### Prerequisites
- A local or hosted HTTP server to run the game (e.g., Python's SimpleHTTPServer, Node.js).

### Steps
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-folder>
2. Start a local HTTP server:
    ```bash
    python -m http.server
3. Open your browser and navigate to http://localhost:8000.

## Project Highlights
### Creativity and Design
- Focused on delivering an engaging user experience with visually appealing environments.
- Custom animations, including a dynamic title screen with noise effects, enhance the overall aesthetic.
  
### Challenges Overcome
- Blender was not used due to system limitations; instead, .glb models were sourced and optimized for the project.
- Implemented procedural enhancements to maintain high visual quality without overloading resources.
  
### Future Improvements
- **Collision Detection:** Restrict player movement within boundaries for enhanced realism.
- **Expanded Terrain Models:** Introduce additional environmental assets for a more cohesive world.
- **Performance Tuning:** Optimize rendering of large models to reduce lag and improve user experience.
  
## Key Takeaways
This project showcases:
- Proficiency in 3D graphics using Three.js and WebGL.
- Strong problem-solving skills in overcoming technical constraints (e.g., handling system limitations for model design).
- A commitment to creating intuitive, engaging, and technically sound interactive experiences.


