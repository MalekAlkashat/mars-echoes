import { CylinderGeometry, Group, Mesh, MeshBasicMaterial, SphereGeometry } from 'three';

/** Temporary humanoid silhouette; final character art remains undecided. */
export function createSpiritAppearance(): Group {
  const root = new Group();
  root.name = 'placeholder-humanoid-spirit';
  const material = new MeshBasicMaterial({ color: '#d4e4e6', transparent: true, opacity: .42, depthWrite: false });
  const body = new Mesh(new CylinderGeometry(.13, .23, .65, 10), material);
  body.position.y = .59;
  const head = new Mesh(new SphereGeometry(.135, 14, 10), material);
  head.position.y = 1.08;
  root.add(body, head);
  for (const side of [-1, 1]) {
    const arm = new Mesh(new CylinderGeometry(.045, .025, .53, 7), material);
    arm.position.set(side * .24, .58, 0);
    arm.rotation.z = side * .17;
    root.add(arm);
    const lower = new Mesh(new CylinderGeometry(.075, .01, .34, 7), material);
    lower.position.set(side * .085, .14, 0);
    root.add(lower);
  }
  root.traverse(object => { object.userData.excludeAO = true; });
  return root;
}
