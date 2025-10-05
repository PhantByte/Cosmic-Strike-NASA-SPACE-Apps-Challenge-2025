import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import GUI from 'lil-gui';

let gui = new GUI({title : 'Main menu'});
let runningSimulation = false;

const params = {
  prevention : "None",
  location : "New York",
  velocity : 1,
  size : 1,
  submit:() =>
  {
    let UI = document.querySelector('.lil-gui');
    UI.style.display = 'none';
    runSimulation(params);
  }
}

const preventionInfo = {
  "None": "No prevention applied. The asteroid will impact the selected location.",
  "Kinetic": "Kinetic: Slightly alters the asteroid trajectory to avoid impact.",
  "Laser": "Laser: Gradually shrinks the asteroid with a laser beam from Earth."
};


const locations = {
  "New York" : [40.668252, -74.020154 + 90],
  "Paris" : [48.856540, 2.350917 + 90],
  "Rome" : [41.894833, 12.482812 + 90],
  "Seoul" : [37.549800, 126.991525 + 90],
  "San Francisco" : [37.771532, -122.420052 + 90],
  "Houston" : [29.728696, -95.374835 + 90],
  "Bistrita" : [47.139678, 24.497307 + 90],
  "Berlin" : [52.516888, 13.404820 + 90],
  "Ottawa" : [45.409732, -75.699385 + 90],
  "Sao Paulo" : [-23.575927, -46.640413 + 90],
  "Sydney" : [-33.878286, 151.200103 + 90],
  "New Delhi" : [28.598285, 77.204618 + 90]
};

gui.add(params, 'location', Object.keys(locations)).name('Impact Location');
gui.add(params, 'velocity', 1, 20).step(1).name('Velocity');
gui.add(params, 'size', 0.5, 20).step(0.5).name('Size');
gui.add(params, 'prevention', ['None', 'Kinetic', 'Laser']).name('Prevention').onChange((value) => {
       document.getElementById('preventionInfo').innerText = preventionInfo[value];
   });;
gui.add(params, 'submit').name('Submit');

function latLonToUnitVector(lat, lon) {
  const toRad = Math.PI / 180;
  const phi = lat * toRad;
  const lambda = lon * toRad;

  const cosPhi = Math.cos(phi);
  return {x:cosPhi * Math.sin(lambda), y:Math.sin(phi), z:cosPhi * Math.cos(lambda)};
}
let distance = 500;
let coords;
let camera;
let asteroidModel = null;
let asteroidX;
let asteroidY;
let asteroidZ;
let velocityVector;
let velocitySpeed;

function runSimulation(params)
{
  if (runningSimulation) return;
  console.log(params);
  velocitySpeed = params.velocity; 
  distance = params.velocity * 500;
  coords = latLonToUnitVector(locations[params.location][0], locations[params.location][1]); 
  velocityVector = {x: -coords.x * velocitySpeed, y: -coords.y * velocitySpeed, z: -coords.z * velocitySpeed}; 
  asteroidX = coords.x * (1000 + distance);
  asteroidY = coords.y * (1000 + distance);
  asteroidZ = coords.z * (1000 + distance);
  asteroidModel.position.set(asteroidX, asteroidY, asteroidZ);
  asteroidModel.scale.set(params.size,params.size,params.size);
  camera.position.set(asteroidX + 20 * coords.x * asteroidModel.scale.x,
     asteroidY + 20 * coords.y * asteroidModel.scale.x,
      asteroidZ + 20 * coords.z * asteroidModel.scale.x);
  camera.lookAt(0, 0, 0);
  if (params.prevention === "Laser") {
    camera.position.set(asteroidX + 30 * coords.x * asteroidModel.scale.x,
     asteroidY + 20 * coords.y * asteroidModel.scale.x,
      asteroidZ + 20 * coords.z * asteroidModel.scale.x);
  camera.lookAt(0, 0, 0);
  }
  runningSimulation = true;
}

function main()
{

  const canvas = document.getElementById('c');
  const renderer = new THREE.WebGLRenderer({antialias : true, canvas});
  let fov = 45;
  let aspectRatio = 2;
  let nearPlane = 0.1;
  let farPlane = 1000000;

  function asteroidFallTo(x, y, z, distance)
  {
    velocityVector = {x: -coords.x * velocitySpeed, y: -coords.y * velocitySpeed, z: -coords.z * velocitySpeed};
    asteroidX = coords.x * distance;
    asteroidY = coords.y * distance;
    asteroidZ = coords.z * distance;
  }
  
  coords = latLonToUnitVector(locations["New York"][0], locations["New York"][1]);

  asteroidFallTo(coords.x, coords.y, coords.z, 1000 + distance);

  camera = new THREE.PerspectiveCamera(fov, aspectRatio, nearPlane, farPlane);
  camera.position.set(asteroidX + 20 * coords.x, asteroidY + 20 * coords.y, asteroidZ + 20 * coords.z);
  camera.lookAt(0, 0, 0);

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(asteroidX, asteroidY, asteroidZ);
  controls.update();

  const scene = new THREE.Scene();

  let objects = [];

  const sphereRadius = 100;
  const sphereWidthDivisions = 200;
  const sphereHeightDivisions = 200;
  const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
  const loader = new THREE.TextureLoader();
  const sunTexture = loader.load('/textures/sun.jpeg');
  const sunMaterial = new THREE.MeshPhongMaterial({map:sunTexture});
  const sun = new THREE.Mesh(sphereGeo, sunMaterial);
  let sunX = -10000;
  sun.position.set(sunX, 0, 0);
  sun.scale.set(1.5, 1.5, 1.5);
  scene.add(sun);

  /*for (const city in locations) {
    const coords = locations[city];   // [lat, lon]
    const point = new THREE.Mesh(sphereGeo, sunMaterial);
    point.scale.set(0.05, 0.05, 0.05);

    const xyz = latLonToUnitVector(coords[0], coords[1]);
    point.position.set(xyz.x * 300, xyz.y * 300, xyz.z * 300);
    scene.add(point);
  }*/

  objects.push(sun);
  const earthTexture = loader.load('/textures/earth.jpg');
  const earthMaterial = new THREE.MeshPhongMaterial({map:earthTexture});
  const earth = new THREE.Mesh(sphereGeo, earthMaterial);
  earth.scale.set(10, 10, 10);

  const earthOrbit = new THREE.Object3D();
  earthOrbit.position.set(0, 0, 0);

  scene.add(earthOrbit);

  earthOrbit.add(earth);

  objects.push(earthOrbit);

  objects.push(earth);

  const textureLoader = new THREE.TextureLoader();
  textureLoader.load('/textures/asteroidTexture.jpg');

  const meshLoader = new GLTFLoader();


  meshLoader.load( '/models/meteorModel.glb', function ( gltf ) { 
    asteroidModel = gltf.scene;
    asteroidModel.scale.set(1,1,1);
    asteroidModel.position.set(asteroidX, asteroidY, asteroidZ);
    asteroidModel.traverse((child) => {
      if (child.isMesh) {
        const tex = textureLoader.load('/textures/asteroidTexture.jpg');
        child.material.map = tex;
        child.material.needsUpdate = true;
        child.material = new THREE.MeshPhongMaterial({ map: child.material.map });
      }
    });
    scene.add( asteroidModel );
  });


  const color = 0xFFFFFF;
  const ambientIntensity = .5;
  const ambientLight = new THREE.AmbientLight(color, ambientIntensity);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 1000000);
  pointLight.decay = 1.5;
  pointLight.distance = 0;
  pointLight.position.set(sunX, 0, 0);
  scene.add(pointLight);

  {
    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
      '/sky/px.png',
      '/sky/nx.png',
      '/sky/py.png',
      '/sky/ny.png',
      '/sky/pz.png',
      '/sky/nz.png',
    ]);
    scene.background = texture;
  }
  
  const asteroidRotationX = Math.random();
  const asteroidRotationY = Math.random();
  const asteroidRotationZ = Math.random();

  function pitagora(x, y, z)
  {
    return Math.sqrt(x*x+y*y+z*z);
  }

  let meteorFinished = false;

  function createExplosion(position, asteroid) {
    let scale = 1;
    scale *= asteroidModel.scale.x * Math.cbrt(velocitySpeed * velocitySpeed);
    const geometry = new THREE.SphereGeometry(scale, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff6600,
      transparent: true,
      opacity: 0.8,
    });
    const explosion = new THREE.Mesh(geometry, material);
    explosion.position.copy(position);
    scene.add(explosion);

    const explosionDuration = 700; // ms
    const start = performance.now();

    function animateExplosion(time) {
      const elapsed = time - start;
      if (elapsed < explosionDuration) {
        scale = 1 + elapsed / 1000;
        explosion.scale.set(scale, scale, scale);
        explosion.material.opacity = 1 - elapsed / explosionDuration;
        requestAnimationFrame(animateExplosion);
      } else {
        scene.remove(explosion);
      }
    }
    requestAnimationFrame(animateExplosion);
  }
  let laserBeam = null;

  function createLaserBeam(asteroidPosition) {
    if(laserBeam) scene.remove(laserBeam);
    const start = new THREE.Vector3(0, 0, 0);
    const end = asteroidPosition.clone();
    end.x *= 5; end.y *= 5; end.z *= 5;
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    const midPoint = start.clone().add(direction.clone().multiplyScalar(0.5));

    const geometry = new THREE.CylinderGeometry(0.25, 0.25, length, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    laserBeam = new THREE.Mesh(geometry, material);

    laserBeam.position.copy(midPoint);

    laserBeam.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.clone().normalize()
    );

    scene.add(laserBeam);
  }
  function applyPrevention() {
    if (!asteroidModel) return;
    if (!runningSimulation) return;

    switch(params.prevention) {
      case "Kinetic":
        velocityVector.x += 0.0025;
        velocityVector.y += 0.0025;
        velocityVector.z -= 0.0025;
        break;

      case "Laser":
        asteroidModel.scale.multiplyScalar(0.99); 
        if (asteroidModel.scale.x > 0.2) createLaserBeam(asteroidModel.position);
        else {
          if (laserBeam) scene.remove(laserBeam);
        }
        break;

      default:
        break;
    }
  }
  
  function render(time)
  {
    time *= 0.001; //ms -> s 

    function resizeRenderer(renderer) {
      const canvas = renderer.domElement;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const needResize = canvas.width !== width || canvas.height !== height;
      if (needResize) {
        renderer.setSize(width, height, false);
      }
      return needResize;
    }
    if (resizeRenderer(renderer)) {
      const canvas = renderer.domElement;
      const width = canvas.clientWidth; 
      const height = canvas.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    function refreshButtonAppear()
    {
      const refreshButton = document.querySelector('#refreshButton');
      refreshButton.style.display = "block";
    }

    applyPrevention();
    if (runningSimulation && asteroidModel !== null && pitagora(asteroidModel.position.x, asteroidModel.position.y, asteroidModel.position.z) <= 1000+20) {
      if (!meteorFinished) {
        if (params.prevention === "None" || params.prevention === "Kinetic") createExplosion(asteroidModel.position, asteroidModel);
        scene.remove(asteroidModel);
        setTimeout(refreshButtonAppear, 2000);
        meteorFinished = true;
      }
    }
    else if (runningSimulation && asteroidModel !== null && pitagora(asteroidModel.position.x, asteroidModel.position.y, asteroidModel.position.z) >= 20000) {
      setTimeout(refreshButtonAppear, 2000);
    }
    else if (runningSimulation && asteroidModel !== null) {
      controls.target.set(asteroidModel.position.x, asteroidModel.position.y, asteroidModel.position.z);
      camera.position.x += velocityVector.x;
      camera.position.y += velocityVector.y;
      camera.position.z += velocityVector.z;
      asteroidModel.position.x += velocityVector.x;
      asteroidModel.position.y += velocityVector.y;
      asteroidModel.position.z += velocityVector.z;
      asteroidModel.rotation.x += 0.01 * asteroidRotationX;
      asteroidModel.rotation.y += 0.01 * asteroidRotationY;
      asteroidModel.rotation.z += 0.01 * asteroidRotationZ;
    }

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();