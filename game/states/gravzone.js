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
