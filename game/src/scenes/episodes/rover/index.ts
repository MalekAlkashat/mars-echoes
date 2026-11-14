import * as THREE from 'three';
import type { EpisodeEntry, GameScene, InputFrame, SceneContext } from '../../../app/contracts';
import { CameraRig } from '../../../entities/rover/camera';
import { createRover } from '../../../entities/rover/model';
import { Vehicle } from '../../../entities/rover/controller';
import { WheelEffects } from '../../../entities/rover/wheel-effects';
import { createRoverWorld } from './layout';
import { Progress } from './mission';
import { RoverHUD } from './hud';

export async function createRoverEpisode(
  context: SceneContext, entry: EpisodeEntry, signal: AbortSignal,
): Promise<GameScene> {
  if(entry.chapter==='blueberry-clue'||entry.resume?.kind==='blueberry-clue'){
    const {createBlueberryClue}=await import('./missions/blueberry-clue');
    return createBlueberryClue(context,entry,signal);
  }
  if (entry.resume?.kind === 'opportunity' || (!entry.resume && new URLSearchParams(location.search).get('prototype') !== 'repair')) {
    const {createOpportunityDrive} = await import('./opportunity-drive');
    return createOpportunityDrive(context,entry,signal);
  }
  const assets = await context.assets.load();
  signal.throwIfAborted();
  const world = createRoverWorld(assets, () => createRover(assets.rover, true).root);
  try {
    const rover = createRover(assets.rover);
    rover.root.rotation.order = 'YXZ';
    world.scene.add(rover.root, rover.module);
    const progress = new Progress();
    const hud = new RoverHUD(context.ui);
    const vehicle = new Vehicle();
    const camera = new CameraRig();
    camera.setObstacles(world.obstacles);
    const wheelEffects = new WheelEffects(world.scene, world.height);
    const keyMaterial = new THREE.MeshStandardMaterial({ color: 0xf3eee4, roughness: 0.6, metalness: 0.05 });
    const socketKey = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.025, 0.025), keyMaterial);
    socketKey.position.set(0, 0.19, -0.05);
    rover.socket.add(socketKey);
    const cartridgeKey = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.022, 0.025), keyMaterial);
    cartridgeKey.position.set(0, 0.183, -0.065);
    rover.module.add(cartridgeKey);
    const donorSocket = world.donor.getObjectByName('optical-socket');
    const donorModule = rover.module.clone(true);
    donorModule.visible = true;
    if (donorSocket) donorSocket.add(donorModule);
    else world.donor.add(donorModule);
    donorModule.position.set(0, 0, -0.02);

    const extractionStart = new THREE.Vector3();
    const extractionRotation = new THREE.Quaternion();
    const approachStart = new THREE.Vector3();
    const socketPosition = new THREE.Vector3();
    const socketRotation = new THREE.Quaternion();
    const localOffset = new THREE.Vector3();
    const lookRotation = new THREE.Quaternion();
    const wheelAngles = Array<number>(6).fill(0);
    const effects = { time: 0, degraded: 0 };
    let serviceHeading = 0;
    let opticalUntil = 0;
    let rejectTimer = 0;
    let hasStarted = false;
    let active = false;
    let paused = false;
    let disposed = false;
    let returning = false;
    let time = 0;
    const driving = () => progress.phase === 'drive' || progress.phase === 'relay';

    await world.ready;
    signal.throwIfAborted();
    world.setupEnvironment(context.renderer);

    function present(): void {
      if (!active || disposed) return;
      if (!hasStarted) return;
      const target = progress.phase === 'drive' ? world.donorPosition : world.relayPosition;
      const distance = vehicle.position.distanceTo(target);
      hud.update(progress, distance, distance < (progress.phase === 'drive' ? 2.85 : 4),
        opticalUntil > time && driving(), rejectTimer);
    }

    function reset(): void {
      progress.reset();
      vehicle.reset(world.spawn.x, world.spawn.z, 0);
      vehicle.settle(1, world.height);
      rover.root.position.copy(vehicle.position);
      rover.root.rotation.set(0, 0, 0);
      camera.reset();
      if (active) context.clearInput();
      paused = false;
      returning = false;
      opticalUntil = 0;
      rejectTimer = 0;
      time = 0;
      effects.time = 0;
      effects.degraded = 0;
      rover.module.visible = false;
      donorModule.visible = true;
      for (const wheel of rover.wheels) wheel.rotation.x = 0;
      wheelAngles.fill(0);
      wheelEffects.reset();
      rover.setArmTarget(new THREE.Vector3(0.48, 0.7, -0.5));
      if (hasStarted) {
        progress.enter('drive');
        if (active) context.ui.playing();
      }
      rover.root.updateMatrixWorld(true);
      camera.update(0, progress.phase, rover.root, rover.socket,
        world.donorPosition, world.relayPosition, false, world.height);
      present();
    }

    function interact(): void {
      if (paused || !hasStarted) return;
      if (progress.phase === 'drive' && vehicle.position.distanceTo(world.donorPosition) < 2.85) {
        vehicle.speed = 0;
        const delta = world.donorPosition.clone().sub(vehicle.position);
        vehicle.heading = Math.atan2(-delta.x, -delta.z);
        serviceHeading = vehicle.heading;
        progress.enter('scan');
        opticalUntil = 0;
        context.clearInput();
        context.ui.canvas.focus();
      } else if (progress.phase === 'relay' && vehicle.position.distanceTo(world.relayPosition) < 4) {
        vehicle.speed = 0;
        progress.enter('transmit');
        opticalUntil = 0;
        context.clearInput();
      }
    }

    function update(dt: number, input: Readonly<InputFrame>): void {
      if (disposed || !active) return;
      if (input.returnPressed && !returning) {
        returning = true;
        context.request({ kind: 'return-to-hub', result: {
          episodeId: 'episode-rover-01', wreckId: entry.wreckId,
          outcome: progress.phase === 'end' ? 'completed' : 'aborted',
        } });
        return;
      }
      if (paused) return;
      if (input.startPressed && !hasStarted) {
        hasStarted = true;
        reset();
      }
      if (input.replayPressed) reset();
      if (input.interactPressed) interact();
      if (input.confirmPressed && progress.phase === 'align') {
        if (!progress.attemptInsertion()) rejectTimer = 1.6;
        context.ui.canvas.focus();
      }
      if (input.opticalPressed && driving()) opticalUntil = opticalUntil > time ? 0 : time + 3;
      if (driving() || progress.phase === 'ready') camera.orbit(input.dragX, input.dragY, input.zoom);
      if (progress.phase === 'align') progress.adjust(input.dragX * 0.001, -input.dragY * 0.001, 0);

      const step = Math.max(0, Math.min(dt, 0.05));
      time += step;
      const previousPhase = progress.phase;
      const previousDistance = vehicle.movedDistance;
      const previousContacts = vehicle.contactPositions.map(point => point.clone());
      const previousHeading = vehicle.heading;
      if (hasStarted) progress.update(step);
      rejectTimer = Math.max(0, rejectTimer - step);
      if (driving()) {
        vehicle.update(step, { forward: input.moveY, turn: -input.moveX }, world.obstacles, world.height);
        camera.yaw -= input.lookX * step;
        camera.pitch = THREE.MathUtils.clamp(camera.pitch + input.lookY * step * 0.6, 0.07, 0.85);
      }
      if (progress.phase === 'align') {
        progress.adjust(input.moveX * step * 0.18, input.moveY * step * 0.18, input.rotate * step * 0.65);
      }
      if (progress.phase === 'extract') {
        vehicle.heading = serviceHeading + Math.PI / 2 * THREE.MathUtils.smoothstep(progress.elapsed, 1.7, 3.4);
      }
      if (progress.phase === 'calibrate') {
        vehicle.heading = serviceHeading + Math.PI / 2 * (1 - THREE.MathUtils.smoothstep(progress.elapsed, 0, 1.2));
      }
      if (!driving()) vehicle.settle(step, world.height);
      const actualSpeed = !driving() ? 0
        : (vehicle.movedDistance - previousDistance) / Math.max(step, 0.001) * Math.sign(vehicle.speed);
      const headingTravel = Math.atan2(Math.sin(vehicle.heading - previousHeading), Math.cos(vehicle.heading - previousHeading));
      rover.root.position.copy(vehicle.position);
      rover.root.rotation.set(vehicle.pitch, vehicle.heading, vehicle.roll);
      rover.update(time, actualSpeed, progress.repaired);
      rover.setSuspension(vehicle.wheelOffsets, driving() ? vehicle.steer * 0.38 : 0);
      for (let i = 0; i < rover.wheels.length; i++) {
        if (Math.abs(actualSpeed) > 0.02 || Math.abs(headingTravel) > 0.0001) {
          const turn = driving() ? vehicle.steer * 0.38 : 0;
          const yaw = vehicle.heading + (i % 3 === 0 ? turn : i % 3 === 2 ? -turn * 0.35 : 0);
          const contactTravel = vehicle.contactPositions[i].clone().sub(previousContacts[i]);
          wheelAngles[i] -= (contactTravel.x * -Math.sin(yaw) + contactTravel.z * -Math.cos(yaw)) / 0.266;
        }
        rover.wheels[i].rotation.x = wheelAngles[i];
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
      updateServicePose();
      world.tick(time, step);
      world.follow(vehicle.position);
      const effectSpeed = Math.abs(actualSpeed) > 0.08 ? actualSpeed : headingTravel / Math.max(step, 0.001) * 0.35;
      wheelEffects.update(step, time, vehicle.contactPositions, effectSpeed, vehicle.heading, vehicle.grounded);
      const optical = opticalUntil > time && driving();
      camera.setMotion({ speed: actualSpeed, acceleration: vehicle.acceleration, steer: vehicle.steer, impact: vehicle.impact });
      camera.update(step, progress.phase, rover.root, rover.socket, world.donorPosition, world.relayPosition, optical, world.height);
      wheelEffects.setView(camera.camera.fov, innerHeight * context.renderer.getPixelRatio());
      const feed = optical || progress.phase === 'scan' || progress.phase === 'calibrate';
      effects.time = time;
      effects.degraded = feed && !progress.repaired ? 1
        : progress.phase === 'calibrate' ? Math.max(0, 1 - progress.elapsed / 1.6) : 0;
      present();
    }

    function updateServicePose(): void {
      if (['extract', 'align', 'insert'].includes(progress.phase)) {
        let depth = 0.34;
        let { x, y, angle } = progress.offset;
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
          donorModule.visible = progress.elapsed < 0.85;
          rover.module.visible = progress.elapsed >= 0.85;
          rover.module.position.copy(extractionStart).lerp(destination, t);
          rover.module.position.y += Math.sin(t * Math.PI) * 0.18;
        } else {
          rover.module.position.copy(destination);
          if (rejectTimer > 1.3) {
            rover.module.position.add(new THREE.Vector3(0, 0,
              -Math.sin((1.6 - rejectTimer) * Math.PI / 0.3) * 0.035).applyQuaternion(socketRotation));
          }
        }
        lookRotation.setFromAxisAngle(new THREE.Vector3(0, 0, 1), angle);
        rover.module.quaternion.copy(socketRotation).multiply(lookRotation);
        if (progress.phase === 'extract') {
          rover.module.quaternion.copy(extractionRotation).slerp(socketRotation.clone().multiply(lookRotation),
            THREE.MathUtils.smoothstep(progress.elapsed, 0.9, 3.2));
        }
        const gripPoint = new THREE.Vector3(0, -0.16, 0.08).applyQuaternion(rover.module.quaternion).add(rover.module.position);
        if (progress.phase === 'extract' && progress.elapsed < 0.85) {
          gripPoint.copy(approachStart).lerp(new THREE.Vector3(0, -0.16, 0.08)
            .applyQuaternion(extractionRotation).add(extractionStart), THREE.MathUtils.smoothstep(progress.elapsed, 0, 0.85));
        }
        rover.setArmTarget(rover.root.worldToLocal(gripPoint));
        rover.arm.claw.quaternion.copy(rover.root.getWorldQuaternion(new THREE.Quaternion()).invert()).multiply(rover.module.quaternion);
      } else if (progress.repaired) {
        rover.module.visible = false;
        rover.setArmTarget(new THREE.Vector3(0.48, 0.7, -0.5));
      }
    }

    reset();
    if(entry.resume?.kind==='repair'){
      const saved=entry.resume;
      hasStarted=saved.started;
      vehicle.reset(saved.position[0],saved.position[1],saved.heading);vehicle.settle(.25,world.height);
      progress.phase=saved.phase;progress.elapsed=saved.elapsed;progress.offset={...saved.offset};
      progress.failedAttempts=saved.failedAttempts;progress.repaired=saved.repaired;
      serviceHeading=saved.serviceHeading;time=saved.time;effects.time=time;opticalUntil=time+saved.opticalRemaining;
      camera.reset();camera.yaw=saved.cameraYaw;camera.pitch=saved.cameraPitch;camera.distance=saved.cameraDistance;
      rover.root.position.copy(vehicle.position);rover.root.rotation.set(vehicle.pitch,vehicle.heading,vehicle.roll);
      rover.update(time,0,progress.repaired);rover.root.updateMatrixWorld(true);
      rover.socket.getWorldPosition(socketPosition);rover.socket.getWorldQuaternion(socketRotation);
      donorModule.getWorldPosition(extractionStart);donorModule.getWorldQuaternion(extractionRotation);
      rover.arm.claw.getWorldPosition(approachStart);
      donorModule.visible=['ready','drive','scan'].includes(progress.phase);
      rover.module.visible=['extract','align','insert'].includes(progress.phase);
      updateServicePose();world.tick(time,0);world.follow(vehicle.position);
      camera.update(0,progress.phase,rover.root,rover.socket,world.donorPosition,world.relayPosition,opticalUntil>time,world.height);
    }
    return {
      id: 'episode-rover-01', scene: world.scene, camera: camera.camera, effects,
      activate() {
        active = true;
        if (hasStarted) { context.ui.playing(); present(); }
        else hud.prepare();
      },
      update,
      resize(width, height) {
        camera.camera.aspect = width / height;
        camera.camera.updateProjectionMatrix();
      },
      setPaused(value) { paused = value; returning = false; },
      getSaveEntry(){return {scene:'episode-rover-01',wreckId:entry.wreckId,resume:{kind:'repair',started:hasStarted,
        position:[vehicle.position.x,vehicle.position.z],heading:vehicle.heading,cameraYaw:camera.yaw,cameraPitch:camera.pitch,
        cameraDistance:camera.distance,time,phase:progress.phase,elapsed:progress.elapsed,offset:{...progress.offset},
        failedAttempts:progress.failedAttempts,repaired:progress.repaired,serviceHeading,opticalRemaining:Math.max(0,opticalUntil-time)}};},
      restart: reset,
      dispose() {
        if (disposed) return;
        disposed = true;
        active = false;
        world.dispose();
      },
      debug() {
        return {
          phase: progress.phase, position: `${vehicle.position.x.toFixed(2)},${vehicle.position.z.toFixed(2)}`,
          heading: vehicle.heading.toFixed(3),
          alignment: `${progress.offset.x.toFixed(3)},${progress.offset.y.toFixed(3)},${progress.offset.angle.toFixed(3)}`,
          repaired: progress.repaired, paused,
          contacts: vehicle.grounded.map(grounded => grounded ? '1' : '0').join(''),
          bodyPose: `${vehicle.pitch.toFixed(3)},${vehicle.roll.toFixed(3)}`,
        };
      },
    };
  } catch (error) {
    world.dispose();
    throw error;
  }
}
