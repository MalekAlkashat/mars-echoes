/**
 * Planned command execution with a bounded, mission-local traction and sink approximation.
 * SIMPLIFIED: every number in TUNING is a gameplay value. None is a measured speed, traction
 * coefficient, steering angle or historical command. Sources give only outcomes (PG-04, PG-12, PG-13).
 */
import { softness, TRENCH_CAP, inRect, type Ground } from './field.ts';
import { ROVER, SITE } from './site.ts';

export type Command = { kind: 'drive'; metres: number } | { kind: 'turn'; radians: number };
export type Stop = 'envelope' | 'deep-limit' | 'interrupted' | null;
export type Report = {
  command: Command; wheelMetres: number; movedMetres: number; turnedRadians: number;
  softness: number; sinkBefore: number; sinkAfter: number; stopped: Stop;
};
export const MAX_QUEUE = 3;
export const TUNING = {
  wheelSpeed: 1.35,        // m/s of wheel surface during player plans (time compressed)
  replayWheelSpeed: 3.2,   // replay takes about 5.5 seconds, not a historical rover speed
  turnRate: 0.8,           // rad/s commanded
  manualForward: 2.5,     // firm-ground speeds match the existing rover controls
  manualReverse: 1.4,
  manualTurnRate: 1.0,
  acceleration: 4,
  cautiousLimit: 0.6,      // a drive longer than this counts as a big move
  softTraction: 0.74,      // best share of wheel travel that becomes progress in soft sand
  sinkScale: 0.12,         // metres of sink over which traction falls by e
  spinPenalty: 0.1,        // extra loss for big moves in soft sand
  cautiousDig: 0.004,      // metres of sink per metre of slip, small moves
  bigDig: 0.035,           // metres of sink per metre of slip, big moves
  rollingRut: 0.015,       // rut left by a wheel simply rolling over soft sand
  turnLoss: 0.8,           // share of a commanded turn lost in soft sand
  turnDig: 0.05,           // metres of sink per radian commanded in soft sand
  replayWheelMetres: 16,   // wheel travel of the compressed replay drive
  replaySoftRun: 1.9,      // chassis travel after traction starts to fail
  replaySink: 0.125,       // sink at the end of the replay: about hub depth (wheel radius 0.131 m)
  replayTurn: 0.35,        // end-of-drive turn commanded in the replay; mostly lost
} as const;

export type RoverState = {
  x: number; z: number; heading: number;
  /** Shared spin angle of the six wheels, radians. Driven by commanded travel, not by progress. */
  wheelAngle: number; steer: number; wheelSpeed: number; chassisSpeed: number;
  /** +1 while the front leads, -1 while the rear leads; kept after stopping for the chase camera. */
  travelSign: number;
};
export function wheelPositions(state: Pick<RoverState, 'x' | 'z' | 'heading'>, out: [number, number][] = []): [number, number][] {
  const c = Math.cos(state.heading), s = Math.sin(state.heading);
  ROVER.wheels.forEach(([lx, lz], i) => { (out[i] ??= [0, 0])[0] = state.x + lx * c + lz * s; out[i][1] = state.z - lx * s + lz * c; });
  return out;
}
function bodyInside(x: number, z: number, heading: number): boolean {
  const c = Math.cos(heading), s = Math.sin(heading);
  for (const [lx, lz] of [[-ROVER.halfWidth, -ROVER.frontExtent], [ROVER.halfWidth, -ROVER.frontExtent], [ROVER.halfWidth, ROVER.rearExtent], [-ROVER.halfWidth, ROVER.rearExtent]])
    if (!inRect(SITE.envelope, x + lx * c + lz * s, z - lx * s + lz * c)) return false;
  return true;
}
/** Path the plan would follow with perfect traction. Used for the on-ground preview and for refusing plans. */
export function predictPath(start: Pick<RoverState, 'x' | 'z' | 'heading'>, queue: readonly Command[]): { points: [number, number][]; heading: number; inside: boolean } {
  let { x, z, heading } = start, inside = true;
  const points: [number, number][] = [[x, z]];
  for (const command of queue) {
    if (command.kind === 'turn') {
      const steps = Math.max(1, Math.ceil(Math.abs(command.radians) / 0.05));
      for (let i = 0; i < steps; i++) { heading += command.radians / steps; if (!bodyInside(x, z, heading)) inside = false; }
      continue;
    }
    const steps = Math.max(1, Math.ceil(Math.abs(command.metres) / 0.25)), d = command.metres / steps;
    for (let i = 0; i < steps; i++) {
      x += -Math.sin(heading) * d; z += -Math.cos(heading) * d; points.push([x, z]);
      if (!bodyInside(x, z, heading) || z > SITE.deepLimitZ) inside = false;
    }
  }
  return { points, heading, inside };
}

export class Driver {
  readonly state: RoverState = { x: 0, z: 0, heading: 0, wheelAngle: 0, steer: 0, wheelSpeed: 0, chassisSpeed: 0, travelSign: -1 };
  readonly reports: Report[] = [];
  /** Totals of the last finished plan or replay, for the planned-versus-actual readout. */
  lastPlan = { wheelMetres: 0, movedMetres: 0 };
  private queue: Command[] = [];
  private done = 0;
  private current: Report | null = null;
  private replay: { wheel: number; turn: number; origin: [number, number]; direction: [number, number]; length: number; heading: number } | null = null;
  private readonly wheels: [number, number][] = [];
  private readonly ground: Ground;
  private manualRun = 0;
  private manualDirection = 0;

  constructor(ground: Ground) { this.ground = ground; }
  get busy(): boolean { return this.queue.length > 0 || this.replay !== null; }
  get replaying(): boolean { return this.replay !== null; }
  get remaining(): number { return this.queue.length; }

  reset(pose: { x: number; z: number; heading: number }): void {
    Object.assign(this.state, { x: pose.x, z: pose.z, heading: pose.heading, wheelAngle: 0, steer: 0, wheelSpeed: 0, chassisSpeed: 0, travelSign: -1 });
    this.queue = []; this.current = null; this.replay = null; this.done = 0; this.reports.length = 0;
    this.lastPlan = { wheelMetres: 0, movedMetres: 0 };
    this.manualRun = this.manualDirection = 0;
  }
  /** Mean softness under the six wheels, 0..1. */
  softnessUnder(): number {
    wheelPositions(this.state, this.wheels);
    return this.wheels.reduce((sum, [x, z]) => sum + softness(x, z), 0) / 6;
  }
  meanSink(): number {
    wheelPositions(this.state, this.wheels);
    return this.wheels.reduce((sum, [x, z]) => sum + this.ground.sinkAt(x, z), 0) / 6;
  }
  /** Starts a plan. Returns false if the driver is busy, the plan is empty or too long. */
  send(plan: readonly Command[]): boolean {
    if (this.busy || plan.length === 0 || plan.length > MAX_QUEUE) return false;
    this.queue = plan.map(command => ({ ...command }));
    this.manualRun = this.manualDirection = 0;
    this.reports.length = 0; this.done = 0; this.current = null;
    return true;
  }
  /** The announced historical replay: a scripted reverse drive that ends mired at SITE.stuck. */
  startReplay(): boolean {
    if (this.busy) return false;
    const dx = SITE.stuck.x - this.state.x, dz = SITE.stuck.z - this.state.z, length = Math.hypot(dx, dz);
    this.replay = { wheel: 0, turn: 0, origin: [this.state.x, this.state.z], direction: [dx / length, dz / length], length, heading: Math.atan2(dx, dz) };
    this.reports.length = 0;
    this.current = this.begin({ kind: 'drive', metres: -TUNING.replayWheelMetres });
    return true;
  }
  /** Ends the running command at once and drops the rest of the plan. Nothing is left half-owned. */
  interrupt(): void {
    if (!this.busy) return;
    if (this.current) this.finish('interrupted');
    this.queue = []; this.replay = null;
    this.state.wheelSpeed = this.state.chassisSpeed = this.state.steer = 0;
  }
  private begin(command: Command): Report {
    return { command, wheelMetres: 0, movedMetres: 0, turnedRadians: 0, softness: this.softnessUnder(), sinkBefore: this.meanSink(), sinkAfter: 0, stopped: null };
  }
  private finish(stopped: Stop): void {
    if (!this.current) return;
    this.current.stopped = stopped; this.current.sinkAfter = this.meanSink();
    this.reports.push(this.current); this.current = null; this.done = 0;
    this.state.wheelSpeed = this.state.chassisSpeed = this.state.steer = 0;
    if (!this.replay) this.queue.shift();
    if (stopped === 'envelope' || stopped === 'deep-limit') this.queue = [];
    if (this.queue.length === 0 && !this.replay) this.lastPlan = {
      wheelMetres: this.reports.reduce((sum, r) => sum + r.wheelMetres, 0), movedMetres: this.reports.reduce((sum, r) => sum + r.movedMetres, 0),
    };
  }
  /** Presses each wheel's rut. `extra[i]` is added sink for this step; rolling over soft sand leaves a shallow rut. */
  private press(extra: (softnessAtWheel: number) => number, floor = TUNING.rollingRut, cap = TRENCH_CAP): void {
    wheelPositions(this.state, this.wheels);
    for (const [x, z] of this.wheels) {
      const s = softness(x, z);
      if (s <= 0) continue;
      this.ground.stamp(x, z, Math.min(cap, Math.max(this.ground.sinkAt(x, z) + extra(s), floor * s)));
    }
  }

  /** Direct input uses this same soil/contact owner. The scene arbitrates plans before calling it.
   * Holding a drive beyond cautiousLimit incurs the same slip penalty as a long planned move;
   * releasing the key starts a new short attempt, rather than resetting the penalty every frame.
   */
  manual(dt: number, forward: number, turn: number): Stop {
    if (this.busy) return null;
    const step = Number.isFinite(dt) ? Math.min(Math.max(dt, 0), 0.05) : 0;
    const axis = (value: number) => Number.isFinite(value) ? Math.max(-1, Math.min(1, value)) : 0;
    forward = axis(forward); turn = axis(turn);
    const s = this.state, direction = Math.sign(forward);
    if (!step) return null;
    if (direction !== this.manualDirection || !direction) this.manualRun = 0;
    this.manualDirection = direction;
    const soft = this.softnessUnder();
    const target = forward * (forward >= 0 ? TUNING.manualForward : TUNING.manualReverse);
    // Releasing input brakes immediately; acceleration is smoothed while a drive is held.
    s.wheelSpeed = !direction ? 0 : s.wheelSpeed + Math.max(-TUNING.acceleration * step, Math.min(TUNING.acceleration * step, target - s.wheelSpeed));
    const wheel = Math.abs(s.wheelSpeed) * step;
    this.manualRun += wheel;
    const big = this.manualRun > TUNING.cautiousLimit;
    const grip = TUNING.softTraction * Math.exp(-this.meanSink() / TUNING.sinkScale) * (big ? TUNING.spinPenalty : 1);
    const traction = 1 - soft + soft * grip;
    const angle = turn * TUNING.manualTurnRate * step * (1 - TUNING.turnLoss * soft);
    const heading = s.heading + angle;
    const moved = s.wheelSpeed * step * traction;
    const x = s.x - Math.sin(heading) * moved, z = s.z - Math.cos(heading) * moved;
    if (z > SITE.deepLimitZ || !bodyInside(x, z, heading)) {
      s.wheelSpeed = s.chassisSpeed = s.steer = 0;
      return z > SITE.deepLimitZ ? 'deep-limit' : 'envelope';
    }
    s.x = x; s.z = z; s.heading = Math.atan2(Math.sin(heading), Math.cos(heading));
    s.steer = turn; s.chassisSpeed = s.wheelSpeed * traction;
    if (direction) s.travelSign = direction;
    s.wheelAngle -= s.wheelSpeed * step / ROVER.wheelRadius;
    if (wheel || angle) this.press(v => v * ((wheel - Math.abs(moved)) * (big ? TUNING.bigDig : TUNING.cautiousDig) + Math.abs(angle) * TUNING.turnDig));
    return null;
  }

  step(dt: number): void {
    const step = Number.isFinite(dt) ? Math.min(Math.max(dt, 0), 0.05) : 0;
    if (step === 0 || !this.busy) return;
    if (this.replay) { this.stepReplay(step); return; }
    const command = this.queue[0], state = this.state;
    this.current ??= this.begin(command);
    const report = this.current, soft = this.softnessUnder();
    if (command.kind === 'turn') {
      const sign = Math.sign(command.radians), want = Math.min(Math.abs(command.radians) - this.done, TUNING.turnRate * step);
      const got = want * (1 - TUNING.turnLoss * soft);
      if (!bodyInside(state.x, state.z, state.heading + sign * got)) { this.finish('envelope'); return; }
      state.heading += sign * got; state.steer = sign; state.wheelSpeed = soft > 0 ? TUNING.wheelSpeed * 0.5 : 0; state.chassisSpeed = 0;
      state.wheelAngle -= state.travelSign * state.wheelSpeed * step / ROVER.wheelRadius;
      this.press(s => s * TUNING.turnDig * want);
      this.done += want; report.turnedRadians += sign * got;
      if (this.done >= Math.abs(command.radians) - 1e-6) this.finish(null);
      return;
    }
    const direction = Math.sign(command.metres) || 1, big = Math.abs(command.metres) > TUNING.cautiousLimit;
    const wheel = Math.min(Math.abs(command.metres) - this.done, TUNING.wheelSpeed * step);
    const grip = TUNING.softTraction * Math.exp(-this.meanSink() / TUNING.sinkScale) * (big ? TUNING.spinPenalty : 1);
    const traction = 1 - soft + soft * grip, moved = wheel * traction;
    const nx = state.x - Math.sin(state.heading) * direction * moved, nz = state.z - Math.cos(state.heading) * direction * moved;
    state.travelSign = direction; state.steer = 0;
    state.wheelSpeed = direction * TUNING.wheelSpeed; state.chassisSpeed = direction * TUNING.wheelSpeed * traction;
    state.wheelAngle -= direction * wheel / ROVER.wheelRadius;
    this.done += wheel; report.wheelMetres += wheel;
    if (nz > SITE.deepLimitZ) { this.press(s => s * (wheel - moved) * TUNING.bigDig); this.finish('deep-limit'); return; }
    if (!bodyInside(nx, nz, state.heading)) { this.finish(soft > 0 && direction < 0 ? 'deep-limit' : 'envelope'); return; }
    state.x = nx; state.z = nz; report.movedMetres += moved;
    this.press(s => s * (wheel - moved) * (big ? TUNING.bigDig : TUNING.cautiousDig));
    if (this.done >= Math.abs(command.metres) - 1e-6) this.finish(null);
  }

  private stepReplay(step: number): void {
    const replay = this.replay!, state = this.state, report = this.current!;
    const total = TUNING.replayWheelMetres, firm = replay.length - TUNING.replaySoftRun, fade = 2.0;
    if (replay.wheel < total) {
      const before = this.progress(replay.wheel, firm, total, fade, replay.length);
      const wheel = Math.min(total - replay.wheel, TUNING.replayWheelSpeed * step);
      replay.wheel += wheel;
      const after = this.progress(replay.wheel, firm, total, fade, replay.length), moved = after - before;
      state.x = replay.origin[0] + replay.direction[0] * after; state.z = replay.origin[1] + replay.direction[1] * after;
      state.heading += (replay.heading - state.heading) * Math.min(1, step * 2);
      state.travelSign = -1; state.steer = 0; state.wheelSpeed = -TUNING.replayWheelSpeed; state.chassisSpeed = -moved / step;
      state.wheelAngle += wheel / ROVER.wheelRadius;
      report.wheelMetres += wheel; report.movedMetres += moved;
      this.press(s => s * (wheel - moved) * TUNING.bigDig, TUNING.rollingRut, TUNING.replaySink);
      return;
    }
    // The end-of-drive turn: commanded, mostly lost in the soft sand (PG-07), then the rover stops itself.
    const want = Math.min(TUNING.replayTurn - replay.turn, TUNING.turnRate * step);
    replay.turn += want;
    state.heading += (SITE.stuck.heading - replay.heading) * want / TUNING.replayTurn;
    state.steer = 1; state.wheelSpeed = -TUNING.replayWheelSpeed * 0.5; state.chassisSpeed = 0;
    state.wheelAngle += TUNING.replayWheelSpeed * 0.5 * step / ROVER.wheelRadius;
    this.press(() => 0, TUNING.rollingRut, TUNING.replaySink);
    if (replay.turn >= TUNING.replayTurn - 1e-6) {
      state.x = SITE.stuck.x; state.z = SITE.stuck.z; state.heading = SITE.stuck.heading;
      report.turnedRadians = SITE.stuck.heading - replay.heading;
      this.replay = null; this.finish(null);
      this.lastPlan = { wheelMetres: report.wheelMetres, movedMetres: report.movedMetres };
    }
  }
  /** Chassis travel for a given wheel travel: one-to-one on firm ground, then fading to a stop. */
  private progress(wheel: number, firm: number, total: number, fade: number, length: number): number {
    if (wheel <= firm) return wheel;
    const full = 1 - Math.exp(-(total - firm) / fade);
    return firm + (length - firm) * (1 - Math.exp(-(wheel - firm) / fade)) / full;
  }
  /** True once every wheel is on firm ground north of the last low crest. */
  free(): boolean {
    return !this.busy && this.softnessUnder() === 0 && this.state.z <= SITE.escape.z + 0.9;
  }
}
