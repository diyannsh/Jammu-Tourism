/**
 * JAMMU EXPEDITION — CLIENT ENGINE
 * Architecture: Telemetry Canvas, Web Audio Synthesizer, Dynamic Route Configurator
 */

// 1. PROCEDURAL 3D TOPOGRAPHIC WIREFRAME
const canvas = document.getElementById("hero-canvas");
let renderer, scene, camera, terrainMesh, terrainPoints, terrainGeometry;
let clock = new THREE.Clock();
const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };

function initTopography() {
  if (!window.THREE || !canvas) return;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
      45,
      canvas.clientWidth / Math.max(canvas.clientHeight, 1),
      0.1,
      100
    );
    camera.position.set(0, -6, 4.5);
    camera.lookAt(0, 0, 0);

    // Dynamic Himalayan Ridge Topography Grid
    const width = 16;
    const height = 12;
    const segmentsX = 48;
    const segmentsY = 36;
    terrainGeometry = new THREE.PlaneGeometry(width, height, segmentsX, segmentsY);

    // Displace vertices to form mountain elevation peaks
    const pos = terrainGeometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i);
      const v = pos.getY(i);
      const elevation =
        Math.sin(u * 0.7) * Math.cos(v * 0.8) * 1.1 +
        Math.sin(u * 1.5 + v * 0.9) * 0.45 +
        Math.cos(u * 2.1) * 0.25;
      pos.setZ(i, elevation);
    }
    terrainGeometry.computeVertexNormals();

    // Wireframe Mesh
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: 0x9fa6ab,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    terrainMesh = new THREE.Mesh(terrainGeometry, wireMaterial);
    scene.add(terrainMesh);

    // Glowing Peak Radar Points
    const pointMaterial = new THREE.PointsMaterial({
      color: 0xd4af37,
      size: 0.035,
      transparent: true,
      opacity: 0.6,
    });
    terrainPoints = new THREE.Points(terrainGeometry, pointMaterial);
    scene.add(terrainPoints);

    resizeTerrain();
    animateTerrain();
  } catch (error) {
    canvas.style.display = "none";
    console.warn("Telemetry canvas disabled:", error.message);
  }
}

function resizeTerrain() {
  if (!renderer || !camera) return;
  const w = canvas.clientWidth || window.innerWidth;
  const h = canvas.clientHeight || window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.position.z = w < 650 ? 5.8 : 4.5;
  camera.updateProjectionMatrix();
}

function animateTerrain() {
  requestAnimationFrame(animateTerrain);
  const elapsedTime = clock.getElapsedTime();

  pointer.x += (pointer.targetX - pointer.x) * 0.03;
  pointer.y += (pointer.targetY - pointer.y) * 0.03;

  if (terrainMesh && terrainPoints) {
    // Subtle breathing altitude undulation
    terrainMesh.rotation.z = pointer.x * 0.12 + Math.sin(elapsedTime * 0.1) * 0.05;
    terrainMesh.rotation.x = -0.3 + pointer.y * 0.08;
    terrainMesh.position.x = pointer.x * 0.4;
    terrainPoints.rotation.copy(terrainMesh.rotation);
    terrainPoints.position.copy(terrainMesh.position);
  }

  renderer.render(scene, camera);
}

window.addEventListener("resize", resizeTerrain, { passive: true });
window.addEventListener(
  "pointermove",
  (e) => {
    pointer.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    pointer.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  },
  { passive: true }
);

initTopography();

// 2. LIVE TELEMETRY CLOCK (KOLKATA TIME ZONE)
const clockElement = document.getElementById("local-time");
function updateTelemetryClock() {
  clockElement.textContent = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}
updateTelemetryClock();
setInterval(updateTelemetryClock, 1000);

// 3. TELEMETRY BOOT TEXT STREAM
const terminalText = document.getElementById("terminal-text");
const bootMessage = "INITIALIZING JMU-FIELD ENGINE... ORDNANCE GRID READY";
let terminalIndex = 0;

function streamBootLog() {
  if (terminalIndex < bootMessage.length) {
    terminalText.textContent += bootMessage.charAt(terminalIndex++);
    setTimeout(streamBootLog, 28);
  }
}
setTimeout(streamBootLog, 350);

// 4. SYNTHESIZED TACTICAL AUDIO FEEDBACK
let audioContext = null;
let soundEnabled = false;

function triggerAcousticBeep(frequency = 600, duration = 0.06) {
  if (!soundEnabled) return;
  try {
    audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, audioContext.currentTime);

    gain.gain.setValueAtTime(0.028, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start();
    osc.stop(audioContext.currentTime + duration);
  } catch (err) {
    console.warn("Acoustics inactive:", err.message);
  }
}

const soundToggle = document.getElementById("sound-toggle");
soundToggle.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  soundToggle.classList.toggle("is-off", !soundEnabled);
  soundToggle.setAttribute("aria-pressed", String(soundEnabled));
  document.getElementById("sound-label").textContent = soundEnabled ? "ON" : "OFF";
  triggerAcousticBeep(soundEnabled ? 780 : 380, 0.1);
});

// 5. SMOOTH INTERPOLATED RETICLE CURSOR
const cursorDot = document.getElementById("cursor-dot");
const cursorRing = document.getElementById("cursor-ring");
let mouseX = innerWidth / 2;
let mouseY = innerHeight / 2;
let ringX = mouseX;
let ringY = mouseY;

window.addEventListener("pointermove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
}, { passive: true });

function renderCursor() {
  cursorDot.style.left = mouseX + "px";
  cursorDot.style.top = mouseY + "px";
  ringX += (mouseX - ringX) * 0.18;
  ringY += (mouseY - ringY) * 0.18;
  cursorRing.style.left = ringX + "px";
  cursorRing.style.top = ringY + "px";
  requestAnimationFrame(renderCursor);
}
renderCursor();

document.addEventListener("pointerover", (e) => {
  if (e.target.closest("button, a, .route-card")) {
    document.body.classList.add("cursor-active");
    triggerAcousticBeep(640, 0.04);
  } else {
    document.body.classList.remove("cursor-active");
  }
});

// 6. CARD 3D TILT WITH REAL-TIME GLARE
const selectedRoutes = [];
document.querySelectorAll(".route-card").forEach((card) => {
  card.addEventListener("pointermove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    card.style.setProperty("--mx", `${x * 100}%`);
    card.style.setProperty("--my", `${y * 100}%`);
    card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 6}deg) rotateY(${(x - 0.5) * 8}deg)`;
  });

  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });

  const addButton = card.querySelector(".quick-add");
  addButton.addEventListener("click", (e) => {
    e.stopPropagation();
    const routeName = card.dataset.route;
    if (!selectedRoutes.includes(routeName)) {
      selectedRoutes.push(routeName);
    }
    addButton.classList.add("added");
    addButton.innerHTML = '<i data-lucide="check"></i> Added to route';
    if (window.lucide) lucide.createIcons();
    renderItinerary();
    notifyToast(`${routeName.toUpperCase()} RECORDED`);
    triggerAcousticBeep(880, 0.09);
  });
});

// 7. EXPEDITION CONFIGURATOR ENGINE
const plannerState = {
  duration: "48H",
  vibe: "Spiritual",
  group: "Solo traveller",
};

const routeStops = {
  Spiritual: [
    ["Katra Basecamp", "JAMMU · 875 M"],
    ["Trikuta Ridgeline", "ASCENT · 1,585 M"],
    ["Shrine Approach", "THE QUIET HOUR"],
  ],
  Adventure: [
    ["Patnitop Trailhead", "JAMMU · 2,024 M"],
    ["Sanasar Meadow", "WILDERNESS · 2,050 M"],
    ["Cloudline Overlook", "THE HIGH ROUTE"],
  ],
  Heritage: [
    ["Mubarak Mandi Complex", "OLD CITY · 1725"],
    ["Bahu Fort Citadel", "TAWI RIVER · 300 YR"],
    ["Bagh-e-Bahu Terraces", "GARDEN · GOLDEN HOUR"],
  ],
};

const selectCopy = {
  Spiritual: { title: "A Call to the Mountains", ascent: "1,585 M", pace: "CONSIDERED" },
  Adventure: { title: "Into the Cloudline", ascent: "2,024 M", pace: "UNTAMED" },
  Heritage: { title: "Echoes of the Dogras", ascent: "300 YR", pace: "UNHURRIED" },
};

document.querySelectorAll(".segment").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(`.segment[data-kind="${button.dataset.kind}"]`)
      .forEach((item) => item.classList.remove("selected"));
    button.classList.add("selected");
    plannerState[button.dataset.kind] = button.dataset.value;
    renderItinerary();
    triggerAcousticBeep(700, 0.05);
  });
});

document.getElementById("group-type").addEventListener("change", (e) => {
  plannerState.group = e.target.value;
  renderItinerary();
});

function renderItinerary() {
  const currentVibe = selectCopy[plannerState.vibe];
  const count = selectedRoutes.length;

  document.getElementById("preview-title").textContent = count
    ? `${count} Circuit${count > 1 ? "s" : ""} Locked`
    : currentVibe.title;

  document.getElementById("preview-sub").textContent =
    `A considered ${plannerState.duration.replace("H", "-hour")} ${plannerState.vibe.toLowerCase()} passage for ${plannerState.group.toLowerCase()}.`;

  document.getElementById("duration-note").textContent = plannerState.duration.replace("H", " HOURS");
  document.getElementById("vibe-note").textContent = plannerState.vibe.toUpperCase();
  document.getElementById("route-count").textContent = String(count).padStart(2, "0");
  document.getElementById("ascent").textContent = count
    ? `${count} SECTOR${count > 1 ? "S" : ""}`
    : currentVibe.ascent;
  document.getElementById("pace").textContent = currentVibe.pace;

  const displayStops = count
    ? selectedRoutes.slice(0, 3).map((route, i) => [
        route,
        `CUSTOM CIRCUIT · ${String(i + 1).padStart(2, "0")}`,
      ])
    : routeStops[plannerState.vibe];

  document.getElementById("itinerary-stops").innerHTML = displayStops
    .map(
      (stop) => `
      <div class="stop">
        <span class="stop-dot"></span>
        <div>
          <strong>${stop[0]}</strong>
          <small>${stop[1]}</small>
        </div>
      </div>`
    )
    .join("");
}
renderItinerary();

// 8. TACTICAL HUD TOAST & INTERSECTION OBSERVER
let toastTimer;
function notifyToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

if (window.lucide) lucide.createIcons();