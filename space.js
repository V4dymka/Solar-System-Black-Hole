const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, innerWidth/innerHeight, 0.1, 200000);
    camera.position.set(0, 300, 1200);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight);
    document.body.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0,0,0);

    const loader = new THREE.TextureLoader();

    const starGeo = new THREE.BufferGeometry();
    const starCount = 80000;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i*3]   = (Math.random() - 0.5) * 500000;
      starPositions[i*3+1] = (Math.random() - 0.5) * 500000;
      starPositions[i*3+2] = (Math.random() - 0.5) * 500000;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 1.5 }));
    scene.add(stars);

    const objects = {};

    const blackHole = new THREE.Mesh(
      new THREE.SphereGeometry(125, 64, 64),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    blackHole.position.set(-5000, 500, -5000);
    scene.add(blackHole);
    objects.blackhole = blackHole;

    (function createDust() {
      const particleCount = 10000;
      const pos = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        const r = 100 + Math.random() * 200;
        const a = Math.random() * Math.PI * 2;
        pos[i*3]   = Math.cos(a) * r;
        pos[i*3+1] = (Math.random() - 0.5) * 12;
        pos[i*3+2] = Math.sin(a) * r;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({
        map: loader.load('textures/smoke.png'),
        color: 0xffb366,
        size: 14,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const dust = new THREE.Points(geo, mat);
      dust.rotation.x = Math.PI * 0.02;
      blackHole.add(dust);
      objects.blackholeDust = dust;
    })();

    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(90, 64, 64),
      new THREE.MeshBasicMaterial({ map: loader.load('textures/sun.jpg') })
    );
    sun.position.set(0, 0, 0);
    scene.add(sun);
    objects.sun = sun;
    const sunLight = new THREE.PointLight(0xffffff, 2.0, 8000);
    sun.add(sunLight);

    const hemi = new THREE.HemisphereLight(0xccccff, 0x222222, 0.25);
    scene.add(hemi);

    const mercury = new THREE.Mesh(
      new THREE.SphereGeometry(10, 48, 48),
      new THREE.MeshPhongMaterial({ map: loader.load('textures/mercury.jpg') })
    ); mercury.position.set(150, 0, 0); scene.add(mercury); objects.mercury = mercury;

    const venus = new THREE.Mesh(
      new THREE.SphereGeometry(18, 48, 48),
      new THREE.MeshPhongMaterial({ map: loader.load('textures/venus.jpg') })
    ); venus.position.set(185, 0, -60); scene.add(venus); objects.venus = venus;

    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(20, 48, 48),
      new THREE.MeshPhongMaterial({ map: loader.load('textures/earth.jpg') })
    ); earth.position.set(220, 0, 0); scene.add(earth); objects.earth = earth;

    const mars = new THREE.Mesh(
      new THREE.SphereGeometry(15, 48, 48),
      new THREE.MeshPhongMaterial({ map: loader.load('textures/mars.jpg') })
    ); mars.position.set(350, 0, -40); scene.add(mars); objects.mars = mars;

    const jupiter = new THREE.Mesh(
      new THREE.SphereGeometry(42, 48, 48),
      new THREE.MeshPhongMaterial({ map: loader.load('textures/jupiter.jpg') })
    ); jupiter.position.set(520, 20, 80); scene.add(jupiter); objects.jupiter = jupiter;

    const saturn = new THREE.Mesh(
      new THREE.SphereGeometry(36, 48, 48),
      new THREE.MeshPhongMaterial({ map: loader.load('textures/saturn.jpg') })
    ); saturn.position.set(760, -10, -60); scene.add(saturn); objects.saturn = saturn;

    const uranus = new THREE.Mesh(
      new THREE.SphereGeometry(32, 48, 48),
      new THREE.MeshPhongMaterial({ map: loader.load('textures/uranus.jpg') })
    ); uranus.position.set(980, 0, 120); scene.add(uranus); objects.uranus = uranus;

    const neptune = new THREE.Mesh(
      new THREE.SphereGeometry(31, 48, 48),
      new THREE.MeshPhongMaterial({ map: loader.load('textures/neptune.jpg') })
    ); neptune.position.set(1150, -20, -120); scene.add(neptune); objects.neptune = neptune;

    const ringGeo = new THREE.RingGeometry(46, 85, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      map: loader.load('textures/saturn_ring.png'),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    saturn.add(ring);

    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(6, 32, 32),
      new THREE.MeshPhongMaterial({ map: loader.load('textures/moon.jpg') })
    );
    moon.position.set(earth.position.x + 40, earth.position.y, earth.position.z);
    scene.add(moon);
    objects.moon = moon;

    const moonOrbit = { radius: 40, speed: 1.4, angle: 0 };

    function setAllVisible(v) {
      for (const k in objects) {
        const o = objects[k];
        if (o && o.visible !== undefined) o.visible = v;
      }
      if (objects.blackholeDust) objects.blackholeDust.visible = v;
    }
    setAllVisible(true);

    const highlightGroup = new THREE.Group();
    scene.add(highlightGroup);
    const glowMap = {};
    function createGlowFor(obj, color=0xffee88, opacity=0) {
      const geom = obj.geometry.clone();
      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.FrontSide
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.scale.set(1.25,1.25,1.25);
      mesh.position.copy(obj.position);
      highlightGroup.add(mesh);
      glowMap[obj.uuid] = { mesh, mat };
    }
    [mercury, venus, earth, moon, mars, jupiter, saturn, uranus, neptune, sun, blackHole]
      .forEach(o => createGlowFor(o));

    const label = document.getElementById('label');

    let isTransition = false;
    const transition = {
      fromPos: new THREE.Vector3(),
      toPos: new THREE.Vector3(),
      fromTarget: new THREE.Vector3(),
      toTarget: new THREE.Vector3(),
      startTime: 0,
      duration: 700
    };

    let focused = null;
    const scaleAnim = { from: 1, to: 1.15, start: 0, dur: 500, active: false };

    function smoothFocusOn(obj, name) {
      if (!obj) return;
      const box = new THREE.Box3().setFromObject(obj);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3()).length();
      const distance = Math.max(size * 2.2, 220);
      const dir = new THREE.Vector3().subVectors(camera.position, controls.target).normalize();
      const desiredCamPos = new THREE.Vector3().copy(center).add(dir.multiplyScalar(distance));

      transition.fromPos.copy(camera.position);
      transition.toPos.copy(desiredCamPos);
      transition.fromTarget.copy(controls.target);
      transition.toTarget.copy(center);
      transition.startTime = performance.now();
      isTransition = true;

      focused = obj;
      scaleAnim.from = obj.scale.x;
      scaleAnim.to = Math.max(1.0, scaleAnim.from) * 1.15;
      scaleAnim.start = performance.now();
      scaleAnim.active = true;

      label.style.display = 'block';
      label.textContent = name || '';
    }

    function clearFocus() {
      focused = null;
      label.style.display = 'none';
      for (const k in glowMap) glowMap[k].mat.opacity = 0;
    }

    const orbits = {
      mercury: { radius: 150, speed: 0.9, angle: 0 },
      venus:   { radius: 185, speed: 0.7, angle: 0 },
      earth:   { radius: 220, speed: 0.5, angle: 0 },
      mars:    { radius: 350, speed: 0.3, angle: 0 },
      jupiter: { radius: 520, speed: 0.15, angle: 0 },
      saturn:  { radius: 760, speed: 0.10, angle: 0 },
      uranus:  { radius: 980, speed: 0.07, angle: 0 },
      neptune: { radius: 1150, speed: 0.06, angle: 0 }
    };

    const names = {
      mercury: 'Mercury', venus: 'Venus', earth: 'Earth', mars: 'Mars',
      jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune'
    };

    const ui = document.querySelector('#ui');
if (ui) {
  ui.addEventListener('click', (ev) => {
    const btn = ev.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.id;
    if (!id) return;

    if (id === 'all') {
      setAllVisible(true);
      transition.fromPos.copy(camera.position);
      transition.toPos.set(0, 300, 1200);
      transition.fromTarget.copy(controls.target);
      transition.toTarget.set(0,0,0);
      transition.startTime = performance.now();
      isTransition = true;
      clearFocus();
    } else if (id === 'sun') {
      setAllVisible(false);
      sun.visible = true;
      smoothFocusOn(sun, 'Sun');
    } else if (id === 'blackhole') {
      setAllVisible(false);
      blackHole.visible = true;
      if (objects.blackholeDust) objects.blackholeDust.visible = true;
      smoothFocusOn(blackHole, 'Black Hole');
    } else {
      setAllVisible(false);
      if (objects[id]) objects[id].visible = true;
      if (id === 'earth') {
        if (objects.moon) objects.moon.visible = true;
      }
      smoothFocusOn(objects[id] || sun, names[id] || id);
    }
  });
}

    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      const dt = clock.getDelta();

      if (objects.blackholeDust) objects.blackholeDust.rotation.y += dt * 0.12;

      mercury.rotation.y += dt * 1.1;
      venus.rotation.y   += dt * 0.9;
      earth.rotation.y   += dt * 0.8;
      mars.rotation.y    += dt * 0.9;
      jupiter.rotation.y += dt * 0.4;
      saturn.rotation.y  += dt * 0.5;
      uranus.rotation.y  += dt * 0.45;
      neptune.rotation.y += dt * 0.4;
      moon.rotation.y    += dt * 0.9;

      for (const key in orbits) {
        const o = orbits[key];
        o.angle += dt * o.speed;
        const p = objects[key];
        if (p && key !== 'earth') {
          p.position.x = sun.position.x + Math.cos(o.angle) * o.radius;
          p.position.z = sun.position.z + Math.sin(o.angle) * o.radius;
          p.position.y = 0;
        } else if (p && key === 'earth') {
          p.position.x = sun.position.x + Math.cos(o.angle) * o.radius;
          p.position.z = sun.position.z + Math.sin(o.angle) * o.radius;
          p.position.y = 0;
        }
      }

      moonOrbit.angle += dt * moonOrbit.speed;
      moon.position.x = earth.position.x + Math.cos(moonOrbit.angle) * moonOrbit.radius;
      moon.position.z = earth.position.z + Math.sin(moonOrbit.angle) * moonOrbit.radius;
      moon.position.y = earth.position.y + Math.sin(moonOrbit.angle * 0.4) * 1.2;

      if (isTransition) {
        const now = performance.now();
        const tRaw = Math.min(1, (now - transition.startTime) / transition.duration);
        const t = tRaw < 0.5 ? 2*tRaw*tRaw : -1 + (4 - 2*tRaw)*tRaw;
        camera.position.lerpVectors(transition.fromPos, transition.toPos, t);
        controls.target.lerpVectors(transition.fromTarget, transition.toTarget, t);
        if (tRaw === 1) isTransition = false;
      }

      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    });