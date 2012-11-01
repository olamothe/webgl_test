$().ready(function(){
	if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

	var WIDTH = 800, HEIGHT = 600 , FOV = 45, NEAR_FRUSTRUM = 1 , FAR_FRUSTRUM = 5000 ;

	var DEBUG_X = true  , DEBUG_Y  = true, DEBUG_Z = true ;
	var container, stats;

	var KEY_LEFT = 37 ,  KEY_UP = 38 ,  KEY_RIGHT = 39 , KEY_DOWN = 40 , KEY_ROLL_LEFT  = 81 , KEY_ROLL_RIGHT = 69;

	var camera, controls, scene, renderer;

	var spaceship , spaceshipPivot ,  fireParticlesSystemRed , fireParticlesSystemOrange ;
	var FIREPARTICLENUMBER = 1000 , SHIP_TURN_SPEED = 2 , SHIP_SPEED = .1;

	var keysPressed = {} ;

	var arrowHelper;

	var clock = new THREE.Clock();

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

		//camera
		camera = new THREE.PerspectiveCamera( FOV , WIDTH / HEIGHT , NEAR_FRUSTRUM , FAR_FRUSTRUM);
		camera.position.z = 300

		//camera controls
		controls = new THREE.TrackballControls( camera );

		controls.rotateSpeed = 2.0;
		controls.zoomSpeed = .09;
		controls.panSpeed = 0.8;

		controls.noZoom = false;
		controls.noPan = false;

		controls.staticMoving = true;
		controls.dynamicDampingFactor = 0.3;

		controls.addEventListener('change', render );


		var materialSpaceship = new THREE.MeshNormalMaterial( {shading: THREE.SmoothShading } )

		//spaceship geometries
		var cockpit = new THREE.CylinderGeometry( 0, 10, 20, 8, 0 );
		var hull = new THREE.CylinderGeometry(10,10,60,8,0)
		var engine1 = new THREE.CylinderGeometry(0,5,10,10,0)
		var engine2 = THREE.GeometryUtils.clone(engine1)

		var wing1 = new THREE.Geometry();
		wing1.vertices.push( new THREE.Vector3(0 , 0 , 0) );
		wing1.vertices.push( new THREE.Vector3(20 , 0 , 0) );
		wing1.vertices.push( new THREE.Vector3(0 , 20 , 0) );
		wing1.vertices.push( new THREE.Vector3(0 , 0 , -2) );
		wing1.vertices.push( new THREE.Vector3(20 , 0 , -2) );
		wing1.vertices.push( new THREE.Vector3(0 , 20 , -2) );
		wing1.faces.push( new THREE.Face3(0,1,2));
		wing1.faces.push( new THREE.Face3(5,4,3));
		wing1.faces.push( new THREE.Face4(1,0,3,4));
		wing1.faces.push( new THREE.Face4(1,4,5,2));
		wing1.faces.push( new THREE.Face4(2,5,3,0));
		wing1.computeFaceNormals()

		//clone first wing, create a mesh and rotate 3 rad --> opposite side of ship
		wing2 = THREE.GeometryUtils.clone(wing1)
		wing2 = new THREE.Mesh(wing2 , materialSpaceship)
		wing2.rotation.y = 3;

		//position geometries relative to the cockpit (cockpit at origin 0,0,0)
		for(var i = 0 ; i < hull.vertices.length ; i++){
			hull.vertices[i].y -= 40
		}
		for(var i = 0 ; i < engine1.vertices.length ; i++){
			engine1.vertices[i].y -= 70
			engine2.vertices[i].y -= 70
			engine1.vertices[i].x -= 5
			engine2.vertices[i].x += 5
		}
		for(var i = 0 ; i < wing1.vertices.length ; i++){
			wing1.vertices[i].y -= 60;
			//wing 2 is a mesh, not a geometry
			wing2.geometry.vertices[i].y -= 60;
		}

		//merge everything into a single geometry(hull)
		THREE.GeometryUtils.merge(hull , cockpit)
		THREE.GeometryUtils.merge(hull , engine1)
		THREE.GeometryUtils.merge(hull , engine2)
		THREE.GeometryUtils.merge(hull , wing1)
		THREE.GeometryUtils.merge(hull , wing2)

		spaceship = new THREE.Mesh(hull ,  materialSpaceship  );
		spaceshipPivot = new THREE.Object3D();
		spaceship.position.y = 40;
		spaceshipPivot.add(spaceship)
		scene.add(spaceshipPivot)
		//arrowHelper = new THREE.ArrowHelper(spaceshipPivot.worldToLocal(new THREE.Vector3(0,1,0)) , new THREE.Vector3(0,0,0) , 100 ,  0x8C1717 )
		//scene.add(arrowHelper)
		//var axis = new THREE.Vector3(0,1,0).crossSelf(spaceshipPivot.worldToLocal)
		//var radians = Math.acos( new THREE.Vector3( 0, 1, 0 ).dot( spaceship.alignVector.clone().normalize() ) );
		//spaceship.matrix = new THREE.Matrix4().makeRotationAxis( axis.normalize(), radians );
		//spaceship.rotation.setEulerFromRotationMatrix( spaceship.matrix, spaceship.eulerOrder );
		//spaceship.quaternion.setFromEuler(spaceship.alignVector)
		

		//fire particles
		var fireMaterialRed = new THREE.ParticleBasicMaterial({
			color : 0xe00f00 ,
			size : 2
		})
		var fireMaterialOrange = new THREE.ParticleBasicMaterial({
			color : 0xf0e000 ,
			size : 2
		})
		var fireParticlesRed = new THREE.Geometry()
		var fireParticlesOrange = new THREE.Geometry()
		for(var i = 0 ; i < FIREPARTICLENUMBER ; i ++){
			//position the particle on either left or right engine , randomly
			var engineParticlePos = Math.random() > .5 ? 1 : -1
			var particleRed = new THREE.Vector3(5*engineParticlePos , -40 ,0)
			var particleOrange = new THREE.Vector3(5*engineParticlePos , -40 ,0)
			var velocityX = (Math.random() -.5)
			var velocityZ = (Math.random() -.5)
			particleRed.velocity = new THREE.Vector3(velocityX , - Math.random()-1 , velocityZ)
			particleOrange.velocity = new THREE.Vector3(velocityX , - Math.random()-1 , velocityZ)
			fireParticlesRed.vertices.push(particleRed)
			fireParticlesOrange.vertices.push(particleOrange)
		}
		fireParticlesSystemRed = new THREE.ParticleSystem(fireParticlesRed , fireMaterialRed)
		fireParticlesSystemOrange = new THREE.ParticleSystem(fireParticlesOrange , fireMaterialOrange)
		fireParticlesSystemRed.particleAnimationPos = 0;
		fireParticlesSystemOrange.particleAnimationPos = 0;
		scene.add(fireParticlesSystemRed)
		scene.add(fireParticlesSystemOrange)

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

		spaceship.geometry.computeBoundingBox()

		//arrowHelper = new THREE.ArrowHelper(spaceship.alignVector , new THREE.Vector3(0,0,0) , 50 , 0x8C1717  )
		//scene.add(arrowHelper)
		
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
	function rotation(){
		

		var angle = 0 , rotationAxis = 0 , rotationMatrix = new THREE.Matrix4();
		if(keysPressed[KEY_LEFT]){
			rotationAxis = new THREE.Vector3(0,0,1);
			angle =  - 2 ;
		}
		if(keysPressed[KEY_RIGHT]){
			rotationAxis = new THREE.Vector3(0,0,1);
			angle = 2 ;
		}
		if(keysPressed[KEY_UP]){
			rotationAxis = new THREE.Vector3(1,0,0)
			angle = - 2
		}
		if(keysPressed[KEY_DOWN]){
			rotationAxis = new THREE.Vector3(1,0,0)
			angle =  2
		}
		if(keysPressed[KEY_ROLL_RIGHT]){
			rotationAxis = new THREE.Vector3(0,1,0)
			angle = 2;
		}
		if(keysPressed[KEY_ROLL_LEFT]){
			rotationAxis = new THREE.Vector3(0,1,0)
			angle = -2;
		}
		rotationMatrix.makeRotationAxis(rotationAxis.normalize() , angle * (Math.PI/180))
		spaceshipPivot.matrix.multiplySelf(rotationMatrix)
		//fireParticlesSystemRed.matrix.multiplySelf(rotationMatrix)
		//fireParticlesSystemOrange.matrix.multiplySelf(rotationMatrix)
		spaceshipPivot.rotation.setEulerFromRotationMatrix(spaceshipPivot.matrix)
		//fireParticlesSystemRed.rotation.setEulerFromRotationMatrix(fireParticlesSystemRed.matrix)
		//fireParticlesSystemOrange.rotation.setEulerFromRotationMatrix(fireParticlesSystemOrange.matrix)
	}

	function animate() {

		requestAnimationFrame( animate );
		render();
		stats.update();
		controls.update()

	}

	function unionBBox( b, p )
{
    var r = new Object();
    r.min = b.min.clone();
    r.max = b.max.clone();

    r.min.x = Math.min( b.min.x, p.x );
    r.min.y = Math.min( b.min.y, p.y );
    r.min.z = Math.min( b.min.z, p.z );
    r.max.x = Math.max( b.max.x, p.x );
    r.max.y = Math.max( b.max.y, p.y );
    r.max.z = Math.max( b.max.z, p.z );

    return r;
}


function transformBBox(b, matrix) 
{   
    var ret = new Object();
    ret.min = matrix.multiplyVector3(new THREE.Vector3(b.min.x, b.min.y, b.min.z));
    ret.max = matrix.multiplyVector3(new THREE.Vector3(b.min.x, b.min.y, b.min.z));

    ret = unionBBox(ret, matrix.multiplyVector3(new THREE.Vector3(b.max.x, b.min.y, b.min.z)));
    ret = unionBBox(ret, matrix.multiplyVector3(new THREE.Vector3(b.min.x, b.max.y, b.min.z)));
    ret = unionBBox(ret, matrix.multiplyVector3(new THREE.Vector3(b.min.x, b.min.y, b.max.z)));
    ret = unionBBox(ret, matrix.multiplyVector3(new THREE.Vector3(b.min.x, b.max.y, b.max.z)));
    ret = unionBBox(ret, matrix.multiplyVector3(new THREE.Vector3(b.max.x, b.max.y, b.min.z)));
    ret = unionBBox(ret, matrix.multiplyVector3(new THREE.Vector3(b.max.x, b.min.y, b.max.z)));
    ret = unionBBox(ret, matrix.multiplyVector3(new THREE.Vector3(b.max.x, b.max.y, b.max.z)));

    return ret;
}


	function render() {
		var bboxWorld = transformBBox(spaceship.geometry.boundingBox , spaceship.matrixWorld)
		var posX , posY , posZ;
		if( spaceshipPivot.rotation.x <= 0 && Math.abs(spaceshipPivot.rotation.z) <= Math.PI/2){
			posZ = bboxWorld.max.z;
			posY = bboxWorld.max.y
		}
		//begin animating fire particle one at a time , from 0 to FIREPARTICLENUMBER
		fireParticlesSystemRed.particleAnimationPos < FIREPARTICLENUMBER ? fireParticlesSystemRed.particleAnimationPos ++  : undefined;
		for(var i = 0 , l = fireParticlesSystemRed.particleAnimationPos ; i < l ; i++){
			var particleRed = fireParticlesSystemRed.geometry.vertices[i]
			var particleOrange = fireParticlesSystemOrange.geometry.vertices[i]

			//update position x/y with each particle velocity
			particleRed.x += particleRed.velocity.x;
			particleRed.y += particleRed.velocity.y;
			particleRed.z += particleRed.velocity.z;

			//
			if(particleRed.y < -200){

				var engineParticlePos = Math.random() > .5 ? 1 : -1
				particleRed.y = posY// worldToLocal(new THREE.Vector3(0,-40,0));
				particleRed.x = bboxWorld.min.x + ( engineParticlePos * 5 ) + ((bboxWorld.max.x - bboxWorld.min.x)/2)
				particleRed.z = posZ
			}
			particleOrange.x += particleOrange.velocity.x;
			particleOrange.y += particleOrange.velocity.y;
			particleOrange.z += particleOrange.velocity.z;
			if(particleOrange.y < -200){
				/*var engineParticlePos = Math.random() > .5 ? 1 : -1
				particleOrange.y = spaceshipPivot.position.y - 40 // worldToLocal(new THREE.Vector3(0,-40,0));
				particleOrange.x = spaceshipPivot.position.x + ( engineParticlePos * 5 ) + (bboxWorld.max.x - bboxWorld.min.x)
				particleOrange.z = spaceshipPivot.position.z;*/
			}
		}
		fireParticlesSystemRed.geometry.verticesNeedUpdate = true;
		fireParticlesSystemOrange.geometry.verticesNeedUpdate = true;
		//spaceshipPivot.translateY(SHIP_SPEED)
		//fireParticlesSystemRed.translateY(.1)
		//fireParticlesSystemOrange.translateY(.1)
		renderer.render( scene, camera );

	}
})