# Living Clock: short implementation guide

Read this before adding a scene; no need to repeat the product audit.

- `src/scripts/living-clock.ts` owns the canvas, real/preview time, resize, visibility, reduced motion and frame budget. Keep one shared loop.
- `src/scripts/living-aquarium.ts` is the small standalone renderer example: `(context, width, height, pixelRatio, date, reducedMotion) => void`. Start each frame with `setTransform`; balance save/restore and reset alpha/dashes.
- Add bilingual scene buttons in `src/components/LivingClock.astro`, and a lazy import in the controller. Lantern Isle is the default. Update the heading and legend when switching. Do not introduce another animation loop or external assets by default.
- Derive all clock motion from the supplied `Date`, not accumulated frames. `livingTime()` provides hour/minute/second, daylight and hourly transition. Previews must use that same date and remain clearly labeled.
- Existing limits: 2.4 million backing pixels, DPR at most 1.5, at most 30fps desktop / 20fps small screens; reduced motion 1fps. The shared controller pauses when hidden/offscreen.
- **Isle lesson:** paint water objects (boat AND wake) before raised terrain/buildings/pier. Painting the boat last made it sail over roofs. Place swim routes clear of foreground reefs; reason about the entire orbit, not one screenshot.
- Keep scene geometry clear of the numeric readout at the top and legend/controls at the bottom. Long English controls must wrap inside buttons, not push the toolbar over the legend. Scene chooser is on the right.
- Use explicit selectors: adding the scene `<details>` made a generic `querySelector('details')` target the wrong panel. Preview must close `.living-explore`.
- Minimal verification for a small scene: `npm run build`, one browser scene switch and visual inspection. Only expand checks if a defect warrants it. Physical-device battery/Safari testing remains outstanding; do not claim it passed.

Aquarium: hour changes water illumination, 60 coral pearls count completed minutes, orange clownfish loops once per minute. Jellyfish and small fish are decorative. Lighting is artistic, not an ocean/astronomy simulation.

Word Clock uses living-words.ts and semantic DOM/SVG rather than painted text. It shares preview time and the render loop; is-words hides the numeric overlay and scene legend. Korean uses native hour names and Sino-Korean minutes; English uses twelve-hour words with AM/PM. The thin ring counts seconds. No font downloads.

English grid: src/lib/word-matrix.ts defines an 18-column letter matrix. Hour and minute words have separate positions to preserve reading order (ONE OH ONE). word-matrix.test.ts checks all 1,440 daily hour/minute combinations. Each cell is one letter, never a whole-word list. The grid now replaces the old seconds ring; Korean uses a 6-column character matrix.

Aquarium motion: decorative shoals, individual fish, ray and jellyfish traverse viewport-relative offscreen margins. Wrap only beyond the full silhouette; never wrap at reef bounds. Tail/fin and bell/tentacle phases differ per creature. Hero fish retains the 60-second orbit and uses continuous horizontal foreshortening when turning. Keep decorative time frozen under reduced motion.
