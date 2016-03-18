/// <reference path="_reference.ts"/>
// MAIN GAME FILE
// THREEJS Aliases
var Scene = Physijs.Scene;
var Renderer = THREE.WebGLRenderer;
var PerspectiveCamera = THREE.PerspectiveCamera;
var BoxGeometry = THREE.BoxGeometry;
var CubeGeometry = THREE.CubeGeometry;
var PlaneGeometry = THREE.PlaneGeometry;
var SphereGeometry = THREE.SphereGeometry;
var Line = THREE.Line;
var Geometry = THREE.Geometry;
var AxisHelper = THREE.AxisHelper;
var Texture = THREE.Texture;
var LambertMaterial = THREE.MeshLambertMaterial;
var PhongMaterial = THREE.MeshPhongMaterial;
var MeshBasicMaterial = THREE.MeshBasicMaterial;
var LineBasicMaterial = THREE.LineBasicMaterial;
var Material = THREE.Material;
var Mesh = THREE.Mesh;
var Object3D = THREE.Object3D;
var SpotLight = THREE.SpotLight;
var PointLight = THREE.PointLight;
var AmbientLight = THREE.AmbientLight;
var Control = objects.Control;
var GUI = dat.GUI;
var Color = THREE.Color;
var Vector3 = THREE.Vector3;
var Face3 = THREE.Face3;
var Point = objects.Point;
var CScreen = config.Screen;
var Clock = THREE.Clock;
//Custom Game Objects
var gameObject = objects.gameObject;
// Setup a Web Worker for Physijs
Physijs.scripts.worker = "/Scripts/lib/Physijs/physijs_worker.js";
Physijs.scripts.ammo = "/Scripts/lib/Physijs/examples/js/ammo.js";
// setup an IIFE structure (Immediately Invoked Function Expression)
var game = (function () {
    // declare game objects
    var havePointerLock;
    var element;
    var scene = new Scene(); // Instantiate Scene Object
    var renderer;
    var camera;
    var control;
    var gui;
    var stats;
    var blocker;
    var instructions;
    var spotLight;
    var ambientLight;
    var groundGeometry;
    var groundPhysicsMaterial;
    var groundMaterial;
    var groundTexture;
    var groundTextureNormal;
    var ground;
    var ground2;
    var clock;
    var playerGeometry;
    var playerPhysicsMaterial;
    var playerMaterial;
    var playerTexture;
    var player;
    var sphereGeometry;
    var sphereMaterial;
    var sphere;
    var keyboardControls;
    var mouseControls;
    var isGrounded;
    var velocity = new Vector3(0, 0, 0);
    var prevTime = 0;
    var directionLineMaterial;
    var directionLineGeometry;
    var directionLine;
    var direction;
    var cameraLookAt;
    var onGround1;
    var tempObj;
    var speedMultiplier;
    function init() {
        // Create to HTMLElements
        blocker = document.getElementById("blocker");
        instructions = document.getElementById("instructions");
        //check to see if pointerlock is supported
        havePointerLock = 'pointerLockElement' in document ||
            'mozPointerLockElement' in document ||
            'webkitPointerLockElement' in document;
        // Instantiate Game Controls
        keyboardControls = new objects.KeyboardControls();
        mouseControls = new objects.MouseControls();
        direction = new Vector3(0, 0, 0);
        // Initialize player onGround1 to be true
        onGround1 = true;
        // Set Speed Multiplier
        speedMultiplier = 1;
        // Check for Pointer Lock
        if (havePointerLock) {
            element = document.body;
            instructions.addEventListener('click', function () {
                // Ask the user for pointer lock
                console.log("Requesting PointerLock");
                element.requestPointerLock = element.requestPointerLock ||
                    element.mozRequestPointerLock ||
                    element.webkitRequestPointerLock;
                element.requestPointerLock();
            });
            document.addEventListener('pointerlockchange', pointerLockChange, false);
            document.addEventListener('mozpointerlockchange', pointerLockChange, false);
            document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
            document.addEventListener('pointerlockerror', pointerLockError, false);
            document.addEventListener('mozpointerlockerror', pointerLockError, false);
            document.addEventListener('webkitpointerlockerror', pointerLockError, false);
            // Hook mouse move events
            document.addEventListener("mousemove", this.moveCallback, false);
        }
        // Scene changes for Physijs
        scene.name = "Main";
        scene.fog = new THREE.Fog(0xffffff, 0, 500);
        scene.setGravity(new THREE.Vector3(0, -40, 0));
        scene.addEventListener('update', function () {
            scene.simulate(undefined, 2);
        });
        // setup a THREE.JS Clock object
        clock = new Clock();
        setupRenderer(); // setup the default renderer
        setupCamera(); // setup the camera
        // Add an AmbientLight to the scene
        ambientLight = new AmbientLight(0x909090);
        scene.add(ambientLight);
        console.log("Added an Ambient Light to Scene");
        /* Spot Light
        spotLight = new SpotLight(0xffffff);
        spotLight.position.set(20, 40, -15);
        spotLight.castShadow = true;
        spotLight.intensity = 2;
        spotLight.lookAt(new Vector3(0, 0, 0));
        spotLight.shadowCameraNear = 2;
        spotLight.shadowCameraFar = 200;
        spotLight.shadowCameraLeft = -5;
        spotLight.shadowCameraRight = 5;
        spotLight.shadowCameraTop = 5;
        spotLight.shadowCameraBottom = -5;
        spotLight.shadowMapWidth = 2048;
        spotLight.shadowMapHeight = 2048;
        spotLight.shadowDarkness = 0.5;
        spotLight.name = "Spot Light";
        scene.add(spotLight);
        console.log("Added spotLight to scene");*/
        // Ground Object
        /* Texture
        groundTexture = new THREE.TextureLoader().load('../../Assets/images/GravelCobble.jpg');
        groundTexture.wrapS = THREE.RepeatWrapping;
        groundTexture.wrapT = THREE.RepeatWrapping;
        groundTexture.repeat.set(4, 4);
        // Normal Map
        groundTextureNormal = new THREE.TextureLoader().load('../../Assets/images/GravelCobbleNormal.jpg');
        groundTextureNormal.wrapS = THREE.RepeatWrapping;
        groundTextureNormal.wrapT = THREE.RepeatWrapping;
        groundTextureNormal.repeat.set(4, 4);
        
        groundMaterial.map = groundTexture;
        groundMaterial.bumpMap = groundTextureNormal;
        groundMaterial.bumpScale = 0.2;*/
        groundMaterial = new PhongMaterial({ color: 0x00FFFF });
        var GroundMaterial2 = new PhongMaterial({ color: 0xFFFF00 });
        groundGeometry = new BoxGeometry(1600, 0.5, 1600);
        groundPhysicsMaterial = Physijs.createMaterial(groundMaterial, 0, 0);
        var groundPhysicsMaterial2 = Physijs.createMaterial(GroundMaterial2, 0, 0);
        ground = new Physijs.ConvexMesh(groundGeometry, groundPhysicsMaterial, 0);
        ground.receiveShadow = true;
        ground.name = "Ground 1";
        scene.add(ground);
        ground.position.set(0, 0, 0);
        ground.__dirtyPosition = true;
        console.log("Added Ground 1 to scene");
        ground2 = new Physijs.ConvexMesh(groundGeometry, groundPhysicsMaterial2, 0);
        ground2.receiveShadow = true;
        ground2.name = "Ground 2";
        ground2.position.set(0, 0, -1600);
        ground2.__dirtyPosition = true;
        scene.add(ground2);
        console.log("Added Ground 2 to scene");
        // Player Object
        /* Player Texture
        playerTexture = new THREE.TextureLoader().load('../../Assets/images/metalTexture.jpg');
        playerTexture.wrapS = THREE.RepeatWrapping;
        playerTexture.wrapT = THREE.RepeatWrapping;
        playerTexture.repeat.set(2, 2);
        
        playerMaterial.map = groundTexture;*/
        playerMaterial = new PhongMaterial({ color: 0xFF0000 });
        playerGeometry = new BoxGeometry(20, 4, 8);
        playerPhysicsMaterial = Physijs.createMaterial(playerMaterial, 0, 0);
        player = new Physijs.BoxMesh(playerGeometry, playerPhysicsMaterial, 2);
        player.position.set(0, 2, 10);
        player.receiveShadow = true;
        player.castShadow = true;
        player.name = "Player";
        scene.add(player);
        console.log("Added Player to Scene");
        player.addEventListener('collision', function (object) {
            if (object.name === "Ground 1") {
                if (!onGround1) {
                    setTimeout(function () {
                        ground2.position.set(0, 0, ground2.position.z - 3200);
                        ground2.__dirtyPosition = true;
                    }, 1000);
                }
                onGround1 = true;
                console.log("player hit the ground 1");
                isGrounded = true;
            }
            if (object.name === "Ground 2") {
                if (onGround1) {
                    setTimeout(function () {
                        ground.position.set(0, 0, ground.position.z - 3200);
                        ground.__dirtyPosition = true;
                    }, 1000);
                }
                onGround1 = false;
                console.log("player hit the ground 2");
                isGrounded = true;
            }
            if (object.name === "Sphere") {
                scene.remove(object);
                scene.add(object);
                sphere.position.set(0, 2, sphere.position.z - 300);
                sphere.__dirtyPosition = true;
                console.log("player hit the sphere");
            }
        });
        // Add camera lookAt
        cameraLookAt = new Object3D();
        cameraLookAt.name = "Camera LookAt";
        scene.add(cameraLookAt);
        cameraLookAt.position.set(player.position.x, 2, player.position.z - 4);
        // Add camera to cameraLookAt
        cameraLookAt.add(camera);
        playerTexture = new THREE.TextureLoader().load('../../Assets/images/reticle.png');
        playerTexture.wrapS = THREE.RepeatWrapping;
        playerTexture.wrapT = THREE.RepeatWrapping;
        playerTexture.repeat.set(1, 1);
        var tempGeom = new PlaneGeometry(0.16, 0.09);
        var tempMat = new LambertMaterial();
        tempMat.map = playerTexture;
        tempMat.transparent = true;
        tempMat.opacity = 1;
        tempObj = new Mesh(tempGeom, tempMat);
        cameraLookAt.add(tempObj);
        tempObj.position.set(0, 0, -0.2);
        // Add DirectionLine
        directionLineMaterial = new LineBasicMaterial({ color: 0xFFFF00 });
        directionLineGeometry = new Geometry();
        directionLineGeometry.vertices.push(new Vector3(0, 0, 0)); // line origin
        directionLineGeometry.vertices.push(new Vector3(0, 0, -500)); // line end
        directionLine = new Line(directionLineGeometry, directionLineMaterial);
        directionLine.name = "DirectionLine";
        tempObj.add(directionLine);
        console.log("Added directionLine to cameraLookAt...");
        directionLine.addEventListener('collision', function (object) {
            if (object.name === "Sphere") {
                //scene.remove(object);
                console.log("line hit the sphere");
            }
        });
        // Sphere Object
        sphereGeometry = new SphereGeometry(1, 4, 2);
        sphereMaterial = Physijs.createMaterial(new LambertMaterial({ color: 0x00ff00 }), 0, 0);
        sphere = new Physijs.SphereMesh(sphereGeometry, sphereMaterial, 0.0000001);
        sphere.position.set(0, 2, -120);
        sphere.receiveShadow = true;
        sphere.castShadow = true;
        sphere.name = "Sphere";
        scene.add(sphere);
        console.log("Added Sphere to Scene");
        // add controls
        gui = new GUI();
        control = new Control();
        addControl(control);
        // Add framerate stats
        addStatsObject();
        console.log("Added Stats to scene...");
        document.body.appendChild(renderer.domElement);
        gameLoop(); // render the scene	
        scene.simulate();
        window.addEventListener('resize', onWindowResize, false);
    }
    //PointerLockChange Event Handler
    function pointerLockChange(event) {
        if (document.pointerLockElement === element /*||
            document.mozPointerLockElement === element ||
            document.webkitPointerLockElement === element*/) {
            // enable our mouse and keyboard controls
            mouseControls.enabled = true;
            keyboardControls.enabled = true;
            blocker.style.display = 'none';
        }
        else {
            // disable our mouse and keyboard controls
            mouseControls.enabled = false;
            keyboardControls.enabled = false;
            blocker.style.display = '-webkit-box';
            blocker.style.display = '-moz-box';
            blocker.style.display = 'box';
            instructions.style.display = '';
            console.log("PointerLock disabled");
        }
    }
    //PointerLockError Event Handler
    function pointerLockError(event) {
        instructions.style.display = '';
        console.log("PointerLock Error Detected!!");
    }
    // Window Resize Event Handler
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    function addControl(controlObject) {
        /* ENTER CODE for the GUI CONTROL HERE */
    }
    // Add Frame Rate Stats to the Scene
    function addStatsObject() {
        stats = new Stats();
        stats.setMode(0);
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';
        document.body.appendChild(stats.domElement);
    }
    // Setup main game loop
    function gameLoop() {
        stats.update();
        //speedMultiplier += 0.00001;
        cameraLookAt.position.set(player.position.x, player.position.y, player.position.z - 4);
        if (tempObj.position.x <= sphere.position.x + 0.005 && tempObj.position.x >= sphere.position.x - 0.005) {
            if (tempObj.position.y <= sphere.position.y + 2 && tempObj.position.y >= sphere.position.y - 2) {
            }
        }
        checkControls();
        // render using requestAnimationFrame
        requestAnimationFrame(gameLoop);
        // render the scene
        renderer.render(scene, camera);
    }
    // Check Controls
    function checkControls() {
        if (keyboardControls.enabled) {
            velocity = new Vector3();
            var time = performance.now();
            var delta = (time - prevTime) / 1000;
            var direction = new Vector3(0, 0, 0);
            velocity.z = -12000.00 * delta;
            if (isGrounded) {
                if (keyboardControls.moveForward) {
                    velocity.z *= 4.0;
                }
                /*if (keyboardControls.moveLeft) {
                    velocity.x -= 12000.0 * delta;
                }*/
                if (keyboardControls.moveBackward) {
                    velocity.z *= 0.25;
                }
                /*if (keyboardControls.moveRight) {
                    velocity.x += 12000.0 * delta;
                }*/
                if (keyboardControls.jump && !keyboardControls.duck) {
                    velocity.y += 24000.0 * delta;
                    if (player.position.y > 4) {
                        isGrounded = false;
                    }
                }
                if (keyboardControls.duck) {
                }
                player.setDamping(0.7, 1);
                // Changing player rotation
                direction.addVectors(direction, velocity); // Add velocity to player Vector
                direction.applyQuaternion(player.quaternion); // Apply player angle
                if (Math.abs(player.getLinearVelocity().x) < 20 && Math.abs(player.getLinearVelocity().y) < 10) {
                    player.applyCentralForce(direction);
                }
            } // isGrounded
            cameraLook();
            mouseControls.pitch = 0;
            mouseControls.yaw = 0;
            mouseControls.mouseX = 0;
            mouseControls.mouseY = 0;
            prevTime = time;
            player.__dirtyRotation;
            player.rotation.set(0, 0, 0);
            player.__dirtyRotation = true;
        } // keyboardControls.enabled
        else {
            player.setAngularVelocity(new Vector3(0, 0, 0));
        }
    }
    // Camera Look function
    function cameraLook() {
        var zenith = THREE.Math.degToRad(3);
        var nadir = THREE.Math.degToRad(-3);
        var cameraPitch = cameraLookAt.rotation.x + mouseControls.pitch;
        var cameraYaw = cameraLookAt.rotation.y + mouseControls.yaw;
        // Constraints
        cameraLookAt.rotation.x = THREE.Math.clamp(cameraPitch, nadir, zenith);
        cameraLookAt.rotation.y = THREE.Math.clamp(cameraYaw, nadir, zenith);
        // Constrain Reticle
        if (tempObj.position.x > 0.12) {
            tempObj.position.x -= 0.001;
        }
        else if (tempObj.position.x < -0.12) {
            tempObj.position.x += 0.001;
        }
        else {
            tempObj.position.x += mouseControls.mouseX;
        }
        if (tempObj.position.y > 0.06) {
            tempObj.position.y -= 0.001;
        }
        else if (tempObj.position.y < -0.06) {
            tempObj.position.y += 0.001;
        }
        else {
            tempObj.position.y += mouseControls.mouseY;
        }
        // Update collision line
        directionLineGeometry.vertices[1].set(tempObj.position.x, tempObj.position.y, tempObj.position.z);
        directionLineGeometry.verticesNeedUpdate = true;
        camera.rotation.x = cameraLookAt.rotation.x;
        camera.rotation.y = cameraLookAt.rotation.y;
    }
    // Setup default renderer
    function setupRenderer() {
        renderer = new Renderer({ antialias: true });
        renderer.setClearColor(0x404040, 1.0);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(CScreen.WIDTH, CScreen.HEIGHT);
        renderer.shadowMap.enabled = true;
        console.log("Finished setting up Renderer...");
    }
    // Setup main camera for the scene
    function setupCamera() {
        camera = new PerspectiveCamera(35, config.Screen.RATIO, 0.1, 500);
        //camera.position.set(0, 30, 80);         // 3P
        camera.position.set(0, 0, 0); // FP
        console.log("Finished setting up Camera...");
    }
    window.onload = init;
    return {
        scene: scene
    };
})();

//# sourceMappingURL=game.js.map
