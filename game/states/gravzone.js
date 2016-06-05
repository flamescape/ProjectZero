var game = require('../svc/game');
var ShipEntity = require('../entities/ship');

var state = {};

state.preload = function() {
	game.load.image('ship', 'assets/ship.png');
	game.load.image('thruster', 'assets/thruster.png');
	game.load.image('faceball', 'assets/faceball.png');
	game.load.image('fire', 'assets/thrust-particle.png');
	game.load.image('beam', 'assets/beam.png');
	game.load.image('skybg', 'assets/sky-bg.jpg');
	game.load.image('citybg', 'assets/city-bg.png');
	game.load.spritesheet('snow', 'assets/snowflakes.png', 17, 17);
	game.load.spritesheet('chain', 'assets/chain.png', 16, 26);
	game.load.physics('shipPhys', 'assets/ship.json');
	game.load.json('map1', 'assets/map1.json');
}

var s, cursors, b, sky, cityscape;

state.create = function() {
	game.time.advancedTiming = true;

	this.stage.backgroundColor = "#000000";
	// this.stage.backgroundColor = "#aaaaff";
	// game.world.setBounds(-1000,-1000,2000,2000);
	game.physics.startSystem(Phaser.Physics.P2JS);
	game.physics.p2.gravity.y = 200;
	game.physics.p2.restitution = 0.3;
	game.physics.p2.world.solver.iterations = 10;


	sky = game.add.tileSprite(0, 0, game.width, game.height, 'skybg');
	cityscape = game.add.tileSprite(0, 0, game.width, 300, 'citybg');

	var map = game.cache.getJSON('map1');

	// add terrain
	var poly = map.layers.find(l=>l.name=="Terrain").objects.find(o=>!!o.polygon);
	var terrain = new Phaser.Physics.P2.Body(game);
	terrain.addPolygon({

	}, poly.polygon.map(p=>[p.x+poly.x,p.y+poly.y]));
	terrain.static = true;
	// terrain.debug = true;
	game.physics.p2.addBody(terrain);
	var bounds = poly.polygon.reduce((bounds, p)=>{
		bounds.l = Math.min(bounds.l, p.x+poly.x);
		bounds.r = Math.max(bounds.r, p.x+poly.x);
		bounds.t = Math.min(bounds.t, p.y+poly.y);
		bounds.b = Math.max(bounds.b, p.y+poly.y);
		return bounds;
	}, {l:0,t:0,r:0,b:0});


	game.world.setBounds(bounds.l, bounds.t-500, bounds.r-bounds.l, bounds.b-(bounds.t-500));

	// add ship spawn
	var spawn = map.layers.find(l=>l.name=="Props").objects.find(o=>o.name=="spawn");
	console.log('spawn',spawn);

	var tersp = createTerrainSprite(terrain);
	// tersp.x = spawn.x;
	// tersp.y = spawn.y;
	game.add.existing(tersp);

	s = game.add.shipEntity(spawn.x, spawn.y, {

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

	var terrainBMD = game.add.bitmapData(200,200);
	terrainBMD

	// b = game.add.sprite(spawn.x, spawn.y, 'faceball');
	// game.physics.p2.enable(b, game.debugMode);
	// b.body.clearShapes();
	// b.body.addCircle(25, 0, 0, 0);
	// b.body.mass = 20;
	// createRope(5, s, b);

	cursors = game.input.keyboard.createCursorKeys();

	var ballspawns = map.layers.find(l=>l.name=="Props").objects.filter(o=>o.name=="ball");

	ballspawns.forEach(bs=>{
		b = game.add.sprite(bs.x, bs.y, 'faceball');
		game.physics.p2.enable(b, game.debugMode);
		b.body.clearShapes();
		b.body.addCircle(25, 0, 0, 0);
		b.body.mass = 2;
	})

	
	// createRope(5, s, b);

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
    	s.rightThruster.power += 50; // 50%
    }
    if (cursors.right.isDown) {
    	s.leftThruster.power += 50; // 50%
    }
    if (cursors.down.isDown) {
    	s.backThruster.power = 100;
    	s.leftThruster.power = 100; // 100%
    	s.rightThruster.power = 100; // 100%
    }
}

state.render = function(){
	game.debug.text( "FPS: "+game.time.fps, 5, 15);
}

state.preRender = function(){
	sky.x = game.camera.x;
	sky.y = game.world.bounds.y;
	sky.tilePosition.x = -game.camera.x*0.05;
	sky.tilePosition.y = (game.camera.y*0.8)-300;

	cityscape.x = game.camera.x;
	cityscape.y = game.world.bounds.y+(game.camera.y*0.4)+550;
	cityscape.tilePosition.x = -game.camera.x*0.2;
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

function createTerrainSprite(body){

    var angle, child, color, i, j, lineColor, lw, obj, offset, sprite, v, verts, vrot, _j, _ref1;

	var ppu = game.physics.p2.mpx(1) * -1;
    obj = body.data;
    sprite = new Phaser.Graphics(game);
    sprite.clear();
    lineColor = 0xff0000;
    lw = 1;

    if (obj instanceof p2.Body && obj.shapes.length)
    {
        var l = obj.shapes.length;

        i = 0;

        while (i !== l)
        {
            child = obj.shapes[i];
            offset = child.position || 0;
            angle = child.angle || 0;

            if (child instanceof p2.Convex)
            {
                verts = [];
                vrot = p2.vec2.create();

                for (j = _j = 0, _ref1 = child.vertices.length; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; j = 0 <= _ref1 ? ++_j : --_j)
                {
                    v = child.vertices[j];
                    p2.vec2.rotate(vrot, v, angle);
                    verts.push([(vrot[0] + offset[0]) * ppu, -(vrot[1] + offset[1]) * ppu]);
                }

                drawConvex(sprite, verts, child.triangles, lineColor, 0x36312f, lw, false, [offset[0] * ppu, -offset[1] * ppu]);
            }

            i++;
        }
    }

	sprite.position.x = body.data.position[0] * ppu;
    sprite.position.y = body.data.position[1] * ppu;

    return sprite;

}

function drawConvex(g, verts, triangles, color, fillColor, lineWidth, debug, offset) {

    var colors, i, v, v0, v1, x, x0, x1, y, y0, y1;

    if (lineWidth === undefined) { lineWidth = 1; }
    if (color === undefined) { color = 0x000000; }

    if (!debug)
    {
        // g.lineStyle(lineWidth, color, 1);
        g.beginFill(fillColor);
        i = 0;

        while (i !== verts.length)
        {
            v = verts[i];
            x = v[0];
            y = v[1];

            if (i === 0)
            {
                g.moveTo(x, -y);
            }
            else
            {
                g.lineTo(x, -y);
            }

            i++;
        }

        g.endFill();

        if (verts.length > 2)
        {
            g.moveTo(verts[verts.length - 1][0], -verts[verts.length - 1][1]);
            return g.lineTo(verts[0][0], -verts[0][1]);
        }
    }
    else
    {
        colors = [0xff0000, 0x00ff00, 0x0000ff];
        i = 0;

        while (i !== verts.length + 1)
        {
            v0 = verts[i % verts.length];
            v1 = verts[(i + 1) % verts.length];
            x0 = v0[0];
            y0 = v0[1];
            x1 = v1[0];
            y1 = v1[1];
            g.lineStyle(lineWidth, colors[i % colors.length], 1);
            g.moveTo(x0, -y0);
            g.lineTo(x1, -y1);
            g.drawCircle(x0, -y0, lineWidth * 2);
            i++;
        }

        g.lineStyle(lineWidth, 0x000000, 1);
        return g.drawCircle(offset[0], offset[1], lineWidth * 2);
    }

}

module.exports = state;
