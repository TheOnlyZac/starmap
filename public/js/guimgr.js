import { enumStarTypes } from './starmgr.js';

var DISABLE_LOADING_SCREEN = false;

class GuiManager {
    constructor() {
        this.panels = {};

        this.fLoading = false;
        this.tLastSpinnerUpdate = 0; // time spinner was last updated
        this.tLoadingStarted = 0; // time the last load was initiated

        this.pointedObject = null;
        this.tooltip = document.querySelector('#tooltip');
        
        this.propsPanel = document.querySelector('#properties-panel');
        this.propsPanel.style.visibility = 'hidden'; // start hidden

        this.fMouseOnUiPanel = false;

        document.querySelector('#fullscreen-btn').addEventListener('click', (event) => {
            //todo: support moz and webkit fullscreen requests
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                document.documentElement.requestFullscreen();
            }
        });

        this.bindEventListeners();
    }

    bindEventListeners() {
        window.addEventListener('click', this.onWindowClick.bind(this));
        window.addEventListener('focus', this.onWindowFocus.bind(this));

        document.querySelectorAll('.panel').forEach((panel) => {
            panel.addEventListener('mouseenter', this.onPanelMouseEnter.bind(this));
            panel.addEventListener('mouseout', this.onPanelMouseOut.bind(this));
        });
    }
    
    // Mouse click event handler
    onWindowClick(event) {
        //if (mouseInput.wasLongClick() | !mouseInput.wasStationaryClick())
        //    return; // abort if long click or mouse moved during click

        // Show props panel for star pointed at by mouse cursor
        if (this.pointedObject != null) {
            let starRecord = this.pointedObject.object.userData;
            this.createStarPropsPanel(starRecord, event.x - window.innerWidth/2, event.y - window.innerHeight/2);
        } else {
            this.propsPanel.style.visibility = 'hidden';
        }
    };

    onPanelMouseEnter(event) {
        this.fMouseOnUiPanel = true;
    }

    onPanelMouseOut(event) {
        if (event.relatedTarget && event.relatedTarget.closest('.panel')) {
          // Mouse is entering a child element of the panel, do nothing
          return;
        }
        this.fMouseOnUiPanel = false;
    }

    onWindowFocus(event) {
        const mouseX = event.clientX;
        const mouseY = event.clientY;

        this.checkMouseOverUiPanel(mouseX, mouseY);
    }

    checkMouseOverUiPanel(x, y) {
        try {
            const elementUnderMouse = document.elementFromPoint(x, y);
            
            document.querySelectorAll('.panel').forEach((panel) => {
                if (panel.contains(elementUnderMouse)) {
                    this.fMouseOnUiPanel = true;
                    return;
                }
            });
            this.fMouseOnUiPanel = false;
        } catch (e) {
            // pass
        }
        console.log(this.fMouseOnUiPanel);
    }

    showLoadingOverlay() {
        this.tLoadingStarted = new Date().getTime();

        let loadingOverlay = document.querySelector('#loading-overlay');
        let spinner = document.querySelector('#spinner');
        
        spinner.innerHTML = 'Loading';
        loadingOverlay.style.display = 'flex';
        loadingOverlay.style.opacity = 1.0;
        this.fLoading = true;
    }

    hideLoadingOverlay() {
        const now = new Date().getTime();
        const loadingDurMs = now - this.tLoadingStarted;

        // Always load for at least one second so the transition isn't jarring
        let dummyLoadTimeoutMs = loadingDurMs > 1000 ? 0 : 1000 - loadingDurMs;

        setTimeout(() => {
            this.fLoading = false;
            document.querySelector('#spinner').innerHTML = 'Ready!';
            
            let loadingOverlay = document.querySelector('#loading-overlay');
            setTimeout(() => {
                loadingOverlay.style.opacity = 0.0;
            }, 250);
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 1250);
        }, dummyLoadTimeoutMs);
    }

    createStarPropsPanel(starRecord, xPos, yPos) {
        // Check if panel already open
        if (this.panels[starRecord.name]) {
            //this.panels[starRecord.name].front();
            return;
        }

        const that = this;
        const jspanel = jsPanel.create({
            position:    "left-top",
            contentSize: "210 auto",
            resizeit: false,
            headerTitle: starRecord.name,
            theme:       "black",
            headerControls: {
                'close': 'enable',
                'maximize': 'remove',
                'normalize': 'remove',
                'minimize': 'remove',
                'smallify': 'remove'
            },
            position: {
                offsetX: xPos,
                offsetY: yPos
            },
            callback: function(panel) {
                // Set UI element class
                jsPanel.setClass(this, 'panel');
                jsPanel.setClass(this, 'blurbg');
                
                // Bind event listeners
                this.addEventListener('mouseenter', that.onPanelMouseEnter.bind(that));
                this.addEventListener('mouseout', that.onPanelMouseOut.bind(that));
                
                // Add panel content                
                let subtitleElement = document.createElement('p')
                let subtitle;
                switch (starRecord.type) {
                    case enumStarTypes.GalacticCore:
                        subtitle = "Supermassive black hole";
                        break;
                    case enumStarTypes.BlackHole:
                        subtitle = "Black hole";
                        break;
                    case enumStarTypes.ProtoPlanetary:
                        subtitle = "Proto-planetary disk";
                        break;
                    case enumStarTypes.StarG:
                        subtitle = 'Yellow star system';
                        break;
                    case enumStarTypes.StarO:
                        subtitle = 'Blue star system';
                        break;
                    case enumStarTypes.StarM:
                        subtitle = 'Red star system';
                        break;
                    case enumStarTypes.BinaryOO:
                        subtitle = 'Blue-blue binary system';
                        break;
                    case enumStarTypes.BinaryOM:
                        subtitle = 'Blue-red binary system';
                        break;
                    case enumStarTypes.BinaryOG:
                        subtitle = 'Blue-yellow binary system';
                        break;
                    case enumStarTypes.BinaryGG:
                        subtitle = 'Yellow-yellow binary system';
                        break;
                    case enumStarTypes.BinaryGM:
                        subtitle = 'Yellow-red binary system';
                        break;
                    case enumStarTypes.BinaryMM:
                        subtitle = 'Red-red binary system';
                        break;
                    default:
                        console.error("Unrecognized star type", starRecord.type);
                        subtitle = "Unknown star type";
                }
                
                subtitleElement.appendChild(document.createTextNode(subtitle));
                this.addToolbar('header', subtitleElement);

                //let posXElement = document.createTextNode(starRecord.position.x.toFixed(3));
                //posXElement.classList.add('value-posx');
                //this.content.appendChild(posXElement);
                
                const posGrid = document.createElement('div');
                posGrid.classList.add('panel-grid');
                
                ['x', 'y', 'z'].forEach(axis => {
                    const labelElement = document.createElement('p');
                    labelElement.append(document.createTextNode(axis.toUpperCase() + ' Position'));
                    posGrid.append(labelElement);

                    const posElement = document.createElement('p');
                    posElement.append(document.createTextNode(starRecord.position[axis].toFixed(3)));
                    posGrid.append(posElement);
                });

                this.content.append(posGrid);
                //document.querySelector('.value-posx').innerHTML = starRecord.position.x.toFixed(3);
                //document.querySelector('.value-posy').innerHTML = starRecord.position.y.toFixed(3);
                //document.querySelector('.value-posz').innerHTML = starRecord.position.z.toFixed(3);
                //this.content.append(document.querySelector('.star-position').cloneNode());
                
            }
        });

        this.panels[starRecord.name] = jsPanel;
        console.log(this.panels);
        return jsPanel;
    }

    update(cursor, pointedObject) {
        // Debug flag to disable the loading screen
        if (DISABLE_LOADING_SCREEN) {
            this.fLoading = false;
            document.querySelector('#loading-overlay').style.display = 'none';
        }

        this.checkMouseOverUiPanel(cursor.x, cursor.y);

        // Update reference to object currently pointed at by mouse cursor
        this.pointedObject = pointedObject;

        // Update spinner text if loading
        if (this.fLoading) {
            let now = new Date().getTime();
            let dtSpinnerUpdate = now - this.tLastSpinnerUpdate;
            
            if (dtSpinnerUpdate > 500) {
                this.tLastSpinnerUpdate = now;
                let spinner = document.querySelector('#spinner');
                switch (spinner.innerHTML) {
                    case 'Loading':
                        spinner.innerHTML = 'Loading.';
                        break;
                    case 'Loading.':
                        spinner.innerHTML = 'Loading..';
                        break;
                    case 'Loading..':
                        spinner.innerHTML = 'Loading...';
                        break;
                    default:
                        spinner.innerHTML = 'Loading.'
                        break;
                }
            }
        }

        // Check if cursor is pointing at an object
        if (this.pointedObject != null) {
            //console.log(this.pointedObject);
            // Show tooltip with star name on mouseover
            let starName = this.pointedObject.object.userData.name;
            this.tooltip.style.visibility = 'visible';

            // Set tooltip position to upper-right of star
            this.tooltip.style.left = (cursor.x + 1) / 2 * window.innerWidth + 5 + 'px';
            this.tooltip.style.top = (-cursor.y + 1) / 2 * window.innerHeight - 30 + 'px';
            this.tooltip.innerHTML = starName;
    
            // Set the cursor icon to the one with the little question mark
            document.body.style.cursor = 'help';
        } else {
            // Hide the tooltip and reset the cursor icon
            this.tooltip.style.visibility = 'hidden';
            document.body.style.cursor = 'auto';
        }
    }
}

export default GuiManager;
