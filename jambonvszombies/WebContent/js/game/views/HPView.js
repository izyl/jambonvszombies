/**
 * Pour toute ces mini vues, soit utiliser le templating backbone soit cr�� tout l'�l�ment ici.
 * Le templating serait plus backbone "spirit" mais perso, je pr�f�re tout cr��r ici.
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
