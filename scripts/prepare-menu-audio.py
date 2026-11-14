"""Reproducible local WAV edits; Python standard library only. Originals stay intact."""
from array import array
from pathlib import Path
import hashlib
import json
import math
import wave

ROOT = Path(__file__).resolve().parent.parent


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_wave(path, samples, rate):
    path.parent.mkdir(parents=True, exist_ok=True)
    encoded = array('h', (round(max(-.999, min(.999, value)) * 32767) for value in samples))
    with wave.open(str(path), 'wb') as output:
        output.setparams((2, 2, rate, len(encoded) // 2, 'NONE', 'not compressed'))
        output.writeframes(encoded.tobytes())


def level(samples, rate, cyclic=False, target=.15):
    """Stereo-linked slow gain avoids changing stereo balance or pumping on transients."""
    block = round(rate * .05)
    frames = len(samples) // 2
    rms = []
    for start in range(0, frames, block):
        chunk = samples[start * 2:min(frames, start + block) * 2]
        rms.append(math.sqrt(sum(value * value for value in chunk) / len(chunk)))
    gains = []
    for index in range(len(rms)):
        neighbours = [rms[(index + offset) % len(rms)] if cyclic else rms[min(len(rms)-1, max(0, index+offset))] for offset in range(-2, 3)]
        local = math.sqrt(sum(value * value for value in neighbours) / len(neighbours))
        gains.append(max(.3, min(2.5, target / max(.015, local))))
    result = array('f')
    for frame in range(frames):
        index, fraction = divmod(frame / block, 1)
        index = int(index)
        following = gains[(index + 1) % len(gains)] if cyclic else gains[min(index + 1, len(gains)-1)]
        gain = gains[index] * (1-fraction) + following * fraction
        result.extend((samples[frame*2] * gain, samples[frame*2+1] * gain))
    return result


def stretch_wsola(samples, rate, factor=3):
    """Waveform-similarity overlap-add: extend the phrase without rate/pitch slowdown."""
    window = round(rate * .06)
    hop = round(rate * .02)
    search = round(rate * .012)
    frames = len(samples) // 2
    length = round((frames-window) * factor) + window
    left = array('f', [0]) * length
    right = array('f', [0]) * length
    weights = array('f', [0]) * length
    mono = array('f', ((samples[i] + samples[i+1]) * .5 for i in range(0, len(samples), 2)))
    taper = [math.sin(math.pi * (index+.5) / window) ** 2 for index in range(window)]
    overlap = window-hop
    stride = 24
    for output in range(0, length-window+1, hop):
        expected = min(frames-window, round(output/factor))
        selected = expected
        if output:
            targets = [(left[output+i]+right[output+i]) / max(2*weights[output+i], 1e-6) for i in range(0, overlap, stride)]
            offsets = range(max(0, expected-search), min(frames-window, expected+search)+1, stride)
            best = -math.inf
            for candidate in offsets:
                dot = power = 0.
                for index, target in enumerate(targets):
                    value = mono[candidate+index*stride]
                    dot += value*target
                    power += value*value
                score = dot / math.sqrt(max(power, 1e-12))
                if score > best:
                    best, selected = score, candidate
        for index, weight in enumerate(taper):
            dest, source = output+index, (selected+index)*2
            left[dest] += samples[source]*weight
            right[dest] += samples[source+1]*weight
            weights[dest] += weight
    result = array('f')
    # The final partial hop is omitted rather than emitting an unfilled tail.
    end = next((i for i in range(length-1, 0, -1) if weights[i] > 1e-6), 0)+1
    for index in range(end):
        weight = max(weights[index], 1e-6)
        result.extend((left[index]/weight, right[index]/weight))
    return result


def seamless(samples, rate):
    fade = round(rate*.4)
    frames = len(samples)//2
    result = array('f', samples[fade*2:(frames-fade)*2])
    for index in range(fade):
        angle = (index+.5)/fade*math.pi/2
        for channel in range(2):
            tail = samples[(frames-fade+index)*2+channel]
            head = samples[index*2+channel]
            result.append(tail*math.cos(angle)+head*math.sin(angle))
    return result


click_source = ROOT/'assets/audio/ui-v1/clicking.wav'
click_output = ROOT/'game/public/assets/audio/ui-v2/clicking.wav'
with wave.open(str(click_source), 'rb') as source:
    rate, channels, width = source.getframerate(), source.getnchannels(), source.getsampwidth()
    assert (channels, width) == (2, 3)
    start, end = round(rate*.108), round(rate*.175)
    click_frames=end-start
    source.setpos(start)
    data = bytearray(source.readframes(end-start))
    for frame in range(end-start):
        gain = min(1, (frame+1)/(rate*.0003), (end-start-1-frame)/(rate*.0025))
        if gain >= 1:
            continue
        for channel in range(channels):
            offset = (frame*channels+channel)*width
            sample = int.from_bytes(data[offset:offset+width], 'little', signed=True)
            data[offset:offset+width] = round(sample*max(0, gain)).to_bytes(width, 'little', signed=True)
    click_output.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(click_output), 'wb') as output:
        output.setparams((channels, width, rate, end-start, 'NONE', 'not compressed'))
        output.writeframes(data)

music_source = ROOT/'assets/audio/menu-music-v1/Music intro.wav'
music_output = ROOT/'game/public/assets/audio/menu-music-v1/intro-loop.wav'
with wave.open(str(music_source), 'rb') as source:
    rate = source.getframerate()
    assert (source.getnchannels(), source.getsampwidth()) == (2, 2)
    source.setpos(round(rate*1.75))
    original = array('h', source.readframes(round(rate*2.25)))
    middle = array('f', (sample/32768 for sample in original))
music = level(middle, rate)
music = stretch_wsola(music, rate, 3)
music = level(seamless(music, rate), rate, cyclic=True, target=.14)
peak = max(abs(sample) for sample in music)
headroom = min(1, .8/peak)
music = array('f', (sample*headroom for sample in music))
write_wave(music_output, music, rate)
quarters = []
for start in range(0, len(music)-round(rate*.25)*2, round(rate*.25)*2):
    chunk = music[start:start+round(rate*.25)*2]
    quarters.append(round(math.sqrt(sum(sample*sample for sample in chunk)/len(chunk)), 5))
report = {
    'click': {'sourceSha256': digest(click_source), 'outputSha256': digest(click_output), 'sliceSeconds':[.108,.175], 'seconds':click_frames/rate, 'edit':'First transient only; .3 ms attack / 2.5 ms release; original preserved'},
    'music': {'sourceSha256': digest(music_source), 'outputSha256': digest(music_output), 'sourceSliceSeconds':[1.75,4], 'stretchFactor':3, 'stretchMethod':'stereo-linked waveform similarity overlap-add', 'crossfadeSeconds':.4, 'seconds':len(music)/(rate*2), 'peak':round(max(abs(v) for v in music),5), 'rms250ms':quarters, 'loopBoundaryDelta':round(max(abs(music[-2+i]-music[i]) for i in range(2)),6)}
}
(ROOT/'assets/audio/menu-music-v1/processing.json').write_text(json.dumps(report, indent=2)+'\n')
print(json.dumps(report))
