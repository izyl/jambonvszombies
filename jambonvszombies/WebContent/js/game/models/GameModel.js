var game = game || {};

$(function($) {

	game.GameModel = Backbone.Model.extend({

		initialize : function() {
			console.log("Creating game model");

			this.playerModel = new game.PlayerModel();
		}
	});
});
