// Josh Bender - 300746563
// Assignment 3 for Comp 392 - Advanced Graphics
// Last Updated Friday, Match 25th

module objects {
    // MouseControls Class +++++++++++++++
    export class MouseControls {
        // PUBLIC INSTANCE VARIABLES +++++++++
        public sensitivity: number;
        public yaw: number;     // Left-Right look - Y-Axis
        public pitch: number;   // Up-Down look - X-Axis
        public enabled: boolean;
        public mouseX: number;
        public mouseY: number;
        public rayX: number;
        public rayY: number;
        
        // CONSTRUCTOR +++++++++++++++++++++++
        constructor() {
            this.enabled = false;
            this.sensitivity = 0.0001;
            this.yaw = 0;
            this.pitch = 0;
            this.mouseX = 0;
            this.mouseY = 0;
            this.rayX = 0;
            this.rayY = 0;
            
            document.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        }
        
        // PUBLIC METHODS +++++++++++++++++++++
        public onMouseMove(event: MouseEvent): void {
            this.yaw = -event.movementX * this.sensitivity;
            this.pitch = -event.movementY * this.sensitivity;
            this.mouseX = event.movementX * 0.0008;
            this.mouseY = event.movementY * -0.0008;
			this.rayX = ( event.clientX / window.innerWidth ) * 2 - 1;
			this.rayY = - ( event.clientY / window.innerHeight ) * 2 + 1;
			//this.rayX = ( event.clientX / window.innerWidth ) * 2 - 1;
			//this.rayY = - ( event.clientY / window.innerHeight ) * 2 + 1;
        }
    }
}