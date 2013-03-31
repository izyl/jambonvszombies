/**
 * @author izyl
 * 
 * Player's Model, it holds all the player's logics and characteristics, it's getting user's inputs and fire the events to the player view <br/>This is three.js
 * MD2CharacterComplex serving as a model for applications views
 * 
 * @see Game.Views.*
 */

var game = game || {};

$(function($) {

	game.PlayerModel = Backbone.Model.extend({

		initialize : function() {
			console.log("Creating player model");

			this.name = "Your jambon hero user name";

			this.life = 100;
			this.scale = 3;

			// animation parameters
			this.animationFPS = 18;
			this.transitionFrames = 15;

			// movement model parameters
			this.maxSpeed = 750;
			this.maxReverseSpeed = -275;
			this.frontAcceleration = 600;
			this.backAcceleration = 1000;
			this.frontDecceleration = 1000;
			this.angularSpeed = 2.5;

			// rig
			this.root = new THREE.Object3D();
			this.meshBody = null;
			this.meshWeapon = null;
			this.controls = null;

			// skins
			this.skinsBody = [];
			this.skinsWeapon = [];
			this.weapons = [];
			this.currentSkin = undefined;

			this.onLoadComplete = function() {
				this.trigger('ready');
			};

			// internals
			this.meshes = [];
			this.animations = {};
			this.loadCounter = 0;

			// internal movement control variables
			this.speed = 0;
			this.bodyOrientation = 0;

			this.walkSpeed = this.maxSpeed;
			this.crouchSpeed = this.maxSpeed * 0.5;

			// internal animation parameters
			this.activeAnimation = null;
			this.oldAnimation = null;

			this.controls = {

				moveForward : false,
				moveBackward : false,
				moveLeft : false,
				moveRight : false,
				crouch : false,
				jump : false,
				attack : false
			};

			// CHARACTER

			var stickmanCfg = {

				baseUrl : "models/stickman/",

				body : "stickman.js",
				skins : [ "stickman.png" ],
				weapons : [],
				animations : {
					move : "run",
					idle : "stand",
					jump : "jump",
					attack : "attack",
					crouchMove : "cwalk",
					crouchIdle : "cstand",
					crouchAttach : "crattack"
				},

				walkSpeed : this.walkSpeed,
				crouchSpeed : this.crouchSpeed
			};

			this.loadParts(stickmanCfg);

			this.enableShadows(true);

			this.setWeapon(0);
			this.setSkin(0);

		},
		
		// API

		enableShadows : function(enable) {

			for ( var i = 0; i < this.meshes.length; i++) {

				this.meshes[i].castShadow = enable;
				this.meshes[i].receiveShadow = enable;

			}

		},

		setVisible : function(enable) {

			for ( var i = 0; i < this.meshes.length; i++) {

				this.meshes[i].visible = enable;
				this.meshes[i].visible = enable;

			}

		},

		loadParts : function(config) {

			this.animations = config.animations;
			this.walkSpeed = config.walkSpeed;
			this.crouchSpeed = config.crouchSpeed;

			this.loadCounter = config.weapons.length * 2 + config.skins.length + 1;

			var weaponsTextures = [];
			for ( var i = 0; i < config.weapons.length; i++)
				weaponsTextures[i] = config.weapons[i][1];

			// SKINS

			this.skinsBody = this.loadTextures(config.baseUrl + "skins/", config.skins);
			this.skinsWeapon = this.loadTextures(config.baseUrl + "skins/", weaponsTextures);

			// BODY

			var loader = new THREE.JSONLoader();
			var self = this;

			loader.load(config.baseUrl + config.body, function(geo) {

				geo.computeBoundingBox();
				self.root.position.y = -self.scale * geo.boundingBox.min.y;

				var mesh = self.createPart(geo, self.skinsBody[0]);
				mesh.scale.set(self.scale, self.scale, self.scale);

				self.root.add(mesh);

				self.meshBody = mesh;
				self.meshes.push(mesh);

				self.checkLoadingComplete();

			});

			// WEAPONS

			var generateCallback = function(index, name) {

				return function(geo) {

					var mesh = createPart(geo, self.skinsWeapon[index]);
					mesh.scale.set(self.scale, self.scale, self.scale);
					mesh.visible = false;

					mesh.name = name;

					self.root.add(mesh);

					self.weapons[index] = mesh;
					self.meshWeapon = mesh;
					self.meshes.push(mesh);

					this.checkLoadingComplete();

				};

			};

			for ( var i = 0; i < config.weapons.length; i++) {

				loader.load(config.baseUrl + config.weapons[i][0], generateCallback(i, config.weapons[i][0]));

			}

		},

		setPlaybackRate : function(rate) {
			if (this.meshBody)
				this.meshBody.duration = this.meshBody.baseDuration / rate;
			if (this.meshWeapon)
				this.meshWeapon.duration = this.meshWeapon.baseDuration / rate;

		},

		setWireframe : function(wireframeEnabled) {

			if (wireframeEnabled) {

				if (this.meshBody)
					this.meshBody.material = this.meshBody.materialWireframe;
				if (this.meshWeapon)
					this.meshWeapon.material = this.meshWeapon.materialWireframe;

			} else {

				if (this.meshBody)
					this.meshBody.material = this.meshBody.materialTexture;
				if (this.meshWeapon)
					this.meshWeapon.material = this.meshWeapon.materialTexture;

			}

		},

		setSkin : function(index) {

			if (this.meshBody && this.meshBody.material.wireframe === false) {

				this.meshBody.material.map = this.skinsBody[index];
				this.currentSkin = index;

			}

		},

		setWeapon : function(index) {

			for ( var i = 0; i < this.weapons.length; i++)
				this.weapons[i].visible = false;

			var activeWeapon = this.weapons[index];

			if (activeWeapon) {

				activeWeapon.visible = true;
				this.meshWeapon = activeWeapon;

				if (this.activeAnimation) {

					activeWeapon.playAnimation(this.activeAnimation);
					this.meshWeapon.setAnimationTime(this.activeAnimation, this.meshBody.getAnimationTime(this.activeAnimation));

				}

			}

		},

		setAnimation : function(animationName) {

			if (animationName === this.activeAnimation || !animationName)
				return;

			if (this.meshBody) {

				this.meshBody.setAnimationWeight(animationName, 0);
				this.meshBody.playAnimation(animationName);

				this.oldAnimation = this.activeAnimation;
				this.activeAnimation = animationName;

				this.blendCounter = this.transitionFrames;

			}

			if (this.meshWeapon) {

				this.meshWeapon.setAnimationWeight(animationName, 0);
				this.meshWeapon.playAnimation(animationName);

			}

		},

		update : function(delta) {

			if (this.controls)
				this.updateMovementModel(delta);

			if (this.animations) {

				this.updateBehaviors(delta);
				this.updateAnimations(delta);

			}
		},

		updateAnimations : function(delta) {

			var mix = 1;

			if (this.blendCounter > 0) {

				mix = (this.transitionFrames - this.blendCounter) / this.transitionFrames;
				this.blendCounter -= 1;

			}

			if (this.meshBody) {

				this.meshBody.update(delta);

				this.meshBody.setAnimationWeight(this.activeAnimation, mix);
				this.meshBody.setAnimationWeight(this.oldAnimation, 1 - mix);

			}

			if (this.meshWeapon) {

				this.meshWeapon.update(delta);

				this.meshWeapon.setAnimationWeight(this.activeAnimation, mix);
				this.meshWeapon.setAnimationWeight(this.oldAnimation, 1 - mix);

			}

		},

		updateBehaviors : function(delta) {

			var controls = this.controls;
			var animations = this.animations;
			var moveAnimation, idleAnimation;

			// crouch vs stand

			if (controls.crouch) {

				moveAnimation = animations["crouchMove"];
				idleAnimation = animations["crouchIdle"];

			} else {

				moveAnimation = animations["move"];
				idleAnimation = animations["idle"];

			}

			// actions

			if (controls.jump) {

				moveAnimation = animations["jump"];
				idleAnimation = animations["jump"];

			}

			if (controls.attack) {

				if (controls.crouch) {

					moveAnimation = animations["crouchAttack"];
					idleAnimation = animations["crouchAttack"];

				} else {

					moveAnimation = animations["attack"];
					idleAnimation = animations["attack"];

				}

			}

			// set animations

			if (controls.moveForward || controls.moveBackward || controls.moveLeft || controls.moveRight) {

				if (this.activeAnimation !== moveAnimation) {

					this.setAnimation(moveAnimation);

				}

			}

			if (Math.abs(this.speed) < 0.2 * this.maxSpeed && !(controls.moveLeft || controls.moveRight || controls.moveForward || controls.moveBackward)) {

				if (this.activeAnimation !== idleAnimation) {

					this.setAnimation(idleAnimation);

				}

			}

			// set animation direction

			if (controls.moveForward) {

				if (this.meshBody) {

					this.meshBody.setAnimationDirectionForward(this.activeAnimation);
					this.meshBody.setAnimationDirectionForward(this.oldAnimation);

				}

				if (this.meshWeapon) {

					this.meshWeapon.setAnimationDirectionForward(this.activeAnimation);
					this.meshWeapon.setAnimationDirectionForward(this.oldAnimation);

				}

			}

			if (controls.moveBackward) {

				if (this.meshBody) {

					this.meshBody.setAnimationDirectionBackward(this.activeAnimation);
					this.meshBody.setAnimationDirectionBackward(this.oldAnimation);

				}

				if (this.meshWeapon) {

					this.meshWeapon.setAnimationDirectionBackward(this.activeAnimation);
					this.meshWeapon.setAnimationDirectionBackward(this.oldAnimation);

				}

			}

		},

		updateMovementModel : function(delta) {

			var controls = this.controls;

			// speed based on controls

			if (controls.crouch)
				this.maxSpeed = this.crouchSpeed;
			else
				this.maxSpeed = this.walkSpeed;

			this.maxReverseSpeed = -this.maxSpeed;

			if (controls.moveForward)
				this.speed = THREE.Math.clamp(this.speed + delta * this.frontAcceleration, this.maxReverseSpeed, this.maxSpeed);
			if (controls.moveBackward)
				this.speed = THREE.Math.clamp(this.speed - delta * this.backAcceleration, this.maxReverseSpeed, this.maxSpeed);

			// orientation based on controls
			// (don't just stand while turning)

			var dir = 1;

			if (controls.moveLeft) {

				this.bodyOrientation += delta * this.angularSpeed;
				this.speed = THREE.Math.clamp(this.speed + dir * delta * this.frontAcceleration, this.maxReverseSpeed, this.maxSpeed);

			}

			if (controls.moveRight) {

				this.bodyOrientation -= delta * this.angularSpeed;
				this.speed = THREE.Math.clamp(this.speed + dir * delta * this.frontAcceleration, this.maxReverseSpeed, this.maxSpeed);

			}

			// speed decay

			if (!(controls.moveForward || controls.moveBackward)) {

				if (this.speed > 0) {

					var k = this.exponentialEaseOut(this.speed / this.maxSpeed);
					this.speed = THREE.Math.clamp(this.speed - k * delta * this.frontDecceleration, 0, this.maxSpeed);

				} else {

					var k = this.exponentialEaseOut(this.speed / this.maxReverseSpeed);
					this.speed = THREE.Math.clamp(this.speed + k * delta * this.backAcceleration, this.maxReverseSpeed, 0);

				}

			}

			// displacement

			var forwardDelta = this.speed * delta;

			this.root.position.x += Math.sin(this.bodyOrientation) * forwardDelta;
			this.root.position.z += Math.cos(this.bodyOrientation) * forwardDelta;

			// steering

			this.root.rotation.y = this.bodyOrientation;

		},

		// internal helpers

		loadTextures : function(baseUrl, textureUrls) {

			var mapping = new THREE.UVMapping();
			var textures = [];

			for ( var i = 0; i < textureUrls.length; i++) {

				textures[i] = THREE.ImageUtils.loadTexture(baseUrl + textureUrls[i], mapping, this.checkLoadingComplete);
				textures[i].name = textureUrls[i];

			}

			return textures;
		},

		createPart : function(geometry, skinMap) {

			geometry.computeMorphNormals();

			var whiteMap = THREE.ImageUtils.generateDataTexture(1, 1, new THREE.Color(0xffffff));
			var materialWireframe = new THREE.MeshPhongMaterial({
				color : 0xffaa00,
				specular : 0x111111,
				shininess : 50,
				wireframe : true,
				shading : THREE.SmoothShading,
				map : whiteMap,
				morphTargets : true,
				morphNormals : true,
				metal : true
			});

			var materialTexture = new THREE.MeshPhongMaterial({
				color : 0xffffff,
				specular : 0x111111,
				shininess : 50,
				wireframe : false,
				shading : THREE.SmoothShading,
				map : skinMap,
				morphTargets : true,
				morphNormals : true,
				metal : true
			});
			materialTexture.wrapAround = true;

			//

			var mesh = new THREE.MorphBlendMesh(geometry, materialTexture);
			mesh.rotation.y = -Math.PI / 2;

			//

			mesh.materialTexture = materialTexture;
			mesh.materialWireframe = materialWireframe;

			//

			mesh.autoCreateAnimations(this.animationFPS);

			return mesh;

		},

		checkLoadingComplete : function() {

			console.log("checkLoadingComplete");

			// je vois pas comment faire plus proprement pour l'instant...
			var model = game.gameModel.playerModel;
			model.loadCounter -= 1;
			if (model.loadCounter === 0)
				model.onLoadComplete();

		},

		exponentialEaseOut : function(k) {
			return k === 1 ? 1 : -Math.pow(2, -10 * k) + 1;
		}

	});
});
