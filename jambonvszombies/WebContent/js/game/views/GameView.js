var game = game || {};

$(function($) {

	game.GameView = Backbone.View.extend({

		// App variables
		container : null,
		camera : null,
		scene : null,
		renderer : null,

		projector : null,
		raycaster : new THREE.Raycaster(),
		rays : new Array(),
		rayLineMaterial : new THREE.LineBasicMaterial({
			color : 0xff0000
		}),

		viewportWidth : null,
		viewportHeight : null,

		cameraControls : null,

		clock : new THREE.Clock(),
		nextGameTick : (new Date).getTime(),
		// Constants
		fps : 30,
		max_frame_skip : 10,
		skip_ticks : 1000 / this.fps,

		levelManager : null,

		/*
		 * function initialize
		 */
		initialize : function() {
			_.bindAll(this, "animate", "render", "update");

			if (!Detector.webgl)
				Detector.addGetWebGLMessage();

			camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 40000);
			camera.position.set(0, 150, 1300);

			// SCENE
			scene = new THREE.Scene();
			scene.add(camera);

			// RENDERER
			renderer = new THREE.WebGLRenderer({
				antialias : true,
				clearAlpha : 1,
				clearColor : 0xccdddd
			});

			viewportWidth = window.innerWidth;
			viewportHeight = window.innerHeight;
			renderer.setSize(viewportWidth, viewportHeight);
			container.appendChild(renderer.domElement);

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

			projector = new THREE.Projector();

			levelManager = new game.LevelManager();
			levelManager.scene = scene;
			levelManager.buildLevel(1);

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

		animate : function() {

			requestAnimationFrame(this.animate);
			this.render();
			this.update();
		},

		/**
		 * function update Handles game state updates
		 */
		update : function() {


			var delta = this.clock.getDelta();
			this.model.update(delta);
			this.collisions();
			cameraControls.update(delta);
			stats.update();
		},

		collisions : function() {

			// currentPosition.y = this.model.root.position.y;
			// var vector = new THREE.Vector3( position.x, position.y, position.z );
			// var normalized = this.model.dir.normalize();

			// this.controls = {
			//
			// moveForward : false,
			// moveBackward : false,
			// moveLeft : false,
			// moveRight : false,
			// crouch : false,
			// jump : false,
			// attack : false
			// };

			var playerMesh = this.model.meshBody;
			var originPoint = this.model.root.position.clone();

//			while (this.rays.length > 0) {
//				scene.remove(this.rays.pop());
//			}

			for ( var vertexIndex = 0; vertexIndex < playerMesh.geometry.vertices.length; vertexIndex++) {

				var localVertex = playerMesh.geometry.vertices[vertexIndex].clone();
				var globalVertex = localVertex.applyMatrix4(playerMesh.matrix);
				var directionVector = globalVertex.sub(playerMesh.position);

				this.raycaster.set( originPoint, directionVector.clone().normalize() );
				var intersects = this.raycaster.intersectObjects(levelManager.buildings);

				if (intersects.length > 0 && intersects[0].distance < 20) {
					console.log(intersects[0].object.name);
					intersects[0].object.material.color = 0xff0000;

				}
				//this.traceRay();
			}

		},

		traceRay : function() {

			var geometry = new THREE.Geometry();
			geometry.vertices.push(this.raycaster.ray.origin);
			geometry.vertices.push(this.raycaster.ray.origin.clone().add(this.raycaster.ray.direction.clone().multiplyScalar(1000)));
			var rayLine = new THREE.Line(geometry, this.rayLineMaterial);
			scene.add(rayLine);
			this.rays.push(rayLine);
		},

		/**
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

			var controls = game.gameModel.playerModel.controls;

			switch (event.keyCode) {

			case 38: /* up */
			case 87: /* W querty wsad */
			case 90: /* Z azert zsqd */

				controls.moveForward = true;
				break;

			case 40: /* down */
			case 83: /* S */
				controls.moveBackward = true;
				break;

			case 37: /* left */
			case 65: /* A */
			case 81: /* Q */
				controls.moveLeft = true;
				break;

			case 39: /* right */
			case 68: /* D */
				controls.moveRight = true;
				break;

			case 67: /* C */
				controls.crouch = true;
				break;
			case 32: /* space */
				controls.jump = true;
				break;
			case 17: /* ctrl */
				controls.attack = true;
				break;

			}

		},

		onKeyUp : function(event) {

			var controls = game.gameModel.playerModel.controls;

			switch (event.keyCode) {

			case 38: /* up */
			case 87: /* W querty wsad */
			case 90: /* Z azert zsqd */

				controls.moveForward = false;
				break;

			case 40: /* down */
			case 83: /* S */
				controls.moveBackward = false;
				break;

			case 37: /* left */
			case 65: /* A */
			case 81: /* Q */
				controls.moveLeft = false;
				break;

			case 39: /* right */
			case 68: /* D */
				controls.moveRight = false;
				break;

			case 67: /* C */
				controls.crouch = false;
				break;
			case 32: /* space */
				controls.jump = false;
				break;
			case 17: /* ctrl */
				controls.attack = false;
				break;

			}

		}
	});

});