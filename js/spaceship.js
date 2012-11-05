if( typeof GAME == 'undefined'){
	GAME = {}
}

GAME.Spaceship = function(position , acceleration , turnSpeed , maxSpeed, material ){

	//game world values
	this.position =  position instanceof THREE.Vector3 ? position : new THREE.Vector3(0,0,0);
	this.acceleration = acceleration ? acceleration : .01;
	this.turnSpeed = turnSpeed ? turnSpeed : 2;
	this.maxSpeed = maxSpeed ? maxSpeed : .3
	this.speed = 0;


	//spaceship mesh material
	this.material = material instanceof THREE.Material ? material : new THREE.MeshNormalMaterial( {shading: THREE.SmoothShading } )

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
	wing2 = new THREE.Mesh(wing2 , this.material)
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

	//scene objects
	this.mesh = new THREE.Mesh(hull ,  this.material  );
	this.pivot = new THREE.Object3D();
	this.mesh.position.y = 40
	this.pivot.add(this.mesh)
	this.pivot.position = this.position
	return this

}

GAME.Spaceship.prototype = {
	constructor : GAME.Spaceship,

	rotate : function(angle , axis){
		var rotationMatrix = new THREE.Matrix4();
		rotationMatrix.makeRotationAxis(axis.normalize() , angle * (Math.PI/180))
		this.pivot.matrix.multiplySelf(rotationMatrix)
		this.pivot.rotation.setEulerFromRotationMatrix(this.pivot.matrix)
		this.pivot.matrixWorldNeedsUpdate = true
	},
	accelerate : function(){
		this.speed += this.acceleration
		
		if(this.speed > this.maxSpeed){
			this.speed = this.maxSpeed
		}
	},
	deccelerate : function(){
		this.speed -= this.acceleration

		if(this.speed < - this.maxSpeed){
			this.speed = -this.maxSpeed
		}
	},
	update : function(){
		this.pivot.translateY(this.speed)
	}


}