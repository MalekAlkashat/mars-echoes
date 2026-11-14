# Optical recovery interaction proposal

The user selected third-person exploration with brief optical-feed views, an optical module salvaged from another discarded rover, and a small positioning puzzle. The opening uses stage-two damage and conveys emotion through movement and sound with minimal text.

## Proposed sequence

1. Wake with one usable optical channel. Keep ordinary third-person navigation readable; sensing failures and short feed interruptions communicate the damaged eye without blurring the external camera.
2. Follow a short visible route to the selected donor rover. It is completely inactive and stays quiet. A brief optical view inspects its compatible module.
3. The arm retrieves the cartridge through an authored motion. The player does not need to solve joint-by-joint robotic control unless that is separately selected.
4. Enter a service pose. The mast lowers and the arm brings the replacement toward the damaged socket. A close third-person view shows component, keyed connector and socket together.
5. Solve a small positioning puzzle. Proposed controls move the held component in a constrained alignment plane and adjust its orientation; the arm follows that bounded target. This remains a positioning puzzle, with the component visible in the scene. Exact keys, axes and tolerance remain proposals.
6. An insertion input is accepted once alignment is sufficient. Proposed failure behavior is a gentle mechanical stop and retry rather than breaking the part or ending the scene. Complete the latch through a short authored motion.
7. A brief optical-feed calibration shows the repaired channel stabilizing. Return to third person; the repaired eye, steadier head and responsive movement make success visible. This repairs an optic, not the rover's entire damaged body.

## Physical and presentation checks

The active eye cannot look directly at its own socket. Use optical feed for donor inspection and the repaired view; use an external close-up for the assembly itself unless a different justified viewpoint is selected. Do not add an unexplained extra camera to the model.

Verify arm reach, clearance and mast movement with the real model. Use separate transforms for socket, module, arm joints and head. Keep insertion alignment independent of terrain physics. The donor must be reachable despite the protagonist's damaged mobility.

## Completion evidence

The donor can be found; the module is retrieved once; positioning visibly changes its alignment; out-of-tolerance insertion gives clear recoverable feedback; successful insertion updates the optic and sensing state; camera and controls return correctly; reset restores donor, module and rover state. These are future checks, not completed implementation.

## Continuation

After restoring vision, the protagonist tries to reach mission control, still expecting a response. The original mission and the source of continued operation after decommissioning remain to be established.
