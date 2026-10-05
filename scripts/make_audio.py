"""Generate SFX + music bed for the MGCHORD promo. Usage: python3 scripts/make_audio.py"""
import numpy as np, subprocess, wave, os
from scipy.signal import lfilter, butter

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "sfx")
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)

def t(d): return np.arange(int(SR * d)) / SR
def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def env_ad(n, a, dec):
    x = np.arange(n) / SR
    return np.minimum(1, x / max(a, 1e-4)) * np.exp(-x / dec)
def lp(x, f, order=2): b, a = butter(order, f / (SR / 2), "low"); return lfilter(b, a, x)
def hp(x, f, order=2): b, a = butter(order, f / (SR / 2), "high"); return lfilter(b, a, x)
def bp(x, lo, hi): b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], "band"); return lfilter(b, a, x)
def saw(f, tt): return 2 * ((f * tt) % 1) - 1
def norm(x, peak=0.89): return x / (np.max(np.abs(x)) + 1e-9) * peak
def verb(x, tail=0.5, mix=0.25):
    n = int(SR * tail); ir = rng.standard_normal(n) * np.exp(-np.arange(n) / (SR * tail / 4))
    ir = lp(ir, 5000); y = np.convolve(x, ir / np.sum(np.abs(ir)) * 3)[: len(x) + n]
    out = np.zeros(len(y)); out[: len(x)] += x * (1 - mix); return out + y * mix

def save(name, x, stereo=False):
    x = np.clip(x, -1, 1)
    wav = os.path.join(OUT, name + ".wav")
    d = (x * 32767).astype(np.int16)
    with wave.open(wav, "wb") as w:
        w.setnchannels(2 if stereo else 1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.stack([d, d], 1) if (stereo and d.ndim == 1) else d).tobytes())
    mp3 = os.path.join(OUT, name + ".mp3")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-b:a", "160k", mp3], check=True)
    os.remove(wav)
    print(name, round(len(x) / SR, 2), "s")

# ---------- SFX ----------
def whoosh():
    d = 0.8; tt = t(d); n = rng.standard_normal(len(tt))
    f = 250 * (14 ** (tt / d)); out = np.zeros(len(tt)); step = 512
    for i in range(0, len(tt), step):
        c = f[i]; out[i:i + step] = bp(n[max(0, i - 2048):i + step], c * 0.7, min(c * 1.6, 18000))[-len(out[i:i + step]):]
    e = np.sin(np.pi * np.clip(tt / d, 0, 1)) ** 1.5
    return norm(out * e) * 0.9

def impact():
    d = 1.6; tt = t(d)
    sub = np.sin(2 * np.pi * (38 + 90 * np.exp(-tt * 14)) * tt) * np.exp(-tt * 2.6)
    nz = lp(rng.standard_normal(len(tt)), 2500) * np.exp(-tt * 9) * 0.6
    crack = hp(rng.standard_normal(len(tt)), 3000) * np.exp(-tt * 45) * 0.5
    return norm(verb(sub + nz + crack, 0.9, 0.25)[: len(tt)])

def riser():
    d = 1.0; tt = t(d)
    nz = bp(rng.standard_normal(len(tt)), 400, 9000) * (tt / d) ** 2
    tone = np.sin(2 * np.pi * np.cumsum(200 * 7 ** (tt / d)) / SR) * (tt / d) ** 2 * 0.5
    return norm(nz + tone) * 0.85

def pop(f0=720):
    tt = t(0.16); x = np.sin(2 * np.pi * np.cumsum(f0 * np.exp(-tt * 12)) / SR) * np.exp(-tt * 22)
    x += hp(rng.standard_normal(len(tt)), 4000) * np.exp(-tt * 140) * 0.3
    return norm(x)

def click():
    tt = t(0.09); x = np.sin(2 * np.pi * 1300 * tt) * np.exp(-tt * 70)
    x += rng.standard_normal(len(tt)) * np.exp(-tt * 500) * 0.6
    return norm(lp(x, 8000))

def tick():
    tt = t(0.07); return norm(np.sin(2 * np.pi * 1900 * tt) * np.exp(-tt * 55) + np.sin(2 * np.pi * 3800 * tt) * np.exp(-tt * 80) * 0.3) * 0.7

def thud():
    tt = t(0.45); x = np.sin(2 * np.pi * (45 + 80 * np.exp(-tt * 25)) * tt) * np.exp(-tt * 9)
    x += lp(rng.standard_normal(len(tt)), 1500) * np.exp(-tt * 40) * 0.5
    return norm(x)

def ping():
    tt = t(1.2); x = sum(a * np.sin(2 * np.pi * f * tt) * np.exp(-tt * d) for f, a, d in [(880, 1, 4), (1320, .5, 5), (1760, .35, 6), (2640, .15, 8)])
    return norm(verb(x, 0.6, 0.3)[: len(tt)]) * 0.8

def shimmer():
    d = 1.6; tt = t(d); x = np.zeros(len(tt))
    for i, m in enumerate([84, 87, 91, 94, 96]):
        s = int(i * 0.1 * SR); n = len(tt) - s
        x[s:] += np.sin(2 * np.pi * hz(m) * tt[:n]) * np.exp(-tt[:n] * 2.5) * (1 + 0.4 * np.sin(2 * np.pi * 7 * tt[:n]))
    return norm(verb(x, 0.8, 0.35)[: len(tt)]) * 0.7

CM = [48, 60, 63, 67, 72]
def stab(kind):
    d = 1.6; tt = t(d); x = np.zeros(len(tt))
    for m in CM:
        f = hz(m)
        if kind == "piano":
            v = sum(a * np.sin(2 * np.pi * f * k * (1 + 0.0004 * k * k) * tt) for k, a in [(1, 1), (2, .5), (3, .3), (4, .15), (5, .08)]) * np.exp(-tt * (2.2 + (m - 48) / 30))
        elif kind == "pad":
            v = sum(saw(f * (1 + dt), tt) for dt in (-0.006, 0, 0.006)) / 3; v = lp(v, 1800) * np.minimum(1, tt / 0.25) * np.exp(-np.maximum(tt - 0.7, 0) * 2.2)
        else:
            v = lp(saw(f, tt) + 0.5 * saw(f * 2.005, tt), 3500) * np.exp(-tt * 9)
        x += v
    return norm(verb(x, 0.7, 0.2)[: len(tt)]) * 0.85

SFX = dict(whoosh=whoosh(), impact=impact(), riser=riser(), pop=pop(), pop_hi=pop(980), click=click(), tick=tick(), thud=thud(), ping=ping(), shimmer=shimmer(),
           stab_piano=stab("piano"), stab_pad=stab("pad"), stab_pluck=stab("pluck"))
for k, v in SFX.items(): save(k, v, stereo=True)

# ---------- music bed: 120 bpm, 18 bars, Cm - Ab - Eb - Bb ----------
BPM = 120; BAR = 60 / BPM * 4; BARS = 18; N = int(SR * BAR * BARS)
chords = [[48, 60, 63, 67], [44, 56, 60, 63], [51, 63, 67, 70], [46, 58, 62, 65]]
L = np.zeros(N); R = np.zeros(N)

def add(buf, x, at):
    s = int(at * SR); e = min(N, s + len(x))
    if s < N: buf[s:e] += x[: e - s]

for b in range(BARS):
    ch = chords[b % 4]; at = b * BAR; d = BAR + 0.25; tt = t(d)
    for m in ch[1:]:
        pad = np.zeros(len(tt))
        for dt in (-0.007, 0.0, 0.007): pad += saw(hz(m) * (1 + dt), tt)
        pad = lp(pad / 3, 1400 + 600 * (b >= 2)) * np.minimum(1, tt / 0.35) * np.minimum(1, (d - tt) / 0.25) * 0.16
        add(L, pad, at); add(R, np.roll(pad, 40), at)
    sub = np.sin(2 * np.pi * hz(ch[0] - 12) * tt) * np.minimum(1, tt / 0.02) * np.minimum(1, (d - tt) / 0.1) * 0.42
    add(L, sub, at); add(R, sub, at)
    if b >= 2:   # arp 8ths
        for i in range(8):
            m = [ch[1], ch[2], ch[3], ch[2] + 12][i % 4] + (12 if i % 4 == 3 else 0); tt2 = t(0.5)
            p = lp(saw(hz(m + 12), tt2) + 0.4 * saw(hz(m + 12) * 2.003, tt2), 3200) * np.exp(-tt2 * 9) * 0.13
            add(L, p * (0.8 if i % 2 else 1.1), at + i * BAR / 8); add(R, p * (1.1 if i % 2 else 0.8), at + i * BAR / 8)
    for beat in range(4):   # drums
        bt = at + beat * BAR / 4
        if b >= 3:
            k = t(0.35); kick = np.sin(2 * np.pi * (45 + 110 * np.exp(-k * 28)) * k) * np.exp(-k * 8) * 0.75
            add(L, kick, bt); add(R, kick, bt)
        if b >= 4:
            h = hp(rng.standard_normal(int(SR * 0.05)), 7000) * np.exp(-t(0.05) * 90) * 0.12
            add(L, h, bt + BAR / 8); add(R, h, bt + BAR / 8)
        if b >= 6 and beat in (1, 3):
            cl = bp(rng.standard_normal(int(SR * 0.2)), 1200, 6000) * np.exp(-t(0.2) * 22) * 0.22
            add(L, cl, bt); add(R, cl, bt)

fade = np.ones(N); fi = int(SR * 0.6); fo = int(SR * 1.5)
fade[:fi] = np.linspace(0, 1, fi); fade[-fo:] = np.linspace(1, 0, fo)
L *= fade; R *= fade
peak = max(np.max(np.abs(L)), np.max(np.abs(R))); L, R = L / peak * 0.85, R / peak * 0.85
wav = os.path.join(OUT, "bed.wav")
d = (np.stack([L, R], 1) * 32767).astype(np.int16)
with wave.open(wav, "wb") as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(d.tobytes())
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-b:a", "160k", os.path.join(OUT, "bed.mp3")], check=True); os.remove(wav)
print("bed", BAR * BARS, "s")
