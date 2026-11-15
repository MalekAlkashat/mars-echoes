import { assertActive, type GameScene, type HubBookmark, type SceneContext, type SceneEntry, type OpportunityChapter } from '../../app/contracts';
import { ROVER_MEMORY } from '../../content/equipment';
import { SpiritController } from '../../entities/spirit/controller';
import { createSpiritAppearance, type SpiritAppearance } from '../../entities/spirit/appearance';
import { SpiritCamera } from '../../entities/spirit/camera';
import { element } from '../../ui';
import { createHubWorld } from './layout';
import {OpportunityEpilogue} from './epilogue';
import {ReturnShot} from './return-shot';

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
    let epilogue:OpportunityEpilogue|undefined,finaleObserved=false;
    const localEvents=new AbortController();
    const revisit=document.createElement('button');revisit.className='epilogue-revisit';revisit.textContent='Revisit ending';revisit.hidden=true;document.body.append(revisit);
    const restore = (bookmark?: HubBookmark) => {
      effects.speed = 0;
      controller.reset(bookmark?.position[0] ?? world.spawn.x, bookmark?.position[2] ?? world.spawn.z, world.height, bookmark?.heading ?? 0);
      follow.yaw = bookmark?.cameraYaw ?? 0;
      follow.pitch = bookmark?.cameraPitch ?? .12;
      follow.distance = bookmark?.cameraDistance ?? 5.8;
      rig.reset(controller);
      follow.reset();
      follow.camera.zoom=1;follow.camera.updateProjectionMatrix();
      follow.update(0, controller.position, world.height, world.obstacles);
      rig.update(0, controller, follow.camera, world.height, context.renderer.getPixelRatio(), innerHeight);
    };
    restore(entry.bookmark);
    let returnShot:ReturnShot|undefined;
    const choice=document.createElement('select');choice.id='memory-chapter';choice.setAttribute('aria-label','Choose Opportunity memory');
    choice.innerHTML='<option value="journey">Opportunity · Full memory journey</option><option value="blueberry-clue">2004 · The Blueberry Clue</option><option value="purgatory">2005 · Stuck in Purgatory</option><option value="long-night">2018 · The Long Night</option>';
    let choiceReady=false;
    const firstUnrecorded=():OpportunityChapter=>(['blueberry-clue','purgatory','long-night'] as const).find(id=>!context.session.chapters.has(id))??'blueberry-clue';
    choice.style.cssText='background:#202422;color:#fff;padding:10px;border:1px solid #d6ad78;max-width:100%;min-width:0;font:inherit';choice.hidden=true;const replay=document.createElement('details');replay.className='memory-replay';const summary=document.createElement('summary');summary.textContent='Choose a memory';replay.append(summary,choice);element('interaction').prepend(replay);
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
      if(epilogue)epilogue.show();
    };
    const beginEnding=()=>{
      if(epilogue||!context.session.chapters.has('long-night'))return;
      started=true;finaleObserved=true;revisit.hidden=true;choice.hidden=true;
      // Direct chapter previews have no entry bookmark. Reuse the unobstructed
      // southern approach rather than composing an ending at the hub spawn.
      if(controller.position.distanceTo(world.wreck.position)>ROVER_MEMORY.entryDistance){
        restore({position:[world.wreck.position.x,world.wreck.position.y,world.wreck.position.z+2.6],heading:0,cameraYaw:0,cameraPitch:.12,cameraDistance:5.8});
      }
      const bookmark:HubBookmark={position:controller.position.toArray() as [number,number,number],heading:controller.heading,cameraYaw:follow.yaw,cameraPitch:follow.pitch,cameraDistance:follow.distance};
      controller.reset(bookmark.position[0],bookmark.position[2],world.height,bookmark.heading);
      epilogue=new OpportunityEpilogue({context,world,controller,camera:follow.camera,bookmark,resetAppearance:()=>rig.reset(controller),exit:()=>{
        const saved=epilogue?.bookmark;epilogue?.dispose();epilogue=undefined;restore(saved);context.clearInput();show();
      }});
    };
    revisit.addEventListener('click',beginEnding,{signal:localEvents.signal});
    const scene: GameScene = {
      id: 'mars-hub', scene: world.scene, camera: follow.camera, effects,
      activate() { active = true; show(); },
      update(dt, input) {
        if (!active || disposed) return;
        if(!paused&&!finaleObserved&&context.session.finale?.status==='pending')beginEnding();
        revisit.hidden=Boolean(epilogue)||paused||!started||!context.session.chapters.has('long-night')||controller.position.distanceTo(world.wreck.position)>=ROVER_MEMORY.entryDistance;
        if(epilogue){
          const step=paused?0:dt;effects.time+=step;effects.speed=0;
          epilogue.update(step);world.tick(effects.time,step);world.follow(controller.position);
          rig.update(step,controller,follow.camera,world.height,context.renderer.getPixelRatio(),innerHeight);
          return;
        }
        if(!choiceReady){choice.value='journey';choiceReady=true;}
        if (!started && input.startPressed) { started = true; show(); }
        const step = paused ? 0 : dt;
        effects.time += step;
        if (started && !paused) {
          follow.orbit(input.dragX + input.lookX * dt * 200, input.dragY + input.lookY * dt * 200, input.zoom);
          controller.update(step, input, follow.yaw, world.obstacles, world.height);
          if (input.interactPressed && controller.position.distanceTo(world.wreck.position) < ROVER_MEMORY.entryDistance) {
            context.request({ kind: 'enter-memory', entry: {scene: ROVER_MEMORY.episodeId, wreckId: ROVER_MEMORY.wreckId, chapter:choice.value==='journey'?firstUnrecorded():choice.value==='long-night'?'long-night':choice.value==='purgatory'?'purgatory':'blueberry-clue',...(choice.value==='journey'?{journey:true as const}:{})},
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
        if(!paused&&distance<ROVER_MEMORY.entryDistance)context.session.encounterOpportunity();
        choice.hidden=distance>=ROVER_MEMORY.entryDistance||paused;replay.hidden=choice.hidden;if(replay.hidden)replay.open=false;
        element('interaction-text').textContent = distance < ROVER_MEMORY.entryDistance
          ? context.session.chapters.size>0 ? 'Memories recorded · Explore your Robot Journal.' : context.session.completed.has(ROVER_MEMORY.wreckId) ? 'Rover sequence visited.' : 'A rover lies silent.'
          : `Abandoned rover · ${Math.ceil(distance)} m`;
        element('interact-button').hidden = distance >= ROVER_MEMORY.entryDistance;
        element('interact-button').textContent = choice.value==='journey'?(context.session.journey?'Continue memory  E':context.session.opportunityComplete?'Replay full memory  E':'Enter memory  E'):'Replay chapter  E';
        element('touch-controls').hidden = false;
        element('touch-controls').style.visibility = 'visible';
      },
      journeyShot(direction,seconds,reduced,dt=0){
        if(direction!=='in'||!entry.memoryReturn)return;
        returnShot??=new ReturnShot(follow.camera,controller.position,world.wreck.position,world.height);
        returnShot.apply(seconds,reduced,innerWidth<=650);
        // Cosmetic life only: no controller, follow rig, mission or epilogue update.
        effects.time+=dt;world.follow(controller.position);
        rig.update(reduced?0:dt,controller,follow.camera,world.height,context.renderer.getPixelRatio(),innerHeight);
      },
      resize(width, height) { follow.camera.aspect = width / height; follow.camera.updateProjectionMatrix(); },
      getBookmark() {
        if(epilogue)return epilogue.bookmark;
        if (!started || !controller.grounded) return;
        return {position:controller.position.toArray() as [number,number,number],heading:controller.heading,
          cameraYaw:follow.yaw,cameraPitch:follow.pitch,cameraDistance:follow.distance};
      },
      isPresentationIdle(){return epilogue?.idle??false;},
      setPaused(value) { paused = value; choice.hidden=true;revisit.hidden=true;epilogue?.setPaused(value); },
      restart() { epilogue?.dispose();epilogue=undefined;finaleObserved=false;effects.time = 0; restore(); started = true; paused = false; context.clearInput(); show(); },
      dispose() { if (disposed) return; disposed = true; active = false;localEvents.abort();epilogue?.dispose();revisit.remove(); replay.remove(); rig.dispose(); world.dispose(); },
      debug() { return {phase: started ? 'hub' : 'ready', position: `${controller.position.x.toFixed(2)},${controller.position.z.toFixed(2)}`,
        heading: controller.heading.toFixed(3), grounded: controller.grounded, repaired: false,
        terrain:world.scene.userData.layout?.terrain??'reference100-v1', decorativeWrecks:0,
        terrainWidth:world.scene.userData.layout?.terrainWidth??100,terrainDepth:world.scene.userData.layout?.terrainDepth??100,
        speed:Math.hypot(controller.actualVelocity.x,controller.actualVelocity.z), cameraFov:follow.camera.fov,
        ...rig.debug(),...(epilogue?epilogue.debug():{epilogueBeat:'inactive'})}; },
    };
    return scene;
  } catch (error) {
    spirit?.dispose();
    world.dispose();
    throw error;
  }
}
