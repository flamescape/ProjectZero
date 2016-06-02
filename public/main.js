(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
global.CLIENT = true;
global.SERVER = false;

var game = require('./game/svc/game');
game.state.add('gravzone', require('./game/states/gravzone'), true);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./game/states/gravzone":4,"./game/svc/game":5}],2:[function(require,module,exports){
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

},{"./shipthruster":3}],3:[function(require,module,exports){

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

	var randomMultiplier = (() => Math.random()*1.5);

	this.emitter.minParticleSpeed.x = magnitude * 0.5 * Math.cos(ejectionAngle);
	this.emitter.maxParticleSpeed.x = this.emitter.minParticleSpeed.x * randomMultiplier();
	this.emitter.minParticleSpeed.y = magnitude * 0.5 * Math.sin(ejectionAngle);
	this.emitter.maxParticleSpeed.y = this.emitter.minParticleSpeed.y * randomMultiplier();
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

},{}],4:[function(require,module,exports){
var game = require('../svc/game');
var ShipEntity = require('../entities/ship');

var state = {};

state.preload = function() {
	game.load.image('ship', 'assets/ship.png');
	game.load.image('thruster', 'assets/thruster.png');
	game.load.image('faceball', 'assets/faceball.png');
	game.load.image('fire', 'assets/thrust-particle.png');
	game.load.image('beam', 'assets/beam.png');
	game.load.spritesheet('snow', 'assets/snowflakes.png', 17, 17);
	game.load.spritesheet('chain', 'assets/chain.png', 16, 26);
	game.load.physics('shipPhys', 'assets/ship.json');
}

var s, cursors, b;

state.create = function() {
	this.stage.backgroundColor = "#aaaaff";
	// game.world.setBounds(-1000,-1000,2000,2000);
	game.physics.startSystem(Phaser.Physics.P2JS);
	game.physics.p2.gravity.y = 200;
	game.physics.p2.restitution = 0.3;

	s = game.add.shipEntity(400, 130, {

	});
	s.leftThruster = s.addThruster({
		particle: "snow",
		maxForce: 500,
		offsetX: -26,
		offsetY: 29
	});
	s.rightThruster = s.addThruster({
		particle: "snow",
		maxForce: 500,
		offsetX: 26,
		offsetY: 29
	});

	s.backThruster = s.addThruster({
		particle: "fire",
		maxForce: 1000,
		offsetX: 0,
		offsetY: 37
	});


	game.camera.follow(s);

	cursors = game.input.keyboard.createCursorKeys();



	b = game.add.sprite(350, 430, 'faceball');
	game.physics.p2.enable(b, game.debugMode);
	b.body.clearShapes();
	b.body.addCircle(25, 0, 0, 0);
	b.body.mass = 15;

	
	createRope(5, s, b);

	game.input.onDown.add(function(){
		console.log('click', game.input.x, game.input.y)
		// s.body.applyForce([-1000,1000], 0,0);
		
	}, this);
}

state.update = function() {
	s.leftThruster.power = 0; // 0%
	s.rightThruster.power = 0; // 0%
	s.backThruster.power = 0;

    if (cursors.up.isDown) {
    	s.leftThruster.power = 66; // 100%
    	s.rightThruster.power = 66; // 100%
    }
    if (cursors.left.isDown) {
    	s.rightThruster.power += 34; // 34%
    }
    if (cursors.right.isDown) {
    	s.leftThruster.power += 34; // 34%
    }
    if (cursors.down.isDown) {
    	s.backThruster.power = 100;
    	s.leftThruster.power = 100; // 100%
    	s.rightThruster.power = 100; // 100%
    }
}

state.render = function(){
	
}

function createRope(length, bodyA, bodyB) {

	var xAnchor = bodyA.body.x;
	var yAnchor = bodyA.body.y+100;

    var lastRect = bodyA;
    var height = 20;        //  Height for the physics body - your image height is 8px
    var width = 4;         //  This is the width for the physics body. If too small the rectangles will get scrambled together.
    var maxForce = Infinity;   //  The force that holds the rectangles together.

    for (var i = 0; i <= length; i++)
    {
        var x = xAnchor;                    //  All rects are on the same x position
        var y = yAnchor + (i * height);     //  Every new rect is positioned below the last

        if (i % 2 === 0){
            //  Add sprite (and switch frame every 2nd time)
            newRect = game.add.sprite(x, y, 'chain', 1);
        }else{
            newRect = game.add.sprite(x, y, 'chain', 0);
            lastRect.bringToTop();
        }

        game.physics.p2.enable(newRect, game.debugMode);
        newRect.body.setRectangle(width, height);

        if (i !== 0){  
            //  Anchor the first one created
            // newRect.body.velocity.x = 400;      //  Give it a push :) just for fun
            newRect.body.mass = 1;     //  Reduce mass for evey rope element
        }

        //  After the first rectangle is created we can add the constraint
        if (lastRect){
        	var dist = (lastRect === bodyA) ? 40 : (height/2);
            game.physics.p2.createRevoluteConstraint(newRect, [0, -(height/2)], lastRect, [0, dist], maxForce);
        }

        lastRect = newRect;

    }

	// lastRect.body.static = true;
    game.physics.p2.createRevoluteConstraint(bodyB, [0, -(height/2)], lastRect, [0, 30], maxForce);

}

module.exports = state;

},{"../entities/ship":2,"../svc/game":5}],5:[function(require,module,exports){
var game = new Phaser.Game(640*2, 480*1.5, Phaser.AUTO);
game.debugMode = !true;

module.exports = game;

},{}]},{},[1]);
