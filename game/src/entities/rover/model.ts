import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { createRoverMaterials } from './materials';
export type RoverRig = {
    root: THREE.Group;
    head: THREE.Group;
    socket: THREE.Group;
    eye: THREE.Mesh;
    module: THREE.Group;
    arm: {
        upper: THREE.Mesh;
        lower: THREE.Mesh;
        claw: THREE.Group;
    };
    wheels: THREE.Group[];
    setArmTarget(target: THREE.Vector3): void;
    setSuspension(offsets: readonly number[], steer?: number): void;
    update(time: number, speed: number, repaired: boolean): void;
};
type Triple = [
    number,
    number,
    number
];
const UP = new THREE.Vector3(0, 1, 0);
const WHEEL_RADIUS = 0.266;
export function createRover(template: THREE.Object3D, wreck = false): RoverRig {
    const root = new THREE.Group();
    root.name = wreck ? 'inactive-rover-placeholder' : 'playable-rover-placeholder';
    root.userData.source = 'Procedural refinement of selected reference; technical asset, not exact reconstruction';
    root.userData.placeholderSource = template.name;
    const m = createRoverMaterials(wreck);
    const batches = new Map<THREE.Object3D, Map<THREE.Material, THREE.BufferGeometry[]>>();
    const transform = new THREE.Object3D();
    function mesh(g: THREE.BufferGeometry, material: THREE.Material, parent: THREE.Object3D = root): THREE.Mesh {
        const part = new THREE.Mesh(g, material);
        part.castShadow = part.receiveShadow = true;
        parent.add(part);
        return part;
    }
    function batch(g: THREE.BufferGeometry, material: THREE.Material, parent: THREE.Object3D = root, position: Triple = [0, 0, 0], rotation: Triple = [0, 0, 0]): void {
        transform.position.set(...position);
        transform.rotation.set(...rotation);
        transform.scale.set(1, 1, 1);
        transform.updateMatrix();
        const geometry = g.index ? g.toNonIndexed() : g.clone();
        geometry.applyMatrix4(transform.matrix);
        g.dispose();
        let parentBatch = batches.get(parent);
        if (!parentBatch)
            batches.set(parent, parentBatch = new Map());
        let materialBatch = parentBatch.get(material);
        if (!materialBatch)
            parentBatch.set(material, materialBatch = []);
        materialBatch.push(geometry);
    }
    function box(size: Triple, position: Triple, material: THREE.Material = m.paint, parent: THREE.Object3D = root, radius = 0.018, rotation: Triple = [0, 0, 0]): void {
        batch(new RoundedBoxGeometry(...size, 1, radius), material, parent, position, rotation);
    }
    function cylinder(radius: number, length: number, position: Triple, material: THREE.Material, parent: THREE.Object3D = root, rotation: Triple = [0, 0, 0], segments = 16): void {
        batch(new THREE.CylinderGeometry(radius, radius, length, segments), material, parent, position, rotation);
    }
    function ring(radius: number, tube: number, position: Triple, material: THREE.Material, parent: THREE.Object3D, rotation: Triple = [0, 0, 0]): void {
        batch(new THREE.TorusGeometry(radius, tube, 5, 24), material, parent, position, rotation);
    }
    function rod(a: THREE.Vector3, b: THREE.Vector3, radius: number, material: THREE.Material, parent: THREE.Object3D = root, dynamic = false): THREE.Mesh | undefined {
        const g = new THREE.CylinderGeometry(radius, radius, 1, 8);
        const d = new THREE.Vector3().subVectors(b, a);
        const part = new THREE.Mesh(g, material);
        part.position.copy(a).add(b).multiplyScalar(0.5);
        part.scale.y = d.length();
        part.quaternion.setFromUnitVectors(UP, d.normalize());
        if (dynamic) {
            part.castShadow = part.receiveShadow = true;
            parent.add(part);
            return part;
        }
        part.updateMatrix();
        batch(g.clone().applyMatrix4(part.matrix), material, parent);
        g.dispose();
        return undefined;
    }
    function tube(points: Triple[], radius: number, material: THREE.Material, parent: THREE.Object3D = root): void {
        batch(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))), 16, radius, 6, false), material, parent);
    }
    function fastener(position: Triple, parent: THREE.Object3D = root, normal: 'y' | 'x' | 'z' = 'y', radius = 0.014): void {
        const rotation: Triple = normal === 'z' ? [Math.PI / 2, 0, 0] : normal === 'x' ? [0, 0, Math.PI / 2] : [0, 0, 0];
        cylinder(radius * 1.4, 0.006, position, m.frame, parent, rotation, 12);
        cylinder(radius, 0.011, position, m.steel, parent, rotation, 6);
    }
    function polygon(points: [
        number,
        number
    ][], depth: number, position: Triple, material: THREE.Material, parent: THREE.Object3D = root, rotation: Triple = [0, 0, 0], bevel = 0.006): void {
        const shape = new THREE.Shape(points.map(p => new THREE.Vector2(...p)));
        shape.closePath();
        batch(new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 1, steps: 1, curveSegments: 1 }), material, parent, position, rotation);
    }
    // Separate frame and broken skins leave actual openings around the battery bay.
    for (const side of [-1, 1]) {
        box([0.085, 0.15, 1.58], [side * 0.40, 0.46, 0.01], m.frame);
        box([0.08, 0.055, 1.65], [side * 0.43, 0.74, 0], m.steel);
    }
    for (const z of [-0.65, -0.05, 0.59])
        box([0.91, 0.08, 0.075], [0, 0.49, z], m.frame);
    box([0.77, 0.11, 1.30], [0, 0.46, 0.02], m.paintDark, root, 0.045);
    box([0.84, 0.23, 0.67], [0, 0.64, -0.30], m.frame, root, 0.065);
    box([0.94, 0.065, 0.53], [0, 0.82, -0.43], m.paint, root, 0.025, [0.045, 0, 0]);
    box([0.38, 0.055, 0.69], [-0.28, 0.82, 0.24], m.paint, root, 0.022, [-0.025, 0, -0.055]);
    box([0.30, 0.065, 0.40], [0.29, 0.81, -0.10], m.paint, root, 0.022);
    box([0.26, 0.11, 0.38], [0.12, 0.67, 0.42], m.cavity);
    for (let i = 0; i < 4; i++) {
        box([0.12, 0.20, 0.35], [-0.25 + i * 0.14, 0.65, 0.40], m.frame, root, 0.017);
        box([0.09, 0.022, 0.29], [-0.25 + i * 0.14, 0.76, 0.40], m.edge);
    }
    const nose: [
        number,
        number
    ][] = [[-0.52, -0.09], [-0.43, -0.18], [-0.18, -0.20], [-0.09, -0.14], [0.02, -0.19], [0.12, -0.12], [0.18, -0.16], [0.30, -0.07], [0.52, -0.05], [0.51, 0.11], [0.41, 0.17], [-0.40, 0.17], [-0.53, 0.08]];
    polygon(nose, 0.035, [0, 0.65, -0.84], m.paint);
    polygon([[-0.27, -0.12], [0.24, -0.12], [0.35, 0.05], [-0.35, 0.05]], 0.055, [0, 0.52, -0.82], m.frame);
    for (const side of [-1, 1]) {
        box([0.18, 0.09, 0.08], [side * 0.40, 0.69, -0.86], m.frame, root, 0.012);
        box([0.135, 0.047, 0.014], [side * 0.40, 0.695, -0.908], m.paintDark, root, 0.009);
        fastener([side * 0.45, 0.82, -0.63]);
        fastener([side * 0.45, 0.81, 0.12]);
        box([0.22, 0.06, 0.10], [side * 0.38, 0.64, 0.82], m.paintDark);
    }
    const sidePanel: [
        number,
        number
    ][] = [[-0.70, -0.09], [-0.61, -0.15], [-0.27, -0.13], [-0.19, -0.02], [-0.07, -0.09], [0.01, -0.01], [0.09, -0.07], [0.20, 0.03], [0.37, -0.04], [0.42, -0.11], [0.66, -0.08], [0.71, 0.08], [0.59, 0.16], [-0.61, 0.16]];
    polygon(sidePanel, 0.022, [-0.51, 0.64, 0], m.paint, root, [0, Math.PI / 2, 0]);
    polygon([[-0.69, -0.08], [-0.56, -0.13], [-0.32, -0.09], [-0.24, 0.05], [-0.08, 0], [0.02, 0.09], [0.15, 0.05], [0.21, 0.15], [-0.62, 0.16]], 0.025, [0.51, 0.65, 0], m.paint, root, [0, Math.PI / 2, -0.03]);
    polygon([[0.35, -0.10], [0.64, -0.10], [0.70, 0.07], [0.58, 0.15], [0.29, 0.12], [0.35, 0.04], [0.28, -0.02]], 0.022, [0.52, 0.65, 0.03], m.paint, root, [0.04, Math.PI / 2 - 0.12, -0.08]);
    for (const side of [-1, 1]) {
        for (const z of [-0.52, 0.03, 0.62])
            fastener([side * 0.535, 0.75, z], root, 'x');
        box([0.018, 0.045, 0.20], [side * 0.54, 0.69, -0.45], m.cavity, root, 0.008);
    }
    box([0.31, 0.10, 0.35], [-0.20, 0.82, 0.50], m.paintDark, root, 0.022);
    for (let i = 0; i < 6; i++)
        box([0.255, 0.012, 0.022], [-0.20, 0.878, 0.39 + i * 0.043], m.steel, root, 0.004);
    tube([[0.43, 0.70, -0.18], [0.46, 0.54, 0], [0.47, 0.56, 0.31], [0.43, 0.72, 0.49]], 0.018, m.rubber);
    tube([[0.39, 0.72, -0.15], [0.42, 0.52, 0.02], [0.44, 0.51, 0.34], [0.37, 0.68, 0.55]], 0.010, m.edge);
    tube([[-0.42, 0.58, -0.22], [-0.44, 0.52, 0.07], [-0.41, 0.58, 0.33]], 0.013, m.rubber);
    for (let i = 0; i < 18; i++)
        batch(new THREE.BoxGeometry(0.008 + (i % 3) * 0.004, 0.008, 0.026), m.edge, root, [-0.41 + i * 0.047, 0.805 + (i % 2) * 0.006, -0.69]);
    cylinder(0.04, 0.15, [-0.34, 0.92, 0.64], m.steel);
    rod(new THREE.Vector3(-0.34, 0.98, 0.64), new THREE.Vector3(-0.36, 1.30, 0.65), 0.010, m.frame);
    rod(new THREE.Vector3(-0.36, 1.30, 0.65), new THREE.Vector3(-0.44, 1.58, 0.68), 0.007, m.steel);
    const wheels: THREE.Group[] = [];
    const suspensions: {
        first: THREE.Mesh;
        second: THREE.Mesh;
        anchor: THREE.Vector3;
        anchor2: THREE.Vector3;
        end: THREE.Vector3;
    }[] = [];
    const tireProfile = [[0.135, -0.103], [0.19, -0.105], [0.235, -0.088], [0.251, -0.060], [0.254, -0.035], [0.254, 0.035], [0.251, 0.060], [0.235, 0.088], [0.19, 0.105], [0.135, 0.103]].map(p => new THREE.Vector2(p[0], p[1]));
    for (const side of [-1, 1])
        for (const z of [-0.66, 0, 0.66]) {
            const wheel = new THREE.Group();
            wheel.name = `wheel-${side}-${z}`;
            wheel.rotation.order = 'YXZ';
            wheel.position.set(side * 0.66, WHEEL_RADIUS, z);
            root.add(wheel);
            wheels.push(wheel);
            batch(new THREE.LatheGeometry(tireProfile, 32), m.rubber, wheel, [0, 0, 0], [0, 0, Math.PI / 2]);
            cylinder(0.153, 0.19, [0, 0, 0], m.frame, wheel, [0, 0, Math.PI / 2], 24);
            cylinder(0.131, 0.018, [side * 0.109, 0, 0], m.steel, wheel, [0, 0, Math.PI / 2], 24);
            cylinder(0.061, 0.029, [side * 0.126, 0, 0], m.edge, wheel, [0, 0, Math.PI / 2], 16);
            ring(0.158, 0.008, [side * 0.101, 0, 0], m.edge, wheel, [0, Math.PI / 2, 0]);
            ring(0.210, 0.005, [side * 0.092, 0, 0], m.dust, wheel, [0, Math.PI / 2, 0]);
            for (let bolt = 0; bolt < 8; bolt++) {
                const a = bolt / 8 * Math.PI * 2;
                cylinder(0.011, 0.014, [side * 0.123, Math.cos(a) * 0.103, Math.sin(a) * 0.103], m.edge, wheel, [0, 0, Math.PI / 2], 6);
            }
            for (let tooth = 0; tooth < 24; tooth++) {
                const a = tooth / 24 * Math.PI * 2;
                for (const half of [-1, 1])
                    batch(new THREE.BoxGeometry(0.10, 0.022, 0.055), tooth % 7 === 0 ? m.dust : m.rubber, wheel, [half * 0.052, Math.cos(a + half * 0.035) * 0.253, Math.sin(a + half * 0.035) * 0.253], [a, half * 0.15, 0]);
            }
            const anchor = new THREE.Vector3(side * 0.39, 0.56, z * 0.68);
            const anchor2 = new THREE.Vector3(side * 0.43, 0.66, z * 0.68 + 0.09);
            const end = new THREE.Vector3(side * 0.60, WHEEL_RADIUS, z);
            const first = rod(anchor, end, 0.039, m.frame, root, true)!;
            const second = rod(anchor2, end, 0.020, m.steel, root, true)!;
            suspensions.push({ first, second, anchor, anchor2, end });
            cylinder(0.075, 0.11, [side * 0.48, 0.57, z * 0.68], m.edge, root, [0, 0, Math.PI / 2]);
        }
    cylinder(0.13, 0.08, [0, 0.88, -0.32], m.frame);
    cylinder(0.095, 0.15, [0, 0.98, -0.32], m.edge);
    cylinder(0.064, 0.26, [0, 1.15, -0.32], m.steel);
    cylinder(0.086, 0.042, [0, 1.27, -0.32], m.frame);
    for (const x of [-0.09, 0.09])
        fastener([x, 0.925, -0.32]);
    tube([[0.07, 1.25, -0.23], [0.13, 1.10, -0.17], [0.14, 0.94, -0.11], [0.22, 0.84, 0.03]], 0.014, m.rubber);
    const head = new THREE.Group();
    head.name = 'optical-head';
    head.position.set(0, 1.3, -0.32);
    root.add(head);
    const shellShape = new THREE.Shape([[-0.47, -0.145], [-0.39, -0.225], [0.39, -0.225], [0.47, -0.145], [0.47, 0.14], [0.39, 0.22], [-0.39, 0.22], [-0.47, 0.14]].map(p => new THREE.Vector2(p[0], p[1])));
    for (const x of [-0.22, 0.22]) {
        const hole = new THREE.Path();
        hole.absarc(x, 0, 0.174, 0, Math.PI * 2, true);
        shellShape.holes.push(hole);
    }
    batch(new THREE.ExtrudeGeometry(shellShape, { depth: 0.355, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 1, curveSegments: 24 }), m.paint, head, [0, 0, -0.19]);
    box([0.81, 0.34, 0.045], [0, 0, 0.14], m.frame, head, 0.03);
    // The optical apertures stop at a sealed rear service cover, facing away from the driver camera.
    polygon([[-0.445, -0.13], [-0.375, -0.198], [0.375, -0.198], [0.445, -0.13], [0.445, 0.13], [0.375, 0.195], [-0.375, 0.195], [-0.445, 0.13]], 0.035, [0, 0, 0.173], m.paint, head);
    box([0.39, 0.12, 0.008], [0, 0.025, 0.216], m.frame, head, 0.009);
    for (let i = 0; i < 5; i++)
        box([0.34, 0.009, 0.014], [0, -0.020 + i * 0.022, 0.225], m.edge, head, 0.003);
    for (const x of [-0.355, 0.355])
        for (const y of [-0.13, 0.13])
            fastener([x, y, 0.218], head, 'z', 0.012);
    const faceShape = new THREE.Shape([[-0.407, -0.14], [-0.35, -0.18], [0.35, -0.18], [0.407, -0.14], [0.407, 0.135], [0.35, 0.18], [-0.35, 0.18], [-0.407, 0.135]].map(p => new THREE.Vector2(p[0], p[1])));
    for (const x of [-0.22, 0.22]) {
        const hole = new THREE.Path();
        hole.absarc(x, 0, 0.166, 0, Math.PI * 2, true);
        faceShape.holes.push(hole);
    }
    batch(new THREE.ExtrudeGeometry(faceShape, { depth: 0.018, bevelEnabled: true, bevelThickness: 0.005, bevelSize: 0.004, bevelSegments: 1, curveSegments: 24 }), m.frame, head, [0, 0, -0.215]);
    for (const x of [-0.368, 0.368])
        for (const y of [-0.143, 0.145])
            fastener([x, y, -0.225], head, 'z', 0.018);
    for (const side of [-1, 1])
        fastener([side * 0.478, 0.07, 0.06], head, 'x', 0.019);
    box([0.55, 0.022, 0.035], [0, -0.206, -0.21], m.edge, head, 0.009);
    for (let i = 0; i < 14; i++)
        batch(new THREE.BoxGeometry(0.017 + (i % 3) * 0.008, 0.007, 0.025), m.edge, head, [-0.36 + i * 0.054, 0.224, -0.17 + (i % 2) * 0.015]);
    function optic(parent: THREE.Object3D, name: string): THREE.Mesh {
        ring(0.159, 0.016, [0, 0, -0.008], m.steel, parent);
        ring(0.143, 0.008, [0, 0, -0.025], m.cavity, parent);
        cylinder(0.139, 0.045, [0, 0, 0.012], m.cavity, parent, [Math.PI / 2, 0, 0], 28);
        for (const z of [-0.015, -0.004, 0.008])
            ring(0.149, 0.0025, [0, 0, z], m.edge, parent);
        const lens = mesh(new THREE.SphereGeometry(0.137, 28, 18), m.glass.clone(), parent);
        lens.name = name;
        lens.scale.z = 0.37;
        lens.position.z = -0.031;
        return lens;
    }
    const workingOptic = new THREE.Group();
    workingOptic.position.set(-0.22, 0, -0.20);
    head.add(workingOptic);
    const eye = optic(workingOptic, 'working-optical-glass');
    const socket = new THREE.Group();
    socket.name = 'optical-socket';
    socket.position.set(0.22, 0, -0.20);
    head.add(socket);
    ring(0.159, 0.019, [0, 0, -0.006], m.edge, socket);
    batch(new THREE.CylinderGeometry(0.138, 0.138, 0.15, 28, 1, true, Math.PI + 0.18, Math.PI * 2 - 0.36), m.steel, socket, [0, 0, 0.077], [Math.PI / 2, 0, 0]);
    batch(new THREE.CircleGeometry(0.137, 28), m.cavity, socket, [0, 0, 0.15], [0, Math.PI, 0]);
    for (const x of [-0.037, 0.037])
        box([0.016, 0.027, 0.075], [x, 0.137, 0.055], m.edge, socket, 0.004);
    for (const x of [-0.05, 0.05])
        box([0.026, 0.04, 0.012], [x, 0, 0.142], m.gold, socket, 0.002);
    const installedOptic = new THREE.Group();
    installedOptic.name = 'restored-optic';
    socket.add(installedOptic);
    optic(installedOptic, 'restored-optical-glass');
    installedOptic.visible = false;
    const module = new THREE.Group();
    module.name = 'keyed-optical-cartridge';
    cylinder(0.126, 0.14, [0, 0, 0.07], m.frame, module, [Math.PI / 2, 0, 0], 28);
    optic(module, 'cartridge-optical-glass');
    box([0.04, 0.022, 0.085], [0, 0.131, 0.08], m.steel, module, 0.003);
    for (const x of [-0.05, 0.05])
        box([0.025, 0.04, 0.012], [x, 0, 0.148], m.gold, module, 0.002);
    module.visible = false;
    const anchor = new THREE.Vector3(0.39, 0.86, -0.10);
    const shoulder = new THREE.Group();
    shoulder.position.copy(anchor);
    root.add(shoulder);
    cylinder(0.10, 0.16, [0, 0, 0], m.frame, shoulder, [0, 0, Math.PI / 2], 20);
    cylinder(0.07, 0.17, [0, 0, 0], m.steel, shoulder, [0, 0, Math.PI / 2], 20);
    const upper = mesh(new RoundedBoxGeometry(0.115, 0.50, 0.135, 1, 0.016), m.paint);
    const lower = mesh(new RoundedBoxGeometry(0.102, 0.50, 0.118, 1, 0.014), m.paintDark);
    const upperPiston = mesh(new THREE.BoxGeometry(0.075, 1, 0.085), m.steel, upper);
    const lowerPiston = mesh(new THREE.BoxGeometry(0.065, 1, 0.073), m.steel, lower);
    for (const part of [upper, lower]) {
        box([0.017, 0.42, 0.026], [-0.064, 0, 0], m.frame, part, 0.005);
        for (const y of [-0.19, 0.19])
            fastener([0, y, -0.070], part, 'z', 0.012);
    }
    const elbowJoint = new THREE.Group();
    root.add(elbowJoint);
    cylinder(0.077, 0.16, [0, 0, 0], m.frame, elbowJoint, [0, 0, Math.PI / 2], 20);
    cylinder(0.049, 0.175, [0, 0, 0], m.steel, elbowJoint, [0, 0, Math.PI / 2], 16);
    const claw = new THREE.Group();
    root.add(claw);
    box([0.22, 0.055, 0.11], [0, -0.018, 0.035], m.frame, claw, 0.010);
    cylinder(0.043, 0.10, [0, -0.065, 0.035], m.steel, claw);
    for (const side of [-1, 1]) {
        box([0.027, 0.12, 0.045], [side * 0.125, 0.055, 0.045], m.steel, claw, 0.008);
        box([0.038, 0.040, 0.065], [side * 0.116, 0.13, 0.025], m.rubber, claw, 0.007);
    }
    const target = new THREE.Vector3(), reach = new THREE.Vector3(), bend = new THREE.Vector3(), elbow = new THREE.Vector3(), direction = new THREE.Vector3();
    function placeLink(part: THREE.Mesh, piston: THREE.Mesh, from: THREE.Vector3, to: THREE.Vector3, length: number): void {
        direction.subVectors(to, from).normalize();
        part.position.copy(from).addScaledVector(direction, 0.25);
        part.quaternion.setFromUnitVectors(UP, direction);
        const extension = Math.max(0.03, length - 0.46);
        piston.scale.y = extension;
        piston.position.y = 0.21 + extension * 0.5;
    }
    function setArmTarget(requested: THREE.Vector3): void {
        if (![requested.x, requested.y, requested.z].every(Number.isFinite))
            return;
        reach.subVectors(requested, anchor);
        const distance = THREE.MathUtils.clamp(reach.length(), 0.08, 2.4);
        if (reach.lengthSq() < 1e-8)
            reach.set(0, 0, -1);
        reach.normalize();
        target.copy(anchor).addScaledVector(reach, distance);
        const length = THREE.MathUtils.clamp(distance * 0.5 + 0.065, 0.54, 1.22);
        bend.set(requested.y > 0.82 ? 1 : -0.15, requested.y > 0.82 ? 0.08 : 1, 0);
        bend.addScaledVector(reach, -bend.dot(reach));
        if (bend.lengthSq() < 0.001)
            bend.set(1, 0, 0).addScaledVector(reach, -reach.x);
        bend.normalize();
        elbow.copy(anchor).addScaledVector(reach, distance * 0.5).addScaledVector(bend, Math.sqrt(Math.max(0, length * length - distance * distance * 0.25)));
        placeLink(upper, upperPiston, anchor, elbow, length);
        placeLink(lower, lowerPiston, elbow, target, length);
        elbowJoint.position.copy(elbow);
        claw.position.copy(target);
        claw.rotation.set(0, 0, 0);
    }
    function placeSuspension(part: THREE.Mesh, a: THREE.Vector3, b: THREE.Vector3): void {
        direction.subVectors(b, a);
        part.position.copy(a).add(b).multiplyScalar(0.5);
        part.scale.y = direction.length();
        part.quaternion.setFromUnitVectors(UP, direction.normalize());
    }
    function setSuspension(offsets: readonly number[], steer = 0): void {
        const angle = Number.isFinite(steer) ? THREE.MathUtils.clamp(steer, -0.55, 0.55) : 0;
        for (let i = 0; i < wheels.length; i++) {
            const offset = Number.isFinite(offsets[i]) ? THREE.MathUtils.clamp(offsets[i], -0.19, 0.19) : 0;
            wheels[i].position.y = WHEEL_RADIUS + offset;
            wheels[i].rotation.y = i % 3 === 0 ? angle : i % 3 === 2 ? -angle * 0.35 : 0;
            const s = suspensions[i];
            s.end.y = wheels[i].position.y;
            placeSuspension(s.first, s.anchor, s.end);
            placeSuspension(s.second, s.anchor2, s.end);
        }
    }
    setArmTarget(new THREE.Vector3(0.48, 0.70, -0.5));
    setSuspension([]);
    for (const [parent, materials] of batches)
        for (const [material, geometries] of materials) {
            const g = mergeGeometries(geometries);
            if (g) {
                const part = mesh(g, material, parent);
                part.name = `batched-${material.name}`;
            }
            for (const geometry of geometries)
                geometry.dispose();
        }
    let previousTime: number | undefined;
    let previousSpeed = 0;
    function update(time: number, speed: number, repaired: boolean): void {
        installedOptic.visible = repaired;
        if (wreck)
            return;
        const dt = previousTime === undefined ? 0 : THREE.MathUtils.clamp(time - previousTime, 0, 0.1);
        previousTime = time;
        for (const wheel of wheels)
            wheel.rotation.x -= speed * dt / WHEEL_RADIUS;
        const acceleration = dt > 0 ? (speed - previousSpeed) / dt : 0;
        previousSpeed = speed;
        const smooth = 1 - Math.exp(-5 * dt);
        const pitch = (repaired ? 0 : 0.035) + THREE.MathUtils.clamp(acceleration * 0.007, -0.025, 0.025);
        head.rotation.x += (pitch - head.rotation.x) * smooth;
        head.rotation.y += (Math.sin(time * 0.38) * 0.012 - head.rotation.y) * smooth;
        head.rotation.z += ((repaired ? 0.004 : -0.025) - head.rotation.z) * smooth;
    }
    if (wreck)
        head.rotation.set(0.10, -0.08, 0.12);
    root.updateMatrixWorld(true);
    root.userData.rigBudget = { wheelRadius: WHEEL_RADIUS, wheelOrder: 'left-front,left-middle,left-rear,right-front,right-middle,right-rear' };
    return { root, head, socket, eye, module, arm: { upper, lower, claw }, wheels, setArmTarget, setSuspension, update };
}
