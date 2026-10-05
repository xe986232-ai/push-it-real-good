# Remotion Motion

Dua komposisi:
- **MgchordPromo** — video promo/review plugin MGCHORD (36 detik, 1920x1080, 30fps, lengkap dengan sound effect + musik latar)
- **MotionIntro** — intro teks 6 detik

## Scripts
```bash
npm install
npm run dev              # web preview (Vite + @remotion/player)
npm run build            # build web ke dist/ (dipakai Vercel)
npm run studio           # Remotion Studio (scrubber)
npm run render:mgchord   # render MP4 promo MGCHORD -> out/mgchord-promo.mp4 (jalanin di lokal)
npm run render:web       # render MP4 -> public/mgchord-promo.mp4 (file ini yang dipakai tombol Download di web)
npm run render           # render MP4 intro -> out/intro.mp4
npm run audio            # bikin ulang SFX + musik (butuh python3, numpy, scipy, ffmpeg)
```

## Struktur MGCHORD
- `src/mgchord/Promo.tsx`  : timeline, kamera zoom, caption, wipe, outro, cue audio
- `src/mgchord/ui.tsx`     : tiruan UI plugin (piano roll, keyboard, timeline)
- `src/mgchord/data.ts`    : timing frame, chord, pola 12 style
- `scripts/make_audio.py`  : sintesis SFX + musik -> `public/sfx/*.mp3`

Render offline tanpa Google Fonts: `REMOTION_NO_GFONT=1` (pakai font Nunito dari sistem).

## Catatan deploy
Vercel nggak bisa render MP4 (Chrome butuh libnss3), jadi di Vercel cukup `npm run build`.
