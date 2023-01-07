# StarMap

<img src="/thumb.gif" alt="A screenshot of the map viewer." align="right" style="float: right; margin: 10px; width: 400px">
An interactive 3D map of the Spore galaxy. The data comes from `stars.db`, which is where the game stores information about generated star systems.

## Getting Started

1. Clone the repo
2. Install dependencies with `npm install`
3. Start the server with `npm start`
3. Open [localhost:3000](localhost:3000) in a web browser

## Controls

Control the camera using the mouse.
* **Left Click + Drag** to rotate
* **Right Click + Drag** to pan
* **Scroll Wheel** to zoom in/out

## Notes

* Each dot is a single star system, black holes, or proto-planetary disk. 
* The galaxy is naturally very flat, so the y-axis is inflated in the renderer to make the stars appear slightly more spread-out.

## Attribution

Skybox textures courtesy of Screaming Brain Studios on OpenGameArt ([source](https://opengameart.org/content/seamless-space-backgrounds))