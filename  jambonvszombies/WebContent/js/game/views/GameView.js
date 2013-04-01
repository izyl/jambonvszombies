var game = game || {};

$(function($) {

	game.GameView = Backbone.View.extend({

		// App variables
		container : null,
		camera : null,
		scene : null,
		renderer : null,

		viewportWidth : null,
		viewportHeight : null,

		cameraControls : null,

		clock : new THREE.Clock(),
		nextGameTick : (new Date).getTime(),
		// Constants
		fps : 30,
		max_frame_skip : 10,
		skip_ticks : 1000 / this.fps,

		/*
		 * function initialize
		 */
		initialize : function() {
			_.bindAll(this, "animate", "render", "update");

			camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 4000);
			camera.position.set(0, 150, 1300);

			// SCENE
			scene = new THREE.Scene();
			scene.fog = new THREE.Fog(0xeddddd, 1000, 4000);
			scene.add(camera);

			// LIGHTS
			scene.add(new THREE.AmbientLight(0x222222));

			var light = new THREE.DirectionalLight(0xffffff, 2.25);
			light.position.set(200, 450, 500);

			light.castShadow = true;
			light.shadowMapWidth = 1024;
			light.shadowMapHeight = 1024;
			light.shadowMapDarkness = 0.95;
			// light.shadowCameraVisible = true;

			light.shadowCascade = true;
			light.shadowCascadeCount = 3;
			light.shadowCascadeNearZ = [ -1.000, 0.995, 0.998 ];
			light.shadowCascadeFarZ = [ 0.995, 0.998, 1.000 ];
			light.shadowCascadeWidth = [ 1024, 1024, 1024 ];
			light.shadowCascadeHeight = [ 1024, 1024, 1024 ];

			scene.add(light);

			// GROUND

			var gt = THREE.ImageUtils.loadTexture("textures/terrain/grasslight-big.jpg");
			var gg = new THREE.PlaneGeometry(16000, 16000);
			var gm = new THREE.MeshPhongMaterial({
				color : 0xffffff,
				map : gt
			});

			var ground = new THREE.Mesh(gg, gm);
			ground.rotation.x = -Math.PI / 2;
			ground.material.map.repeat.set(64, 64);
			ground.material.map.wrapS = ground.material.map.wrapT = THREE.RepeatWrapping;
			ground.receiveShadow = true;

			scene.add(ground);

			// RENDERER

			renderer = new THREE.WebGLRenderer({
				antialias : true
			});

			viewportWidth = window.innerWidth;
			viewportHeight = window.innerHeight;
			renderer.setSize(viewportWidth, viewportHeight);
			renderer.setClearColor(scene.fog.color, 1);

			container.appendChild(renderer.domElement);

			//

			renderer.gammaInput = true;
			renderer.gammaOutput = true;
			renderer.shadowMapEnabled = true;

			renderer.shadowMapCascade = true;
			renderer.shadowMapType = THREE.PCFSoftShadowMap;
			// renderer.shadowMapDebug = true;

			// STATS

			stats = new Stats();
			container.appendChild(stats.domElement);

			// EVENTS

			window.addEventListener('resize', this.onWindowResize, false);
			document.addEventListener('keydown', this.onKeyDown, false);
			document.addEventListener('keyup', this.onKeyUp, false);

			// CONTROLS

			cameraControls = new THREE.TrackballControls(camera, renderer.domElement);
			cameraControls.target.set(50, 50, 50);

			this.listenTo(this.model, 'ready', this.addPlayer);
		},

		addPlayer : function() {
			console.log("player is ready");
			var root = this.model.root;
			scene.add(root);

			var gyro = new THREE.Gyroscope();
			gyro.add(camera);
			root.add(gyro);

			this.animate();
		},

		/*
		 * function update Handles game state updates
		 */
		update : function() {

		},

		animate : function() {

			requestAnimationFrame(this.animate);
			this.render();

			var delta = this.clock.getDelta();
			cameraControls.update(delta);
			this.model.update(delta);
			stats.update();
		},

		/*
		 * function render Keeps updates at around 50 per second while trying to render the scene as fast as possible
		 */
		render : function() {
			loops = 0;

			// Attempt to update as many times as possible to get to our nextGameTick 'timeslot'
			// However, we only can update up to 10 times per frame
			while ((new Date).getTime() > this.nextGameTick && loops < this.max_frame_skip) {
				this.update();
				this.nextGameTick += this.skip_ticks;
				loops++;
			}

			/*
			 * If we fall really far behind in updates then we need to set nextGameTick to the current time to prevent the situation where nextGameTick is so
			 * far ahead of our current update that we start running updates extremely fast
			 */
			if (loops === this.max_frame_skip) {
				this.nextGameTick = (new Date).getTime();
			}

			renderer.render(scene, camera);

		},

		// EVENT HANDLERS

		onWindowResize : function(event) {

			viewportWidth = window.innerWidth;
			viewportHeight = window.innerHeight;

			renderer.setSize(viewportWidth, viewportHeight);

			camera.aspect = viewportWidth / viewportHeight;
			camera.updateProjectionMatrix();

		},

		/**
		 * TODO : menu d'options pour les controls
		 */
		onKeyDown : function(event) {

			var playerModel = game.gameModel.playerModel;
			switch (event.keyCode) {

			case 38: /* up */
			case 87: /* W querty wsad */
			case 90: /* Z azert zsqd */

				playerModel.controls.moveForward = true;
				break;

			case 40: /* down */
			case 83: /* S */
				playerModel.controls.moveBackward = true;
				break;

			case 37: /* left */
			case 65: /* A */
			case 81: /* Q */
				playerModel.controls.moveLeft = true;
				break;

			case 39: /* right */
			case 68: /* D */
				playerModel.controls.moveRight = true;
				break;

			case 67: /* C */
				playerModel.controls.crouch = true;
				break;
			case 32: /* space */
				playerModel.controls.jump = true;
				break;
			case 17: /* ctrl */
				playerModel.controls.attack = true;
				break;

			}

		},

		onKeyUp : function(event) {

			var playerModel = game.gameModel.playerModel;

			switch (event.keyCode) {

			case 38: /* up */
			case 87: /* W querty wsad */
			case 90: /* Z azert zsqd */

				playerModel.controls.moveForward = false;
				break;

			case 40: /* down */
			case 83: /* S */
				playerModel.controls.moveBackward = false;
				break;

			case 37: /* left */
			case 65: /* A */
			case 81: /* Q */
				playerModel.controls.moveLeft = false;
				break;

			case 39: /* right */
			case 68: /* D */
				playerModel.controls.moveRight = false;
				break;

			case 67: /* C */
				playerModel.controls.crouch = false;
				break;
			case 32: /* space */
				playerModel.controls.jump = false;
				break;
			case 17: /* ctrl */
				playerModel.controls.attack = false;
				break;

			}

		}
	});

});