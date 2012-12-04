/*
Olivier Lamothe
November 2012
*/
if (typeof GAME == "undefined"){
	GAME = {}
}

GAME.EngineParticles = function(spaceship , material , boundary , nbParticles){
	this.spaceship = spaceship
	if(! this.spaceship instanceof GAME.Spaceship) 
		throw new Exception("Spaceship needs to be an instance of GAME.Spaceship")

	this.material = material instanceof THREE.Material ? material : 
		new THREE.ParticleBasicMaterial({
			color : 0xe00f00 ,
			size : 2
		})
	this.boundary = boundary

	this.nbParticles = nbParticles;
	this.nbAnimatedParticles = 0;

	var particles = new THREE.Geometry();
	for(var i = 0 ; i < nbParticles ; i ++){
		var particle = new THREE.Vector3(0 , 0 ,0) //position in the middle of the ship (local)
		particle = this.spaceship.pivot.matrixWorld.multiplyVector3(particle) //middle of the ship (world)
		particle.velocity = new THREE.Vector3(); // velocity 0,0,0 at start
		particle.inAnimation = false; //flag as usable for animation
		particles.vertices.push(particle)
	}
	this.particleSystem = new THREE.ParticleSystem(particles , this.material)
	return this

}

GAME.EngineParticles.prototype = {
	constructor : GAME.EngineParticles,
	update : function(){
		//update all particles in animation
		for(var i = 0 ; i < this.nbParticles ; i++){
			var particle = this.particleSystem.geometry.vertices[i]
			if(particle.inAnimation){
				particle.x += particle.velocity.x
				particle.y += particle.velocity.y
				particle.z += particle.velocity.z
				this.checkParticleBoundary(particle)
			}
			else{
				this.resetParticle(particle)
			}
		}
		this.particleSystem.geometry.verticesNeedUpdate = true;
	},

	engineFiring : function(){
		//ship is accelerating : add new particle to animation
		for(var i = 0 ; i < 30 ; i++){
		var particle = this.findFirstParticle();
		this.setParticleStart(particle)
		}
	},

	setParticleStart : function(particle){
		var engineParticlePos = Math.random() > .5 ? 1 : -1 ,
		resetPoint = new THREE.Vector3(5 * engineParticlePos,-40,0),
		resetVelocity = new THREE.Vector3(Math.random() -.5 , - Math.random()-1 , Math.random() -.5),
		rotationMatrix = new THREE.Matrix4();
		resetPoint = this.spaceship.pivot.matrixWorld.multiplyVector3(resetPoint)
		particle.velocity = rotationMatrix.extractRotation(this.spaceship.pivot.matrix).multiplyVector3(resetVelocity)
		particle.y = resetPoint.y
		particle.x = resetPoint.x
		particle.z = resetPoint.z
		particle.inAnimation = true;
	},
	checkParticleBoundary : function(particle){
		//should change to time clock for each particle, stop animating particle after X delta time ???
		var particleLocal = this.spaceship.pivot.worldToLocal(particle.clone())
		if(particleLocal.y < - this.boundary || particleLocal.y > 0){
			this.resetParticle(particle)
		}
	},
	resetParticle : function(particle){
		particle.inAnimation = false;
		particle.x = 0
		particle.y = 0
		particle.z = 0 //position in the middle of the ship (local)
		particle = this.spaceship.pivot.matrixWorld.multiplyVector3(particle) //middle of the ship (world)

	},
	findFirstParticle : function(){
		for(var i = 0  ; i < this.nbParticles ; i++){
			if(! this.particleSystem.geometry.vertices[i].inAnimation)
				return this.particleSystem.geometry.vertices[i]
		}
		return this.particleSystem.geometry.vertices[0]
	}
}