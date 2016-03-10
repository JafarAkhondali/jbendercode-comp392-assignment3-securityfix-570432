module objects {
    // KeyboardControls Class +++++++++++++++
    export class KeyboardControls {
        // PUBLIC INSTANCE VARIABLES ++++++++++++
        public moveForward: boolean;
        public moveBackward: boolean;
        public moveLeft: boolean;
        public moveRight: boolean;
        public jump: boolean;
        
        // CONSTRUCTOR ++++++++++++++++++++++++++    
        constructor() {
            document.addEventListener('keydown', this.onKeyDown.bind(this), false);
            document.addEventListener('keyup', this.onKeyUp.bind(this), false);
        }
        
        // PUBLIC METHODS
        public onKeyDown(event: KeyboardEvent):void {
            switch(event.keyCode) {
                
                // Forward
                case 38: // Up Arrow
                case 87: // W Key
                this.moveForward = true;
                break;
                
                // Left
                case 37: // Left Arrow
                case 65: // A Key
                this.moveLeft = true;
                break;
                
                // Down
                case 40: // Down Arrow
                case 83: // S Key
                this.moveBackward = true;
                break;
                
                // Right
                case 39: // Right Arrow
                case 68: // D Key
                this.moveRight = true;
                break;
                
                // Jump
                case 32: // Space Bar
                this.jump = true;
                break;
            }
        }
        
        public onKeyUp(event: KeyboardEvent):void {
            switch(event.keyCode) {
                
                // Forward
                case 38: // Up Arrow
                case 87: // W Key
                this.moveForward = false;
                break;
                
                // Left
                case 37: // Left Arrow
                case 65: // A Key
                this.moveLeft = false;
                break;
                
                // Down
                case 40: // Down Arrow
                case 83: // S Key
                this.moveBackward = false;
                break;
                
                // Right
                case 39: // Right Arrow
                case 68: // D Key
                this.moveRight = false;
                break;
                
                // Jump
                case 32: // Space Bar
                this.jump = false;
                break;
            }
        }
    }
}