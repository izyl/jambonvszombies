/**
 * Pour toute ces mini vues, soit utiliser le templating backbone soit créé tout l'élément ici.
 * Le templating serait plus backbone "spirit" mais perso, je préfère tout créér ici.
 * */
var game = game || {};

$(function($) {

	game.HPView = Backbone.View.extend({
		initialize : function() {
			this.listenTo(this.model, 'change:life', this.update);
		},

		update : function() {
			
			$("#playerHP").progressBar(this.model.get("life")  * 100 / this.model.maxLife);
			return this;
		}
	});
});
