/*
Olivier Lamothe
November 2012
*/
$().ready(function(){
	if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

	var WIDTH = 800, HEIGHT = 600 , FOV = 45, NEAR_FRUSTRUM = 1 , FAR_FRUSTRUM = 5000 ;

	var DEBUG_X = true  , DEBUG_Y  = true, DEBUG_Z = true ;
	var container, stats;

	var KEY_LEFT = 37 ,  KEY_UP = 38 ,  KEY_RIGHT = 39 , KEY_DOWN = 40 , KEY_ROLL_LEFT  = 81 , KEY_ROLL_RIGHT = 69 , KEY_FORWARD = 87 , KEY_BACKWARD = 83;

	var camera, controls, scene, renderer , clock;

	var spaceship , spaceshipPivot ,  fireParticlesSystemRed , fireParticlesSystemOrange , fireParticlesVelocityPivot;
	var FIREPARTICLENUMBER = 500 , PARTICLE_LIVE_TIME = 2000 ,  SHIP_TURN_SPEED = 5 , SHIP_MAX_SPEED = .5 , SHIP_ACCELERATION = .01;

	var keysPressed = {} ;

	var arrowHelper;

	init();
	animate();

	function init() {
		
		window.addEventListener("keydown" , keyDown)
		window.addEventListener("keyup" , keyUp)

		//scene
		scene = new THREE.Scene();

		//renderer
		renderer = new THREE.WebGLRenderer( { antialias: false } );
		renderer.setSize( WIDTH, HEIGHT );

		container = document.getElementById( 'container' );
		container.appendChild( renderer.domElement );

		// lights
		light = new THREE.SpotLight( 0xf5e61b)
		light.position.set( 100, 0 , 0)
		light.castShadow = true;
		light.shadowCameraVisible = true;
		scene.add(light)

		light = new THREE.SpotLight( 0xf5e61b)
		light.position.set( 100, 100 , 0)
		light.castShadow = true;
		light.shadowCameraVisible = true;
		scene.add(light)

		// stats
		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';
		stats.domElement.style.zIndex = 100;
		container.appendChild( stats.domElement );

		//spaceship
		spaceship = new GAME.Spaceship(
			new THREE.Vector3(0,0,0) , //starting position
			SHIP_ACCELERATION , 
			SHIP_TURN_SPEED ,
			SHIP_MAX_SPEED, 
			new THREE.MeshNormalMaterial( {shading: THREE.SmoothShading } ))

		//the ship rotates around a pivot (Object3D @ center of the ship (0,0,0)) ,
		//the actual ship mesh itself is a child of that Object3D
		//so we add the pivot to the scene
		scene.add(spaceship.pivot)
		

		//fire particles
		var fireMaterialRed = new THREE.ParticleBasicMaterial({
			color : 0xe00f00 ,
			size : 2
		})
		var fireMaterialOrange = new THREE.ParticleBasicMaterial({
			color : 0xf0e000 ,
			size : 2
		})
		fireParticlesSystemRed = new GAME.EngineParticles(
			spaceship , 
			fireMaterialRed , 
			200 , //boundary values for particle system
			FIREPARTICLENUMBER,
			PARTICLE_LIVE_TIME)
		fireParticlesSystemOrange = new GAME.EngineParticles(
			spaceship , 
			fireMaterialOrange , 
			200 , //boundary values
			FIREPARTICLENUMBER,
			PARTICLE_LIVE_TIME)

		scene.add(fireParticlesSystemRed.particleSystem)
		scene.add(fireParticlesSystemOrange.particleSystem)

		//plane/grid
		if(DEBUG_X){
			var planeX = new THREE.Mesh( 
				new THREE.PlaneGeometry( WIDTH , HEIGHT , 20 , 20 ) , 
				new THREE.MeshBasicMaterial({color : 0x008000 , wireframe : true})//green
			)
			planeX.rotation.y = Math.PI/2 //flat with x
			scene.add(planeX)
		}
		if(DEBUG_Y){
			var planeY = new THREE.Mesh( 
				new THREE.PlaneGeometry( WIDTH , HEIGHT , 20 , 20 ) , 
				new THREE.MeshBasicMaterial({color : 0x2C5197 , wireframe : true})//blue
			)
			planeY.rotation.x = Math.PI/2 //flat with y
			scene.add(planeY)
		}
		if(DEBUG_Z){
			var planeZ = new THREE.Mesh( 
				new THREE.PlaneGeometry( WIDTH , HEIGHT , 20 , 20 ) , 
				new THREE.MeshBasicMaterial({color : 0x8C1717 , wireframe : true})//red
			)
			scene.add(planeZ)//flat with z
		}
		//camera
		camera = new GAME.Camera(FOV , WIDTH / HEIGHT , NEAR_FRUSTRUM , FAR_FRUSTRUM , spaceship , 45 , 150)

		//camera controls
		controls = new THREE.TrackballControls( camera.camera );

		controls.rotateSpeed = 2.0;
		controls.zoomSpeed = .09;
		controls.panSpeed = 0.8;

		controls.noZoom = false;
		controls.noPan = false;

		controls.staticMoving = true;
		controls.dynamicDampingFactor = 0.3;
		
	}
	function keyUp (e){
		delete keysPressed[e.which]
	}
	function keyDown(e){
		keysPressed[e.which] = true;
		if(rotationKeyIsPressed()){
			rotation()
			e.preventDefault()
		}
	}
	function rotationKeyIsPressed(){
		return keysPressed[KEY_LEFT] || keysPressed[KEY_RIGHT] || keysPressed[KEY_UP] || keysPressed[KEY_DOWN] || keysPressed[KEY_ROLL_LEFT] || keysPressed[KEY_ROLL_RIGHT]
	}
	function movementKeyIsPressed(){
		return keysPressed[KEY_FORWARD] || keysPressed[KEY_BACKWARD]

	}
	function rotation(){
		

		var angle = 0 , rotationAxis = 0 , rotationMatrix = new THREE.Matrix4();
		if(keysPressed[KEY_LEFT]){
			rotationAxis = new THREE.Vector3(0,0,1);
			angle =  1 ;
		}
		if(keysPressed[KEY_RIGHT]){
			rotationAxis = new THREE.Vector3(0,0,1);
			angle = -1 ;
		}
		if(keysPressed[KEY_UP]){
			rotationAxis = new THREE.Vector3(1,0,0)
			angle = - 1
		}
		if(keysPressed[KEY_DOWN]){
			rotationAxis = new THREE.Vector3(1,0,0)
			angle =  1
		}
		if(keysPressed[KEY_ROLL_RIGHT]){
			rotationAxis = new THREE.Vector3(0,1,0)
			angle = -1;
		}
		if(keysPressed[KEY_ROLL_LEFT]){
			rotationAxis = new THREE.Vector3(0,1,0)
			angle = 1;
		}
		spaceship.rotate(angle , rotationAxis)
	}
	function movement(){
		if(movementKeyIsPressed()){
			if(keysPressed[KEY_FORWARD]){
				spaceship.accelerate()
			}
			if(keysPressed[KEY_BACKWARD]){
				spaceship.deccelerate()
			}
			fireParticlesSystemOrange.engineFiring()
			fireParticlesSystemRed.engineFiring()
		}
	}

	function animate() {

		requestAnimationFrame( animate );
		spaceship.update();
		movement()
		fireParticlesSystemRed.update();
		fireParticlesSystemOrange.update();
		stats.update();
		controls.update()
		camera.update()
		render();

	}

	function render() {

		renderer.render( scene, camera.camera );

	}
})