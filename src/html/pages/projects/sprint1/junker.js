// Constants
var XAXIS = new THREE.Vector3(1,0,0);
var YAXIS = new THREE.Vector3(0,1,0);
var ZAXIS = new THREE.Vector3(0,0,1);

var moveableObjects = [];

var container;		// A div element that will hold the renderer
var renderer;		// The Three.js webGL renderer
var selectContainer;// Element that will hold all the controllable objects
var selectLabel;

var camera;			// A camera object that gives the viewpoint
var scene; 			// The scene graph
var light1, light2;	// extra lights

var mouseX = 0, mouseY = 0;			// The position of the mouse
var mousePrevX = 0, mousePrevY = 0; // previous mouse position
var mouseDown = 0;                  // mouse button currently pressed
var windowX = window.innerWidth;	// half the width of the window
var windowY = window.innerHeight;	// half the height of the window

// For key down/up events
var wdown = 0;
var adown = 0;
var sdown = 0;
var ddown = 0;

// Initialization and initial call to tick.
// Executed when the page is loaded.
window.onload = function()
{
	init();
	tick();
}

var shapeIndex = [0,0,0,0,0,0];
var shapeNames = ["sphere", "cube", "plane", "cone", "cylinder", "torus"];
function init() 
{
	// Create the container and add it to the page
	container = document.createElement("div");
	container.id = "main";
	container.tabIndex = 0;
	document.body.appendChild(container);
	
	// Create a reference to the selection dropdown for later
	selectContainer = document.getElementById("objselect");
	selectLabel = document.getElementById("select-button").nextSibling;
	
	// Create a camera that will be used to render the scene
	camera = new THREE.PerspectiveCamera(30, container.clientWidth/container.clientHeight, 1, 2000);
	camera.rotation.order = 'YXZ';
	
	// Create the scene 
	scene = new THREE.Scene();
	
	// Now parse the json, since we have the necessary objects allocated
	// Change to "demo1.json" for the other demo
	parseJsonFile("demo1.json");

	// While json is parsing, create the renderer and add it to the container (div element)
	// Also add event listeners so we can respond to events.
	renderer = new THREE.WebGLRenderer({antialias:false});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(container.clientWidth, container.clientHeight);
	container.appendChild(renderer.domElement);
	container.addEventListener("mousemove", onDocumentMouseMove, false);
	container.addEventListener("mousedown", onDocumentMouseDown, false);
	container.addEventListener("mouseup", onDocumentMouseUp, false);
	container.addEventListener("mousewheel", onDocumentMouseWheel, false);
	container.addEventListener("DOMMouseScroll", onDocumentMouseWheel, false); // firefox
	container.addEventListener("keydown", onKeyDown);
	container.addEventListener("keyup", onKeyUp);
	window.addEventListener("resize", onWindowResize, false);
	
	// Hook click events for the buttons that instantiate new objects
	var createButtons = document.getElementById("creator").childNodes;
	var length = createButtons.length;
	for (var i = 0, j = -1; i < length; ++i)
	{
		var button = createButtons[i];
		if (button.nodeType == 3) continue;
		button.setAttribute("data-value", ++j);
		button.onclick = function()
			{
				var num = Number(this.getAttribute("data-value"));
				var incr = ++shapeIndex[num]
				var name = shapeNames[num];
				addMeshToScene(name, name+incr, [Math.random(), Math.random(), Math.random()], [1,1,1], [0,0,0])
			}
	}

	// Some extra lights
	loadLights();
}

// Parses a json file containing a scene
function parseJsonFile(filename)
{
	var request = new XMLHttpRequest();
	request.open("GET", filename, true);
	request.overrideMimeType("application/json");
	request.send();
	
	// Necessary since call to send is asynchronous
	request.onload = 
		function() 
		{
            var rootNode = JSON.parse(request.responseText);
            var children = rootNode["children"];
        	for(var i = 0; i < children.length; ++i)
			{
				var obj = children[i];
				var type = obj["type"];
				if(type == "mesh")
				{
					var m = obj["material"];
					addMeshToScene(obj["geometry"], obj["name"], m["diffuseColor"], m["specularColor"], obj["translate"]);
				}
				else if (type == "camera")
				{
					handleCamera(obj);
				}
				else if (type == "directional light")
				{
					var color = obj["color"];
					var dlight = new THREE.DirectionalLight(new THREE.Color(color[0], color[1], color[2]));
					
					var pos = obj["position"];
					dlight.position.set(pos[0], pos[1], pos[2]);
					
					scene.add(dlight);
				}
			}
        }
}

// Create a mesh and add it to the scene
function addMeshToScene(geometryStr, name, dColor, sColor, translate)
{
	var geometry;
	switch (geometryStr)
	{
		case "sphere":
			geometry = new THREE.SphereGeometry(1, 32, 32);
			break;
		case "cube":
			geometry = new THREE.BoxGeometry(1, 1, 1);
			break;
		case "plane":
			geometry = new THREE.PlaneGeometry(1, 1);
			break;
		case "cone":
			geometry = new THREE.CylinderGeometry(0, 1, 1, 32);
			break;
		case "cylinder":
			geometry = new THREE.CylinderGeometry(1, 1, 1, 32);
			break;
		case "torus":
			geometry = new THREE.TorusGeometry(1, 0.5, 32, 32);
			break;
		default:
			alert(name);
			return;
	}

	var diffuseColor = new THREE.Color(dColor[0], dColor[1], dColor[2]);
	var material = new THREE.MeshPhongMaterial({
		color: diffuseColor, 
		specular: new THREE.Color(sColor[0], sColor[1], sColor[2]), 
		shading: THREE.SmoothShading});
	var shapeToAdd = new THREE.Mesh(geometry, material);
	
	shapeToAdd.position.x = translate[0];
	shapeToAdd.position.y = translate[1];
	shapeToAdd.position.z = translate[2];
	
	scene.add(shapeToAdd);
	addControllableObject(shapeToAdd, name, false, "#"+diffuseColor.getHexString());
}

// Configure camera properties based on a json node
function handleCamera(obj)
{
	var eye = obj["eye"];
	camera.position.x = eye[0];
	camera.position.y = eye[1];
	camera.position.z = eye[2];
	
	var vup = obj["vup"];
	camera.up.set(vup[0], vup[1], vup[2]);

	
	var center = obj["center"];
	camera.lookAt(new THREE.Vector3(center[0], center[1], center[2]));
	
	camera.fov = obj["fov"];
	camera.updateProjectionMatrix();
	
	addControllableObject(camera, "Camera", true, "#fff");
}

var index = 0;
var activeIndex = 0;
var cameraIndex = 0;
var firstObject = true;
function addControllableObject(obj, label, isCamera, colorHex)
{
	moveableObjects.push(obj);

	colorHex = "color:"+colorHex+";";
	var button = document.createElement("button");
	button.setAttribute("type", "button");
	button.setAttribute("data-value", index);
	button.setAttribute("style", colorHex);
	button.onclick = function()
		{
			changeFocus(this.getAttribute("data-value"), this.innerHTML, this.getAttribute("style"));
		}
	
	var text = document.createTextNode(label);
	button.appendChild(text);
	selectContainer.appendChild(button);
	
	if (isCamera)
	{
		cameraIndex = index;
	}
	if (firstObject)
	{
		changeFocus(index, text.nodeValue, colorHex);
	}
	
	index = index + 1;
	firstObject = false;
}

// Changes the focus to a certain object so that it can receive events
function changeFocus(index, text, style)
{
	activeIndex = index
	if (index == cameraIndex)
	{
		rev = -1;
	}
	else
	{
		rev = 1;
	}
	selectLabel.innerHTML = text;
	selectLabel.setAttribute("style", style);
}

function loadLights()
{
	// Add a blueish ambient light to the scene
	var ambient = new THREE.AmbientLight(0x222244);
	scene.add(ambient);

	// Add a yellowish directional light to the scene
	light1 = new THREE.DirectionalLight(0xffeedd);
	light1.position.set(1, 1, 1);
	scene.add(light1);

	// Add a dim directional light
	light2 = new THREE.DirectionalLight(0x333333);
	light2.position.set(0, 0, 1);
	scene.add(light2);
}

// EVENT HANDLERS =============================================================

function onWindowResize() 
{
	var container = document.getElementById("main");
	windowX = container.clientWidth;
	windowY = container.clientHeight;

	camera.aspect = container.clientWidth / container.clientHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(container.clientWidth, container.clientHeight);
}

// Scale whatever has focus
// If the camera has focus, scale the whole scene instead
function onDocumentMouseWheel( event )
{
	var scaleTarget = moveableObjects[activeIndex];;
	if (activeIndex == cameraIndex || scaleTarget == undefined)
	{
		scaleTarget = scene;
	}

	var scaleFactor;
	if (event.detail > 0 || event.wheelDelta > 0)
	{
		scaleFactor = 1.1;
	}
	else
	{
		scaleFactor = 1.0/1.1;
	}
	
	scaleTarget.scale.x *= scaleFactor;
	scaleTarget.scale.y *= scaleFactor;
	scaleTarget.scale.z *= scaleFactor;
}

function onKeyDown(event)
{
	switch (event.which)
	{
		case 87:
			wdown = 1;
			break;
		case 65:
			adown = 1;
			break;
		case 83:
			sdown = 1;
			break;
		case 68:
			ddown = 1;
			break;
	}
}

function onKeyUp(event)
{
	switch (event.which)
	{
		case 87:
			wdown = 0;
			break;
		case 65:
			adown = 0;
			break;
		case 83:
			sdown = 0;
			break;
		case 68:
			ddown = 0;
			break;
	}
}

function onDocumentMouseUp( event ) 
{
	mouseDown = 0;
}	

function onDocumentMouseDown( event ) 
{
	mouseDown = event.which;
}	

function onDocumentMouseMove( event ) 
{
	//mousePrevX = mouseX;
	//mousePrevY = mouseY;
	mouseX = event.clientX;
	mouseY = event.clientY;
}

// ===========================================================================

// "Main loop"
function tick() 
{
	// requestAnimationFrame schedules a call to animate again
	requestAnimationFrame(tick); 
	update();
	render();
}

var rev = 1;	// Used to reverse direction of rotation when camera has focus
function update()
{
	var target = moveableObjects[activeIndex];
	target.translateX(adown * -0.1 + ddown * 0.1);
	target.translateZ(wdown * -0.1 + sdown * 0.1)

	if (mouseDown == 1)
	{
		target.rotation.y += rev*(mouseX-mousePrevX)*0.005;
		target.rotation.x += rev*(mouseY-mousePrevY)*0.005;
	}

	// Update previous position here because animateFrame out of sync
	// with onDocumentMouseMove
	mousePrevX = mouseX;
	mousePrevY = mouseY;
}

function render() 
{
	renderer.render(scene, camera);
}
