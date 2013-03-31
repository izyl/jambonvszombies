var game = game || {};

$(function($) {

	game.HPView = Backbone.View.extend({
		initialize : function() {
			this.listenTo(this.model, 'change:life', this.update);
		},

		update : function() {
			$("#playerHP").progressbar({
				value : this.model.get("life") /3
			});
			return this;
		}
	});
});
