import { Vector3 } from 'three';
import type { EpisodeEntry, GameScene, SceneContext } from '../../../app/contracts';
import { createHubEnvironment } from '../../../environments/mars/hub';
import { createOpportunityRover } from '../../../entities/rover/opportunity';
import { Vehicle } from '../../../entities/rover/controller';
import { CameraRig } from '../../../entities/rover/camera';
import { WheelEffects } from '../../../entities/rover/wheel-effects';
import { element } from '../../../ui';

/** Actual Opportunity driving systems; historical chapter logic is added separately. */
export async function createOpportunityDrive(context: SceneContext, entry: EpisodeEntry, signal: AbortSignal): Promise<GameScene> {
  const assets = await context.assets.load();
  signal.throwIfAborted();
  const world = createHubEnvironment();
  try {
    const rover = createOpportunityRover(assets.opportunity);
    world.scene.add(rover.root);
    const vehicle = new Vehicle(rover.contactConfig);
    const camera = new CameraRig(rover.opticalAnchor);
    camera.setObstacles(world.obstacles);
    const dust = new WheelEffects(world.scene,world.height,.14);
    const previousContacts = Array.from({length:6},() => new Vector3());
    const effects = {time:0,degraded:0};
    let active = false, started = false, paused = false, disposed = false, optical = false, returning = false;
    await world.ready;
    signal.throwIfAborted();
    world.setupEnvironment(context.renderer);
    const show = () => {
      context.ui.resetView();
      if (started) context.ui.playing();
      else context.ui.showIntro({
        eyebrow:'Opportunity · movement preview',title:'Opportunity',
        copy:'Take the rover across the Martian terrain.',button:'Drive Opportunity',
        controls:'WASD to drive · drag or arrows to look · F for optical view',
        note:'Supplied NASA model. Historical mission chapters are still in development.',
      });
      element('chapter').textContent='Opportunity';
      element('objective').textContent='Explore the basin.';
      element('interaction').hidden=true;
      element('touch-controls').hidden=!started;
      element('touch-controls').style.visibility=started?'visible':'hidden';
      element('touch-rotate').hidden=true;
    };
    const pose = () => {
      rover.root.position.copy(vehicle.position);
      rover.root.rotation.set(vehicle.pitch,vehicle.heading,vehicle.roll);
      rover.setSuspension(vehicle.wheelOffsets,vehicle.steer*.38);
      rover.root.updateMatrixWorld(true);
    };
    const reset = () => {
      vehicle.reset(world.spawn.x,world.spawn.z,0);
      vehicle.settle(.25,world.height);
      rover.reset(); dust.reset(); camera.reset();
      effects.time=0; optical=false; returning=false; paused=false;
      pose();
      camera.update(0,started?'drive':'ready',rover.root,rover.opticalAnchor,world.spawn,world.spawn,false,world.height);
      if(active){context.clearInput();show();}
    };
    reset();
    if(entry.resume?.kind==='opportunity'){
      const saved=entry.resume;
      started=saved.started;
      vehicle.reset(saved.position[0],saved.position[1],saved.heading);
      vehicle.settle(.25,world.height);
      camera.reset();camera.yaw=saved.cameraYaw;camera.pitch=saved.cameraPitch;camera.distance=saved.cameraDistance;
      optical=saved.optical;effects.time=saved.time;
      pose();world.tick(effects.time,0);world.follow(vehicle.position);
      camera.update(0,started?'drive':'ready',rover.root,rover.opticalAnchor,world.spawn,world.spawn,optical,world.height);
    }
    return {
      id:'episode-rover-01',scene:world.scene,camera:camera.camera,effects,
      activate(){active=true;show();},
      update(dt,input){
        if(!active||paused||disposed)return;
        if(input.returnPressed&&!returning){returning=true;context.request({kind:'return-to-hub',result:{episodeId:'episode-rover-01',wreckId:entry.wreckId,outcome:'aborted'}});return;}
        if(input.startPressed&&!started){started=true;reset();}
        if(input.replayPressed)reset();
        if(input.opticalPressed&&started)optical=!optical;
        camera.orbit(input.dragX,input.dragY,input.zoom);
        const step=Math.min(Math.max(dt,0),.05);
        const previousDistance=vehicle.movedDistance,previousHeading=vehicle.heading;
        previousContacts.forEach((point,i)=>point.copy(vehicle.contactPositions[i]));
        effects.time+=step;
        if(started){
          vehicle.update(step,{forward:input.moveY,turn:-input.moveX},world.obstacles,world.height);
          camera.yaw-=input.lookX*step;
          camera.pitch=Math.max(.07,Math.min(.85,camera.pitch+input.lookY*step*.6));
        }else vehicle.settle(step,world.height);
        pose();
        const headingTravel=Math.atan2(Math.sin(vehicle.heading-previousHeading),Math.cos(vehicle.heading-previousHeading));
        const travel=vehicle.movedDistance-previousDistance;
        rover.roll(previousContacts,vehicle.contactPositions,vehicle.heading,travel>.00001||Math.abs(headingTravel)>.00001);
        const speed=travel/Math.max(step,.001)*Math.sign(vehicle.speed);
        const effectSpeed=Math.abs(speed)>.08?speed:headingTravel/Math.max(step,.001)*.35;
        dust.update(step,effects.time,vehicle.contactPositions,started?effectSpeed:0,vehicle.heading,vehicle.grounded);
        world.tick(effects.time,step);world.follow(vehicle.position);
        camera.setMotion({speed,acceleration:vehicle.acceleration,steer:vehicle.steer,impact:vehicle.impact});
        camera.update(step,started?'drive':'ready',rover.root,rover.opticalAnchor,world.spawn,world.spawn,optical,world.height);
        dust.setView(camera.camera.fov,innerHeight*context.renderer.getPixelRatio());
        element('feed').hidden=!optical;
        element('feed-label').textContent='Opportunity · optical view';
      },
      resize(width,height){camera.camera.aspect=width/height;camera.camera.updateProjectionMatrix();},
      setPaused(value){paused=value;returning=false;},
      getSaveEntry(){return {scene:'episode-rover-01',wreckId:entry.wreckId,resume:{kind:'opportunity',started,
        position:[vehicle.position.x,vehicle.position.z],heading:vehicle.heading,cameraYaw:camera.yaw,
        cameraPitch:camera.pitch,cameraDistance:camera.distance,time:effects.time,optical}};},
      restart(){started=true;reset();},
      dispose(){if(disposed)return;disposed=true;active=false;world.dispose();},
      debug(){return {phase:started?'drive':'ready',model:'opportunity-v1',position:`${vehicle.position.x.toFixed(2)},${vehicle.position.z.toFixed(2)}`,
        contacts:vehicle.grounded.map(value=>value?'1':'0').join(''),wheelAngles:rover.wheels.map(w=>w.rotation.x.toFixed(3)).join(','),
        wheelOffsets:vehicle.wheelOffsets.map(x=>x.toFixed(3)).join(','),heading:vehicle.heading.toFixed(3),speed:vehicle.speed.toFixed(3),
        wheelRadius:rover.contactConfig.wheelRadius,optical};},
    };
  }catch(error){world.dispose();throw error;}
}
