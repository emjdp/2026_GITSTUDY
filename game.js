let scene, camera, renderer;
let player;
let obstacles = [];
let commits = [];
let score = 0;
let gameActive = false;
let speed = 0.5;

const scoreDisplay = document.getElementById('score-display');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

function init() {
    // Setup Scene!
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0d1117, 0.02);

    // Setup Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);

    // Setup Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x0d1117);
    document.body.appendChild(renderer.domElement);

    // Add Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // Grid Helper for ground
    const grid = new THREE.GridHelper(200, 40, 0x30363d, 0x30363d);
    grid.position.y = -1;
    scene.add(grid);

    // Create Player
    const playerGeo = new THREE.BoxGeometry(1, 1, 1);
    const playerMat = new THREE.MeshPhongMaterial({ color: 0x00f0ff, emissive: 0x0088ff, emissiveIntensity: 0.5 });
    player = new THREE.Mesh(playerGeo, playerMat);
    player.position.y = -0.5;
    scene.add(player);

    // Event Listeners
    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('keydown', onKeyDown, false);
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);

    animate();
}

function startGame() {
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');

    // Reset state
    score = 0;
    speed = 0.3;
    scoreDisplay.innerText = `Commits: ${score}`;
    player.position.x = 0;

    // Clear old objects
    obstacles.forEach(o => scene.remove(o));
    commits.forEach(c => scene.remove(c));
    obstacles = [];
    commits = [];

    gameActive = true;
}

function onKeyDown(event) {
    if (!gameActive) return;
    const moveDistance = 2;
    if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
        player.position.x = Math.max(-6, player.position.x - moveDistance);
    } else if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
        player.position.x = Math.min(6, player.position.x + moveDistance);
    }
}

function spawnObject() {
    if (Math.random() > 0.7) {
        // Spawn Commit (Green Sphere)
        const geo = new THREE.SphereGeometry(0.5, 16, 16);
        const mat = new THREE.MeshPhongMaterial({ color: 0x2ea043, emissive: 0x2ea043, emissiveIntensity: 0.5 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set((Math.floor(Math.random() * 7) - 3) * 2, -0.5, -50);
        scene.add(mesh);
        commits.push(mesh);
    } else {
        // Spawn Bug (Red Cube)
        const geo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
        const mat = new THREE.MeshPhongMaterial({ color: 0xf85149, emissive: 0xf85149, emissiveIntensity: 0.3 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set((Math.floor(Math.random() * 7) - 3) * 2, -0.4, -50);
        scene.add(mesh);
        obstacles.push(mesh);
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    if (gameActive) {
        // Spawn logic
        if (Math.random() < 0.03 + (score * 0.001)) {
            spawnObject();
        }

        speed += 0.0001;

        // Move objects and check collisions
        for (let i = obstacles.length - 1; i >= 0; i--) {
            let obs = obstacles[i];
            obs.position.z += speed;
            obs.rotation.x += 0.05;
            obs.rotation.y += 0.05;

            // Collision with Bug
            if (obs.position.distanceTo(player.position) < 1.2) {
                gameActive = false;
                gameOverScreen.classList.remove('hidden');
            }

            if (obs.position.z > 10) {
                scene.remove(obs);
                obstacles.splice(i, 1);
            }
        }

        for (let i = commits.length - 1; i >= 0; i--) {
            let cmt = commits[i];
            cmt.position.z += speed;

            // Collect Commit
            if (cmt.position.distanceTo(player.position) < 1.2) {
                scene.remove(cmt);
                commits.splice(i, 1);
                score++;
                scoreDisplay.innerText = `Commits: ${score}`;
            } else if (cmt.position.z > 10) {
                scene.remove(cmt);
                commits.splice(i, 1);
            }
        }
    }

    renderer.render(scene, camera);
}

window.onload = init;
