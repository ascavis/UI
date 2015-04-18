var renderer;
var camera;
var scene;

var drawArray = new Array();

var planetRenderModels = [];
var planetRenderModel = function(planet){
    // NOTE: radius is scaled up extremely for debugging purposes
	var geometry = new THREE.SphereGeometry( planet.radius * 200, 16, 16 );
	var material  = new THREE.MeshBasicMaterial( { color: planet.color, overdraw : true })
	material.specular  = new THREE.Color(planet.color);
	var mesh = new THREE.Mesh( geometry, material );	

    var curve = new OrbitalCurve(planet.orbitalElements);
	var orbitGeometry = new THREE.Geometry();
	orbitGeometry.vertices = curve.getPoints(50);
	var material = new THREE.LineBasicMaterial({ color : planet.color });
	var orbit = new THREE.Line(orbitGeometry, material);
	
	this.planet = planet;
	this.geometry = geometry;
	this.material = material;
	this.mesh = mesh;
	this.orbitMesh = orbit;
}

var asteroidRenderMap = {};
var asteroidRenderModel = function(asteroid){
	    // NOTE: radius is scaled up extremely for debugging purposes
		var geometry = new THREE.SphereGeometry( asteroid.radius * 200, 16, 16 );
		var material  = new THREE.MeshBasicMaterial( { color: 0xffffff, overdraw : true })
		material.specular  = new THREE.Color(0xffffff);
		mesh = new THREE.Mesh( geometry, material );	
	
	    var curve = new OrbitalCurve(asteroid.orbitalElements);
		var orbitGeometry = new THREE.Geometry();
		orbitGeometry.vertices = curve.getPoints(50);
		var material = new THREE.LineBasicMaterial({ color : 0xffffff });
		var orbit = new THREE.Line(orbitGeometry, material);
		
		this.asteroid = asteroid;
		this.geometry = geometry;		
		this.material = material;
		this.mesh = mesh;
		this.orbitMesh = orbit;
		
		this.updateMarker = false;
}


function setUpScene() {
	var container = document.getElementById("main");					
	
	renderer = new THREE.WebGLRenderer({ alpha: true });
	renderer.setSize( container.offsetWidth, container.offsetHeight );
	container.appendChild(renderer.domElement);
		
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 2000 * AU );
	camera.position.set(0, -2 * AU, 2 * AU);
	
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	controls = new THREE.OrbitControls(camera,container);
	controls.addEventListener( 'change', render );
	
	scene = new THREE.Scene();
	
	setUpSun();
	
	planets.getPlanets().forEach( function(planet){		
		pR = new planetRenderModel(planet);
		planetRenderModels.push(pR);
		
		scene.add(pR.mesh);
		scene.add(pR.orbitMesh);
	});
	
	render();

	asteroids.load();
}

function setUpSun(){
	var geometry = new THREE.SphereGeometry( 0.05 * AU, 16, 16 );
	var material  = new THREE.MeshBasicMaterial( { color: 0xffffff });
	
	material.specular  = new THREE.Color('yellow');
	mesh = new THREE.Mesh( geometry, material );
	mesh.position.set(0,0,0);
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
	
	planetRenderModels.forEach( function(pR){
        var nu = trueAnomaly(pR.planet.orbitalElements, currentdate);
		var coordinates = calculateCartesianCoordinates(pR.planet.orbitalElements, nu);	
		pR.mesh.position.set(coordinates.x, coordinates.y, coordinates.z);
	});
	
	for (var key in asteroidRenderMap) {
	    asteroidRenderMap[key].updateMarker = false;
	}
	
	asteroids.getAsteroids().forEach(
		function(ast){
			var nu = trueAnomaly(ast.orbitalElements, currentdate);
			var coordinates = calculateCartesianCoordinates(ast.orbitalElements, nu);	
			
			if(ast.id in asteroidRenderMap){
				var rA = asteroidRenderMap[ast.id];
				rA.mesh.position.set(coordinates.x, coordinates.y, coordinates.z);
				rA.updateMarker = true;
			}
			else{
				var rA = new asteroidRenderModel(ast,2000,0xffffff);
				rA.mesh.position.set(coordinates.x, coordinates.y, coordinates.z);
				rA.updateMarker = true;
				asteroidRenderMap[ast.id] = rA;
				scene.add(rA.mesh);
				scene.add(rA.orbitMesh);
			}
		}
	);
	
	for (var key in asteroidRenderMap) {
	    if(asteroidRenderMap[key].updateMarker == false){
	    	scene.remove(asteroidRenderMap[key].mesh);
	    	scene.remove(asteroidRenderMap[key].orbitMesh);
	    	delete asteroidRenderMap[key];
	    }
	}
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
	renderer.render(scene, camera);
}
