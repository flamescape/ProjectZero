global.CLIENT = true;
global.SERVER = false;

var game = require('./game/svc/game');
game.state.add('gravzone', require('./game/states/gravzone'), true);
