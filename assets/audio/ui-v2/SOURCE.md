# Immediate menu click derivative

Original retained at `assets/audio/ui-v1/clicking.wav`, supplied by the user. Runtime v1 remains preserved. Source metadata/hash is in that folder's SOURCE.md.

Runtime v2: `game/public/assets/audio/ui-v2/clicking.wav`. Derived with `python scripts/prepare-menu-audio.py` using only the original WAV: slice .108–.175 seconds, .3 ms attack and 2.5 ms release. This removes the source's 100 ms silent lead and second transient, leaving a single 67 ms click. Original stereo 24-bit PCM/44.1 kHz encoding is retained. No synthesis or external sound was added.

Source/output hashes are recorded in `assets/audio/menu-music-v1/processing.json`.
