# 3D **World Rendering** with Three.js

This project utilizes the Three.js library to create a 3D **world** similiar to Minecraft with terrain generation and resource placement. The **world** is rendered in a web browser using WebGL.

## Getting Started

To run and experiment with the code, follow these steps:

### Prerequisites

- Ensure you have a web browser with **WebGL** support.
- Set up a development environment with **Node.js** and **npm**.

### Installation

1. Clone the repository to your local machine:

   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git

2. Navigate to the project directory:
     ```bash
     cd YOUR_REPOSITORY
     
3. Open the project in your preferred code editor.
4. Install dependencies:
     ```bash
     npm install

### Running the Project
Open the index.html file in a web browser or set up a local server to serve the project. For example, you can use the http-server package:
  
npm install -g http-server
http-server


### Project Structure

* index.html: HTML file containing the structure of the web page.<br>
* app.js: Main JavaScript file containing the 3D world setup, rendering loop, and UI creation.<br>
* world.js: Module handling the world generation, including terrain and resource placement.<br>
* ui.js: Module creating the user interface (UI) with adjustable parameters.<br>

### Dependencies
* Three.js: A JavaScript 3D library.<br>
* Stats.js: A statistics library for monitoring performance.<br>
* OrbitControls.js: A camera control library for navigation.<br>
* lil-gui.module.min.js: A minimal GUI library for creating user interfaces.

### Usage
Adjust parameters in the UI to modify the world's dimensions, terrain, and resource characteristics. Explore the 3D world by navigating with the camera controls.

### Contributing
Feel free to contribute to the project by opening issues or submitting pull requests.

### License
This project is licensed under the MIT License.

     
