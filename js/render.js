var renderer;
var camera;
var scene;

var drawArray = new Array();

var planets = [earth, mars];

function setUpScene() {					
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 2100000000 );
//	camera = new THREE.OrthographicCamera( - 10000000 , 100000000 , 100000000 , -100000000 , 1, 10000000 );
	camera.position.y = 150000000;
	camera.lookAt(new THREE.Vector3( 0, -1, 0 ));
	
	controls = new THREE.OrbitControls( camera );
	controls.addEventListener( 'change', render );
	
	scene = new THREE.Scene();
	
	setUpSun();
	
	planets.forEach( function(planet){
		scene.add(planet.mesh);
	});
	
	document.body.appendChild( renderer.domElement );
	render();
}

function setUpSun(){
	var geometry = new THREE.SphereGeometry( 695800 * 10, 64, 64 );
	var material  = new THREE.MeshBasicMaterial( { color: 0xffffff })
	//var material = new THREE.MeshBasicMaterial({ overdraw : true} );
	
	material.specular  = new THREE.Color('yellow');
	mesh = new THREE.Mesh( geometry, material );
	mesh.position = new THREE.Vector3(0,0,0);
	scene.add(mesh);
}

function drawAxes() {
	var length = 100000;
	var axes = new THREE.Object3D();
	axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( length, 0, 0 ), 0xFF0000, false ) );
	axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, length, 0 ), 0xFF0000, false ) );
	axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, length ), 0xFF0000, false ) );
	scene.add(axes);
}

function updateScene(){
	var currentdate = new Date();
	
	planets.forEach( function(planet){
		var coordinates = calculateCartesianCoordinates(planet.orbitalElements, currentdate);	
		planet.mesh.position = new THREE.Vector3(coordinates.x, coordinates.y, coordinates.z);
	});
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

function updateLabel( annotation, position3d){
	
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