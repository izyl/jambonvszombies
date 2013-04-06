var game = game || {};

$(function($) {

	game.LevelManager = Backbone.Model.extend({

		level : -1,
		scene : null,
		lights : new Array(),
		mapDimension : {
			width : 16000,
			depth : 16000,
			height : 16000
		},

		initialize : function() {
			console.log("Creating Level manager");

		},

		/**
		 * TODO : Avant de charger un autre level, on libere les resources du niveau courant boucler sur les objets de scene et tout libérer ? peut etre
		 * demander sur https://github.com/mrdoob/three.js/
		 */
		clearResources : function() {
			console.log(this + " clearing level " + this.level + " resources ");

		},

		buildLevel : function(level) {

			this.clearResources();

			this.level = level;
			console.log(this + " : creating Level " + level);
			this.scene.fog = new THREE.Fog(0xccdddd, 1000, 4000);

			/**
			 * Pour l'instant on fait tout ici a la barbare, apres on ira lire des fichiers Level[level].js
			 */

			this.addGround();
			this.addWalls();
			this.addLight();

			for ( var z = 0; z < 50; z++) {
				this.addBuilding();
			}
		},

		addWalls : function() {

			var cubeGeo = new THREE.CubeGeometry(this.mapDimension.width, this.mapDimension.height, this.mapDimension.depth);

			var mat1 = new THREE.MeshPhongMaterial({
				shading : THREE.FlatShading,
			});
			var mat2 = new THREE.MeshPhongMaterial({
				wireframe : true
			});

			var mesh = THREE.SceneUtils.createMultiMaterialObject(cubeGeo, [ mat1, mat2 ]);
			mesh.overDraw = true;
			mesh.position = new THREE.Vector3(0, 0, 0);
			mesh.name = "level walls";
			this.scene.add(mesh);

		},

		addLight : function() {

			this.lights[0] = new THREE.AmbientLight(0x333333);
			var light = new THREE.DirectionalLight(0x999999);
			light.position.set(10, 10, 10);
			this.lights[1] = light;

			var light = new THREE.DirectionalLight(0x999999);
			light.position.set(10, 10, -10);
			this.lights[2] = light;

			for ( var light in this.lights) {
				this.scene.add(this.lights[light]);
			}
		},

		// BUILDINGS
		addBuilding : function() {

			var width = Math.random() * 1000 + 200;
			var height = Math.random() * 2000 + 300;
			var depth = Math.random() * 1000 + 200;

			var cubeGeo = new THREE.CubeGeometry(width, height, depth);

			var mat1 = new THREE.MeshPhongMaterial({
				shading : THREE.FlatShading
			});
			var mat2 = new THREE.MeshPhongMaterial({
				wireframe : true
			});

			var mesh = THREE.SceneUtils.createMultiMaterialObject(cubeGeo, [ mat1, mat2 ]);

			mesh.position.x = (Math.random() > 0.5 ? -1 : 1) * Math.random() * this.mapDimension.width / 2;
			mesh.position.z = (Math.random() > 0.5 ? -1 : 1) * Math.random() * this.mapDimension.depth / 2;

			cubeGeo.computeBoundingBox();
			mesh.position.y = -cubeGeo.boundingBox.min.y;

			// lets pick that cube and randomly divide the height
			// then we will fill with the same block sliced on the height and a bit scaled

			var slices = Math.random() * height / 200;
			var bloc_height = height / slices;
			var scale = Math.random() * 1.5;
			scale = scale > 1.1 ? scale : 1.1;
			cubeGeo = new THREE.CubeGeometry(width * scale, bloc_height, depth * scale);
			cubeGeo.computeBoundingBox();
			var y = -cubeGeo.boundingBox.min.y;
			for ( var slice = 0; slice < slices - 1; slice++) {
				var mergeMesh = THREE.SceneUtils.createMultiMaterialObject(cubeGeo, [ mat1, mat2 ]);
				mergeMesh.position.x = mesh.position.x;
				mergeMesh.position.y = y;
				mergeMesh.position.z = mesh.position.z;
				mergeMesh.translate(slice * (bloc_height + bloc_height / slices), mergeMesh.up);
				this.scene.add(mergeMesh);
			}

			if (Math.round(Math.random()) > 0 && height > 700) {

				for ( var i = 0; i < 3; i++) {

					var stickheight = Math.random() * 500 + 300;
					cubeGeo = new THREE.CubeGeometry(2, stickheight, 2);
					var mergeMesh = THREE.SceneUtils.createMultiMaterialObject(cubeGeo, [ mat1, mat2 ]);
					mergeMesh.position.x = mesh.position.x + 10 * i;
					mergeMesh.position.y = mesh.position.y + 10 * i;
					mergeMesh.position.z = mesh.position.z;
					mergeMesh.translate(height / 2, mergeMesh.up);
					this.scene.add(mergeMesh);

					var sphereGeo = new THREE.SphereGeometry(5, 5, 5);

					var color = 0x0026FF;
					Math.random() > 0.5 ? color = 0xFF0000 : color = 0x0026FF;

					var mat = new THREE.MeshBasicMaterial({
						color : color
					});
					var sticklight = new THREE.Mesh(sphereGeo, mat);
					sticklight.position.x = mergeMesh.position.x;
					sticklight.position.y = mergeMesh.position.y;
					sticklight.position.z = mergeMesh.position.z;
					sticklight.translate(stickheight / 2, mergeMesh.up);
					this.scene.add(sticklight);
				}
			}

			mesh.name="building";
			this.scene.add(mesh);
		},

		// GROUND

		addGround : function() {
			var gt = THREE.ImageUtils.loadTexture("textures/terrain/grasslight-mini.jpg");
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

			ground.name="ground";
			this.scene.add(ground);

		},

	});
});
