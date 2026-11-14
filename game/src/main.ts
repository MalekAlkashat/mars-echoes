import './style.css';
import * as THREE from 'three';
import { loadAssets } from './assets';
import { CameraRig } from './camera';
import { Progress } from './progress';
import { createRover } from './rover';
import { UI, element } from './ui';
import { Vehicle } from './vehicle';
import { createWorld } from './world';
import { createPresentation, createRenderer } from './rendering';
import { WheelEffects } from './wheelEffects';

const ui = new UI();
const progress = new Progress();
const vehicle = new Vehicle();
const keys = new Set<string>();
let paused = false;
let opticalUntil = 0;
let rejectTimer = 0;
let time = 0;
let hasStarted = false;
const driving = () => progress.phase === 'drive' || progress.phase === 'relay';
const camera = new CameraRig(ui.canvas, () => !paused && (driving() || progress.phase === 'ready'));

async function initialize(): Promise<void> {
  const renderer = createRenderer(ui.canvas);

  const assets = await loadAssets((loaded, total) => {
    element('load-status').textContent = `Preparing the graveyard · ${loaded} / ${total}`;
  });
  const rover = createRover(assets.rover);
  rover.root.rotation.order = 'YXZ';
  const world = createWorld(assets, () => createRover(assets.rover, true).root);
  element('load-status').textContent = 'Preparing terrain and lighting…';
  await world.ready;
  world.setupEnvironment(renderer);
  camera.setObstacles(world.obstacles);
  const wheelEffects = new WheelEffects(world.scene,world.height);
  const keyMaterial = new THREE.MeshStandardMaterial({color:0xf3eee4,roughness:0.6,metalness:0.05});
  const socketKey = new THREE.Mesh(new THREE.BoxGeometry(0.035,0.025,0.025),keyMaterial);
  socketKey.position.set(0,0.19,-0.05);
  rover.socket.add(socketKey);
  const cartridgeKey = new THREE.Mesh(new THREE.BoxGeometry(0.03,0.022,0.025),keyMaterial);
  cartridgeKey.position.set(0,0.183,-0.065);
  rover.module.add(cartridgeKey);
  world.scene.add(rover.root, rover.module);
  const donorSocket = world.donor.getObjectByName('optical-socket');
  const donorModule = rover.module.clone(true);
  donorModule.visible = true;
  if (donorSocket) donorSocket.add(donorModule);
  else {
    donorModule.position.set(0.22, 1.3, -0.52);
    world.donor.add(donorModule);
  }
  donorModule.position.set(0, 0, -0.02);
  const extractionStart = new THREE.Vector3();
  const extractionRotation = new THREE.Quaternion();
  const approachStart = new THREE.Vector3();
  const socketPosition = new THREE.Vector3();
  const socketRotation = new THREE.Quaternion();
  const localOffset = new THREE.Vector3();
  const lookRotation = new THREE.Quaternion();
  let serviceHeading = 0;
  const wheelAngles = Array<number>(6).fill(0);
  let frameMilliseconds = 16.7;
  const clock = new THREE.Clock();

  const presentation = createPresentation(renderer,world.scene,camera.camera);
  const {composer,film} = presentation;

  function reset(): void {
    progress.reset();
    vehicle.reset(world.spawn.x, world.spawn.z, 0);
    vehicle.settle(1,world.height);
    rover.root.position.copy(vehicle.position);
    rover.root.rotation.set(0, 0, 0);
    camera.reset();
    keys.clear();
    paused = false;
    opticalUntil = 0;
    rejectTimer = 0;
    rover.module.visible = false;
    donorModule.visible = true;
    for (const wheel of rover.wheels) wheel.rotation.x = 0;
    wheelAngles.fill(0);
    wheelEffects.reset();
    rover.setArmTarget(new THREE.Vector3(0.48, 0.7, -0.5));
    if (hasStarted) {
      progress.enter('drive');
      ui.playing();
    }
  }

  function pause(value: boolean): void {
    if (!hasStarted) return;
    paused = value;
    keys.clear();
    ui.pause(value);
  }

  function insert(): void {
    if (paused || progress.phase !== 'align') return;
    if (!progress.attemptInsertion()) rejectTimer = 1.6;
    ui.canvas.focus();
  }

  function interact(): void {
    if (paused) return;
    if (progress.phase === 'drive' && vehicle.position.distanceTo(world.donorPosition) < 2.85) {
      vehicle.speed = 0;
      // Face the recovered part, so the short arm reaches without crossing the chassis.
      const delta = world.donorPosition.clone().sub(vehicle.position);
      vehicle.heading = Math.atan2(-delta.x, -delta.z);
      serviceHeading = vehicle.heading;
      progress.enter('scan');
      opticalUntil = 0;
      keys.clear();
      ui.canvas.focus();
    } else if (progress.phase === 'relay' && vehicle.position.distanceTo(world.relayPosition) < 4.0) {
      vehicle.speed = 0;
      progress.enter('transmit');
      keys.clear();
      opticalUntil = 0;
    }
  }

  function toggleOptical(): void {
    if (!paused && driving()) opticalUntil = opticalUntil > time ? 0 : time + 3;
  }

  ui.start.addEventListener('click', () => {
    hasStarted = true;
    reset();
  });
  ui.insert.addEventListener('click', insert);
  ui.interact.addEventListener('click', interact);
  element('feed-button').addEventListener('click', toggleOptical);
  element('pause-button').addEventListener('click', () => pause(true));
  element('resume-button').addEventListener('click', () => pause(false));
  element('restart-button').addEventListener('click', reset);
  element('replay-button').addEventListener('click', reset);

  window.addEventListener('keydown', (event) => {
    if (paused && event.code === 'Tab') {
      const resume = element('resume-button');
      const restart = element('restart-button');
      event.preventDefault();
      (document.activeElement === resume ? restart : resume).focus();
      return;
    }
    if (event.code === 'Escape') {
      event.preventDefault();
      if (!event.repeat) pause(!paused);
      return;
    }
    if (!hasStarted || paused) return;
    if (['KeyW','KeyA','KeyS','KeyD','KeyQ','KeyE','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.code)) {
      event.preventDefault();
      keys.add(event.code);
    }
    if (event.repeat) return;
    if (event.code === 'KeyE' && driving()) interact();
    if (event.code === 'KeyF') toggleOptical();
    if (event.code === 'Enter' && progress.phase === 'align') { event.preventDefault(); insert(); }
    if (event.code === 'KeyR') reset();
  });
  window.addEventListener('keyup', (event) => keys.delete(event.code));
  document.addEventListener('pointerdown', (event) => {
    if (event.target !== ui.canvas && !(event.target instanceof HTMLElement && event.target.closest('[data-key]'))) keys.clear();
  });
  window.addEventListener('blur', () => { if (hasStarted) pause(true); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && hasStarted) pause(true); });
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-key]')) {
    const key = button.dataset.key!;
    button.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      keys.add(key);
    });
    const release = () => keys.delete(key);
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('lostpointercapture', release);
    button.addEventListener('click', (event) => {
      if (event.detail !== 0) return;
      keys.add(key);
      setTimeout(release, 150);
    });
  }

  let repairDrag: { x: number; y: number } | null = null;
  ui.canvas.addEventListener('pointerdown', (event) => {
    if (!paused && progress.phase === 'align') {
      repairDrag = { x: event.clientX, y: event.clientY };
      ui.canvas.setPointerCapture(event.pointerId);
    }
  });
  ui.canvas.addEventListener('pointermove', (event) => {
    if (!repairDrag || paused || progress.phase !== 'align') return;
    progress.adjust((event.clientX - repairDrag.x) * 0.001, (repairDrag.y - event.clientY) * 0.001, 0);
    repairDrag = { x: event.clientX, y: event.clientY };
  });
  ui.canvas.addEventListener('pointerup', () => { repairDrag = null; });
  ui.canvas.addEventListener('pointercancel', () => { repairDrag = null; });

  window.addEventListener('resize', () => {
    camera.camera.aspect = innerWidth / innerHeight;
    camera.camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    presentation.resize();
  });
  reset();
  ui.loaded();
  if (import.meta.env.DEV && new URLSearchParams(location.search).has('review')) {
    const { installRecorder } = await import('./review');
    installRecorder(ui.canvas);
  }

  function animate(): void {
    const realDelta = clock.getDelta();
    const dt = Math.min(realDelta, 0.05);
    if (realDelta > 0 && realDelta < 0.2) frameMilliseconds += (realDelta*1000-frameMilliseconds)*.03;
    if (!paused) time += dt;
    const step = paused ? 0 : dt;
    const previousPhase = progress.phase;
    const previousDistance = vehicle.movedDistance;
    const previousContacts = vehicle.contactPositions.map(point=>point.clone());
    const previousHeading = vehicle.heading;
    if (hasStarted && !paused) progress.update(dt);
    rejectTimer = Math.max(0, rejectTimer - step);

    if (driving() && !paused) {
      vehicle.update(dt, {
        forward: Number(keys.has('KeyW')) - Number(keys.has('KeyS')),
        turn: Number(keys.has('KeyA')) - Number(keys.has('KeyD')),
      }, world.obstacles, world.height);
      camera.yaw += (Number(keys.has('ArrowLeft')) - Number(keys.has('ArrowRight'))) * dt;
      camera.pitch = THREE.MathUtils.clamp(camera.pitch + (Number(keys.has('ArrowDown')) - Number(keys.has('ArrowUp'))) * dt * 0.6, 0.07, 0.85);
    }
    if (progress.phase === 'align' && !paused) {
      progress.adjust(
        (Number(keys.has('KeyD')) - Number(keys.has('KeyA'))) * dt * 0.18,
        (Number(keys.has('KeyW')) - Number(keys.has('KeyS'))) * dt * 0.18,
        (Number(keys.has('KeyE')) - Number(keys.has('KeyQ'))) * dt * 0.65,
      );
    }

    if (progress.phase === 'extract') vehicle.heading = serviceHeading + Math.PI / 2 * THREE.MathUtils.smoothstep(progress.elapsed, 1.7, 3.4);
    if (progress.phase === 'calibrate') vehicle.heading = serviceHeading + Math.PI / 2 * (1 - THREE.MathUtils.smoothstep(progress.elapsed, 0, 1.2));
    if (!driving() && !paused) vehicle.settle(dt,world.height);
    const actualSpeed = paused || !driving() ? 0 : (vehicle.movedDistance-previousDistance)/Math.max(dt,.001)*Math.sign(vehicle.speed);
    const headingTravel = Math.atan2(Math.sin(vehicle.heading-previousHeading),Math.cos(vehicle.heading-previousHeading));
    rover.root.position.copy(vehicle.position);
    rover.root.rotation.set(vehicle.pitch, vehicle.heading, vehicle.roll);
    rover.update(time,actualSpeed,progress.repaired);
    rover.setSuspension(vehicle.wheelOffsets,driving()?vehicle.steer*.38:0);
    for (let i=0;i<rover.wheels.length;i++) {
      if (!paused && (Math.abs(actualSpeed)>.02 || Math.abs(headingTravel)>.0001)) {
        const turn = driving() ? vehicle.steer*.38 : 0;
        const yaw = vehicle.heading + (i%3===0?turn:i%3===2?-turn*.35:0);
        const contactTravel = vehicle.contactPositions[i].clone().sub(previousContacts[i]);
        wheelAngles[i] -= (contactTravel.x*-Math.sin(yaw)+contactTravel.z*-Math.cos(yaw))/.266;
      }
      rover.wheels[i].rotation.x=wheelAngles[i];
    }
    if (!driving() && progress.phase !== 'ready') rover.head.rotation.set(0, 0, 0);
    rover.root.updateMatrixWorld(true);
    rover.socket.getWorldPosition(socketPosition);
    rover.socket.getWorldQuaternion(socketRotation);

    if (progress.phase === 'extract' && previousPhase !== 'extract') {
      donorModule.getWorldPosition(extractionStart);
      donorModule.getWorldQuaternion(extractionRotation);
      rover.arm.claw.getWorldPosition(approachStart);
      rover.module.visible = false;
    }
    const servicing = ['extract','align','insert'].includes(progress.phase);
    if (servicing) {
      let depth = 0.34;
      let x = progress.offset.x;
      let y = progress.offset.y;
      let angle = progress.offset.angle;
      if (progress.phase === 'insert') {
        const fraction = THREE.MathUtils.smoothstep(progress.elapsed, 0, 1.1);
        depth = THREE.MathUtils.lerp(0.34, 0.015, fraction);
        x *= 1 - fraction;
        y *= 1 - fraction;
        angle *= 1 - fraction;
      }
      localOffset.set(-x, y, -depth).applyQuaternion(socketRotation);
      const destination = socketPosition.clone().add(localOffset);
      if (progress.phase === 'extract') {
        const t = THREE.MathUtils.smoothstep(progress.elapsed, 0.9, 3.2);
        donorModule.visible=progress.elapsed<.85;
        rover.module.visible=progress.elapsed>=.85;
        rover.module.position.copy(extractionStart).lerp(destination, t);
        rover.module.position.y += Math.sin(t * Math.PI) * 0.18;
      } else {
        rover.module.position.copy(destination);
        if (rejectTimer > 1.3) rover.module.position.add(new THREE.Vector3(0,0,-Math.sin((1.6-rejectTimer)*Math.PI/0.3)*0.035).applyQuaternion(socketRotation));
      }
      lookRotation.setFromAxisAngle(new THREE.Vector3(0,0,1), angle);
      rover.module.quaternion.copy(socketRotation).multiply(lookRotation);
      if (progress.phase === 'extract') rover.module.quaternion.copy(extractionRotation).slerp(socketRotation.clone().multiply(lookRotation),THREE.MathUtils.smoothstep(progress.elapsed,.9,3.2));
      const gripPoint = new THREE.Vector3(0,-0.16,0.08).applyQuaternion(rover.module.quaternion).add(rover.module.position);
      if(progress.phase==='extract' && progress.elapsed<.85) gripPoint.copy(approachStart).lerp(new THREE.Vector3(0,-.16,.08).applyQuaternion(extractionRotation).add(extractionStart),THREE.MathUtils.smoothstep(progress.elapsed,0,.85));
      rover.setArmTarget(rover.root.worldToLocal(gripPoint));
      rover.arm.claw.quaternion.copy(rover.root.getWorldQuaternion(new THREE.Quaternion()).invert()).multiply(rover.module.quaternion);
    } else if (progress.repaired) {
      rover.module.visible = false;
      rover.setArmTarget(new THREE.Vector3(0.48, 0.7, -0.5));
    }

    world.tick(time, step);
    world.follow(vehicle.position);
    const effectSpeed = Math.abs(actualSpeed)>.08 ? actualSpeed : paused ? 0 : headingTravel/Math.max(dt,.001)*.35;
    wheelEffects.update(step,time,vehicle.contactPositions,effectSpeed,vehicle.heading,vehicle.grounded);
    const optical = opticalUntil > time && driving();
    camera.setMotion({speed:actualSpeed,acceleration:vehicle.acceleration,steer:vehicle.steer,impact:vehicle.impact});
    camera.update(paused ? 0 : dt, progress.phase, rover.root, rover.socket, world.donorPosition, world.relayPosition, optical, world.height);
    wheelEffects.setView(camera.camera.fov,innerHeight*renderer.getPixelRatio());
    const feed = optical || progress.phase === 'scan' || progress.phase === 'calibrate';
    film.uniforms.time.value = time;
    film.uniforms.degraded.value = feed && !progress.repaired ? 1 : progress.phase === 'calibrate' ? Math.max(0, 1-progress.elapsed/1.6) : 0;
    const target = progress.phase === 'drive' ? world.donorPosition : world.relayPosition;
    const distance = vehicle.position.distanceTo(target);
    if (hasStarted) ui.update(progress, distance, distance < (progress.phase === 'drive' ? 2.85 : 4), optical, rejectTimer);
    if (import.meta.env.DEV) {
      ui.canvas.dataset.phase = progress.phase;
      ui.canvas.dataset.position = `${vehicle.position.x.toFixed(2)},${vehicle.position.z.toFixed(2)}`;
      ui.canvas.dataset.heading = vehicle.heading.toFixed(3);
      ui.canvas.dataset.alignment = `${progress.offset.x.toFixed(3)},${progress.offset.y.toFixed(3)},${progress.offset.angle.toFixed(3)}`;
      ui.canvas.dataset.repaired = String(progress.repaired);
      ui.canvas.dataset.paused = String(paused);
      ui.canvas.dataset.keys = [...keys].join(',');
      ui.canvas.dataset.contacts = vehicle.grounded.map(grounded=>grounded?'1':'0').join('');
      ui.canvas.dataset.bodyPose = `${vehicle.pitch.toFixed(3)},${vehicle.roll.toFixed(3)}`;
      ui.canvas.dataset.frameMilliseconds = frameMilliseconds.toFixed(1);
    }
    composer.render();
    requestAnimationFrame(animate);
  }
  animate();
}

initialize().catch((error: unknown) => {
  console.error(error);
  ui.error('The scene could not load. Check that WebGL is available, then reload.');
});
