/**
 * Mission 2 production chapter: the real rover, firm ground,
 * the hero ripple, planned command execution, slip and sink, and a recovery to firm ground.
 * Completion commits SAND only through the shared successful-return transaction.
 */
import * as T from 'three';
import { emptyInput, type EpisodeEntry, type GameScene, type InputFrame, type SceneContext } from '../../../../../app/contracts';
import { Vehicle } from '../../../../../entities/rover/controller';
import { createOpportunityRover } from '../../../../../entities/rover/opportunity';
import { WheelEffects } from '../../../../../entities/rover/wheel-effects';
import { element } from '../../../../../ui';
import { purgatoryText as copy } from '../../../../../content/purgatory';
import { SliceCameras } from './cameras';
import { Driver, MAX_QUEUE, TUNING, predictPath, type Command } from './drive';
import { PlanPanel, TILES, type PanelView } from './panel';
import { ROVER, SITE } from './site';
import { createPurgatoryWorld } from './world';
import { RecoveryAssist } from './recovery-assist';
import { SequenceOverlay, type Phase } from './sequence-ui';
import { SEQUENCE_TIMING } from './archive';
import {saveSoil,restoreSoil} from './checkpoint';
import './style.css';

const PATH_POINTS = 64;

export async function createPurgatorySlice(context: SceneContext, entry: EpisodeEntry, signal: AbortSignal): Promise<GameScene> {
  const assets = await context.assets.load(); signal.throwIfAborted();
  const world = await createPurgatoryWorld(signal);
  try {
    signal.throwIfAborted(); world.setup(context.renderer);
    const { ground } = world;
    const rover = createOpportunityRover(assets.opportunity); world.scene.add(rover.root);
    const vehicle = new Vehicle(rover.contactConfig), driver = new Driver(ground), cameras = new SliceCameras();
    const dust = new WheelEffects(world.scene, ground.surface, 0.14), panel = new PlanPanel();
    const overlay = new SequenceOverlay(Boolean(entry.journey)), assist = new RecoveryAssist();
    const tread = world.scene.getObjectByName('wheel-contact-tread-impressions');
    if (tread) tread.visible = false;
    const effects = { time: 0, degraded: 0 }, camera = cameras.camera;
    // Mission-local tint of the shared wheel dust: the panorama's churned soil is red-brown, not pale.
    const puffs = world.scene.getObjectByName('wheel-contact-mineral-dust') as T.Points<T.BufferGeometry, T.ShaderMaterial> | undefined;
    (puffs?.material.uniforms.dustColor.value as T.Color | undefined)?.set('#b4835a');

    // Planned-path preview: a flat ribbon on the ground, rebuilt only when the queue changes.
    const ribbon = new T.BufferGeometry(), ribbonPositions = new Float32Array(PATH_POINTS * 2 * 3), ribbonIndex: number[] = [];
    for (let i = 0; i < PATH_POINTS - 1; i++) { const a = i * 2; ribbonIndex.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    ribbon.setAttribute('position', new T.BufferAttribute(ribbonPositions, 3)); ribbon.setIndex(ribbonIndex); ribbon.setDrawRange(0, 0);
    const preview = new T.Mesh(ribbon, new T.MeshBasicMaterial({ color: '#ffd9a0', transparent: true, opacity: 0.8, depthWrite: false, side: T.DoubleSide, fog: false }));
    preview.name = 'planned-path-preview'; preview.frustumCulled = false; preview.userData.excludeAO = true; preview.renderOrder = 3;
    const goal = new T.Mesh(new T.RingGeometry(0.3, 0.4, 40), preview.material);
    goal.rotation.x = -Math.PI / 2; goal.visible = false; goal.userData.excludeAO = true; goal.renderOrder = 3;
    world.scene.add(preview, goal);

    // These virtual navigation chevrons are a gameplay aid, not marks in the NASA imagery.
    const arrows: number[] = [];
    for (const z of [-0.1, -1.8, -3.5]) {
      for (const [x, dz] of [[-0.38, 0.18], [0, -0.2], [0.38, 0.18], [0.23, 0.3], [0, 0.06], [-0.23, 0.3]]) arrows.push(x, ground.sample(x, z + dz) + 0.035, z + dz);
    }
    const arrowGeometry = new T.BufferGeometry(); arrowGeometry.setAttribute('position', new T.Float32BufferAttribute(arrows, 3));
    arrowGeometry.setIndex([0, 1, 5, 1, 4, 5, 1, 2, 4, 2, 3, 4, 6, 7, 11, 7, 10, 11, 7, 8, 10, 8, 9, 10, 12, 13, 17, 13, 16, 17, 13, 14, 16, 14, 15, 16]);
    const guide = new T.Mesh(arrowGeometry, new T.MeshBasicMaterial({color:'#f6d6a3', transparent:true, opacity:0.7, side:T.DoubleSide, depthWrite:false}));
    guide.name = 'recovery-navigation-guide'; guide.userData.excludeAO = true; guide.visible = false; world.scene.add(guide);

    let phase: Phase = 'replay', phaseTime = 0, queue: Command[] = [], sent: Command[] = [], hint: string = copy.clues.ready;
    let active = false, paused = false, disposed = false, returning = false, held = false, blocked = false;
    let odoWheel = 0, odoMoved = 0, lastX = 0, lastZ = 0, lastAngle = 0;
    let manualControl = true, panelElapsed = 0;
    const reduced = () => document.body.classList.contains('reduced-menu-motion') || matchMedia('(prefers-reduced-motion: reduce)').matches;
    const label = (command: Command) => TILES.find(tile => JSON.stringify(tile.command) === JSON.stringify(command))?.short ?? 'Drive';

    const pose = (step: number) => {
      const s = driver.state;
      vehicle.position.x = s.x; vehicle.position.z = s.z; vehicle.heading = s.heading; vehicle.speed = s.chassisSpeed; vehicle.steer = s.steer;
      vehicle.settle(step, ground.surface);
      rover.root.position.copy(vehicle.position); rover.root.rotation.set(vehicle.pitch, vehicle.heading, vehicle.roll);
      rover.setSuspension(vehicle.wheelOffsets, s.steer * 0.38);
      // Wheel spin follows commanded wheel travel, so it visibly outruns the chassis when slipping.
      for (const wheel of rover.wheels) wheel.rotation.x = s.wheelAngle;
      rover.root.updateMatrixWorld(true);
    };
    const drawPreview = () => {
      const visible = queue.length > 0 && !driver.busy;
      preview.visible = goal.visible = visible;
      if (!visible) { ribbon.setDrawRange(0, 0); return; }
      const { points } = predictPath(driver.state, queue), count = Math.min(points.length, PATH_POINTS);
      for (let i = 0; i < count; i++) {
        const [x, z] = points[i], [px, pz] = points[Math.max(0, i - 1)], [nx, nz] = points[Math.min(count - 1, i + 1)];
        let tx = nx - px, tz = nz - pz; const length = Math.hypot(tx, tz) || 1; tx /= length; tz /= length;
        for (const [k, side] of [[0, -0.07], [1, 0.07]] as const) {
          const vx = x - tz * side, vz = z + tx * side;
          ribbonPositions.set([vx, ground.sample(vx, vz) + 0.045, vz], (i * 2 + k) * 3);
        }
      }
      ribbon.getAttribute('position').needsUpdate = true; ribbon.setDrawRange(0, Math.max(0, count - 1) * 6);
      const [gx, gz] = points[count - 1]; goal.position.set(gx, ground.sample(gx, gz) + 0.05, gz);
    };
    const view = (): PanelView => {
      const running = sent.length - driver.remaining, text = copy.phases.recover;
      return {
        title: text.title, body: text.body, hint,
        wheel: `${(manualControl ? odoWheel : driver.busy ? odoWheel - planWheelStart : driver.lastPlan.wheelMetres).toFixed(2)} m`,
        moved: `${(manualControl ? odoMoved : driver.busy ? odoMoved - planMovedStart : driver.lastPlan.movedMetres).toFixed(2)} m`,
        sink: `${Math.round(driver.meanSink() * 100)} cm`,
        queue: driver.busy && !driver.replaying
          ? sent.map((command, i) => ({ label: label(command), state: i < running ? 'done' : i === running ? 'running' : 'filled' }))
          : queue.map(command => ({ label: label(command), state: 'filled' as const })),
        busy: driver.busy, planning: phase === 'recover', replayOffered: false, camera: cameras.mode,
      };
    };
    let planWheelStart = 0, planMovedStart = 0;
    const beginPlan = () => { planWheelStart = odoWheel; planMovedStart = odoMoved; };
    const send = () => {
      if (driver.busy) { if (!driver.replaying) { driver.interrupt(); planFinished(); } return; }
      if (queue.length === 0 || phase !== 'recover') return;
      if (!predictPath(driver.state, queue).inside && driver.softnessUnder() === 0) { hint = copy.clues.refused; return; }
      sent = queue; queue = [];
      if (driver.send(sent)) { manualControl = false; beginPlan(); hint = 'Executing the plan. WASD takes over; E stops it.'; drawPreview(); }
    };
    const planFinished = () => {
      if (phase === 'replay') {
        phase = 'stuck'; phaseTime = 0; hint = copy.clues.replayDone; context.clearInput(); assist.reset(driver.state.wheelAngle);
        return;
      }
      const reports = driver.reports, soft = reports.some(r => r.softness > 0);
      const stop = reports.find(r => r.stopped)?.stopped;
      hint = stop === 'deep-limit' ? copy.clues.deeper : stop === 'envelope' ? copy.clues.envelope : stop === 'interrupted' ? copy.clues.interrupted
        : !soft ? copy.clues.firm
        : reports.some(r => r.command.kind === 'drive' && Math.abs(r.command.metres) > TUNING.cautiousLimit && r.softness > 0) ? copy.clues.softBig
        : reports.some(r => r.command.kind === 'turn' && r.softness > 0) ? copy.clues.softTurn : copy.clues.softSmall;
      sent = [];
    };
    const reset = () => {
      phase = 'replay'; phaseTime = 0; queue = []; sent = []; hint = copy.clues.ready; returning = false; effects.time = 0;
      manualControl = false; panelElapsed = 0; held = blocked = false; overlay.action = null;
      odoWheel = odoMoved = planWheelStart = planMovedStart = 0;
      ground.reset(); driver.reset(SITE.observe); dust.reset(); cameras.reset(); rover.reset();
      vehicle.reset(SITE.observe.x, SITE.observe.z, SITE.observe.heading); pose(0.25); world.mesh.refresh(); drawPreview();
      lastX = driver.state.x; lastZ = driver.state.z; lastAngle = driver.state.wheelAngle;
      world.follow(driver.state.x, driver.state.z); world.tickSky(0);
      cameras.update(0, { x: vehicle.position.x, y: vehicle.position.y, z: vehicle.position.z, heading: vehicle.heading, pitch: vehicle.pitch, travelSign: driver.state.travelSign }, ground.surface, reduced(), 'intro', 0);
      driver.startReplay(); assist.reset(); beginPlan();
      context.clearInput(); panel.actions.length = 0;
      if (active) show();
    };
    const show = () => {
      document.body.classList.add('purgatory-active');
      context.ui.resetView(); context.ui.setScene('episode-rover-01'); element('restart-button').hidden = false;
      context.ui.playing(); element('hud').hidden = true; element('objective').hidden = true; element('chapter').hidden = true;
      overlay.root.hidden = paused; panel.root.hidden = paused || phase !== 'recover';
      document.body.classList.toggle('purgatory-recover',phase==='recover'&&!paused);
      element('touch-controls').hidden=false;
      panel.render(view()); overlay.render(phase, phaseTime, 0, held, blocked);
    };
    reset();
    if(entry.resume?.kind==='purgatory'&&entry.resume.phase!=='replay'){
      const s=entry.resume;driver.interrupt();restoreSoil(ground,s.deformation);
      driver.reset({x:s.position[0],z:s.position[1],heading:s.heading});driver.state.wheelAngle=s.wheelAngle;
      phase=s.phase;phaseTime=s.phaseTime;effects.time=s.time;manualControl=true;
      odoWheel=s.wheelMetres;odoMoved=s.movedMetres;lastAngle=s.wheelAngle;lastX=s.position[0];lastZ=s.position[1];
      cameras.reset();cameras.mode=s.cameraMode;cameras.yaw=s.cameraYaw;cameras.pitch=s.cameraPitch;cameras.distance=s.cameraDistance;
      assist.reset(s.wheelAngle);pose(.25);world.mesh.refresh();world.follow(lastX,lastZ);world.tickSky(effects.time);
      const shot=phase==='outro'?'outro':['sand','archive','end'].includes(phase)?'sand':undefined;
      cameras.update(0,{x:vehicle.position.x,y:vehicle.position.y,z:vehicle.position.z,heading:s.heading,pitch:vehicle.pitch,travelSign:1},ground.surface,reduced(),shot,1);
      hint='Saved rover and sand restored. Queued commands cleared; WASD is ready.';
    }

    const api: GameScene = {
      id: 'episode-rover-01', scene: world.scene, camera, effects,
      activate() { active = true; show(); },
      update(dt, input) {
        if (!active || paused || disposed) return;
        const step = Math.min(Math.max(dt, 0), 0.05);
        if (returning) return;
        if(overlay.action==='skip'){
          overlay.action=null;context.clearInput();
          if(phase==='replay'){
            // Resolve only the authored encounter, never the player's recovery.
            for(let i=0;i<7200&&driver.busy;i++)driver.step(1/60);
            planFinished();pose(.25);world.mesh.refresh();
          }else if(phase==='stuck'){phase='recover';phaseTime=0;manualControl=true;cameras.set('chase');}
          else if(phase==='outro'||phase==='sand'){phase='archive';phaseTime=0;}
          else if(phase==='archive'){phase='end';phaseTime=0;}
        }
        if (overlay.action === 'restart') { reset(); overlay.action = null; return; }
        if (input.returnPressed || overlay.action === 'return' || (phase==='end'&&input.interactPressed)) {
          const complete=phase==='end'&&driver.free()&&!input.returnPressed;
          // Consume the click before requesting a transition. A failed/cancelled return
          // must wait for a new player action, not silently submit the same completion.
          overlay.action = null;
          returning = true; driver.interrupt(); panel.root.hidden = overlay.root.hidden = true; context.clearInput();
          context.request({ kind: 'return-to-hub', result: { episodeId: 'episode-rover-01', wreckId: entry.wreckId, chapter:'purgatory', outcome: complete?'completed':'aborted' } });
          return;
        }
        effects.time += step; phaseTime += step;
        world.tickSky(effects.time);
        if (phase === 'stuck' && phaseTime >= SEQUENCE_TIMING.stuck) { phase = 'recover'; phaseTime = 0; manualControl = true; cameras.set('chase'); context.clearInput(); panel.root.hidden = false; }
        if (phase === 'outro' && phaseTime >= SEQUENCE_TIMING.outro) { phase = 'sand'; phaseTime = 0; }
        if (phase === 'sand' && phaseTime >= SEQUENCE_TIMING.sand) { phase = 'archive'; phaseTime = 0; }
        if (phase === 'archive' && phaseTime >= SEQUENCE_TIMING.archive) { phase = 'end'; phaseTime = 0; }
        if (phase === 'recover' && input.opticalPressed) cameras.next();
        for (const action of panel.actions.splice(0)) {
          if (phase !== 'recover') continue;
          if (action.kind === 'camera') cameras.set(action.mode);
          else if (action.kind === 'send') send();
          else if (action.kind === 'replay') continue;
          else if (driver.busy) continue;
          else if (action.kind === 'clear') { queue = []; drawPreview(); hint = copy.clues.ready; }
          else if (queue.length < MAX_QUEUE) { queue = [...queue, TILES[action.index].command]; drawPreview(); }
        }
        // A click and E can arrive in one frame; accept the tile before sending its plan.
        if (phase === 'recover' && (input.interactPressed || input.confirmPressed)) send();
        const wasBusy = driver.busy;
        const direct = phase === 'recover' && (input.moveX !== 0 || input.moveY !== 0);
        if (direct) {
          if (driver.busy) driver.interrupt();
          if (!manualControl) cameras.set('chase');
          manualControl = true;
          if (queue.length || sent.length) { queue = []; sent = []; drawPreview(); }
        }
        if (driver.busy) driver.step(step);
        else {
          const forward = assist.forward(step, phase === 'recover' ? input.moveY : 0, driver.state.wheelAngle, ROVER.wheelRadius, driver.softnessUnder() > 0);
          const stop = driver.manual(step, forward, phase === 'recover' ? -input.moveX : 0);
          blocked = stop !== null;
          if (stop) hint = stop === 'deep-limit' ? copy.clues.deeper : copy.clues.envelope;
          else if (direct) hint = driver.softnessUnder() > 0 ? 'Hold W. The recovery assist meters short moves; follow the guide.' : copy.clues.ready;
        }
        const s = driver.state;
        odoWheel += Math.abs(s.wheelAngle - lastAngle) * ROVER.wheelRadius; odoMoved += Math.hypot(s.x - lastX, s.z - lastZ);
        lastAngle = s.wheelAngle; lastX = s.x; lastZ = s.z;
        if (wasBusy && !driver.busy && !direct) planFinished();
        if (phase === 'recover' && driver.free()) {
          phase = 'outro'; phaseTime = 0; driver.interrupt(); driver.manual(step, 0, 0); queue = []; sent = []; drawPreview();
          panel.root.hidden = true; context.clearInput();
        }
        world.mesh.refresh();
        pose(step);
        dust.update(step, effects.time, vehicle.contactPositions, s.wheelSpeed, vehicle.heading, vehicle.grounded);
        world.follow(s.x, s.z);
        if (phase === 'recover') cameras.orbit(input.dragX + input.lookX * step * 100, input.dragY + input.lookY * step * 100, input.zoom);
        // While a plan is queued, face the way its first drive will go, so the goal is up-screen before SEND.
        const planned = driver.busy ? undefined : queue.find(command => command.kind === 'drive');
        const travelSign = manualControl ? 1 : planned?.kind === 'drive' ? Math.sign(planned.metres) : s.travelSign;
        const shot = phase === 'replay' ? 'intro' : phase === 'stuck' ? 'stuck' : phase === 'outro' ? 'outro' : ['sand', 'archive', 'end'].includes(phase) ? 'sand' : undefined;
        const shotProgress = phase === 'replay' ? phaseTime / 5.5 : phase === 'outro' ? Math.min(1, phaseTime / 3.2) : phase === 'sand' ? phaseTime / SEQUENCE_TIMING.sand : 1;
        cameras.update(step, { x: vehicle.position.x, y: vehicle.position.y, z: vehicle.position.z, heading: vehicle.heading, pitch: vehicle.pitch, travelSign }, ground.surface, reduced(), shot, shotProgress);
        held = phase === 'recover' && input.moveY > 0;
        document.body.classList.toggle('purgatory-recover',phase==='recover');
        guide.visible = phase === 'recover';
        // Telemetry is legible at 10 Hz. Do not rebuild the panel's view/JSON on every render.
        panelElapsed += step;
        if (panelElapsed >= 0.1) {
          panelElapsed = 0;
          panel.render(view());
        }
        overlay.render(phase, phaseTime, (SITE.stuck.z - s.z) / (SITE.stuck.z - (SITE.escape.z + 0.9)), held, blocked);
      },
      journeyShot(direction,seconds,reduced){if(direction==='out'){seconds=reduced?0:seconds;rover.root.position.z=vehicle.position.z-Math.min(seconds,6)*.12;rover.root.position.y=vehicle.position.y+ground.surface(rover.root.position.x,rover.root.position.z)-ground.surface(vehicle.position.x,vehicle.position.z);rover.root.updateMatrixWorld(true);}},
      resize(width, height) { camera.aspect = width / height; camera.updateProjectionMatrix(); dust.setView(camera.fov, height); },
      setPaused(value) { paused = value; if(!value)returning=false; document.body.classList.toggle('purgatory-recover',phase==='recover'&&!value); panel.root.hidden = value || phase !== 'recover'; overlay.root.hidden = value; panel.actions.length = 0; },
      restart() { paused = false; reset(); show(); },
      getSaveEntry() {
        // The scripted encounter resumes from its start, never a half-owned replay command.
        const savePhase=phase==='stuck'?'replay':phase,replay=savePhase==='replay',s=driver.state;
        return {scene:'episode-rover-01',wreckId:entry.wreckId,chapter:'purgatory',resume:{
          kind:'purgatory',started:true,time:effects.time,position:replay?[SITE.observe.x,SITE.observe.z]:[s.x,s.z],
          heading:replay?SITE.observe.heading:s.heading,cameraYaw:cameras.yaw,cameraPitch:cameras.pitch,cameraDistance:cameras.distance,
          cameraMode:cameras.mode,phase:savePhase,phaseTime:replay?0:phaseTime,wheelAngle:replay?0:s.wheelAngle,
          wheelMetres:replay?0:odoWheel,movedMetres:replay?0:odoMoved,deformation:replay?[]:saveSoil(ground),
        }};
      },
      dispose() {
        if (disposed) return;
        disposed = true; active = false; panel.dispose(); overlay.dispose(); document.body.classList.remove('purgatory-active','purgatory-recover'); element('restart-button').hidden = true; element('objective').hidden = element('chapter').hidden = false; world.dispose();
        if (import.meta.env.DEV) delete (window as { __purgatoryReview?: unknown }).__purgatoryReview;
      },
      debug() {
        const s = driver.state;
        return {
          chapter: 'purgatory', phase, phaseTime: phaseTime.toFixed(3), busy: driver.busy, queued: queue.length, cameraMode: cameras.mode, control: driver.replaying ? 'replay' : phase !== 'recover' ? 'cinematic' : driver.busy ? 'plan' : 'manual', recoveryAssist: assist.easing, tracksVisible: Boolean(tread?.visible),
          position: `${s.x.toFixed(3)},${s.z.toFixed(3)}`, heading: s.heading.toFixed(3), bodyY: vehicle.position.y.toFixed(3),
          odoWheel: odoWheel.toFixed(3), odoMoved: odoMoved.toFixed(3), wheelSpeed: s.wheelSpeed.toFixed(2), chassisSpeed: s.chassisSpeed.toFixed(3),
          softnessUnder: driver.softnessUnder().toFixed(2), meanSink: driver.meanSink().toFixed(3),
          pitch: vehicle.pitch.toFixed(3), roll: vehicle.roll.toFixed(3), contacts: vehicle.grounded.map(v => (v ? '1' : '0')).join(''),
          groundTriangles: world.mesh.triangles, free: driver.free(),
        };
      },
    };
    if (import.meta.env.DEV) {
      // Review aid for stills when the browser will not animate (hidden or throttled window).
      // It runs this scene's own update at a fixed 1/60 s step; it adds no loop, listener or second code path.
      (window as { __purgatoryReview?: unknown }).__purgatoryReview = {
        advance(seconds: number, input: Partial<InputFrame> = {}) {
          const steps = Math.max(1, Math.round(Math.min(seconds, 120) * 60));
          for (let i = 0; i < steps; i++) api.update(1 / 60, { ...emptyInput(), ...(i === 0 ? input : {}) });
          return api.debug();
        },
        state: () => api.debug(),
      };
    }
    return api;
  } catch (error) { world.dispose(); throw error; }
}
