if (typeof GAME == "undefined"){
	GAME = {}
}

GAME.Camera = function(fov , aspect , near , far , spaceshipToLookAt , angleToLookAt , horizontalDistance){

	this.camera = new THREE.PerspectiveCamera( fov , aspect , near , far);
	this.spaceship = spaceshipToLookAt
	this.origin =  spaceshipToLookAt.pivot.position
	this.angleToLookAt = angleToLookAt
	this.horizontalDistance = horizontalDistance
	this.positionCamera(this.origin , this.angleToLookAt , this.origin , this.horizontalDistance)

	return this

}

GAME.Camera.prototype = {
	constructor : GAME.Camera,
	positionCamera : function(lookAt , angleToLookAt , origin , horizontalDistance){
		/*

		    		/|
		  hypoth-> / |
		(unknown) /  | (distanceY unknown)
		 	 	 /   |
		angle-> /____|
		(known)  distanceZ (known)
		

		*/

		var distanceZ = origin.z - horizontalDistance
		var lengthHypot =  horizontalDistance / Math.cos(angleToLookAt * (Math.PI / 180)) //scalar projection http://en.wikipedia.org/wiki/Scalar_projection
		var distanceY = Math.sqrt((lengthHypot * lengthHypot)- (distanceZ * distanceZ)) //pythagora
		this.camera.position.x = origin.x
		this.camera.position.y = -distanceY
		this.camera.position.z = -distanceZ
		this.camera.lookAt(lookAt)
	},
	update : function(){
		this.origin = this.spaceship.pivot.position
		this.positionCamera(this.origin , this.angleToLookAt , this.origin , this.horizontalDistance)
	}
}