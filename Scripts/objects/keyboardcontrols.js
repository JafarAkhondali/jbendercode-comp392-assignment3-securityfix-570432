var objects;
(function (objects) {
    // KeyboardControls Class +++++++++++++++
    var KeyboardControls = (function () {
        // CONSTRUCTOR ++++++++++++++++++++++++++    
        function KeyboardControls() {
            document.addEventListener('keydown', this.onKeyDown.bind(this), false);
            document.addEventListener('keyup', this.onKeyUp.bind(this), false);
        }
        // PUBLIC METHODS
        KeyboardControls.prototype.onKeyDown = function (event) {
            switch (event.keyCode) {
                // Forward
                case 38: // Up Arrow
                case 87:
                    this.moveForward = true;
                    break;
                // Left
                case 37: // Left Arrow
                case 65:
                    this.moveLeft = true;
                    break;
                // Down
                case 40: // Down Arrow
                case 83:
                    this.moveBackward = true;
                    break;
                // Right
                case 39: // Right Arrow
                case 68:
                    this.moveRight = true;
                    break;
                // Jump
                case 32:
                    this.jump = true;
                    break;
            }
        };
        KeyboardControls.prototype.onKeyUp = function (event) {
            switch (event.keyCode) {
                // Forward
                case 38: // Up Arrow
                case 87:
                    this.moveForward = false;
                    break;
                // Left
                case 37: // Left Arrow
                case 65:
                    this.moveLeft = false;
                    break;
                // Down
                case 40: // Down Arrow
                case 83:
                    this.moveBackward = false;
                    break;
                // Right
                case 39: // Right Arrow
                case 68:
                    this.moveRight = false;
                    break;
                // Jump
                case 32:
                    this.jump = false;
                    break;
            }
        };
        return KeyboardControls;
    }());
    objects.KeyboardControls = KeyboardControls;
})(objects || (objects = {}));

//# sourceMappingURL=keyboardcontrols.js.map
