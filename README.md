# StarMap

<img src="resources/thumb.gif" alt="An animated gif showing the 3D map viewer being used. Red, yellow and blue dots representing stars float in outer space. Clicking on a star opens a UI panel that shows properties of the star's data, such as it's name and coordinates." align="right" style="float: right; margin: 10px; width: 400px">
An interactive 3D map of the Spore galaxy. The data comes from `stars.db`, which is where the game stores information about generated star systems.

## Getting Started

### Run from commandline

1. Clone the repo
2. Install dependencies with `npm install`
3. Start the server with `npm start`
3. Open `localhost:4200` in a browser

### Build app

Run the build script with `npm run build`. It will produce a standalone Win, MacOS, and Linux executable in the `build` folder.

## Controls

Control the camera with the mouse.

* **Left Click + Drag** to rotate
* **Right Click + Drag** to pan
* **Scroll Wheel** to zoom in/out
* **Hover** over a star to view its name
* **Click** a star to view its details
* Press **space** to reset the camera

## Background

When you first boot up Spore, the game procedurally generates a galaxy of 42,010 stars. For each star it generates a `cStarRecord` , which are saved in serialized form to a package file called `stars.db`.

Each star record keeps track of things like the type of the star, it's position in the galaxy, the number of planets, the ID of the empire that owns it, etc. This file is kept up to date with your galaxy's data as you play.

There is no randomness in the algorithm which determines the positions of stars, so each galaxy has stars in exactly the same places. Stars may also have one or more planets orbiting them; However, planets are not generated until you visit the star in the space stage.


## Notes

* Each dot is a single star system, black hole, or proto-planetary disk. 
* The galaxy is naturally very flat, so the y-axis is inflated in the renderer to make the stars appear slightly more spread-out.
* In the `resources` folder there is a work-in-progress 010 editor binary template for the cStarRecord file.
 * The template will *not* work on stars.db file due to it being compressed. It *will* work on the cStarRecord file that is inside the stars.db package (hash 0x0179D304), which you can extract with [SporeModderFX](https://emd4600.github.io/SporeModder-FX/) or [S3PE](http://www.simlogical.com/s3pe.htm).

## Attribution

Skybox textures by Screaming Brain Studios on OpenGameArt ([source](https://opengameart.org/content/seamless-space-backgrounds))

Fullscreen icon created by kendis lasman on Flaticon ([source](https://www.flaticon.com/free-icons/fullscreen))

Loading spinner icon provided by loadingspinner.io ([source](https://loading.io/css/))