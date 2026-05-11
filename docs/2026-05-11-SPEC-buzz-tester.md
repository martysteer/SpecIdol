# Buzz Tester — Sound Design Sandbox

## Context

SpecIdol's 5 buzz sounds (150-240 Hz, simple waveforms) are too tame. Need a tool to experiment with obnoxious synth recipes and export winners back into `sounds.js`. Research shows maximum annoyance lives at 2000-5000 Hz with distortion, FM synthesis, beating frequencies, and filtered noise.

## What We're Building

Standalone `www/buzz-tester.html` — sandbox + export tool for designing buzzer sounds using Web Audio API synthesis. Matches project's neon-retro aesthetic.

## Architecture: Single File

One HTML file with inline `<style>` and `<script>`. Loads existing `sounds.js` for comparison playback. Matches `judge-test.html` pattern.

## Files

- **Create**: `www/buzz-tester.html`
- **Reference only**: `www/sounds.js` (loaded via script tag), `www/style.css` (loaded for shared vars)

## Page Layout

### Header
"BUZZ TESTER" in Press Start 2P, neon green, subtitle "Sound Design Sandbox"

### Three Sections

**1. Preset Grid**
Named preset buttons in category groups. Click loads params into controls.

| Category | Presets |
|----------|---------|
| Game Show | Classic Buzzer, Tritone Doom, Wrong Answer, Air Horn |
| Emergency/Alarm | EAS Alert, Siren Wail, Alarm Clock, Feedback Screech |
| Retro Tech | Dial-Up Modem, Fax Screech, Bitcrushed Buzz |
| Extreme | Max Irritation, The Exorcist, Dental Drill, Mosquito Pulse |
| Horns/Bells | Foghorn, Ship Bell, Klaxon, Bicycle Horn |
| Current Game | Buzz 0-4 (existing sounds for A/B comparison) |

Active preset highlighted with neon border.

**2. Controls Panel**
Two-column grid, ~10 controls:

| Control | Type | Range | Default |
|---------|------|-------|---------|
| Waveform 1 | Select | sine/square/sawtooth/triangle | sawtooth |
| Frequency 1 | Slider (log) | 40-8000 Hz | 220 |
| Waveform 2 | Select | off/sine/square/sawtooth/triangle | off |
| Frequency 2 | Slider (log) | 40-8000 Hz | 220 |
| Volume | Slider | 0.0-1.0 | 0.3 |
| Duration | Slider | 0.1-3.0s | 0.5 |
| Distortion | Slider | 0-600 | 0 |
| Filter Freq | Slider (log) | 100-10000 Hz | 1000 |
| Filter Q | Slider | 0.1-50 | 1 |
| Detune | Slider | -50 to +50 Hz | 0 |

Log-scale sliders for frequency (more resolution where pitch differences matter). Each shows current numeric value.

**3. Action Bar**
- **PLAY** — big neon green button, plays current config
- **EXPORT CODE** — generates standalone `playBuzzX()` function, copies to clipboard, "Copied!" flash
- **Existing Sounds** — row of small buttons: Buzz 0-4, Ahooga, Fanfare, Final Combo (calls `sounds.js` functions)

## Synth Engine

`playSynthSound(params)` builds Web Audio graph from config object:

```
Signal chain: Oscillator(s) -> [WaveShaperNode] -> [BiquadFilter] -> GainNode -> destination
```

- 1-2 oscillators based on osc1/osc2 config
- WaveShaperNode with sigmoid distortion curve (bypassed when amount=0)
- BiquadFilterNode bandpass (bypassed when Q <= 0.5)
- Gain envelope: 5ms attack ramp, hold, exponential decay to 0.01

## Preset Parameters

| # | Name | Osc1 | Freq1 | Osc2 | Freq2 | Vol | Dur | Dist | FiltF | FiltQ | Det |
|---|------|------|-------|------|-------|-----|-----|------|-------|-------|-----|
| 1 | Classic Buzzer | saw | 220 | off | — | 0.3 | 0.3 | 200 | 1000 | 1 | 0 |
| 2 | Tritone Doom | saw | 300 | sqr | 424 | 0.4 | 0.6 | 200 | 1000 | 1 | 0 |
| 3 | Wrong Answer | saw | 250 | sqr | 354 | 0.4 | 0.5 | 150 | 1000 | 1 | 0 |
| 4 | Air Horn | saw | 500 | saw | 510 | 0.5 | 1.0 | 100 | 1000 | 1 | 0 |
| 5 | EAS Alert | sin | 853 | sin | 960 | 0.4 | 2.0 | 0 | 1000 | 1 | 0 |
| 6 | Siren Wail | saw | 800 | saw | 1600 | 0.4 | 2.0 | 100 | 1000 | 1 | 0 |
| 7 | Alarm Clock | sqr | 2500 | sqr | 2510 | 0.3 | 1.0 | 0 | 3000 | 5 | 0 |
| 8 | Feedback Screech | saw | 3500 | off | — | 0.3 | 1.0 | 300 | 3500 | 40 | 0 |
| 9 | Dial-Up Modem | sin | 1070 | sin | 1270 | 0.3 | 0.5 | 0 | 1000 | 1 | 0 |
| 10 | Fax Screech | sin | 1100 | sin | 2100 | 0.3 | 1.0 | 0 | 1500 | 3 | 0 |
| 11 | Bitcrushed Buzz | sqr | 250 | off | — | 0.3 | 0.5 | 500 | 1000 | 1 | 0 |
| 12 | Max Irritation | saw | 3500 | saw | 3503 | 0.3 | 0.5 | 400 | 3500 | 15 | 0 |
| 13 | The Exorcist | saw | 3500 | sqr | 3507 | 0.3 | 1.0 | 600 | 3500 | 20 | 0 |
| 14 | Dental Drill | sin | 4000 | sin | 4200 | 0.3 | 1.5 | 200 | 4000 | 10 | 0 |
| 15 | Mosquito Pulse | sin | 8000 | off | — | 0.3 | 0.5 | 0 | 8000 | 5 | 0 |
| 16 | Foghorn | saw | 80 | saw | 82 | 0.5 | 1.5 | 0 | 1000 | 1 | 0 |
| 17 | Ship Bell | tri | 1200 | tri | 1205 | 0.3 | 0.8 | 0 | 2400 | 8 | 0 |
| 18 | Klaxon | saw | 400 | sqr | 400 | 0.4 | 0.8 | 150 | 1000 | 1 | 0 |
| 19 | Bicycle Horn | sin | 500 | sin | 630 | 0.4 | 0.3 | 0 | 1000 | 1 | 0 |
| 20 | Buzz 0 (Current) | saw | 220 | off | — | 0.3 | 0.2 | 0 | 1000 | 1 | 0 |
| 21 | Buzz 1 (Current) | sqr | 180 | off | — | 0.3 | 0.2 | 0 | 1000 | 1 | 0 |
| 22 | Buzz 2 (Current) | saw | 200 | sqr | 200 | 0.3 | 0.2 | 0 | 1000 | 1 | 0 |
| 23 | Buzz 3 (Current) | tri | 240 | off | — | 0.3 | 0.2 | 0 | 1000 | 1 | 0 |
| 24 | Buzz 4 (Current) | sqr | 190 | off | — | 0.3 | 0.2 | 0 | 1000 | 1 | -40 |

## Export Feature

"Export Code" reads current slider values, generates self-contained function:

```javascript
// Generated by Buzz Tester — "Air Horn"
function playBuzzCustom(ctx, startTime, duration) {
    var osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.value = 500;
    // ... full Web Audio setup
}
```

Uses `navigator.clipboard.writeText()` with textarea fallback. Shows "Copied!" toast.

## Styling

- Inherits `style.css` (neon-green, black bg, Press Start 2P)
- Preset grid: `grid-template-columns: repeat(auto-fill, minmax(160px, 1fr))`
- Category headers: neon-magenta
- Active preset: neon-green border glow
- Play button: large, pulsing border animation
- Responsive: single column on mobile

## Accessibility

- `prefers-reduced-motion`: show notice that sound tester requires audio
- All controls labeled
- Keyboard navigable
- Slider values via aria-valuenow

## Verification

1. Open `buzz-tester.html` in browser
2. Click presets — sliders update to preset values
3. Click PLAY — sound plays matching parameters
4. Adjust sliders — sound changes accordingly
5. Click Export Code — clipboard has valid JS function
6. Test existing sound buttons — play correctly via sounds.js
7. Test mobile viewport — layout stacks
8. Test prefers-reduced-motion — graceful handling
