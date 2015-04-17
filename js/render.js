var renderer;
var camera;
var scene;

var drawArray = new Array();

function setUpScene() {					
	renderer = new THREE.WebGLRenderer({ alpha: true });
	renderer.setSize( window.innerWidth, window.innerHeight );
	
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 210000000 );
	camera.position = new THREE.Vector3(0, -2 * AU, 2 * AU);
	camera.lookAt(new THREE.Vector3(0, 0, 0));
	
	controls = new THREE.OrbitControls( camera );
	controls.addEventListener( 'change', render );
	
	scene = new THREE.Scene();
	
	setUpSun();
	
	planets.getPlanets().forEach( function(planet){
		scene.add(planet.mesh);
		scene.add(planet.orbitMesh);
	});
	
	asteroids.load();

	document.body.appendChild( renderer.domElement );
}

function setUpSun(){
	var geometry = new THREE.SphereGeometry( 500000 * 10, 16, 16 );
	var material  = new THREE.MeshBasicMaterial( { color: 0xffffff });
		
	material.specular  = new THREE.Color('yellow');
	mesh = new THREE.Mesh( geometry, material );
	mesh.position = new THREE.Vector3(0,0,0);
	scene.add(mesh);
}

function drawAxes() {
	var length = 2 * AU;
	var axes = new THREE.Object3D();
	axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( length, 0, 0 ), 0xFF0000, false ) );
	axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, length, 0 ), 0xFF0000, false ) );
	axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, length ), 0xFF0000, false ) );
	scene.add(axes);
}

function updateScene(){
	var currentdate = new Date();
	
	planets.getPlanets().forEach( function(planet){
        var nu = trueAnomaly(planet.orbitalElements, currentdate);
		var coordinates = calculateCartesianCoordinates(planet.orbitalElements, nu);	
		planet.mesh.position = new THREE.Vector3(coordinates.x, coordinates.y, coordinates.z);
	});
	
	asteroids.getAsteroids().forEach(
		function(ast){
			if(!ast.added){			
				scene.add(ast.mesh);
				scene.add(ast.orbitMesh);
			}
			
			var nu = trueAnomaly(ast.orbitalElements, currentdate);
			var coordinates = calculateCartesianCoordinates(ast.orbitalElements, nu);	
			ast.mesh.position = new THREE.Vector3(coordinates.x, coordinates.y, coordinates.z);	
		}
	);
}

function drawLabel(text, position3d) {
	var div = document.createElement('div');
	div.className = 'annotation';
	div.style.position = 'absolute';
	//text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
	div.innerHTML = text;
	div.style.top = Math.max(Math.min(world3dToCanvas2d(position3d).y,window.innerHeight - 100), 100 ) + 'px';
	div.style.left = Math.max(Math.min(world3dToCanvas2d(position3d).x,window.innerWidth - 100), 100) + 'px';
	
	div.onclick = function(){
		moveCameraTo(position3d);
	};
	
	document.body.appendChild(div);
	return div;
}

function updateLabel( annotation, position3d) {
	if(world3dToCanvas2d(position3d).y > window.innerHeight - 50 || world3dToCanvas2d(position3d).y < 50){ $(annotation).hide(); return; }
	if(world3dToCanvas2d(position3d).x > window.innerWidth - 50 || world3dToCanvas2d(position3d).x < 50) { $(annotation).hide(); return; }

	annotation.style.top = world3dToCanvas2d(position3d).y;
	annotation.style.left = world3dToCanvas2d(position3d).x;

	$(annotation).show();

	annotation.onclick = function(){
		moveCameraTo(position3d);
	};

	return annotation;
}

function world3dToCanvas2d( position ) {
		var projector = new THREE.Projector();
		var vector = projector.projectVector(position.clone(), camera);
		vector.x = (vector.x + 1)/2 * window.innerWidth;
		vector.y = -(vector.y - 1)/2 * window.innerHeight;
		return vector;
}

function moveCameraTo(position){
	var tween = new TWEEN.Tween(camera.position).to({
	    x: position.x,
	    y: position.y,
	    z: 1
	}).easing(TWEEN.Easing.Linear.None).onUpdate(function () {
	    camera.lookAt(camera.target);
	}).onComplete(function () {
	    camera.lookAt(position);
	}).start();
	
	var tween = new TWEEN.Tween(camera.target).to({
	    x: position.x,
	    y: position.y,
	    z: 0
	}).easing(TWEEN.Easing.Linear.None).onUpdate(function () {
	}).onComplete(function () {
	    camera.lookAt(position);
	}).start();
}

function lighting() {
	// add subtle blue ambient lighting
	var ambientLight = new THREE.AmbientLight(0x000044);
	scene.add(ambientLight);
	
	// directional lighting
	var directionalLight = new THREE.DirectionalLight(0xffffff);
	directionalLight.position.set(1, 1, 1).normalize();
	scene.add(directionalLight);
}

function render() {
	renderer.render( scene, camera );
}
