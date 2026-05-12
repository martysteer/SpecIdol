# Buzz Tester — Sound Reference

Complete catalog of all synthesized sounds in `www/buzz-tester.html`. Each sound is built from Web Audio API primitives: oscillators, waveshapers (distortion), bandpass filters, and gain envelopes.

## Signal Chain

```
Oscillator 1 ──┐
                ├──▶ [WaveShaper] ──▶ [BiquadFilter] ──▶ GainNode ──▶ speakers
Oscillator 2 ──┘     (distortion)     (bandpass)         (envelope)
```

- **Waveforms**: sine (pure tone), square (hollow/buzzy), sawtooth (bright/harsh), triangle (soft/round)
- **Distortion**: Sigmoid transfer curve, 0 = clean, 600 = maximum filth. Adds odd harmonics that make everything sound broken.
- **Filter**: Bandpass BiquadFilterNode. High Q = narrow resonant peak (screechy). Low Q ≤ 1 = effectively bypassed.
- **Envelope**: 5ms attack ramp, sustain at 80% of duration, exponential decay to 0.001.
- **Beating**: Two oscillators a few Hz apart create amplitude wobble at the difference frequency. 3 Hz apart = 3 wobbles/second. The tighter the interval, the more nauseous.

---

## Single Presets (71 total)

### Game Show (7)

| Preset | Construction | Why It Works |
|--------|-------------|-------------|
| **Classic Buzzer** | Sawtooth 220 Hz, distortion 200 | The ur-buzzer. Sawtooth is harmonically rich, distortion adds grit. Low enough to feel authoritative. |
| **Tritone Doom** | Sawtooth 300 + square 424 Hz, distortion 200 | The tritone (300:424 ≈ 1:√2) — the "devil's interval." Two dissonant waveforms clashing. Medieval monks banned this. |
| **Wrong Answer** | Sawtooth 250 + square 354 Hz, distortion 150 | Another tritone, lower and fatter. The mixed waveforms (saw + square) create a complex, nasal timbre. |
| **Air Horn** | Sawtooth 500 + sawtooth 510 Hz, distortion 100 | 10 Hz beating between two saws = rapid amplitude pulsing. Distortion thickens it. Obnoxious by design. |
| **Double Dare** | Square 330 + square 440 Hz, distortion 80 | Perfect fourth interval in square waves. Hollow, retro, game-show-authentic. |
| **Jeopardy Fail** | Sawtooth 280 + triangle 140 Hz, distortion 120 | Octave relationship but with mismatched waveforms. The triangle softens the bottom while saw grinds on top. |
| **Price Is Wrong** | Sawtooth 200 + sawtooth 150 Hz, distortion 100 | Two saws a fourth apart, both low. Dense harmonic interference pattern. |

### Emergency/Alarm (7)

| Preset | Construction | Why It Works |
|--------|-------------|-------------|
| **EAS Alert** | Sine 853 + sine 960 Hz | The actual Emergency Alert System dual-tone. Two pure sines create the characteristic warbling beat. Psychoacoustically engineered to be impossible to ignore. |
| **Siren Wail** | Sawtooth 800 Hz, distortion 100 | Fixed-frequency siren approximation. Sawtooth provides the cutting harmonics that punch through ambient noise. |
| **Alarm Clock** | Square 2500 + square 2510 Hz | 10 Hz beating at 2500 Hz — right in the ear's most sensitive range (2-5 kHz). Square waves for maximum irritation. |
| **Feedback Screech** | Sawtooth 3500 Hz, distortion 300, Q 40 | Simulates mic feedback. The high Q filter creates a resonant peak that screams at 3500 Hz. |
| **Fire Station** | Sawtooth 700 + sawtooth 900 Hz, distortion 80 | Dual sirens at a minor seventh interval. Dissonant and alarming. |
| **Submarine Dive** | Sine 600 + sine 602 Hz, Q 8 | 2 Hz beating creates slow pulsing. Bandpass filter adds submarine-hull resonance. |
| **Nuclear Meltdown** | Sawtooth 440 + square 443 Hz, distortion 250 | 3 Hz beating between mismatched waveforms at concert A. Distortion makes it feel radioactive. |

### Retro Tech (8)

| Preset | Construction | Why It Works |
|--------|-------------|-------------|
| **Dial-Up Modem** | Sine 1070 + sine 1270 Hz | Actual V.22 modem answer frequencies. Two pure tones = that unmistakable dial-up warble. |
| **Fax Screech** | Sine 1100 + sine 2100 Hz | Fax CNG/CED tone approximation. Wide frequency gap creates alien two-note chord. |
| **Bitcrushed Buzz** | Square 250 Hz, distortion 500 | Square wave is already harmonically sparse (odd harmonics only). Heavy distortion folds in even harmonics, creating lo-fi digital grunge. |
| **CRT Whine** | Sine 7800 Hz, Q 12 | The flyback transformer whine of old TVs. Pure high-frequency sine with resonant filter. Some people literally can't hear this. |
| **Dot Matrix** | Sawtooth 120 + square 360 Hz, distortion 200 | Fundamental + third harmonic in different waveforms. Sounds mechanical, percussive. |
| **ZX Spectrum Load** | Square 1500 + square 2400 Hz, distortion 100 | Approximates the two FSK frequencies used in ZX Spectrum tape loading. |
| **8-Bit Death** | Square 440 + square 415 Hz, distortion 300 | Two squares a semitone apart = 25 Hz beating. Distortion at 300 adds crunch. Classic NES death sound territory. |
| **Atari Crash** | Square 800 + sawtooth 50 Hz, distortion 400 | High square note with subsonic sawtooth rumble. The extreme frequency gap + heavy distortion = digital explosion. |

### Extreme (10)

| Preset | Construction | Why It Hurts |
|--------|-------------|-------------|
| **Max Irritation** | Sawtooth 3500 + sawtooth 3503 Hz, distortion 400, Q 15 | 3 Hz beating at 3500 Hz (peak ear sensitivity), heavy distortion, resonant filter. Engineered to maximize discomfort. |
| **The Exorcist** | Sawtooth 3500 + square 3507 Hz, distortion 600, Q 20 | Max distortion + different waveforms beating at 7 Hz + resonant filter. The mixed harmonics create an unholy timbre. |
| **Dental Drill** | Sine 4000 + sine 4200 Hz, distortion 200, Q 10 | 200 Hz beating in the upper sensitivity range. Even pure sines become menacing here with distortion and resonance. |
| **Mosquito Pulse** | Sine 8000 Hz, Q 5 | Near the upper limit of comfortable hearing. Pure tone at the edge of perception. Younger ears hear it more. |
| **Feedback Screech** | Sawtooth 3500 Hz, distortion 300, Q 40 | Q 40 creates a razor-sharp resonant peak. Like a microphone pointed at its own speaker. |
| **Tinnitus** | Sine 6000 + sine 6002 Hz, Q 30 | 2 Hz beating at 6 kHz with high resonance. Simulates the persistent ring of tinnitus. |
| **Skull Splitter** | Square 4500 + sawtooth 4507 Hz, distortion 600, Q 30 | Max distortion, high Q, high frequency, beating. Every parameter turned to "pain." |
| **Nail on Glass** | Sawtooth 5000 + sine 5003 Hz, distortion 350, Q 25 | 3 Hz beating with mismatched waveforms in the upper register. The saw's harmonics + filter resonance = glass-scraping texture. |
| **Psycho Shower** | Sawtooth 3000 + sawtooth 3150 Hz, distortion 250, Q 12 | 150 Hz beating (very fast wobble) in the screech range. Named for obvious reasons. |
| **Angle Grinder** | Sawtooth 2800 + sawtooth 2850 Hz, distortion 500, Q 8 | 50 Hz beating with heavy distortion. Sounds like metal being cut. |
| **Brown Note** | Sawtooth 40 + square 41 Hz, distortion 400, Q 5 | Subsonic territory. The mythical frequency that supposedly causes involuntary... reactions. Won't actually work, but it rumbles. |

### Horns/Bells (8)

| Preset | Construction | Why It Works |
|--------|-------------|-------------|
| **Foghorn** | Sawtooth 80 + sawtooth 82 Hz | 2 Hz beating at low frequency. Deep, mournful, massive. |
| **Ship Bell** | Triangle 1200 + triangle 1205 Hz, Q 8 | 5 Hz beating in triangles with bandpass resonance simulates bell overtones. |
| **Klaxon** | Sawtooth 400 + square 400 Hz, distortion 150 | Same frequency, different waveforms. The combined harmonics create that classic old-car horn sound. |
| **Bicycle Horn** | Sine 500 + sine 630 Hz | Major third interval in pure sines. Clean, friendly, slightly comical. |
| **Train Horn** | Sawtooth 277 + sawtooth 349 Hz, distortion 50 | Major third (C#4 + F4) in saws with slight distortion. Rail-crossing authentic. |
| **Tugboat** | Sawtooth 110 + triangle 112 Hz, distortion 30 | Low beating with mixed waveforms. Foghorn's smaller cousin. |
| **Church Bell** | Triangle 800 + sine 1200 Hz, Q 6 | Fundamental + 3:2 overtone (quint) with bandpass resonance. Bell-like inharmonic relationship. |
| **Clown Horn** | Sine 400 + sine 504 Hz | Major third (5:4 ratio). Pure and silly. |

### Musical (8)

| Preset | Construction | Why It Works |
|--------|-------------|-------------|
| **Doom Bass** | Sawtooth 55 + square 55 Hz, distortion 350 | A1 (55 Hz) with two waveforms stacked = dense low-end. Heavy distortion adds upper harmonics for speaker rumble. |
| **Power Chord** | Sawtooth 110 + sawtooth 165 Hz, distortion 300 | Perfect fifth (2:3) in sawtooths with distortion. The sound of every metal riff. |
| **Reese Bass** | Sawtooth 60 + sawtooth 61 Hz, distortion 150 | 1 Hz beating creates slow phasing sweep. Classic drum & bass sub-bass sound. |
| **Wobble Bass** | Sawtooth 80 + square 80 Hz, distortion 200, Q 12 | Same freq, different waveforms with resonant filter. The Q creates dubstep-style mid-range presence. |
| **Synth Brass** | Sawtooth 440 + sawtooth 441 Hz, distortion 50 | 1 Hz beating at concert A. Two detuned saws = classic analog brass patch. |
| **Horror Stab** | Sawtooth 800 + square 1131 Hz, distortion 200 | Tritone interval in the mid-range with distortion. Jump-scare territory. |
| **Organ Stab** | Sine 440 + sine 880 Hz, distortion 50 | Octave in pure sines. Clean organ-like fundamental + first harmonic. |
| **Fifth Drop** | Sawtooth 150 + sawtooth 100 Hz, distortion 250 | Inverted fifth — high note first, drop to the root. Aggressive bass transition. |

### Sci-Fi (6)

| Preset | Construction | Why It Works |
|--------|-------------|-------------|
| **Laser Zap** | Sawtooth 3000 Hz, distortion 200, Q 5 | High sawtooth with distortion. Fast, bright, cutting. |
| **Phaser Blast** | Sawtooth 1500 + sine 1800 Hz, distortion 100, Q 8 | Mixed waveforms at a minor third with resonant filter. Sci-fi weapon territory. |
| **Robot Voice** | Square 200 + square 303 Hz, distortion 300, Q 15 | Two squares at non-harmonic ratio with resonant filter. Sounds like a vocoder. |
| **UFO Landing** | Sine 600 + sine 603 Hz, Q 15 | 3 Hz beating with high resonance. Slow, eerie pulsing. |
| **Warp Drive** | Sawtooth 100 + sawtooth 103 Hz, distortion 150, Q 10 | 3 Hz beating at low frequency with resonant filter. Engine-like throb. |
| **Holodeck Error** | Square 1200 + triangle 1800 Hz, distortion 100, Q 5 | Mixed waveforms at a fifth with resonance. Digital malfunction aesthetic. |

### Nature (4)

| Preset | Construction | Why It Works |
|--------|-------------|-------------|
| **Angry Wasp** | Sawtooth 180 + sawtooth 183 Hz, distortion 100, Q 8 | 3 Hz beating in the insect wing-frequency range. Resonant filter adds body buzz. |
| **Cicada Swarm** | Sine 5500 + sine 5504 Hz, distortion 50, Q 10 | 4 Hz beating at high frequency. The pulsing of a summer cicada chorus. |
| **Rattlesnake** | Sawtooth 4000 + sawtooth 4100 Hz, distortion 400, Q 3 | 100 Hz beating (fast rattle) with heavy distortion. Broadband noise character. |
| **Thunder Crack** | Sawtooth 60 + sawtooth 65 Hz, distortion 500 | Low frequency with extreme distortion spreads harmonics across the full spectrum. |

### Industrial (6)

| Preset | Construction | Why It Works |
|--------|-------------|-------------|
| **Jackhammer** | Square 100 + sawtooth 102 Hz, distortion 500 | 2 Hz beating with max distortion at low frequency. Percussive, mechanical. |
| **Metal Screech** | Sawtooth 2200 + sawtooth 2207 Hz, distortion 550, Q 20 | 7 Hz beating with heavy distortion and resonance in the mid-screech range. |
| **Arc Welder** | Sawtooth 3200 + square 3205 Hz, distortion 450, Q 12 | 5 Hz beating with high distortion and resonance. Sizzling, electric. |
| **Hydraulic Press** | Sawtooth 50 + triangle 52 Hz, distortion 300, Q 5 | Subsonic with distortion and resonance. Massive, slow, crushing. |
| **Pile Driver** | Square 70 + sawtooth 140 Hz, distortion 600 | Octave with max distortion. Short duration makes it impactful. |
| **Steam Vent** | Sawtooth 6000 + sawtooth 6500 Hz, distortion 100 | High frequency broadband noise character. Hissing release. |

### Current Game (7)

| Preset | Construction | Notes |
|--------|-------------|-------|
| **Buzz 0-4** | Various waveforms, 180-240 Hz | The 5 existing game buzzers. Deliberately tame — sawtooth, square, triangle at low frequencies, minimal effects. |
| **Ahooga** | Sawtooth 400 Hz | Single-note approximation of the two-tone horn. |
| **Fanfare** | Sawtooth 523 Hz (C5) | Single-note approximation of the victory sound. |

---

## Combo Presets — 2-Stack (6)

Simple two-part sequences. Musical intervals or call-and-response patterns.

| Preset | Construction | Effect |
|--------|-------------|--------|
| **Ahooga Horn** | Sawtooth 400 Hz → 220 Hz (400ms gap) | Classic two-tone car horn. High note first, drops to low. |
| **Doorbell** | Sine 659 Hz → 523 Hz (500ms gap) | Ding-dong. E5 down to C5 in pure sines. |
| **Octave Drop** | Sawtooth 440 → 220 Hz (300ms gap) | A4 drops to A3. Second note has more distortion for impact. |
| **Question Mark** | Triangle 440 → 660 Hz (200ms gap) | Rising interval — low to high. Musical question inflection. |
| **Cuckoo** | Sine 830 → 659 Hz (350ms gap) | Minor third drop. The actual cuckoo bird interval. |
| **Laser Duo** | Sawtooth 3000 → 4000 Hz (150ms gap) | Two quick laser zaps ascending. Distortion 200 on both. |

---

## Combo Presets — 3-Stack (12)

Three layers enable chords, sequences with resolution, and simple narratives.

| Preset | Construction | Effect |
|--------|-------------|--------|
| **Wah Wah Wah** | Sawtooth descending: 440 → 370 → 311 Hz | Chromatic descent — each note a semitone lower. Classic "loser" sound. Distortion 200 throughout. |
| **Doom Chord** | Sawtooth A1 (55) + E2 (82) + A2 (110) Hz | Power chord voicing (root + fifth + octave). Distortion 250-350. Wall of low-end. |
| **Chaos Stack** | Foghorn 80 Hz + Screech 3500 Hz + Alarm 2500 Hz | Three incompatible sounds layered. Low drone vs. resonant screech vs. alarm beep. Deliberately horrible. |
| **Horror Sting** | Screech 3000 Hz + Sub hit 40 Hz + Tritone 311/466 Hz | Jump-scare architecture: high screech catches attention, sub-bass hits the chest, tritone sustains dread. |
| **Inception BWAAAH** | Sub 50 Hz (dist 400) + Mid 200 Hz (dist 300) + Horn 400 Hz (dist 200) | Three stacked layers building up from sub-bass. The Inception trailer fog-horn effect. |
| **UFO Abduction** | Carrier 600/603 Hz + Warble 1200/1500 Hz + Sub 40/42 Hz | Beating carrier + alien warble + subsonic foundation. Classic sci-fi abduction soundscape. |
| **Boxing Bell** | Triangle 1200 Hz × 3 hits (0/500/1000ms) | Three identical bell strikes with 500ms spacing. Ship-bell overtone structure. |
| **Dial-Up Handshake** | Carrier 1070/1270 → Screech 2250/2100 → Handshake 1800/1400 Hz | Three phases of modem negotiation. Increasingly noisy. |
| **Drum Roll Hit** | Roll 200/201 Hz (dist 400) → Cymbal 5000/5500 → Hit 80 Hz | Tension-building roll, cymbal crash, final impact. |
| **Air Raid** | Lo siren 300 Hz + Hi siren 600 Hz (offset) + Sub rumble 60/63 Hz | Two alternating siren tones over subsonic drone. |
| **Major Triad** | Sawtooth C4 (262) + E4 (330) + G4 (392) Hz | All three notes simultaneous, slightly detuned (1 Hz beating each). Full major chord with warmth. |
| **Minor Dread** | Sawtooth C4 (262) + Eb4 (311) + G4 (392) Hz, distortion 200 | Minor triad with distortion. Same voicing as Major Triad but the Eb creates darkness. |

---

## Combo Presets — 5-Stack (18)

Five layers enable full musical phrases, narratives with build-ups, and complex textures.

| Preset | Construction | Effect |
|--------|-------------|--------|
| **Victory Fanfare** | Square ascending: C4→E4→G4→C5→C5 (shimmer) | Major arpeggio climbing to resolution. Final note doubled with 1 Hz beating for sparkle. |
| **Final Combo** | Buzz 0-3 rapid fire (50ms spacing) + Ahooga tail | All four game buzzers fired in quick succession, resolved by the ahooga horn. The "everything at once" sound. |
| **Police Siren** | Alternating sawtooth 800/600 Hz × 2.5 cycles | Siren woop-woop pattern with 200ms alternation. Distortion 80 for grit. |
| **Game Over** | Square descending: G4→Eb4→C4→Ab3→C3 | Chromatic-ish descent through dissonant intervals. Final note has distortion 100 for finality. |
| **Countdown Beep** | Sine 880 Hz × 4 beeps → Sawtooth buzz 220 Hz | Four identical countdown pips, then the buzz-in. Timer-to-buzzer transition. |
| **Jackpot** | Square ascending: C5→E5→G5→C6→C6 (shimmer) | Fast ascending arpeggio (120ms spacing). Like Victory Fanfare but faster and higher. |
| **Slot Machine** | Sine ramp: 1000→1100→1200→1300 Hz → C5 win tone | Ascending "spinning reel" tones resolving to a bright major chord. |
| **Close Encounters** | Sine: D5→E5→C5→C4→G4 | The actual Close Encounters of the Third Kind melody. Pure sine tones, no effects. |
| **Emergency Broadcast** | 3× EAS dual-tone (853/960 Hz) → Square 1000 Hz → Static | Three repetitions of the EAS tone, attention signal, then distorted static burst. Authentic structure. |
| **Price Is Right** | Sine ascending: C5→D5→E5→G5→C5+E5 chord | Cheerful ascending scale resolving to a major third chord. Come on down! |
| **Descending Doom** | Sawtooth: 880→660→440→220→55 Hz, increasing distortion | Each note an octave/fifth lower with progressively more distortion (200→400). Ends in subsonic rumble. |
| **Winning Streak** | Square: G4→C5→E5→G5→sparkle (1568+2093 Hz) | Fast ascending (120ms) arpeggio ending in a dual-sine shimmer chord. |
| **Nuclear Meltdown** | Sub drone 60 Hz + Radiation 3000 Hz + Alternating alarms + Steam | Subsonic core with high-Q radiation whine, alternating alarm frequencies, and distorted steam hiss. Layered dread. |
| **Sad Trombone** | Sawtooth descending: Bb4→A4→Ab4→F#4→Eb4 | Classic "wah wah wah waaah" — each note a semitone lower, last note elongated with beating. Distortion 30-50 for brass timbre. |
| **Laser Barrage** | 3× sine pew (3000→3500→4000 Hz) → Charge 200/800 Hz → Blast | Rapid ascending zaps, then a building charge, then distorted low-frequency explosion. |
| **Ice Cream Truck** | Triangle: G4→E4→C4→E4→G4 | "Three Blind Mice" opening fragment in pure triangles. Nostalgic, innocent, slightly creepy in context. |
| **Thunder Strike** | Crack 5000 Hz (30ms) + Pop 3000 Hz (50ms) → Rumble 50 Hz → Roll 80 Hz → Decay 40 Hz | Lightning architecture: instantaneous high-freq crack, then subsonic rumble building and decaying. All at distortion 200-600. |
| **Jeopardy Timer** | 4× square 440 Hz ticks (250ms) → Sawtooth buzz-out | Metronome-like countdown, then time's-up buzzer with beating and distortion 300. |

---

## Combo Presets — 10-Stack (30)

Ten simultaneous/sequenced layers. Complex soundscapes, scenes, and maximum sonic density.

### Clean/Musical

| Preset | Construction | Effect |
|--------|-------------|--------|
| **Full Chromatic** | Square: C4 through A4, chromatic scale (200ms spacing) | All 10 notes of the chromatic scale from C4 to A4, each as a brief square blip. Musical but dense. |
| **Arcade Attract** | Square arpeggio: C-E-G-C-G-E-C + coin sounds + power-up | Classic arcade demo-mode melody. Ascending/descending major arpeggio, then coin-insert sounds (988→1319 Hz), ending with octave power-up. |
| **Orchestra Hit** | 7-note C major chord (C3-C5) + crash noise + sub-bass | All notes fire simultaneously (delay 0). Sawtooth+square per note, distortion 60-80. Massive orchestral stab with noise layer for impact. |
| **Pinball Machine** | Bumps (500→600→700) + bell + flipper + sling + ramp + jackpot + tilt | Full pinball game in 1.5 seconds. Ascending bump tones, mechanical flipper, bell dings, ending in sad tilt buzz. |
| **Space Invaders** | 4× descending march (100→90→80→70) + 2× shoots + hit + explode + UFO + bonus | Full game sequence: aliens descending (getting lower), shots fired, explosion, UFO bonus. Square waves throughout for authentic 8-bit feel. |
| **Circus Disaster** | Calliope (523→659→784) + honk + slide + cymbal + trombone + splat + whistle + sad horn | Happy circus music that goes wrong. Starts cheerful (triangle calliope), adds slapstick elements, ends with sad trombone. |
| **Grand Finale** | Timpani 65/98 Hz + dual brass + cymbal + 2× snare + build + 2× stinger + final hit | Full orchestral ending: percussion sets up, brass enters, snare roll, ascending stingers, massive final chord with sub-bass and distortion. |

### Scenes/Atmospheres

| Preset | Construction | Effect |
|--------|-------------|--------|
| **Haunted House** | Ghost 800/802 Hz + creak + wind + thunder + dual organ + chains × 2 + heartbeat × 2 | Full haunted house soundscape. Ghost is slow-beating sine, organ in sawtooth for pipe-organ character, heartbeat as 40 Hz thuds, chains as distorted high-freq bursts. |
| **Robot Uprising** | Servo × 2 + robot voice + laser scan + stomp × 2 + laser + zap + drone + terminator | Robot invasion narrative: servos warming up, synthetic voice, scanning, heavy stomps, weapons fire, constant drone underneath, ending with heavy bass terminator theme. |

### The Grungy Ones

These presets are deliberately designed to sound awful. Construction principles:
- **Distortion 400-600** on most/all layers
- **Filter Q 20-50** for narrow resonant screeching
- **Beating frequencies 3-13 Hz apart** for nausea-inducing wobble
- **Layered frequency bands** so every part of the hearing range is under assault
- **Sawtooth everything** — richest in harmonics, most affected by distortion

| Preset | Construction | What Makes It Horrible |
|--------|-------------|----------------------|
| **Wall of Sound** | 10 layers spanning 40-8000 Hz, all sawtooth, all distorted | Every frequency band filled simultaneously. Sub (40 Hz) through air (8000 Hz), each with its own distortion curve. Like staring at white noise but it's all sawtooth. 3-second duration to let the misery breathe. |
| **Symphony of Pain** | Drill 4000 + screech 3500 + mosquito 8000 + grinder 2800 + nail 5000 + tinnitus 6000 + alarm 2500 + EAS 853/960 + feedback 3500 + brown note 40 Hz | Every "worst sound" preset fired simultaneously. Dental drill + feedback screech + mosquito + tinnitus + EAS alert all at once. The brown note drone provides subsonic foundation. Filter Q up to 40 on the worst ones. |
| **Max Chaos Alarm** | Klaxon × 2 (400/500 Hz) + EAS + bell × 2 + siren × 2 + foghorn + alarm 2500 Hz + sub drone 55 Hz | Every alarm sound layered. Each in a different frequency band so nothing masks anything else. Staggered delays so the chaos unfolds over 2 seconds. |
| **Angle Grinder** | Dual grind (2800/4200 Hz, Q 30-35) + 3× sparks (5500-6500 Hz) + metal 1800 Hz + screech 3500 Hz (Q 45) + motor 120 Hz + rattle 350 Hz + whine 5000 Hz (Q 40) | Resonant peaks at Q 30-50 in the most painful frequency ranges. The motor provides mechanical foundation while everything above screams. Sparks are brief high-frequency bursts that punctuate the sustained grind. All distortion 500-600. |
| **Sewer Pipe** | Dual gurgle (80/95 Hz) + drips (2000/2200 Hz) + drone 55 Hz + rust 300 Hz (Q 20) + hiss 6000 Hz + clank 800 Hz + groan 150 Hz (Q 25) + gas burst | Subsonic sewage drone with resonant pipe harmonics. The "wet" sounds come from distorted low-frequency sawtooths with high Q — the resonance creates a liquid quality. Gas burst at the end uses sub-bass through extreme distortion. |
| **Dial-Up From Hell** | Carrier 1070/1270 → handshake 2100/2250 → screech 3500/3700 → fax + corrupt data × 2 + static + 60 Hz buzz + data vomit + death tone | Real modem frequencies (V.22 carrier, V.22bis handshake) but with distortion 300-600 applied. The "corruption" stages use increasingly detuned non-standard frequencies. Constant 60 Hz buzz and broadband static underneath. Ends with a distorted death drone. |
| **Garbage Disposal** | Motor 100 Hz + chew × 3 (220-280 Hz, Q 15, dist 600) + grind 1500 Hz (Q 25) + rattle 400 Hz + spoon × 2 (3000-3500 Hz, Q 20) + jam 60 Hz + smoke 5000 Hz | The motor drones at 100 Hz while "chewing" events fire at staggered intervals — distorted low-frequency bursts. "Spoon" hits are high-Q resonant peaks simulating metal hitting the blades. "Jam" is subsonic distortion overload. |
| **Ear Violation** | Tritone × 2 (300/424 + 600/849 Hz) + minor 2nd 1000/1059 Hz + quarter-tone 3000/3075 Hz + 2 Hz beating 5000/5002 Hz + crunch × 2 (55/58 + 110/117 Hz) + needle 4000 Hz (Q 50) + scrape 2500 Hz (Q 40) + flatline 1000 Hz | Systematically stacks every dissonant interval: tritones, minor seconds, quarter-tones, and tight beating. Each interval occupies a different frequency band so none mask each other. Q 50 on the "needle" — the narrowest resonant peak possible. Flatline provides a reference pitch that makes all the dissonance relative. |
| **Broken Printer** | Head × 3 (150 Hz, dist 500, staggered) + feed 200 Hz + jam 80 Hz + error beep × 3 (2000 Hz) + shred 3000/3333 Hz + die 100/50 Hz | Mechanical stuttering (three head strikes), then continuous feed noise, then a low-freq jam, then three error beeps, then high-pitched shredding, then the motor dying (descending pitch). Tells a story of mechanical failure. |
| **Swamp Thing** | Bog 40/43 Hz + bubbles × 3 (280-350 Hz, brief) + squelch × 2 (180-200 Hz, Q 30, dist 600) + croak 120/125 Hz + ooze 60/65 Hz + insects 4000/4100 Hz + belch 70/75 Hz | The "wet" sounds use resonant distorted sawtooths at Q 30-35 — the narrow filter peak creates a liquid/squelching quality. Bubbles are brief sine pops. Insects are high-frequency beating for texture. Everything sits on a subsonic bog drone. |
| **Forbidden Frequency** | Wolf fifths (400/583 + 800/1166 Hz) + beating 3 Hz (3000/3003) + beating 7 Hz (5000/5007) + tone clusters (261/277 + 293/311 Hz) + infra 40/41 Hz + razor 3500 Hz (Q 50) + dissonance 440/466 Hz + howl 1500/1513 Hz (Q 40) | Named for the "wolf fifth" — a mistuned fifth (583 Hz instead of 600) from historical temperament that sounds sour. Combined with chromatic clusters (adjacent semitones), multiple beating frequencies, and Q 50 resonance. Mathematically optimized for maximum harmonic unpleasantness. |
| **Meat Grinder** | Blade × 3 (180 Hz, dist 600, widening detune) + splat + squelch (Q 35) + crunch 90 Hz + gristle 2500 Hz (Q 45) + motor 70 Hz + whine 4000 Hz (Q 50) + overflow 45 Hz | Three blade strikes with progressively wider detuning (7→12→17 Hz). "Splat" is a sub-bass through high-freq cross-modulation burst. "Gristle" at Q 45 is a narrow resonant screech. Motor drone underneath everything. |
| **Chernobyl Basement** | Reactor 50/51 Hz + pipes 200/207 Hz (Q 30) + geiger × 4 (5800-6200 Hz, 20ms bursts) + meltdown 3000/3007 Hz (Q 40) + steam + concrete 100/107 Hz (Q 20) + void 40/41 Hz | Subsonic reactor drone as foundation. Geiger counter clicks are ultra-brief high-frequency square bursts at irregular intervals. Meltdown is a sustained resonant screech. "Void" is near-infrasonic beating. 4-second total duration for full atmospheric dread. |
| **Dentist Nightmare** | Dual drill (4000/5000 Hz, dist 400, Q 45) + suction 120/127 Hz (Q 20) + scrape × 3 (2800-3200 Hz, Q 50, dist 600) + nerve 7000/7002 Hz (Q 50) + rinse + clamp + whimper 600/603 Hz (Q 30) | Q 50 on the scrapes — maximum resonant sharpness. Two drill frequencies in the peak sensitivity range. "Nerve" is 2 Hz beating at 7 kHz with max Q — a thin, piercing, inescapable tone. Suction is distorted low-frequency rumble. "Whimper" adds emotional context. |
| **Toxic Waste Dump** | Acid × 3 (333/444/555 Hz ascending, Q 35, dist 600) + barrel pop × 2 + fizz 6000/6666 Hz + sludge 55/59 Hz + corrode 1800 Hz (Q 40) + warning 800 Hz + mutate 150/157 Hz (detune -50) | Ascending "acid" tones at 333→444→555 Hz — numerologically evil and harmonically unrelated. Barrel pops are sub-bass/high-freq cross-modulation impacts. The detune parameter on "mutate" shifts osc2 by -50 Hz for extra wrongness. |
| **Steel Mill Collapse** | 3× descending beams (80→65→50 Hz) + 2× shear (3000-3500 Hz, Q 30) + impact 40 Hz + debris + groan 100/103 Hz (Q 25) + furnace 2000/2050 Hz (Q 20) + dust 7000/7777 Hz | Structural failure in three acts: beams buckling (descending sub-bass), metal shearing (high-Q screeches), then impact and debris. Furnace provides constant mid-range menace. All distortion 600. |
| **Nails On Blackboard** | 4× ascending nails (2500→2700→3000→3500 Hz, all Q 50, dist 600) + chalk 4500/4503 Hz (Q 50) + squeal 6000/6007 Hz (Q 50) + board resonance 800/807 Hz (Q 35) + shudder 200/204 Hz + spine 3300/3302 Hz (Q 50) + revulsion 5500/5555 Hz (Q 45) | Six layers at Q 50 — every one a razor-sharp resonant peak in the 2500-6000 Hz range where ears are most sensitive. The ascending nail pattern creates anticipatory dread. Board resonance adds lower body. Tight beating (2-7 Hz) on everything for wobble. |
| **Stomach Virus** | Churn × 2 (65-70 Hz, Q 25) + gurgle × 2 (220-250 Hz, Q 35) + heave 100 Hz + splatter 50/5000 Hz cross-mod + bile 160/167 Hz (Q 30) + acid 2000/2013 Hz (Q 40) + moan 300/303 Hz (Q 20) + flatline 1000 Hz | Gastrointestinal narrative: churning (subsonic), gurgling (resonant low-mid), heaving (distorted burst), splattering (cross-modulation impact), then moan fading to flatline. The Q 35 on gurgle creates the liquid quality. |
| **Dumpster Fire** | Crackle × 4 (2800-3500 Hz, brief bursts, dist 600) + roar 80/85 Hz + heat 300/307 Hz (Q 20) + trash × 2 (150-170 Hz, dist 600) + sirens 600 Hz + collapse 40/43 Hz | Fire crackle as rapid high-frequency bursts at staggered intervals. Low-end roar provides the fire's body. "Trash" is distorted low-mid impacts (things falling in). Distant sirens add context. Structural collapse at the end. |
| **Autopsy Room** | Bone saw × 2 (2200/2800 Hz, Q 40, dist 600) + clamp × 2 (380-400 Hz, brief) + wet × 2 (120-130 Hz, Q 30) + fluorescent 4000/4001 Hz (Q 50) + drain 180/190 Hz (Q 25) + hum 60/120 Hz + zipper 1500/1555 Hz (Q 35) | "Fluorescent" is 1 Hz beating at 4 kHz with Q 50 — that barely-perceptible flicker of institutional lighting. Bone saw is resonant mid-frequency screech. "Wet" sounds are distorted low-frequency with high Q for liquid character. The 60 Hz hum is building electrical noise. |
| **Scrapyard Crusher** | Hydraulic 45/47 Hz + compress 60/65 Hz (Q 12) + buckle × 3 (500→400→300 Hz, each with high-freq cross-mod) + screech × 2 (3500/4000 Hz, Q 50) + glass 6000/7500 Hz + flatbed 150/155 Hz (Q 15) + final crush | Hydraulic press narrative: pressure building (subsonic), metal buckling (descending frequency — each buckle lower as metal deforms), screeching (resonant peaks), glass breaking (brief high-freq), final catastrophic crush (sub-bass through full-spectrum distortion). |

---

## Combo Presets — 15-Stack Voices (10)

Formant synthesis: attempting to make oscillators speak. Each preset uses 15 layers to approximate human speech through additive synthesis.

### How Voice Synthesis Works Here

Human vowels are defined by **formant frequencies** — resonant peaks in the vocal tract:

| Vowel | Example | F1 (Hz) | F2 (Hz) | F3 (Hz) |
|-------|---------|---------|---------|---------|
| /ʌ/ | b**u**zz | 640 | 1200 | 2400 |
| /ɒ/ | wr**o**ng | 600 | 1000 | 2400 |
| /u:/ | b**oo** | 300 | 870 | 2250 |
| /ɛ/ | y**e**ah | 530 | 1850 | 2500 |
| /æ/ | spl**a**t | 660 | 1700 | 2400 |
| /oʊ/ | n**o** | 500→350 | 800→870 | 2500 |
| /aʊ/ | **ou**t | 800→350 | 1200→870 | 2500 |
| /i:/ | y(**ee**) | 270 | 2300 | 3000 |

Each voice preset allocates its 15 layers roughly as:
- **2 layers**: Glottal source — sawtooth at ~100-160 Hz (vocal cord buzz) + octave harmonic. The sawtooth is rich in harmonics, which the formant filters then shape.
- **3-4 layers**: Formant resonances — sine oscillators at F1, F2, F3 with slight detuning (3-7 Hz) and bandpass Q 25 for vowel character.
- **2-3 layers**: Consonant approximations — bursts (plosives /b/,/p/,/t/,/g/), noise (fricatives /s/,/z/,/f/), nasal resonance (/n/,/m/,/ŋ/).
- **2-3 layers**: Sub-bass and grit — distorted low-frequency foundation.
- **3-4 layers**: Texture — overtones, air noise, body resonance.

These won't sound like clean speech. They sound like a distorted vocoder gargling gravel. That's the point.

### The Words

| Preset | Phonetics | Formant Strategy | Consonant Strategy | Game Moment |
|--------|-----------|-----------------|-------------------|-------------|
| **V: BUZZ** | /b/ + /ʌ/ + /z/ | F1:640, F2:1200, F3:2400 — open mid vowel | B = 80 Hz square burst (30ms). Z = dual noise at 4000/4500 Hz with distortion 600, sustained from 250ms | Buzzer press |
| **V: WRONG** | /r/ + /ɒ/ + /ŋ/ | F1:600, F2:1000, F3:2400 — open back vowel | R = 300/320 Hz colored noise onset. NG = sine 280/285 Hz nasal resonance (Q 30) from 350ms | Wrong answer |
| **V: OUT** | /aʊ/ + /t/ | Diphthong glide: F1 800→350, F2 1200→870. Two vowel positions with 200ms offset | T = square 3000 Hz burst + noise at 420ms. Sub-bass weight drops at 300ms for emphasis | Elimination |
| **V: BOO** | /b/ + /u:/ | F1:300, F2:870, F3:2250 — close back vowel (lips rounded) | B = 70 Hz square burst. Extended duration (0.8s). Three "crowd" layers at 100-140 Hz add group-boo texture | Crowd disapproval |
| **V: YEAH** | /j/ + /ɛ/ → /æ/ | Diphthong: F1 530→660, F2 1850→1700. Vowel opens from /ɛ/ to /æ/ at 250ms | Y = brief glide through /i:/ formants (270/2300 Hz). Rising energy via "punch" and "shimmer" layers | Correct/celebration |
| **V: NO** | /n/ + /oʊ/ | Diphthong: F1 500→350, F2 800 (closing). Vowel rounds and closes | N = sine 250/255 Hz nasal + 2500 Hz nasal resonance. "Finality" sub-bass at 350ms for authority | Judge rejection |
| **V: GO** | /g/ + /oʊ/ | Same /oʊ/ diphthong as NO but higher pitch (160 Hz fundamental) and more energy | G = 100 Hz square burst with 250 Hz sawtooth. "Power" and "urgency" layers add drive. Initial thump for impact | Round start |
| **V: OOF** | /u:/ + /f/ | F1:300, F2:870, F3:2250 — same as BOO but shorter with gut-punch onset | F = dual noise at 4000-6000 Hz from 280ms. "Gut punch" is 60 Hz sine burst. "Deflate" and "crumple" add physical collapse | Fail moment |
| **V: WOMP WOMP** | 2× (/w/+/ɒ/+/m/+/p/) | Two complete word cycles with 450ms offset. Second "womp" at lower pitch (110 vs 130 Hz) for descending sadness | W = brief sine glide through /u:/ formants. M = nasal sine 250-280 Hz. P = square burst with noise. Full consonant framework both times | Failure horn |
| **V: SPLAT** | /s/+/p/+/l/+/æ/+/t/ | F1:660, F2:1700, F3:2400 starting at 140ms — vowel only occupies 200ms | S = 5000/6000 Hz noise (120ms). P = 100 Hz square burst (30ms). L = sine 400/410 Hz liquid (80ms). T = 3000/5000 Hz burst. "Impact" cross-mod + splatter + goo + drips for aftermath | Messy crash-out |

### SpecIdol Gameplay Voices (10 additional)

These target specific game moments. Voice character varies: some are higher-pitched (F0 ~200-230 Hz, female register), others deep (F0 ~80-100 Hz, demonic male).

| Preset | Phonetics | Formant Strategy | Consonant Strategy | Voice Character | Game Moment |
|--------|-----------|-----------------|-------------------|----------------|-------------|
| **V: NEXT** | /n/+/ɛ/+/k/+/s/+/t/ | F1:530, F2:1850 — front open vowel | N = 250 Hz nasal. KS = 2500/4000 Hz burst. T = 3000/5000 Hz burst. Two consonant clusters. | Female (F0: 220 Hz). Bright, commanding. | Round transition — moving to next story/performer |
| **V: FAIL** | /f/+/eɪ/+/l/ | Diphthong F1:580→400, F2:1800 — vowel closes from /eɪ/ | F = 4500/5500 Hz noise onset. L = 350/360 Hz liquid resonance at end. | Deep male (F0: 100 Hz). Heavy sub-bass, despair layers. | Defeat — performer buzzed out |
| **V: STOP** | /s/+/t/+/ɒ/+/p/ | F1:600, F2:1000 — open back vowel | S = 5000/6500 Hz noise. T = 2500/4000 Hz burst. P = 150 Hz square burst with noise. Heavy "wall" and "weight" impact layers. | Male (F0: 130 Hz). Authoritative, heavy P burst for finality. | Time's up — round ends |
| **V: SHAME** | /ʃ/+/eɪ/+/m/ | Diphthong F1:580→400, F2:1800 — same vowel as FAIL but with SH onset | SH = 4000/5000 Hz broadband noise (wider than S). M = 280/285 Hz nasal. "Contempt" and "sneer" texture layers. | Deep male (F0: 110 Hz). Slow, drawn out (0.7s), dripping disdain. | Judge expressing disapproval |
| **V: WIN** | /w/+/ɪ/+/n/ | F1:390, F2:2000 — close front vowel (brighter than /u:/) | W = brief /u:/ formant glide (300/870 Hz). N = 250 Hz nasal. "Sparkle" and "triumph" layers add celebration. | Female (F0: 200 Hz). Less distortion (350), brighter formants. | Victory — performer survived |
| **V: DEAD** | /d/+/ɛ/+/d/ | F1:530, F2:1850 — same vowel as NEXT but at much lower pitch | D = 120 Hz square burst. Final D = 100 Hz burst. Both voiced plosives (low). "Grave," "void," and "hollow" layers. Ends on flatline (1000 Hz pure sine). | Demonic (F0: 90 Hz). Maximum distortion (600), infrasonic void. | Elimination — dramatic death announcement |
| **V: FIGHT** | /f/+/aɪ/+/t/ | Diphthong F1:800→350, F2:1200→2300 — open to close, wide glide | F = 4500/5500 Hz noise. T = 3000/5000 Hz burst. "Impact" (50 Hz thump), "aggro," and "rage" layers for aggression. | Male (F0: 140 Hz). Aggressive, punchy, quick. | Competitive moment — judges vs performer |
| **V: SAFE** | /s/+/eɪ/+/f/ | Diphthong F1:580→400, F2:1800 — same as FAIL/SHAME but with relief texture | S = 5000/6000 Hz noise. F = 4500/5500 Hz noise at end. "Warmth" and "gentle" sine layers replace the grit. Less distortion overall (150-400). | Female (F0: 230 Hz). Lightest distortion of all voices. Warmth and breath. | Survivor — barely made it |
| **V: RUN** | /r/+/ʌ/+/n/ | F1:640, F2:1200 — same vowel as BUZZ but with urgency texture | R = 350/370 Hz colored noise. N = 250 Hz nasal. Two "heartbeat" layers (50 Hz thumps at 0ms and 200ms). "Panic" and "escape" layers. | Male (F0: 150 Hz). Heartbeat rhythm creates urgency. Breathless. | Countdown pressure — time running out |
| **V: DOOM** | /d/+/u:/+/m/ | F1:300, F2:870, F3:2250 — same vowel as BOO but deeper and longer | D = 80 Hz square burst. M = 250/255 Hz nasal drone. "Abyss" at 30/31 Hz — near-infrasonic. "Toll" bell at 200/400 Hz. Sub at 40 Hz vol 0.5 — loudest sub of any voice. | Lowest voice (F0: 80 Hz). 1-second duration. Maximum sub-bass presence. Gravitational. | Final judgment — ultimate defeat |

---

## Technical Notes

### Why Sawtooth Dominates

Sawtooth waves contain all harmonics (1f, 2f, 3f, 4f...) at decreasing amplitude. This makes them:
1. Most affected by distortion (more harmonics to fold)
2. Most affected by bandpass filtering (more harmonics to select from)
3. Brightest/harshest sounding
4. Best approximation of a vocal cord or bowed string

Square waves contain only odd harmonics (1f, 3f, 5f...), giving them a hollow, clarinet-like quality. Triangle waves are similar to square but with harmonics falling off faster — softer and rounder.

### Why Beating Creates Discomfort

Two frequencies close together (e.g. 3000 and 3003 Hz) create amplitude modulation at their difference (3 Hz). At rates of 2-15 Hz, this falls in the range the brain interprets as "roughness" — a key component of perceived dissonance. The effect is strongest when the beating rate is around 1/4 of the critical bandwidth at that frequency.

### Why High Q Sounds Horrible

A bandpass filter with Q 50 has a bandwidth of approximately `center_freq / Q`. At 3500 Hz with Q 50, that's a 70 Hz window. All the oscillator's energy gets concentrated into this narrow band, creating a thin, piercing, resonant screech — like a wine glass about to shatter.

### The Distortion Curve

The WaveShaper uses a sigmoid transfer function: `(3 + amount) * x * (π/2) / (π + amount * |x|)`. Higher amounts clip the waveform harder, folding harmonics back into the audible range and creating intermodulation products — frequencies that weren't in the original signal. At 600, the waveform is essentially a harsh square approximation regardless of input.

### Formant Synthesis Limitations

Real speech has:
- Time-varying formants (formant transitions during consonants)
- Noise modulation (aspiration, frication)
- F0 variation (pitch contour / intonation)
- Formant bandwidths that vary per vowel

This engine can only approximate with static oscillators at fixed frequencies. The results are more "robot vocoder" than "human speech." The grungy distortion actually helps — it masks the artificiality and adds character.
