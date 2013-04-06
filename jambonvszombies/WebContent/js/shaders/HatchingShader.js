THREE.HatchingShader = {
		uniforms: {

			"uDirLightPos":	{ type: "v3", value: new THREE.Vector3(1,1,1) },
			"uDirLightColor": { type: "c", value: new THREE.Color( 0xeeeeee ) },

			"uAmbientLightColor": { type: "c", value: new THREE.Color( 0xffffff ) },

			"uBaseColor":  { type: "c", value: new THREE.Color( 0xeeeeee ) },
			"uLineColor1": { type: "c", value: new THREE.Color( 0xeeeeee ) },
			"uLineColor2": { type: "c", value: new THREE.Color( 0x000000 ) },
			"uLineColor3": { type: "c", value: new THREE.Color( 0x000000 ) },
			"uLineColor4": { type: "c", value: new THREE.Color( 0x000000 ) }

		},

		vertexShader: [

			"varying vec3 vNormal;",

			"void main() {",

				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
				"vNormal = normalize( normalMatrix * normal );",

			"}"

		].join("\n"),

		fragmentShader: [

			"uniform vec3 uBaseColor;",
			"uniform vec3 uLineColor1;",
			"uniform vec3 uLineColor2;",
			"uniform vec3 uLineColor3;",
			"uniform vec3 uLineColor4;",

			"uniform vec3 uDirLightPos;",
			"uniform vec3 uDirLightColor;",

			"uniform vec3 uAmbientLightColor;",

			"varying vec3 vNormal;",

			"void main() {",

				"float camera = max( dot( normalize( vNormal ), vec3( 0.0, 0.0, 1.0 ) ), 0.4);",
				"float light = max( dot( normalize( vNormal ), uDirLightPos ), 0.0);",

				"gl_FragColor = vec4( uBaseColor, 1.0 );",

				"if ( length(uAmbientLightColor + uDirLightColor * light) < 0.50 ) {",

					"gl_FragColor *= vec4( uLineColor1, 1.0 );",

				"}",

			"}"

		].join("\n")
};

