var objects;
(function (objects) {
    // MouseControls Class +++++++++++++++
    var MouseControls = (function () {
        // CONSTRUCTOR +++++++++++++++++++++++
        function MouseControls() {
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
        MouseControls.prototype.onMouseMove = function (event) {
            this.yaw = -event.movementX * this.sensitivity;
            this.pitch = -event.movementY * this.sensitivity;
            this.mouseX = event.movementX * 0.0008;
            this.mouseY = event.movementY * -0.0008;
            this.rayX = (event.clientX / window.innerWidth) * 2 - 1;
            this.rayY = -(event.clientY / window.innerHeight) * 2 + 1;
            //this.rayX = ( event.clientX / window.innerWidth ) * 2 - 1;
            //this.rayY = - ( event.clientY / window.innerHeight ) * 2 + 1;
        };
        return MouseControls;
    }());
    objects.MouseControls = MouseControls;
})(objects || (objects = {}));

//# sourceMappingURL=mousecontrols.js.map
