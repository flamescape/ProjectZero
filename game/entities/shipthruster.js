
function ShipThrusterEntity(game, config) {
	Phaser.Sprite.call(this, game, 0, 0, 'thruster');

	this.x = config.offsetX || 0;
	this.y = config.offsetY || 0;
	this.anchor.setTo(0.5,0.5);
	// this.alpha = 0.2;

	this.power = 0;
	this.maxForce = config.maxForce || 500;
	this.particle = config.particle || "snow";
	
	this.emitter = game.add.emitter(0,0,500);
	this.emitter.makeParticles(this.particle);
	this.emitter.maxParticleScale = 1.5;
	this.emitter.minParticleScale = 0.1;
	this.emitter.gravity = game.physics.p2.gravity.y;

	if (game.debugMode) {
		this.alpha = 0.1;
	}
	console.log('created thruster');
}
ShipThrusterEntity.prototype = Object.create(Phaser.Sprite.prototype);
ShipThrusterEntity.prototype.constructor = ShipThrusterEntity;

ShipThrusterEntity.prototype.update = function(){
	if (!this.power) {
		return;
	}

	var tplAngle = this.parent.body.rotation + Phaser.Math.angleBetween(0,0, this.x, this.y);
	var tplDist = Math.abs(Phaser.Math.distance(0, 0, this.x, this.y));
	var fx = tplDist * Math.cos(tplAngle);
	var fy = tplDist * Math.sin(tplAngle);

	var ejectionAngle = this.parent.body.rotation + Math.PI / 2;
	var magnitude = (this.power / 100) * this.maxForce;

	this.emitter.minParticleSpeed.x = magnitude * 0.5 * Math.cos(ejectionAngle);
	this.emitter.maxParticleSpeed.x = this.emitter.minParticleSpeed.x * (Math.random()*5)
	this.emitter.minParticleSpeed.y = magnitude * 0.5 * Math.sin(ejectionAngle);
	this.emitter.maxParticleSpeed.y = this.emitter.minParticleSpeed.y * (Math.random()*5)
	this.emitter.emitParticle(this.parent.body.x + fx, this.parent.body.y + fy, this.particle, 0);

    this.parent.body.applyForce(
		[magnitude * Math.cos(ejectionAngle), magnitude * Math.sin(ejectionAngle)], // add "forward" direction force, vector
		fx,fy	// add a rotational force as though the direction force was "pushed" from this position
		// imagine a hand coming from this position, reaching out in the direction vector to touch the body, causing spin
	);
}

// add factory helpers
Phaser.GameObjectCreator.prototype.shipThrusterEntity = function(config){ return new ShipThrusterEntity(this.game, config); }
Phaser.GameObjectFactory.prototype.shipThrusterEntity = function(config){ return this.existing(this.game.make.shipThrusterEntity(config)); }

module.exports = ShipThrusterEntity;
