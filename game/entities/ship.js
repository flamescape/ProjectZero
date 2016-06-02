var ShipThrusterEntity = require('./shipthruster');

function ShipEntity(game, x, y, config) {
	Phaser.Sprite.call(this, game, x, y, 'ship');

	this.thrusters = [];

	game.physics.p2.enable(this, game.debugMode);

	this.body.clearShapes();
	this.body.loadPolygon('shipPhys', 'ship');
	this.body.adjustCenterOfMass();
	this.body.angularDamping = 0.8;
	this.body.mass = 20;
	this.body.collideWorldBounds = true;
	this.anchor.setTo(0.5,0.5);
	// this.body.bounce.y = 0.2;
	// this.body.rotateLeft(2);
	// this.body.offset = new Phaser.Point(50,50);
	// this.angle = 50;
	
	if (game.debugMode) {
		this.alpha = 0.1;
	}

}
ShipEntity.prototype = Object.create(Phaser.Sprite.prototype);
ShipEntity.prototype.constructor = ShipEntity;

ShipEntity.prototype.update = function(){
	console.log('up2');
}

ShipEntity.prototype.addThruster = function(config) {
	// var t = new ShipThrusterEntity();
	// this.thrusters.push(t);
	var sp = this.game.make.shipThrusterEntity(config);
	this.addChild(sp);
	return sp;
};

ShipEntity.prototype.update = function(){
	this.children.forEach(function(child){
		child.update();
	});
};

// add factory helpers
Phaser.GameObjectCreator.prototype.shipEntity = function(x, y, config){ return new ShipEntity(this.game, x, y, config); }
Phaser.GameObjectFactory.prototype.shipEntity = function(x, y, config){ return this.existing(this.game.make.shipEntity(x, y, config)); }

module.exports = ShipEntity;
