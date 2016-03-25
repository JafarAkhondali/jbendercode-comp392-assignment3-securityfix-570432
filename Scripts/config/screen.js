// Josh Bender - 300746563
// Assignment 3 for Comp 392 - Advanced Graphics
// Last Updated Friday, Match 25th
var config;
(function (config) {
    var Screen = (function () {
        function Screen() {
        }
        Screen.WIDTH = window.innerWidth;
        Screen.HEIGHT = window.innerHeight;
        Screen.RATIO = window.innerWidth / window.innerHeight;
        return Screen;
    }());
    config.Screen = Screen;
})(config || (config = {}));

//# sourceMappingURL=screen.js.map
