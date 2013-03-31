var game = game || {};

$(function($) {

	game.InfoView = Backbone.View.extend({

		initialize : function() {
			this.listenTo(this.model, 'change:life', this.update);
		},

		update : function() {
			console.log("InfoView received event name change");
			var out = this.model.get("name");
			$("#playerName").html(out);
			$("#progressbar").progressbar({ value: 37 });
			return this;
		}

	});

});