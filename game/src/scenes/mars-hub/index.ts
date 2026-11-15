import { assertActive, type GameScene, type HubBookmark, type SceneContext, type SceneEntry } from '../../app/contracts';
import { ROVER_MEMORY } from '../../content/equipment';
import { SpiritController } from '../../entities/spirit/controller';
import { createSpiritAppearance, type SpiritAppearance } from '../../entities/spirit/appearance';
import { SpiritCamera } from '../../entities/spirit/camera';
import { element } from '../../ui';
import { createHubWorld } from './layout';

export async function createMarsHub(context: SceneContext, entry: Extract<SceneEntry, {scene: 'mars-hub'}>, signal: AbortSignal): Promise<GameScene> {
  const assets = await context.assets.load();
  assertActive(signal);
  const world = createHubWorld(assets);
  let spirit: SpiritAppearance | undefined;
  try {
    await world.ready;
    assertActive(signal);
    world.setupEnvironment(context.renderer);
    const controller = new SpiritController(world.bounds);
    const rig = spirit = createSpiritAppearance();
    world.scene.add(rig.root);
    const follow = new SpiritCamera();
    let started = Boolean(entry.bookmark), active = false, paused = false, disposed = false;
    const effects = { time: 0, degraded: 0, speed: 0 };
    const restore = (bookmark?: HubBookmark) => {
      effects.speed = 0;
      controller.reset(bookmark?.position[0] ?? world.spawn.x, bookmark?.position[2] ?? world.spawn.z, world.height, bookmark?.heading ?? 0);
      follow.yaw = bookmark?.cameraYaw ?? 0;
      follow.pitch = bookmark?.cameraPitch ?? .12;
      follow.distance = bookmark?.cameraDistance ?? 5.8;
      rig.reset(controller);
      follow.reset();
      follow.update(0, controller.position, world.height, world.obstacles);
      rig.update(0, controller, follow.camera, world.height, context.renderer.getPixelRatio(), innerHeight);
    };
    restore(entry.bookmark);
    const choice=document.createElement('select');choice.id='memory-chapter';choice.setAttribute('aria-label','Choose Opportunity memory');
    choice.innerHTML='<option value="blueberry-clue">2004 · The Blueberry Clue</option><option value="purgatory">2005 · Stuck in Purgatory</option><option value="long-night">2018 · The Long Night</option>';
    let choiceReady=false;
    choice.style.cssText='background:#202422;color:#fff;padding:10px;border:1px solid #d6ad78;max-width:100%;min-width:0;font:inherit';choice.hidden=true;element('interaction').prepend(choice);
    const show = () => {
      context.ui.resetView();
      context.ui.setScene('mars-hub');
      if (started) context.ui.playing();
      else context.ui.showIntro({
        eyebrow: 'Exploration · integration prototype', title: 'Explore Mars',
        copy: 'Cross the valley. Find the rover and enter its memory.', button: 'Explore the valley',
        controls: 'WASD to glide · Shift to rush · Space to leap · E to enter',
        note: 'Follow the valley. Discover the memories left behind.',
      });
      element('chapter').textContent = 'Mars';
      element('objective').textContent = 'Approach the abandoned rover.';
      element('controls').hidden = true;
      element('hub-controls').hidden = !started;
    };
    const scene: GameScene = {
      id: 'mars-hub', scene: world.scene, camera: follow.camera, effects,
      activate() { active = true; show(); },
      update(dt, input) {
        if (!active || disposed) return;
        if(!choiceReady){choice.value=!context.session.chapters.has('blueberry-clue')?'blueberry-clue':!context.session.chapters.has('purgatory')?'purgatory':'long-night';choiceReady=true;}
        if (!started && input.startPressed) { started = true; show(); }
        const step = paused ? 0 : dt;
        effects.time += step;
        if (started && !paused) {
          follow.orbit(input.dragX + input.lookX * dt * 200, input.dragY + input.lookY * dt * 200, input.zoom);
          controller.update(step, input, follow.yaw, world.obstacles, world.height);
          if (input.interactPressed && controller.position.distanceTo(world.wreck.position) < ROVER_MEMORY.entryDistance) {
            context.request({ kind: 'enter-memory', entry: {scene: ROVER_MEMORY.episodeId, wreckId: ROVER_MEMORY.wreckId, chapter:choice.value==='long-night'?'long-night':choice.value==='purgatory'?'purgatory':'blueberry-clue'},
              bookmark: {position: controller.position.toArray() as [number, number, number], heading: controller.heading,
                cameraYaw: follow.yaw, cameraPitch: follow.pitch, cameraDistance: follow.distance} });
          }
        }
        const speedTarget = Math.max(0, Math.min(1, (Math.hypot(controller.actualVelocity.x, controller.actualVelocity.z) - 1.8) / 5.7));
        effects.speed += (speedTarget - effects.speed) * (1 - Math.exp(-step * 9));
        world.tick(effects.time, step);
        world.follow(controller.position);
        follow.update(step, controller.position, world.height, world.obstacles,
          Math.hypot(controller.actualVelocity.x, controller.actualVelocity.z));
        follow.camera.updateMatrixWorld();
        rig.update(step, controller, follow.camera, world.height, context.renderer.getPixelRatio(), innerHeight);
        if (!started) return;
        const distance = controller.position.distanceTo(world.wreck.position);
        choice.hidden=distance>=ROVER_MEMORY.entryDistance||paused;
        element('interaction-text').textContent = distance < ROVER_MEMORY.entryDistance
          ? context.session.skills.has('sunlight') ? 'SUNLIGHT remembered · Opportunity remains silent.' : context.session.chapters.has('purgatory') ? 'SAND remembered · Opportunity escaped Purgatory.' : context.session.chapters.has('blueberry-clue') ? 'Blueberry Clue remembered · GRIND unlocked.' : context.session.completed.has(ROVER_MEMORY.wreckId) ? 'Rover sequence visited.' : 'A rover lies silent.'
          : `Abandoned rover · ${Math.ceil(distance)} m`;
        element('interact-button').hidden = distance >= ROVER_MEMORY.entryDistance;
        element('interact-button').textContent = 'Enter memory  E';
        element('touch-controls').hidden = false;
        element('touch-controls').style.visibility = 'visible';
      },
      resize(width, height) { follow.camera.aspect = width / height; follow.camera.updateProjectionMatrix(); },
      getBookmark() {
        if (!started || !controller.grounded) return;
        return {position:controller.position.toArray() as [number,number,number],heading:controller.heading,
          cameraYaw:follow.yaw,cameraPitch:follow.pitch,cameraDistance:follow.distance};
      },
      setPaused(value) { paused = value; choice.hidden=true; },
      restart() { effects.time = 0; restore(); started = true; paused = false; context.clearInput(); show(); },
      dispose() { if (disposed) return; disposed = true; active = false; choice.remove(); rig.dispose(); world.dispose(); },
      debug() { return {phase: started ? 'hub' : 'ready', position: `${controller.position.x.toFixed(2)},${controller.position.z.toFixed(2)}`,
        heading: controller.heading.toFixed(3), grounded: controller.grounded, repaired: false,
        terrain:world.scene.userData.layout?.terrain??'reference100-v1', decorativeWrecks:0,
        terrainWidth:world.scene.userData.layout?.terrainWidth??100,terrainDepth:world.scene.userData.layout?.terrainDepth??100,
        speed:Math.hypot(controller.actualVelocity.x,controller.actualVelocity.z), cameraFov:follow.camera.fov,
        ...rig.debug()}; },
    };
    return scene;
  } catch (error) {
    spirit?.dispose();
    world.dispose();
    throw error;
  }
}
