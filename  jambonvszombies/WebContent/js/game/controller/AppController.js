Game.Controllers.App = (function() {

	var renderer, appView,

	// Game loop
	loops = 0, nextGameTick = (new Date).getTime(),

	// Constants
	FPS = 60, MAX_FRAME_SKIP = 10, SKIP_TICKS = 1000 / FPS;

	return {

		// App variables
		camera : null,
		scene : null,
		projector : null,

		/*
		 * Initialize scene
		 */
		initialize : function() {
			_.bindAll(this, "animate", "render", "update");

			// Initialize camera
			this.camera = new THREE.OrthographicCamera(45, window.innerWidth / window.innerHeight, -2000, 10000);
			this.camera.projectionMatrix = new THREE.Matrix4().makeOrthographic(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight
					/ -2, -2000, 10000);
			this.camera.position.y = 70.711;
			this.camera.position.x = 100;
			this.camera.position.z = 100;

			// Create scene
			this.scene = new THREE.Scene();

			// Create projector
			this.projector = new THREE.Projector();

			// Create renderer
			renderer = new THREE.WebGLRenderer({
				antialias : true
			});
			renderer.setSize(window.innerWidth, window.innerHeight);

			// Load scene
			appView = new Game.Views.App({
				el : renderer.domElement
			});

			document.body.appendChild(renderer.domElement);
		},

		/*
		 * function animate Game loop - requests each new frame
		 */
		animate : function() {
			requestAnimationFrame(this.animate);

			this.render();
		},

		/*
		 * function update Handles game state updates
		 */
		update : function() {
			appView.update();
		},

		/*
		 * function render Keeps updates at around 50 per second while trying to render the scene as fast as possible
		 */
		render : function() {
			loops = 0;

			// Attempt to update as many times as possible to get to our nextGameTick 'timeslot'
			// However, we only can update up to 10 times per frame
			while ((new Date).getTime() > nextGameTick && loops < MAX_FRAME_SKIP) {
				this.update();
				nextGameTick += SKIP_TICKS;
				loops++;
			}

			// Render our scene
			renderer.render(this.scene, this.camera);
		}

	};
})();