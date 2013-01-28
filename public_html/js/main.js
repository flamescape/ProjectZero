var gamejs = require('gamejs');
var Vector = require('gamejs/utils/vectors');

// gamejs.preload([]);
gamejs.ready(function() {

	var stage = new Kinetic.Stage({
		container: 'container',
		width: 800,
		height: 600
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
		layer.setRotationDeg(num++);
        var tpos = turretShape.getAbsolutePosition();
		var tpos2 = turretShape2.getAbsolutePosition();
        var mpos = stage.getUserPosition();
        if (mpos) {
			turretShape.setAbsoluteRotation(-Math.atan2(tpos.x-mpos.x, tpos.y-mpos.y));
			turretShape2.setAbsoluteRotation(-Math.atan2(tpos2.x-mpos.x, tpos2.y-mpos.y));
		}
		stage.draw();
        
        return;
    };
    gamejs.time.fpsCallback(tick, this, 26);

});
