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
import DirectionalLight = THREE.DirectionalLight;
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
    var blocker2: HTMLElement;
    var instructions2: HTMLElement;
    var directionLight: DirectionalLight;
    var ambientLight: AmbientLight;
    var groundGeometry: CubeGeometry;
    var groundPhysicsMaterial: Physijs.Material;
    var groundMaterial: PhongMaterial;
    var groundTexture: Texture;
    var ground: Physijs.Mesh;
    var ground2: Physijs.Mesh;
    var clock: Clock;   
    var playerGeometry: CubeGeometry;
    var playerPhysicsMaterial: Physijs.Material;
    var playerMaterial: PhongMaterial;
    var player: Physijs.Mesh;
    var gemGeometry: SphereGeometry;
    var gemMaterial: Material;
    var gem: Mesh;
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
    var warningGeom: Geometry;
    var warningMat: Material;
    var warning: Mesh;
    var rewardMat: Material;
    var reward: Mesh;
    var lowObstacles: Physijs.Mesh[];
    var lowObstacleGeom: Geometry;
    var lowObstacleMat: PhongMaterial;
    var lowObstacleTexture: Texture;
    var lowObstaclePhysicsMat: Physijs.Material;
    var highObstacles: Physijs.Mesh[];
    var highObstacleGeom: Geometry;
    var highObstacleMat: PhongMaterial;
    var highObstacleTexture: Texture;
    var highObstaclePhysicsMat: Physijs.Material;
    var currentObstacle: number;
    var obstaclesPlaced: number;
    var wait: boolean;
    var multiplierStep: number;
    var raycaster: THREE.Raycaster;
    var nextObstacle: Physijs.Mesh;
    var gameOver: boolean;
    
    // CreateJS Related Variables
    var assets: createjs.LoadQueue;
    var canvas: HTMLElement;
    var stage: createjs.Stage;
    var scoreLabel: createjs.Text;
    var timerLabel: createjs.Text;
    var multiplierLabel: createjs.Text;
    var scoreValue: number;
    var timerValue: number;
    var multiplierValue: number;
    
    var manifest = [
      {id: "reticle", src: "../../Assets/images/reticle.png"},
      {id: "ground", src: "../../Assets/images/hex-ground.jpg"},
      {id: "glass", src: "../../Assets/images/glass.jpg"},
    ];
    
    function preload(): void {
        assets = new createjs.LoadQueue();
        assets.installPlugin(createjs.Sound);
        assets.on("complete", init, this);
        assets.loadManifest(manifest);
    }
    
    function setupCanvas(): void {
        canvas = document.getElementById("canvas");
        canvas.setAttribute("width", config.Screen.WIDTH.toString());
        canvas.setAttribute("height", (config.Screen.HEIGHT * 0.06).toString());
        canvas.style.backgroundColor = "#000000";
        stage = new createjs.Stage(canvas);
    }

    function setupScoreboard(): void {
        // initialize  score and timer values
        scoreValue = 0;
        timerValue = 30;
        multiplierValue = 1;
        multiplierStep = 1;

        // Add timer Label
        timerLabel = new createjs.Text(
            "TIME: " + timerValue,
            "30px Consolas",
            "#ffffff"
        );
        timerLabel.x = config.Screen.WIDTH * 0.1;
        timerLabel.y = (config.Screen.HEIGHT * 0.15) * 0.09;
        stage.addChild(timerLabel);
        console.log("Added timer Label to stage");
        
        // Add multiplier Label
        multiplierLabel = new createjs.Text(
            "BONUS: x" + multiplierValue,
            "30px Consolas",
            "#ffffff"
        );
        multiplierLabel.x = config.Screen.WIDTH * 0.45;
        multiplierLabel.y = (config.Screen.HEIGHT * 0.15) * 0.09;
        stage.addChild(multiplierLabel);
        console.log("Added mutliplier Label to stage");

        // Add Score Label
        scoreLabel = new createjs.Text(
            "SCORE: " + scoreValue,
            "30px Consolas",
            "#ffffff"
        );
        scoreLabel.x = config.Screen.WIDTH * 0.8;
        scoreLabel.y = (config.Screen.HEIGHT * 0.15) * 0.09;
        stage.addChild(scoreLabel);
        stage.update();
        console.log("Added Score Label to stage");
    }

    function init(): void {   
        
        // Create instruction  HTMLElements
        blocker = document.getElementById("blocker");
        instructions = document.getElementById("instructions");
        blocker2 = document.getElementById("blocker2");
        instructions2 = document.getElementById("instructions2");
        
        // Set Up CreateJS Canvas and Stage
        setupCanvas();
        
        // Set Up Scoreboard
        setupScoreboard();

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
        wait = false;
        gameOver = false;

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
        ambientLight = new AmbientLight(0x707070);
        scene.add(ambientLight);
        console.log("Added an Ambient Light to Scene");

        // Directional Light
        directionLight = new DirectionalLight(0xffffff, 1.8);
        directionLight.position.set(20, 40, -15);
        directionLight.castShadow = true;
        directionLight.intensity = 2;
        directionLight.lookAt(new Vector3(0, 0, 0));
        directionLight.shadowCameraNear = 2;
        directionLight.shadowCameraFar = 200;
        directionLight.shadowCameraLeft = -5;
        directionLight.shadowCameraRight = 5;
        directionLight.shadowCameraTop = 5;
        directionLight.shadowCameraBottom = -5;
        directionLight.shadowMapWidth = 2048;
        directionLight.shadowMapHeight = 2048;
        directionLight.shadowDarkness = 0.5;
        directionLight.name = "Directional Light";
        scene.add(directionLight);
        console.log("Added directional light to scene");
        
        // Ground Objects
        groundTexture = new THREE.TextureLoader().load('../../Assets/images/hex-ground.jpg');
        groundTexture.wrapS = THREE.RepeatWrapping;
        groundTexture.wrapT = THREE.RepeatWrapping;
        groundTexture.repeat.set(256, 256);
        
        groundMaterial = new PhongMaterial({ color: 0x00DDFF, emissive: 0x333333});
        groundMaterial.map = groundTexture;
        groundGeometry = new BoxGeometry(1600, 0.5, 3200);
        groundPhysicsMaterial = Physijs.createMaterial(groundMaterial, 0, 0);
        
        // Ground 1
        ground = new Physijs.ConvexMesh(groundGeometry, groundPhysicsMaterial, 0);
        ground.receiveShadow = true;
        ground.name = "Ground 1";
        scene.add(ground);
        ground.position.set(0, 0, 0);
        ground.__dirtyPosition = true;
        console.log("Added Ground 1 to scene");
        
        // Ground 2
        ground2 = new Physijs.ConvexMesh(groundGeometry, groundPhysicsMaterial, 0);
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
            if (object.name.indexOf("LowObstacle") > -1){
                scene.remove(object);
                spawnNewObstacle();
                //scene.add(object);
                console.log("player hit a Low Obstacle");
                warnPlayer();
                resetMultiplier();
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
                resetMultiplier();
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
        
        reticleGeom = new PlaneGeometry(0.08, 0.045);
        reticleMat = new PhongMaterial({emissive: 0x0000FF});
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
        
        // Player Reward
        rewardMat = new LambertMaterial({ color: 0x00FF00 });
        rewardMat.transparent = true;
        rewardMat.opacity = 0;
        reward = new Mesh(warningGeom, rewardMat);
        reward.name = "Reward";
        cameraLookAt.add(reward);
        reward.position.set(0, 0, -0.3);
        
        // Gem Object
        gemGeometry = new SphereGeometry(1, 5, 2);
        gemMaterial = new PhongMaterial({ color: 0x00ff00, emissive: 0x00FF00, transparent: true, opacity: 0.7 });
        gem = new Mesh(gemGeometry, gemMaterial);
        gem.position.set(0, 4, -120);
        gem.receiveShadow = true;
        gem.castShadow = true;
        gem.name = "Gem";
        scene.add(gem);
        console.log("Added Gem to Scene");

        // Low Obstacles
        lowObstacles = [];
        
        // Texture
        lowObstacleTexture = new THREE.TextureLoader().load('../../Assets/images/glass.jpg');
        lowObstacleTexture.wrapS = THREE.RepeatWrapping;
        lowObstacleTexture.wrapT = THREE.RepeatWrapping;
        lowObstacleTexture.repeat.set(4, 4);
        
        lowObstacleMat = new PhongMaterial({ color: 0xFF0000, emissive: 0xFF0000 });
        lowObstacleMat.transparent = true;
        lowObstacleMat.opacity = 0.7;
        lowObstacleMat.map = lowObstacleTexture;
        lowObstacleGeom = new BoxGeometry(200, 2, 4);
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
        
        // Texture
        highObstacleTexture = new THREE.TextureLoader().load('../../Assets/images/glass.jpg');
        highObstacleTexture.wrapS = THREE.RepeatWrapping;
        highObstacleTexture.wrapT = THREE.RepeatWrapping;
        highObstacleTexture.repeat.set(4, 4);
        
        highObstacleMat = new PhongMaterial({ color: 0xFF0000, emissive: 0xFF0000 });
        highObstacleMat.transparent = true;
        highObstacleMat.opacity = 0.7;
        highObstacleMat.map = highObstacleTexture;
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
            if (!gameOver){
                blocker.style.display = '-webkit-box';
                blocker.style.display = '-moz-box';
                blocker.style.display = 'box';
                instructions.style.display = '';
            }
            console.log("PointerLock disabled");
        }
    }
    
    // Check for game over and display gameover blocker
    function gameOverCheck(): void {
        if (gameOver){
            // disable our mouse and keyboard controls
            mouseControls.enabled = false;
            keyboardControls.enabled = false;
            
            // Setup Gamover Blocker
            blocker2.style.display = '-webkit-box';
            blocker2.style.display = '-moz-box';
            blocker2.style.display = 'box';
            
            // Leave Pointer Lock and hide instructions
            document.exitPointerLock();
            blocker.style.display = 'none';
            instructions.style.display = 'none';
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

        canvas.style.width = "100%";
        timerLabel.x = config.Screen.WIDTH * 0.1;
        timerLabel.y = (config.Screen.HEIGHT * 0.15) * 0.09;
        scoreLabel.x = config.Screen.WIDTH * 0.8;
        scoreLabel.y = (config.Screen.HEIGHT * 0.15) * 0.09;
        stage.update();
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
        // Rotate Gem
        gem.rotation.y += 0.01;
        
        stats.update();
        
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
    
    // Player Reward
    function rewardPlayer(): void{
        var time: number = performance.now();
        var delta: number = (time - prevTime) / 1000;
        
        rewardMat.opacity = 0.4;
        setTimeout(function() {
            while (rewardMat.opacity > 0){
                rewardMat.opacity = 0;
            }
        }, 500);
    }
    
    // Spawn Obstacles
    function spawnNewObstacle(): void {
        var x = Math.floor((Math.random() * 10) + 1);
        var m = Math.floor((Math.random() * 600) + 1);
        if (x > 5){ var obstacles: Physijs.Mesh[] = highObstacles; var spawnHeight = 2.5; }
        else { var obstacles: Physijs.Mesh[] = lowObstacles;  var spawnHeight = 1; }
        
        obstacles[currentObstacle].position.set(0, spawnHeight, ((obstaclesPlaced + 1) * -800) - m);
        scene.add(obstacles[currentObstacle]);
        nextObstacle = obstacles[currentObstacle];
        
        // Move Obstacle Counter Up
        obstaclesPlaced++;
        if (currentObstacle >= 3) { currentObstacle = 0; }
        else { currentObstacle++; }
    }
    
    // check if player is past obstacle
    function playerPassedObstacle(): void {
        if (player.position.z < nextObstacle.position.z){
            spawnNewObstacle();
        }
    }
    
    // Timer down
    function reduceTimer(): void{
        if (!wait){
            wait = true;
            setTimeout(function() {
                timerValue -= 1;
                wait = false;
            }, 1000);
        }
    }
    
    // Update labels
    function updateScore(): void {
        scoreValue += 1 * multiplierValue;
        timerLabel.text = "TIME: " + timerValue;
        scoreLabel.text = "SCORE: " + scoreValue;
        multiplierLabel.text = "BONUS: x" + multiplierValue;
        stage.update();
    }
    
    // Update Multiplier
    function updateMultiplier(): void {
        if (multiplierValue < 4){
            if (multiplierStep < 5){
                multiplierStep += 1;
            }
            else {
                multiplierValue += 1;
                multiplierStep = 1;
            }
        }
    }
    
    // Multiplier Reset
    function resetMultiplier(): void {
        multiplierValue = 1;
    }
    
    // Distance Check
    function distanceCheck(): void{
        console.log("CAMERA POS: (" + camera.position.x + ", " + camera.position.y + ", " + camera.position.z + ")");
        console.log("LOOKAT POS: (" + cameraLookAt.position.x + ", " + cameraLookAt.position.y + ", " + cameraLookAt.position.z + ")");
        console.log("RETICL POS: (" + reticle.position.x + ", " + reticle.position.y + ", " + reticle.position.z + ")");
        console.log("CAMERA AGL: (" + camera.rotation.x + ", " + camera.rotation.y + ", " + camera.rotation.z + ")");
        console.log("LOOKAT AGL: (" + cameraLookAt.rotation.x + ", " + cameraLookAt.rotation.y + ", " + cameraLookAt.rotation.z + ")");
        console.log("RETICL AGL: (" + reticle.rotation.x + ", " + reticle.rotation.y + ", " + reticle.rotation.z + ")");
        
        // Set up for Ray Casting
        raycaster = new THREE.Raycaster();
        raycaster.near = 0.1;
        raycaster.far = 1000;
        
        //raycaster.set(reticle.position, new Vector3(0, 0, -1));
        raycaster.setFromCamera( new THREE.Vector2(reticle.position.x / 0.16, reticle.position.y / 0.075), camera );
        if (raycaster.intersectObject(gem).length > 0){
            timerValue += 1 * multiplierValue;
            rewardPlayer();
            updateMultiplier();
            resetGem();
            console.log("Gem Hit by Ray");
            //console.log("Gem X: " + gem.position.x);
            //console.log("Gem Y: " + gem.position.y);
            //console.log("Reticle X: " + reticle.position.x);
            //console.log("Reticle Y: " + reticle.position.y);
        }
        //var angleCameraToReticle = cameraLookAt.position.angleTo(reticle.position);
        //console.log(THREE.Math.radToDeg(angleCameraToReticle));
        //if (reticle.position.angleTo(gem.position) < anglePlayerToReticle && reticle.position.angleTo(gem.position) > -anglePlayerToReticle){
        //    console.log("Gem hit");
        //}
    }
    
    // Check if Player Missed Gem
    function playerMissedGem(): void{
        if (player.position.z < gem.position.z){
            resetMultiplier();
            resetGem();
        }
    }
    
    // Reset Gem
    function resetGem(): void{
        var x = Math.floor((Math.random() * 31) + 1);
        var y = Math.floor((Math.random() * 4) + 1);
        var z = Math.floor((Math.random() * 200) + 1);
        scene.remove(gem);
        gem.position.set(x - 15, y + 3, gem.position.z - (100 + z));
        scene.add(gem);
    }

    // Check Controls
    function checkControls(){
        if (keyboardControls.enabled) {
            
            speedMultiplier += 0.0001;
            
            distanceCheck();
            playerMissedGem();
            playerPassedObstacle();
            updateScore();
            gameOverCheck();
            
            // Check Timer for Gameover
            if (timerValue != 0) { reduceTimer(); }
            else { gameOver = true; }
            
            velocity = new Vector3();
            var time: number = performance.now();
            var delta: number = (time - prevTime) / 1000;
            var direction = new Vector3(0, 0, 0);

            velocity.z = -12000.00 * delta * obstacleSlowdown * speedMultiplier;

            player.setAngularFactor(new THREE.Vector3(0, 0, 0));
            
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

        } // keyboardControls.enabled
        else {
            player.setAngularFactor(new THREE.Vector3(0, 0, 0));
            player.setAngularVelocity(new Vector3(0, 0, 0));
            player.setLinearVelocity(new Vector3(0, 0, 0));
        }
    }

    // Camera Look function
    function cameraLook(): void {
        var zenith: number = THREE.Math.degToRad(2);
        var nadir: number = THREE.Math.degToRad(-2);
        
        var cameraPitch: number = cameraLookAt.rotation.x + mouseControls.pitch;
        var cameraYaw: number = cameraLookAt.rotation.y + mouseControls.yaw;
        
        // Constraints
        cameraLookAt.rotation.x = THREE.Math.clamp(cameraPitch, nadir, zenith);
        cameraLookAt.rotation.y = THREE.Math.clamp(cameraYaw, nadir, zenith);
        
        // Constrain Reticle
        if (reticle.position.x > 0.16){
            reticle.position.x -= 0.001;
        }
        else if (reticle.position.x < -0.16) {
            reticle.position.x += 0.001;
        }
        else{
            reticle.position.x += mouseControls.mouseX;
        }
        if (reticle.position.y > 0.075){
            reticle.position.y -= 0.001;
        }
        else if (reticle.position.y < -0.075) {
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
        renderer.setClearColor(0xFFFFFF, 1.0);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(CScreen.WIDTH, CScreen.HEIGHT);
        renderer.shadowMap.enabled = true;
        console.log("Finished setting up Renderer...");
    }

    // Setup main camera for the scene
    function setupCamera(): void {
        camera = new PerspectiveCamera(45, config.Screen.RATIO, 0.1, 1000);
        //camera.position.set(0, 30, 80);         // 3P
        camera.position.set(0, 0, 0);        // FP
        console.log("Finished setting up Camera...");
    }

    window.onload = preload;

    return {
        scene: scene
    }

})();