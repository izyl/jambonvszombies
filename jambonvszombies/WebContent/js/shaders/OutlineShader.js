THREE.OutlineShader = {
	uniforms : {

		"linewidth" : {
			type : "f",
			value : 0.3
		},

	},

	vertexShader : [

	"uniform float linewidth;",

	"void main() {",

	"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
			"vec4 displacement = vec4( normalize( normalMatrix * normal ) * linewidth, 0.0 ) + mvPosition;", "gl_Position = projectionMatrix * displacement;",

			"}"

	].join("\n"),

	fragmentShader : [

	"void main() {",

	"gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );",

	"}"

	].join("\n")
};
