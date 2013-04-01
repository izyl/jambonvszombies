var game = game || {};

$(function($) {

	game.InfoView = Backbone.View.extend({

		initialize : function() {
			this.listenTo(this.model, 'change:name', this.update);
		},

		update : function() {
			console.log("InfoView received event name change");
			var out = this.model.get("name");
			$("#playerName").html(out);
			return this;
		}

	});
});