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
        
        // CONSTRUCTOR +++++++++++++++++++++++
        constructor() {
            this.enabled = false;
            this.sensitivity = 0.0001;
            this.yaw = 0;
            this.pitch = 0;
            this.mouseX = 0;
            this.mouseY = 0;
            
            document.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        }
        
        // PUBLIC METHODS +++++++++++++++++++++
        public onMouseMove(event: MouseEvent): void {
            this.yaw = -event.movementX * this.sensitivity;
            this.pitch = -event.movementY * this.sensitivity;
            this.mouseX = event.movementX * 0.0008;
            this.mouseY = event.movementY * -0.0008;
        }
    }
}