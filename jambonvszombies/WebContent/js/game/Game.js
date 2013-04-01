var game = game || {};

$(function() {
	'use strict';

	var gameModel = new game.GameModel();
	game.gameModel = gameModel;

	var gameView = new game.GameView({
		model : gameModel.playerModel
	});
	game.gameView = gameView;

	var infoView = new game.InfoView({
		model : gameModel.playerModel
	});
	game.infoView = infoView;

	new game.HPView({
		model : gameModel.playerModel
	});
	
	gameModel.playerModel.set("name", "izyl");
	gameModel.playerModel.set("life", 100);

});