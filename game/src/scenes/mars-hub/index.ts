import { assertActive, type GameScene, type HubBookmark, type SceneContext, type SceneEntry } from '../../app/contracts';
import { ROVER_MEMORY } from '../../content/equipment';
import { SpiritController } from '../../entities/spirit/controller';
import { createSpiritAppearance } from '../../entities/spirit/appearance';
import { SpiritCamera } from '../../entities/spirit/camera';
import { element } from '../../ui';
import { createHubWorld } from './layout';
import { HUB_TERRAIN } from '../../environments/mars/hub-terrain';

export async function createMarsHub(context: SceneContext, entry: Extract<SceneEntry, {scene: 'mars-hub'}>, signal: AbortSignal): Promise<GameScene> {
  const assets = await context.assets.load();
  assertActive(signal);
  const world = createHubWorld(assets);
  try {
    await world.ready;
    assertActive(signal);
    world.setupEnvironment(context.renderer);
    const controller = new SpiritController();
    const rig = createSpiritAppearance();
    world.scene.add(rig);
    const follow = new SpiritCamera();
    let started = Boolean(entry.bookmark), active = false, paused = false, disposed = false;
    const effects = { time: 0, degraded: 0 };
    const restore = (bookmark?: HubBookmark) => {
      controller.reset(bookmark?.position[0] ?? 0, bookmark?.position[2] ?? 8, world.height, bookmark?.heading ?? 0);
      if (bookmark) controller.position.y = bookmark.position[1];
      follow.yaw = bookmark?.cameraYaw ?? 0;
      follow.pitch = bookmark?.cameraPitch ?? .12;
      follow.distance = bookmark?.cameraDistance ?? 5.8;
      follow.setFirstPerson(bookmark?.firstPerson??false);
      follow.reset();
      rig.visible=!follow.firstPerson;
      rig.position.copy(controller.position);
      rig.rotation.y = controller.heading;
      follow.update(0, controller.position, world.height, world.obstacles);
    };
    restore(entry.bookmark);
    const show = () => {
      context.ui.resetView();
      context.ui.setScene('mars-hub');
      if (started) context.ui.playing();
      else context.ui.showIntro({
        eyebrow: 'Exploration · integration prototype', title: 'Explore Mars',
        copy: 'Cross the valley. Find the rover and enter its memory.', button: 'Explore the valley',
        controls: 'WASD to glide · Space to leap · E to enter',
        note: 'Placeholder spirit. The complete rover mission is still in development.',
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
        if (!started && input.startPressed) { started = true; show(); }
        const step = paused ? 0 : dt;
        effects.time += step;
        if (started && !paused) {
          if(input.opticalPressed)follow.setFirstPerson(!follow.firstPerson);
          follow.orbit(input.dragX + input.lookX * dt * 200, input.dragY + input.lookY * dt * 200, input.zoom);
          controller.update(step, input, follow.yaw, world.obstacles, world.height);
          if (input.interactPressed && controller.position.distanceTo(world.wreck.position) < ROVER_MEMORY.entryDistance) {
            context.request({ kind: 'enter-memory', entry: {scene: ROVER_MEMORY.episodeId, wreckId: ROVER_MEMORY.wreckId},
              bookmark: {position: controller.position.toArray() as [number, number, number], heading: controller.heading,
                cameraYaw: follow.yaw, cameraPitch: follow.pitch, cameraDistance: follow.distance,firstPerson:follow.firstPerson} });
          }
        }
        rig.position.copy(controller.position);
        rig.rotation.y = controller.heading;
        rig.visible=!follow.firstPerson;
        world.tick(effects.time, step);
        world.follow(controller.position);
        follow.update(step, controller.position, world.height, world.obstacles);
        if (!started) return;
        const distance = controller.position.distanceTo(world.wreck.position);
        element('interaction-text').textContent = distance < ROVER_MEMORY.entryDistance
          ? context.session.completed.has(ROVER_MEMORY.wreckId) ? 'Rover sequence visited.' : 'A rover lies silent.'
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
          cameraYaw:follow.yaw,cameraPitch:follow.pitch,cameraDistance:follow.distance,firstPerson:follow.firstPerson};
      },
      getMapSnapshot(){
        if(!started)return;
        return {terrainId:'meridiani-near-hills-v1',title:'Meridiani valley',bounds:{minX:-HUB_TERRAIN.halfSize,maxX:HUB_TERRAIN.halfSize,minZ:-HUB_TERRAIN.halfSize,maxZ:HUB_TERRAIN.halfSize},playableRadius:HUB_TERRAIN.playableRadius,
          heightAt:world.height,player:{position:[controller.position.x,controller.position.z] as const,heading:controller.heading},
          objective:{position:[world.wreck.position.x,world.wreck.position.z] as const,label:'Opportunity · Enter memory'}};
      },
      setPaused(value) { paused = value; },
      restart() { effects.time = 0; restore(); started = true; paused = false; context.clearInput(); show(); },
      dispose() { if (disposed) return; disposed = true; active = false; world.dispose(); },
      debug() { return {phase: started ? 'hub' : 'ready', position: `${controller.position.x.toFixed(2)},${controller.position.z.toFixed(2)}`,
        heading: controller.heading.toFixed(3), grounded: controller.grounded, repaired: false,
        speed:Math.hypot(controller.velocity.x,controller.velocity.z).toFixed(2),
        view:follow.firstPerson?'first-person':'third-person',avatarVisible:rig.visible,cameraFov:follow.camera.fov,
        terrain:'hub-troughs-v1', decorativeWrecks:0, vistaRadius:1000,
        rockSource:world.scene.userData.suppliedRocks?.source??'legacy',rockScatter:world.scene.userData.suppliedRocks?.scatter??0,
        gravel:world.scene.userData.suppliedRocks?.gravel.count??0,boulders:world.scene.userData.suppliedRocks?.sizes.boulders??0}; },
    };
    return scene;
  } catch (error) {
    world.dispose();
    throw error;
  }
}
