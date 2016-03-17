/// <reference path="_reference.ts"/>

// MAIN GAME FILE

// THREEJS Aliases
import Scene = Physijs.Scene;
import Renderer = THREE.WebGLRenderer;
import PerspectiveCamera = THREE.PerspectiveCamera;
import BoxGeometry = THREE.BoxGeometry;
import CubeGeometry = THREE.CubeGeometry;
import PlaneGeometry = THREE.PlaneGeometry;
import SphereGeometry = THREE.SphereGeometry;
import Line = THREE.Line;
import Geometry = THREE.Geometry;
import AxisHelper = THREE.AxisHelper;
import Texture = THREE.Texture;
import LambertMaterial = THREE.MeshLambertMaterial;
import PhongMaterial = THREE.MeshPhongMaterial;
import MeshBasicMaterial = THREE.MeshBasicMaterial;
import LineBasicMaterial = THREE.LineBasicMaterial;
import Material = THREE.Material;
import Mesh = THREE.Mesh;
import Object3D = THREE.Object3D;
import SpotLight = THREE.SpotLight;
import PointLight = THREE.PointLight;
import AmbientLight = THREE.AmbientLight;
import Control = objects.Control;
import GUI = dat.GUI;
import Color = THREE.Color;
import Vector3 = THREE.Vector3;
import Face3 = THREE.Face3;
import Point = objects.Point;
import CScreen = config.Screen;
import Clock = THREE.Clock;

//Custom Game Objects
import gameObject = objects.gameObject;

// Setup a Web Worker for Physijs
Physijs.scripts.worker = "/Scripts/lib/Physijs/physijs_worker.js";
Physijs.scripts.ammo = "/Scripts/lib/Physijs/examples/js/ammo.js";


// setup an IIFE structure (Immediately Invoked Function Expression)
var game = (() => {

    // declare game objects
    var havePointerLock: boolean;
    var element: any;
    var scene: Scene = new Scene(); // Instantiate Scene Object
    var renderer: Renderer;
    var camera: PerspectiveCamera;
    var control: Control;
    var gui: GUI;
    var stats: Stats;
    var blocker: HTMLElement;
    var instructions: HTMLElement;
    var spotLight: SpotLight;
    var ambientLight: AmbientLight;
    var groundGeometry: CubeGeometry;
    var groundPhysicsMaterial: Physijs.Material;
    var groundMaterial: PhongMaterial;
    var groundTexture: Texture;
    var groundTextureNormal: Texture;
    var ground: Physijs.Mesh;
    var clock: Clock;   
    var playerGeometry: CubeGeometry;
    var playerPhysicsMaterial: Physijs.Material;
    var playerMaterial: PhongMaterial;
    var playerTexture: Texture;
    var player: Physijs.Mesh;
    var sphereGeometry: SphereGeometry;
    var sphereMaterial: Physijs.Material;
    var sphere: Physijs.Mesh;
    var keyboardControls: objects.KeyboardControls;
    var mouseControls: objects.MouseControls;
    var isGrounded: boolean;
    var velocity: Vector3 = new Vector3(0, 0, 0);
    var prevTime: number = 0;
    var directionLineMaterial: LineBasicMaterial;
    var directionLineGeometry: Geometry;
    var directionLine: Line;
    var direction: Vector3;
    var cameraLookAt: Object3D;

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

        // Check for Pointer Lock
        if (havePointerLock) {
            element = document.body;

            instructions.addEventListener('click', () => {

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

        scene.addEventListener('update', () => {    
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
        
        groundGeometry = new BoxGeometry(4000, 1, 4000);
        groundPhysicsMaterial = Physijs.createMaterial(groundMaterial, 0, 0);
        ground = new Physijs.ConvexMesh(groundGeometry, groundPhysicsMaterial, 0);
        ground.receiveShadow = true;
        ground.name = "Ground";
        scene.add(ground);
        console.log("Added Endless Plane to scene");

        // Player Object
        /* Player Texture
        playerTexture = new THREE.TextureLoader().load('../../Assets/images/metalTexture.jpg');
        playerTexture.wrapS = THREE.RepeatWrapping;
        playerTexture.wrapT = THREE.RepeatWrapping;
        playerTexture.repeat.set(2, 2);
        
        playerMaterial.map = groundTexture;*/
        playerMaterial = new PhongMaterial({ color: 0xFF0000 });
        
        playerGeometry = new BoxGeometry(20, 4, 1);
        playerPhysicsMaterial = Physijs.createMaterial(playerMaterial, 0, 0);

        player = new Physijs.BoxMesh(playerGeometry, playerPhysicsMaterial, 2);
        player.position.set(0, 2, 10);
        player.receiveShadow = true;
        player.castShadow = true;
        player.name = "Player";
        scene.add(player);
        console.log("Added Player to Scene");

        player.addEventListener('collision', (object) => {
            if (object.name === "Ground") {
                console.log("player hit the ground");
                isGrounded = true;
            }
            if (object.name === "Sphere") {
                console.log(event);
                scene.remove(object);
                console.log("player hit the sphere");
            }
        });
        
        // Add DirectionLine
        directionLineMaterial = new LineBasicMaterial({ color: 0xFFFF00 });
        directionLineGeometry = new Geometry();
        directionLineGeometry.vertices.push(new Vector3(0, 0, 0)); // line origin
        directionLineGeometry.vertices.push(new Vector3(0, 0, -50)); // line end
        directionLine = new Line(directionLineGeometry, directionLineMaterial);
        player.add(directionLine);
        console.log("Added directionLine to Player...")
        
        // Add camera lookAt
        cameraLookAt = new Object3D();
        cameraLookAt.name = "Camera LookAt"
        scene.add(cameraLookAt);
        cameraLookAt.position.set(player.position.x, 2, player.position.z);
        
        // Add camera to cameraLookAt
        cameraLookAt.add(camera);
        
        /*var tempGeom: Geometry = new PlaneGeometry(1, 1);
        var tempMat: LambertMaterial = new LambertMaterial({color: 0xFFFF00});
        tempMat.transparent = true;
        tempMat.opacity = 0.1;
        var tempObj: Mesh = new Mesh(tempGeom, tempMat);
        camera.add(tempObj);
        tempObj.position.set(0, 0,-0.2);*/
        
        
        // Sphere Object
        sphereGeometry = new SphereGeometry(1, 32, 32);
        sphereMaterial = Physijs.createMaterial(new LambertMaterial({ color: 0x00ff00 }), 0.4, 0);
        sphere = new Physijs.SphereMesh(sphereGeometry, sphereMaterial, 1);
        sphere.position.set(0, 10, 5);
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
    function pointerLockChange(event): void {
        if (document.pointerLockElement === element /*||
            document.mozPointerLockElement === element ||
            document.webkitPointerLockElement === element*/) {
            // enable our mouse and keyboard controls
            mouseControls.enabled = true;
            keyboardControls.enabled = true;
            blocker.style.display = 'none';
        } else {
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
    function pointerLockError(event): void {
        instructions.style.display = '';
        console.log("PointerLock Error Detected!!");
    }

    // Window Resize Event Handler
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function addControl(controlObject: Control): void {
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
    function gameLoop(): void {
        stats.update();
        cameraLookAt.position.set(player.position.x, player.position.y, player.position.z);
        
        checkControls();
        
        // render using requestAnimationFrame
        requestAnimationFrame(gameLoop);

        // render the scene
        renderer.render(scene, camera);
    }

    // Check Controls
    function checkControls(){
        if (keyboardControls.enabled) {
            
            velocity = new Vector3();
            
            var time: number = performance.now();
            var delta: number = (time - prevTime) / 1000;
            
            var direction = new Vector3(0, 0, 0);

            if (isGrounded) {
                if (keyboardControls.moveForward) {
                    velocity.z -= 12000.0 * delta;
                }
                if (keyboardControls.moveLeft) {
                    velocity.x -= 12000.0 * delta;
                }
                if (keyboardControls.moveBackward) {
                    velocity.z += 12000.0 * delta;
                }
                if (keyboardControls.moveRight) {
                    velocity.x += 12000.0 * delta;
                }
                if (keyboardControls.jump && !keyboardControls.duck){
                    velocity.y += 24000.0 * delta;
                    if(player.position.y > 4) {
                        isGrounded = false;
                    }
                }
                if (keyboardControls.duck){
                    //
                }
                player.setDamping(0.7, 0.1);
                // Chaning player rotation
                player.setAngularVelocity(new Vector3(0, -mouseControls.yaw, 0));
                direction.addVectors(direction, velocity);      // Add velocity to player Vector
                direction.applyQuaternion(player.quaternion);   // Apply player angle
                
                if (Math.abs(player.getLinearVelocity().x) < 20 && Math.abs(player.getLinearVelocity().y) < 10) {
                    player.applyCentralForce(direction);
                }
                
                cameraLook();
                
            } // isGrounded
            
            mouseControls.pitch = 0;
            mouseControls.yaw = 0;
            prevTime = time;

        } // keyboardControls.enabled
        else {
            player.setAngularVelocity(new Vector3(0, 0, 0));
        }
    }

    // Camera Look function
    function cameraLook(): void {
        var zenith: number = THREE.Math.degToRad(90);
        var nadir: number = THREE.Math.degToRad(-90);
        
        var cameraPitch: number = camera.rotation.x + mouseControls.pitch;
        
        // Constraints
        camera.rotation.x = THREE.Math.clamp(cameraPitch, nadir, zenith);
    }

    // Setup default renderer
    function setupRenderer(): void {
        renderer = new Renderer({ antialias: true });
        renderer.setClearColor(0x404040, 1.0);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(CScreen.WIDTH, CScreen.HEIGHT);
        renderer.shadowMap.enabled = true;
        console.log("Finished setting up Renderer...");
    }

    // Setup main camera for the scene
    function setupCamera(): void {
        camera = new PerspectiveCamera(35, config.Screen.RATIO, 0.1, 500);
        //camera.lookAt(new Vector3(0, 0, 0));  
        camera.position.set(0, 10, 30);         // 3P
        //camera.position.set(0, 1, -2);        // FP
        console.log("Finished setting up Camera...");
    }

    window.onload = init;

    return {
        scene: scene
    }

})();