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
import Color = THREE.Color;
import Vector3 = THREE.Vector3;
import Face3 = THREE.Face3;
import CScreen = config.Screen;
import Clock = THREE.Clock;

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
    var ground2: Physijs.Mesh;
    var clock: Clock;   
    var playerGeometry: CubeGeometry;
    var playerPhysicsMaterial: Physijs.Material;
    var playerMaterial: PhongMaterial;
    var player: Physijs.Mesh;
    var gemGeometry: SphereGeometry;
    var gemMaterial: Physijs.Material;
    var gem: Physijs.Mesh;
    var keyboardControls: objects.KeyboardControls;
    var mouseControls: objects.MouseControls;
    var isGrounded: boolean;
    var velocity: Vector3 = new Vector3(0, 0, 0);
    var prevTime: number = 0;
    var direction: Vector3;
    var cameraLookAt: Object3D;
    var onGround1: boolean;
    var speedMultiplier: number;
    var obstacleSlowdown: number;
    var reticle: Mesh;
    var reticleTexture: Texture;
    var reticleGeom: Geometry;
    var reticleMat: LambertMaterial
    var reticleColliderGeom: Geometry;
    var reticleColliderMat: LambertMaterial;
    var reticleColliderPhysicsMat: Physijs.Material;
    var reticleCollider: Physijs.Mesh;
    var warningGeom: Geometry;
    var warningMat: Material;
    var warning: Mesh;
    var lowObstacles: Physijs.Mesh[];
    var lowObstacleGeom: Geometry;
    var lowObstacleMat: LambertMaterial;
    var lowObstacleTexture: Texture;
    var lowObstaclePhysicsMat: Physijs.Material;
    var highObstacles: Physijs.Mesh[];
    var highObstacleGeom: Geometry;
    var highObstacleMat: LambertMaterial;
    var highObstacleTexture: Texture;
    var highObstaclePhysicsMat: Physijs.Material;
    var currentObstacle: number;
    var obstaclesPlaced: number;
    
    
    // Create JS variables
    var assets: createjs.LoadQueue;
    var manifest = [
      {id: "reticle", src: "../../Assets/images/reticle.png"}  
    ];
    
    function preload(): void {
        assets = new createjs.LoadQueue();
        assets.installPlugin(createjs.Sound);
        assets.on("complete", init, this);
        assets.loadManifest(manifest);
    }

    function init(): void {   
        
        // Create instruction  HTMLElements
        blocker = document.getElementById("blocker");
        instructions = document.getElementById("instructions");

        //check to see if pointerlock is supported
        havePointerLock = 'pointerLockElement' in document || 
            'mozPointerLockElement' in document || 
            'webkitPointerLockElement' in document;
        
        // Instantiate Game Controls
        keyboardControls = new objects.KeyboardControls();
        mouseControls = new objects.MouseControls();
        
        // Initialize Game variables
        direction = new Vector3(0, 0, 0);
        onGround1 = true;
        speedMultiplier = 1;
        obstacleSlowdown = 1;
        currentObstacle = 0;
        obstaclesPlaced = 0;

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
        }

        // Scene changes for Physijs
        scene.name = "Main";
        scene.fog = new THREE.Fog(0xffffff, 0, 500);
        scene.setGravity(new THREE.Vector3(0, -40, 0));
        scene.addEventListener('update', () => {    
            scene.simulate(undefined, 2);
        });
    
        // Setup
        clock = new Clock();
        setupRenderer(); // setup the default renderer
        setupCamera(); // setup the camera

        // Ambient Light
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
        
        // Ground Objects
        groundMaterial = new PhongMaterial({ color: 0x00FFFF });
        var GroundMaterial2 = new PhongMaterial({ color: 0xFFFF00});
        groundGeometry = new BoxGeometry(1600, 0.5, 3200);
        groundPhysicsMaterial = Physijs.createMaterial(groundMaterial, 0, 0);
        var groundPhysicsMaterial2 = Physijs.createMaterial(GroundMaterial2, 0, 0);
        
        // Ground 1
        ground = new Physijs.ConvexMesh(groundGeometry, groundPhysicsMaterial, 0);
        ground.receiveShadow = true;
        ground.name = "Ground 1";
        scene.add(ground);
        ground.position.set(0, 0, 0);
        ground.__dirtyPosition = true;
        console.log("Added Ground 1 to scene");
        
        // Ground 2
        ground2 = new Physijs.ConvexMesh(groundGeometry, groundPhysicsMaterial2, 0);
        ground2.receiveShadow = true;
        ground2.name = "Ground 2";
        ground2.position.set(0, 0, -3200);
        ground2.__dirtyPosition = true;
        scene.add(ground2);
        console.log("Added Ground 2 to scene");

        // Player Object
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

        // Player Collisions
        player.addEventListener('collision', (object) => {
            if (object.name === "Ground 1") {
                if (!onGround1){
                    setTimeout(function() {
                        ground2.position.set(0, 0, ground2.position.z - 6400);
                        ground2.__dirtyPosition = true;
                    }, 1000);
                }
                onGround1 = true;
                console.log("player hit the ground 1");
                isGrounded = true;
            }
            if (object.name === "Ground 2") {
                if (onGround1){
                    setTimeout(function() {
                        ground.position.set(0, 0, ground.position.z - 6400);
                        ground.__dirtyPosition = true;
                    }, 1000);
                }
                onGround1 = false;
                console.log("player hit the ground 2");
                isGrounded = true;
            }
            if (object.name === "Gem") {
                scene.remove(object);
                gem.position.set(0, 2, gem.position.z - 240);
                gem.__dirtyPosition = true;
                scene.add(object);
                console.log("player hit the gem");
                warnPlayer();
            }
            if (object.name.indexOf("LowObstacle") > -1){
                scene.remove(object);
                spawnNewObstacle();
                //scene.add(object);
                console.log("player hit a Low Obstacle");
                warnPlayer();
                obstacleSlowdown =0.02;
                setTimeout(function() {
                    obstacleSlowdown = 1;
                }, 1000);
            }
            if (object.name.indexOf("HighObstacle") > -1){
                scene.remove(object);
                spawnNewObstacle();
                //scene.add(object);
                console.log("player hit a High Obstacle");
                warnPlayer();
                obstacleSlowdown =0.02;
                setTimeout(function() {
                    obstacleSlowdown = 1;
                }, 1000);
            }
        });
        
        // Add camera LookAt
        cameraLookAt = new Object3D();
        cameraLookAt.name = "Camera LookAt"
        scene.add(cameraLookAt);
        cameraLookAt.position.set(player.position.x, 2, player.position.z - 4);
        cameraLookAt.name = "Camera LookAt"
        cameraLookAt.add(camera);
        
        // Player Reticle
        reticleTexture = new THREE.TextureLoader().load('../../Assets/images/reticle.png');
        reticleTexture.wrapS = THREE.RepeatWrapping;
        reticleTexture.wrapT = THREE.RepeatWrapping;
        reticleTexture.repeat.set(1, 1);
        
        reticleGeom = new PlaneGeometry(0.16, 0.09);
        reticleMat = new LambertMaterial();
        reticleMat.map = reticleTexture;
        reticleMat.transparent = true;
        reticleMat.opacity = 1;
        reticle = new Mesh(reticleGeom, reticleMat);
        reticle.name = "Reticle";
        cameraLookAt.add(reticle);
        reticle.position.set(0, 0, -0.2);
        
        // Player Warning
        warningGeom = new PlaneGeometry(1, 1);
        warningMat = new LambertMaterial({ color: 0xFF0000 });
        warningMat.transparent = true;
        warningMat.opacity = 0;
        warning = new Mesh(warningGeom, warningMat);
        warning.name = "Warning";
        cameraLookAt.add(warning);
        warning.position.set(0, 0, -0.3);
        
        /* Add Reticle Collider
        reticleColliderMat = new PhongMaterial({ color: 0xFF0000 });
        reticleColliderGeom = new BoxGeometry(0.01, 0.01, 500);
        reticleColliderPhysicsMat = Physijs.createMaterial(reticleColliderMat, 0, 0);

        reticleCollider = new Physijs.BoxMesh(reticleColliderGeom, reticleColliderPhysicsMat, 0);
        reticleCollider.position.set(0, 0, -250);
        reticleCollider.receiveShadow = true;
        reticleCollider.castShadow = true;
        reticleCollider.name = "Reticle Collider";
        reticle.add(reticleCollider);
        console.log("Added Reticle Collider to Scene");
        
        reticleCollider.addEventListener('collision', (object) => {
            if (object.name === "gem") {
                //scene.remove(object);
                //scene.add(object);
                //gem.position.set(0, 2, gem.position.z - 300);
                //gem.__dirtyPosition = true;
                console.log("reticleCollider hit the gem");
            }
        });*/
        
        // Gem Object
        gemGeometry = new SphereGeometry(1, 4, 2);
        gemMaterial = Physijs.createMaterial(new LambertMaterial({ color: 0x00ff00 }), 0, 0);
        gem = new Physijs.SphereMesh(gemGeometry, gemMaterial, 0.00000000001);
        gem.position.set(0, 2, -120);
        gem.receiveShadow = true;
        gem.castShadow = true;
        gem.name = "Gem";
        //scene.add(gem);
        console.log("Added Gem to Scene");
        
        // Obstacles
        
        // Low Obstacles
        lowObstacles = [];
        lowObstacleMat = new LambertMaterial({ color: 0x0000FF });
        lowObstacleGeom = new BoxGeometry(200, 1.5, 4);
        lowObstaclePhysicsMat = Physijs.createMaterial(lowObstacleMat, 0, 0);

        for (var i = 0; i < 5; i++) {
            lowObstacles[i] = new Physijs.BoxMesh(lowObstacleGeom, lowObstaclePhysicsMat, 0.00000000001);
            lowObstacles[i].position.set(0, -1000, 0);
            lowObstacles[i].receiveShadow = true;
            lowObstacles[i].castShadow = true;
            lowObstacles[i].name = "LowObstacle_" + i;
        }
        
        // High Obstacles
        highObstacles = [];
        highObstacleMat = new LambertMaterial({ color: 0x00FF00 });
        highObstacleGeom = new BoxGeometry(200, 3, 4);
        highObstaclePhysicsMat = Physijs.createMaterial(highObstacleMat, 0, 0);

        for (var i = 0; i < 5; i++) {
            highObstacles[i] = new Physijs.BoxMesh(highObstacleGeom, highObstaclePhysicsMat, 0.00000000001);
            highObstacles[i].position.set(0, 1.5, -1000 * (i + 1));
            highObstacles[i].receiveShadow = true;
            highObstacles[i].castShadow = true;
            highObstacles[i].name = "HighObstacle_" + i;
        }
        
        // Spawn First Obstacle
        spawnNewObstacle();
        
        // Add framerate stats
        addStatsObject();
        console.log("Added Stats to scene...");

        // Render the scene	
        document.body.appendChild(renderer.domElement);
        gameLoop(); 
        scene.simulate();
        
        // Window Resize Check
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
        
        //speedMultiplier += 0.00001;
        cameraLookAt.position.set(player.position.x,  player.position.y, player.position.z - 4);
        
        checkControls();
        
        // render using requestAnimationFrame
        requestAnimationFrame(gameLoop);
        // render the scene
        renderer.render(scene, camera);
    }

    // Player warning
    function warnPlayer(): void{
        var time: number = performance.now();
        var delta: number = (time - prevTime) / 1000;
        
        warningMat.opacity = 0.4;
        setTimeout(function() {
            while (warningMat.opacity > 0){
                warningMat.opacity = 0;
            }
        }, 500);
    }
    
    // Spawn Obstacles
    function spawnNewObstacle(): void {
        var x = Math.floor((Math.random() * 10) + 1);
        var m = Math.floor((Math.random() * 600) + 1);
        if (x > 5){ var obstacles: Mesh[] = highObstacles; var spawnHeight = 2; }
        else { var obstacles: Mesh[] = lowObstacles;  var spawnHeight = 0.75; }
        
        obstacles[currentObstacle].position.set(0, spawnHeight, ((obstaclesPlaced + 1) * -600) - m);
        scene.add(obstacles[currentObstacle]);
        
        // Move Obstacle Counter Up
        obstaclesPlaced++;
        if (currentObstacle >= 3) { currentObstacle = 0; }
        else { currentObstacle++; }
    }

    // Check Controls
    function checkControls(){
        if (keyboardControls.enabled) {
            
            velocity = new Vector3();
            var time: number = performance.now();
            var delta: number = (time - prevTime) / 1000;
            var direction = new Vector3(0, 0, 0);
            
            velocity.z = -12000.00 * delta * obstacleSlowdown;

            if (isGrounded) {
                if (keyboardControls.moveForward) {
                    velocity.z *= 4.0;
                }
                if (keyboardControls.moveBackward) {
                    velocity.z *= 0.25;
                }
                if (keyboardControls.jump && !keyboardControls.duck){
                    velocity.y += 24000.0 * delta;
                    if(player.position.y > 6) {
                        isGrounded = false;
                    }
                }
                player.setDamping(0.7, 1);
                // Changing player rotation
                direction.addVectors(direction, velocity);      // Add velocity to player Vector
                direction.applyQuaternion(player.quaternion);   // Apply player angle
                
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
            
            player.rotation.set(0, 0, 0);
            player.__dirtyRotation = true;

        } // keyboardControls.enabled
        else {
            player.setAngularVelocity(new Vector3(0, 0, 0));
            player.setLinearVelocity(new Vector3(0, 0, 0));
        }
    }

    // Camera Look function
    function cameraLook(): void {
        var zenith: number = THREE.Math.degToRad(3);
        var nadir: number = THREE.Math.degToRad(-3);
        
        var cameraPitch: number = cameraLookAt.rotation.x + mouseControls.pitch;
        var cameraYaw: number = cameraLookAt.rotation.y + mouseControls.yaw;
        
        // Constraints
        cameraLookAt.rotation.x = THREE.Math.clamp(cameraPitch, nadir, zenith);
        cameraLookAt.rotation.y = THREE.Math.clamp(cameraYaw, nadir, zenith);
        
        // Constrain Reticle
        if (reticle.position.x > 0.12){
            reticle.position.x -= 0.001;
        }
        else if (reticle.position.x < -0.12) {
            reticle.position.x += 0.001;
        }
        else{
            reticle.position.x += mouseControls.mouseX;
        }
        if (reticle.position.y > 0.06){
            reticle.position.y -= 0.001;
        }
        else if (reticle.position.y < -0.06) {
            reticle.position.y += 0.001;
        }
        else{
            reticle.position.y += mouseControls.mouseY;
        }
        camera.rotation.x = cameraLookAt.rotation.x;
        camera.rotation.y = cameraLookAt.rotation.y;
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
        camera = new PerspectiveCamera(35, config.Screen.RATIO, 0.1, 1000);
        //camera.position.set(0, 30, 80);         // 3P
        camera.position.set(0, 0, 0);        // FP
        console.log("Finished setting up Camera...");
    }

    window.onload = preload;

    return {
        scene: scene
    }

})();