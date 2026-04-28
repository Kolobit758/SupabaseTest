// Game variables
let scene, camera, renderer;
let player = { health: 100, attack: 5 };
let monsters = [];
let killedMonsters = 0;
let keys = {};
let mouse = { x: 0, y: 0 };
let raycaster = new THREE.Raycaster();
let pointer = new THREE.Vector2();

// Initialize the game
function init() {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  // Camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1, 5);

  // Renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('game-container').appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(0, 1, 0);
  scene.add(directionalLight);

  // Ground
  const groundGeometry = new THREE.PlaneGeometry(100, 100);
  const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // Walls (simple cubes for boundaries)
  const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
  const wall1 = new THREE.Mesh(new THREE.BoxGeometry(100, 10, 1), wallMaterial);
  wall1.position.set(0, 5, -50);
  scene.add(wall1);
  const wall2 = new THREE.Mesh(new THREE.BoxGeometry(100, 10, 1), wallMaterial);
  wall2.position.set(0, 5, 50);
  scene.add(wall2);
  const wall3 = new THREE.Mesh(new THREE.BoxGeometry(1, 10, 100), wallMaterial);
  wall3.position.set(-50, 5, 0);
  scene.add(wall3);
  const wall4 = new THREE.Mesh(new THREE.BoxGeometry(1, 10, 100), wallMaterial);
  wall4.position.set(50, 5, 0);
  scene.add(wall4);

  // Create monsters
  for (let i = 0; i < 10; i++) {
    createMonster();
  }

  // Event listeners
  document.addEventListener('keydown', (event) => { keys[event.code] = true; });
  document.addEventListener('keyup', (event) => { keys[event.code] = false; });
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('click', shoot);
  window.addEventListener('resize', onWindowResize);

  // Start game loop
  animate();
}

function createMonster() {
  const monsterGeometry = new THREE.BoxGeometry(1, 2, 1);
  const monsterMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
  const monster = new THREE.Mesh(monsterGeometry, monsterMaterial);
  monster.position.set(Math.random() * 80 - 40, 1, Math.random() * 80 - 40);
  monster.health = 5;
  monster.attack = 5;
  monster.speed = 0.02;
  scene.add(monster);
  monsters.push(monster);
}

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  camera.rotation.y -= mouse.x * 0.01;
  camera.rotation.x -= mouse.y * 0.01;
  camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
}

function shoot() {
  pointer.set(mouse.x, mouse.y);
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(monsters);
  if (intersects.length > 0) {
    const monster = intersects[0].object;
    monster.health -= player.attack;
    if (monster.health <= 0) {
      scene.remove(monster);
      monsters.splice(monsters.indexOf(monster), 1);
      killedMonsters++;
      document.getElementById('score').innerText = `Monsters Killed: ${killedMonsters}/10`;
      if (killedMonsters >= 10) {
        document.getElementById('message').innerText = 'You Win!';
        document.getElementById('message').style.display = 'block';
      }
    }
  }
}

function updateMonsters() {
  monsters.forEach(monster => {
    // Move towards player
    const direction = new THREE.Vector3();
    direction.subVectors(camera.position, monster.position).normalize();
    monster.position.add(direction.multiplyScalar(monster.speed));

    // Attack if close
    if (monster.position.distanceTo(camera.position) < 2) {
      player.health -= monster.attack;
      document.getElementById('health').innerText = `Health: ${player.health}`;
      if (player.health <= 0) {
        // Game over
        document.getElementById('message').innerText = 'Game Over!';
        document.getElementById('message').style.display = 'block';
      }
    }
  });
}

function movePlayer() {
  const speed = 0.1;
  if (keys['KeyW']) {
    camera.translateZ(-speed);
  }
  if (keys['KeyS']) {
    camera.translateZ(speed);
  }
  if (keys['KeyA']) {
    camera.translateX(-speed);
  }
  if (keys['KeyD']) {
    camera.translateX(speed);
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  movePlayer();
  updateMonsters();
  renderer.render(scene, camera);
}

// Start the game
init();