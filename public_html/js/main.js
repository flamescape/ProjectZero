var gamejs = require('gamejs');
var Vector = require('gamejs/utils/vectors');

var   b2Vec2 = Box2D.Common.Math.b2Vec2
,	b2BodyDef = Box2D.Dynamics.b2BodyDef
,	b2Body = Box2D.Dynamics.b2Body
,	b2FixtureDef = Box2D.Dynamics.b2FixtureDef
,	b2Fixture = Box2D.Dynamics.b2Fixture
,	b2World = Box2D.Dynamics.b2World
,	b2MassData = Box2D.Collision.Shapes.b2MassData
,	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
,	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
,	b2DebugDraw = Box2D.Dynamics.b2DebugDraw
;

var world = new b2World(new b2Vec2(0, 10),  true);

var thrusting = false, tright = false, tleft = false;

var debugDraw = null;

// gamejs.preload([]);
gamejs.ready(function() {

	var stage = new Kinetic.Stage({
		container: 'container',
		width: 800,
		height: 600,
		scale: 1
	});

	var layer = new Kinetic.Layer({
		x: 100,
		y: 100,
		width: 100,
		height: 100,
//		offset: {x:50, y:50},
		stroke: 'black',
		strokeWidth: 4
	});

	var shipShape = new Kinetic.Polygon({
		x: 0,
		y: 0,
		offset: {x:40,y:40},
		points: [40,0,60,40,80,60,60,60,40,80,20,60,0,60,20,40],
		//fill: 'green',
		stroke: 'black',
		strokeWidth: 1
	});
	var img = new Image();
	img.onload = function(){
		shipShape.setFillPatternImage(img);
	};
	img.src = 'ship.png';
	
	var fixDef = new b2FixtureDef;
	fixDef.density = 1.0;
	fixDef.friction = 0.5;
	fixDef.restitution = 0.2;

	var bodyDef = new b2BodyDef;
	bodyDef.position.x = 1;
	bodyDef.position.y = 1;
	bodyDef.type = b2Body.b2_dynamicBody;
	fixDef.shape = new b2PolygonShape;
	fixDef.shape.SetAsBox(0.5, 0.5);
	var body = world.CreateBody(bodyDef).CreateFixture(fixDef);
	body.GetBody().SetAngularDamping(8)
	body.GetBody().SetLinearDamping(2)
	
	var turretShape = new Kinetic.Polygon({
		x: 40,
		y: 20,
		offset: {x:7.5,y:15},
		points: [5,0,10,0,10,10,15,10,15,20,0,20,0,10,5,10],
		fill: 'red',
		stroke: 'black',
		strokeWidth: 1
	});

	// add the shapes to the layer
	layer.add(shipShape);
	layer.add(turretShape);
	var turretShape2 = turretShape.clone({x:-40,y:20})
    layer.add(turretShape2);

	// add the layer to the stage
	stage.add(layer);

	var num = 0;
    function tick(msDuration) {
	
		gamejs.event.get().forEach(function(e){
			if (e.key == 87) thrusting = e.type == 1;
			if (e.key == 68) tright = e.type == 1;
			if (e.key == 65) tleft = e.type == 1;
		});
	
		if (thrusting) {
			var ve = new b2Vec2(
				Math.cos(body.GetBody().GetAngle() - (Math.PI/2)),
				Math.sin(body.GetBody().GetAngle() - (Math.PI/2))
			);
			ve.Multiply(30);
			body.GetBody().ApplyForce(ve,body.GetBody().GetWorldPoint(new b2Vec2(0,0)))
		}
		if (tright) {
			body.GetBody().ApplyTorque(8);
		}
		if (tleft) {
			body.GetBody().ApplyTorque(-8);
		}
	
		world.Step(1 / 60,  10,  10);
        
        world.ClearForces();
	
		layer.setPosition(body.GetBody().GetPosition().x * 100, body.GetBody().GetPosition().y * 100);
		layer.setRotation(body.GetBody().GetAngle());
		
        var tpos = turretShape.getAbsolutePosition();
		var tpos2 = turretShape2.getAbsolutePosition();
        var mpos = stage.getUserPosition();
        if (mpos) {
			turretShape.setAbsoluteRotation(-Math.atan2(tpos.x-mpos.x, tpos.y-mpos.y));
			turretShape2.setAbsoluteRotation(-Math.atan2(tpos2.x-mpos.x, tpos2.y-mpos.y));
		}
		stage.draw();
		if (debugDraw)
		world.DrawDebugData();
        
        return;
    };
	
    gamejs.time.fpsCallback(tick, this, 60);
	

		debugDraw = new Box2D.Dynamics.b2DebugDraw;
		debugDraw.SetSprite(document.getElementsByTagName('canvas')[0].getContext("2d"));
		debugDraw.SetDrawScale(100.0);
		debugDraw.SetFillAlpha(0.5);
		debugDraw.SetLineThickness(50.0);
		debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
		world.SetDebugDraw(debugDraw);

	

});
