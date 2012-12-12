if (typeof GAME == "undefined"){
	GAME = {}
}

GAME.Camera = function(fov , aspect , near , far , spaceshipToLookAt , angleToLookAt , horizontalDistance){

	this.camera = new THREE.PerspectiveCamera( fov , aspect , near , far);
	this.spaceship = spaceshipToLookAt
	if(! this.spaceship instanceof GAME.Spaceship) 
		throw new Exception("Spaceship needs to be an instance of GAME.Spaceship")

	this.relativeCameraPosition = new THREE.Vector3(0,-150,-150)
	this.origin =  spaceshipToLookAt.pivot.position
	this.angleToLookAt = angleToLookAt
	this.horizontalDistance = horizontalDistance
	this.positionCamera(this.origin , this.angleToLookAt , this.origin , this.horizontalDistance)

	return this

}

GAME.Camera.prototype = {
	constructor : GAME.Camera,
	positionCamera : function(lookAt , angleToLookAt , origin , horizontalDistance){
		this.camera.position.x = 0
		this.camera.position.y = -150
		this.camera.position.z = -150;
		this.camera.lookAt(lookAt)
		return
		/*
		
		    		/|
		  hypoth-> / |
		(unknown) /  | (distanceY unknown)
		 	 	 /   |
		angle-> /____|
		(known)  distanceZ (known)

		*/

		var matrix = new THREE.Matrix4()
		//var vector = new THREE.Vector3()
		matrix = this.spaceship.pivot.matrixWorld.clone()
		matrix.translate(this.relativeCameraPosition)
		this.camera.matrix.identity()
		this.camera.matrix.copy(matrix)
		/*//var absoluteCameraPosition = matrix.extractRotation(this.spaceship.pivot.matrix).multiplyVector3(this.relativeCameraPosition.clone())
		this.camera.position = this.spaceship.pivot.matrixWorld.multiplyVector3(this.relativeCameraPosition)//vector.add(this.relativeCameraPosition , absoluteCameraPosition)

		/*var distanceZ = origin.z - horizontalDistance
		var lengthHypot =  horizontalDistance / Math.cos(angleToLookAt * (Math.PI / 180)) //scalar projection http://en.wikipedia.org/wiki/Scalar_projection
		var distanceY = Math.sqrt((lengthHypot * lengthHypot)- (distanceZ * distanceZ)) //pythagora
		this.camera.position.x = origin.x
		this.camera.position.y = -distanceY
		this.camera.position.z = -distanceZ
		this.camera.lookAt(lookAt)*/
	},
	update : function(){
		this.origin = this.spaceship.pivot.position
		this.positionCamera(this.origin , this.angleToLookAt , this.origin , this.horizontalDistance)
	}
}