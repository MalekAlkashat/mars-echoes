# Menu music, user supplied

Original `Music intro.wav` copied unchanged from `C:/Users/hazem/Downloads/Music intro.wav` on 14 November 2026.

- SHA-256: `bf07708aec52e02483b1cc4b9fab1308d8e3950c72da2f284915c2a84b7e8ee4`
- Stereo 16-bit PCM WAV, 44,100 Hz, 279,174 frames, 6.3305 seconds, 1,116,740 bytes
- No external source/license documentation accompanied the file. It is user supplied, not claimed as NASA or CC0.

Runtime derivative: `game/public/assets/audio/menu-music-v1/intro-loop.wav` (stereo 16-bit PCM/44.1 kHz).

Reproduce with `python scripts/prepare-menu-audio.py`. The script takes the central 1.75–4.0 seconds, applies stereo-linked slow envelope levelling, stretches the phrase by3 using waveform-similarity overlap-add without playback-rate pitch change, and bakes a 400 ms equal-power overlap. A second cyclic envelope pass levels the result to about RMS .14. The resulting 6.22-second loop repeats indefinitely in the main menu, including its Settings overlay. Music fades out when starting/continuing gameplay and resumes when returning to the title. Browser audio starts after a user gesture; background windows do not keep playing it.

`processing.json` records source/output hashes and measured quarter-second RMS (.132–.146 in this version), peak .497 and loop boundary delta .0068. Originals are preserved. Master × Music controls level independently of Effects, with Mute applying to both. No external music or paid generation was used. Listening acceptance remains with the user.
