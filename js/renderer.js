ASCAVIS.Renderer = (function(){
	var renderer;
	var camera;
	var scene;
	
	var drawArray = new Array();
	
	var asteroidScaleFactor = 25;
	var planetScaleFactor = 0.03;
	var sunScaleFactor = 0.0005;
	var distanceScaleFactor = 1e-5;
	
	var planetRenderModels = [];
	var planetRenderModel = function(planet){
	    // NOTE: radius is scaled up extremely for debugging purposes
		var geometry = new THREE.SphereGeometry( planet.radius * planetScaleFactor, 16, 16 );
		var material  = new THREE.MeshBasicMaterial( { color: planet.color, overdraw : true })
		material.specular  = new THREE.Color(planet.color);
		var mesh = new THREE.Mesh( geometry, material );	
	
	    var curve = new OrbitalCurve(planet.orbitalElements);
		var orbitGeometry = new THREE.Geometry();
		orbitGeometry.vertices = curve.getPoints(100);
		
		orbitGeometry.vertices.forEach(function(vertice){
			vertice.x = vertice.x * distanceScaleFactor;
			vertice.y = vertice.y * distanceScaleFactor;
			vertice.z = vertice.z * distanceScaleFactor;
		});
		
		var material = new THREE.LineBasicMaterial({ color : planet.color, linewidth: 2 });
		var orbit = new THREE.Line(orbitGeometry, material);
		
		this.planet = planet;
		this.geometry = geometry;
		this.material = material;
		this.mesh = mesh;
		this.orbitMesh = orbit;
	}
	
	var asteroidRenderMap = {};
	var asteroidRenderModel = function(asteroid, radius, color){
		    // NOTE: radius is scaled up extremely for debugging purposes
			var geometry = new THREE.SphereGeometry( radius * asteroidScaleFactor, 16, 16 );
			//var geometry = new THREE.CubeGeometry( radius, radius, radius );
			var material  = new THREE.MeshBasicMaterial( { color: color, overdraw : true })
			material.specular  = new THREE.Color(0xffffff);
			mesh = new THREE.Mesh( geometry, material );	
		
		    var curve = new OrbitalCurve(asteroid.orbitalElements);
			var orbitGeometry = new THREE.Geometry();
			
			orbitGeometry.vertices = curve.getPoints(100);
			orbitGeometry.vertices.forEach(function(vertice){
				vertice.x = vertice.x * distanceScaleFactor;
				vertice.y = vertice.y * distanceScaleFactor;
				vertice.z = vertice.z * distanceScaleFactor;
			});
						
			var material = new THREE.LineBasicMaterial({ color : 0xffffff, linewidth: 0.5  });
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
		
		renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
		renderer.setSize( container.offsetWidth, container.offsetHeight );
		container.appendChild(renderer.domElement);
			
		camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 2000 * ASCAVIS.Model.AU );
		camera.position.set(0, -2 * ASCAVIS.Model.AU * distanceScaleFactor, 2 * ASCAVIS.Model.AU * distanceScaleFactor);
		
		camera.lookAt(new THREE.Vector3(0, 0, 0));
	
		controls = new THREE.OrbitControls(camera,container);
		controls.addEventListener( 'change', render );
		
		scene = new THREE.Scene();
		
		setUpSun();
		
		ASCAVIS.Model.Planets.getPlanets().forEach( function(planet){		
			pR = new planetRenderModel(planet);
			planetRenderModels.push(pR);
			
			scene.add(pR.mesh);
			scene.add(pR.orbitMesh);
		});
		
		render();
	
		ASCAVIS.Model.Asteroids.load();
	}
	
	function setUpSun(){
		var geometry = new THREE.SphereGeometry( 695800 * sunScaleFactor , 16, 16 );
		var material  = new THREE.MeshBasicMaterial( { color: 0xffffff });
		
		material.specular  = new THREE.Color('yellow');
		mesh = new THREE.Mesh( geometry, material );
		mesh.position.set(0,0,0);
		scene.add(mesh);
	}
	
	function drawAxes() {
		var length = 2 * ASCAVIS.Model.AU;
		var axes = new THREE.Object3D();
		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( length, 0, 0 ), 0xFF0000, false ) );
		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, length, 0 ), 0xFF0000, false ) );
		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, length ), 0xFF0000, false ) );
		scene.add(axes);
	}
	
	function updateScene(){
		var currentdate = new Date();
		
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
		
		
		planetRenderModels.forEach( function(pR){
	        var nu = ASCAVIS.Model.trueAnomaly(pR.planet.orbitalElements, currentdate);
			var coordinates = ASCAVIS.Model.calculateCartesianCoordinates(pR.planet.orbitalElements, nu);	
			pR.mesh.position.set(coordinates.x * distanceScaleFactor, coordinates.y * distanceScaleFactor, coordinates.z * distanceScaleFactor);
		});

		for (var key in asteroidRenderMap) {
		    asteroidRenderMap[key].updateMarker = false;
		}

		asteroids = ASCAVIS.Model.Asteroids.getAsteroids();	
		if(asteroids.length > 20){
			asteroids.forEach(
				function(ast){
					var nu = ASCAVIS.Model.trueAnomaly(ast.orbitalElements, currentdate);
					var coordinates = ASCAVIS.Model.calculateCartesianCoordinates(ast.orbitalElements, nu);	
					
					if(ast.id in asteroidRenderMap){
						var rA = asteroidRenderMap[ast.id];
						rA.mesh.position.set(coordinates.x * distanceScaleFactor, coordinates.y * distanceScaleFactor, coordinates.z * distanceScaleFactor);
						rA.updateMarker = true;
					}
					else{
						var rA = new asteroidRenderModel(ast, 1, 0xffffff);
						rA.mesh.position.set(coordinates.x * distanceScaleFactor, coordinates.y * distanceScaleFactor, coordinates.z * distanceScaleFactor);
						rA.updateMarker = true;
						asteroidRenderMap[ast.id] = rA;
						scene.add(rA.mesh);
						scene.add(rA.orbitMesh);
					}
				}
			);
		}
		else{					
			asteroids.forEach(
				function(ast){
					var nu = ASCAVIS.Model.trueAnomaly(ast.orbitalElements, currentdate);
					var coordinates = ASCAVIS.Model.calculateCartesianCoordinates(ast.orbitalElements, nu);	
										
					if(ast.id in asteroidRenderMap){
						scene.remove(asteroidRenderMap[ast.id].mesh);
						scene.remove(asteroidRenderMap[ast.id].orbitMesh);							
						delete asteroidRenderMap[ast.id];
					}

					var rA = new asteroidRenderModel(ast, 1, 0x1FD8FF);
					rA.mesh.position.set(coordinates.x * distanceScaleFactor, coordinates.y * distanceScaleFactor, coordinates.z * distanceScaleFactor);
					rA.updateMarker = true;
					asteroidRenderMap[ast.id] = rA;
					scene.add(rA.mesh);
					scene.add(rA.orbitMesh);
				}
			);
		}
		
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
	
	function objectFrom2DCoordinates(x, y){
		raycaster = new THREE.Raycaster();
		raycaster.setFromCamera( new THREE.Vector2(x,y), camera );
		intersects = raycaster.intersectObjects( scene.children );
		
		var intersects = raycaster.intersectObjects( scene.children );
		
		if ( intersects.length > 0 ) {
			for (var key in asteroidRenderMap) {
			    if(intersects[0].object === asteroidRenderMap[key].mesh){
			    	return asteroidRenderMap[key];
			    }
			}
		}
		
		return null;
	}	
	
	function render() {
		renderer.render(scene, camera);
	}
	
	return {
		setUpScene : function(){
			setUpScene();
		},
		updateScene : function(){
			updateScene();
		},
		render : function(){
			render();
		},
		objectFrom2DCoordinates : function(){
			return objectFrom2DCoordinates(x, y);
		},
		getCanvasWidth: function(){
			return renderer.domElement.width;
		},
		getCanvasHeight : function(){
			return renderer.domElement.height;
		}
	}
}());
