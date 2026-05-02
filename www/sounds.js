// Web Audio API sound generators for SpecIdol

let audioContext = null;

function getAudioContext() {
    if (!audioContext) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) {
            console.warn('Web Audio API not supported, sounds disabled');
            return null;
        }
        audioContext = new AudioContextClass();
    }
    // Resume if suspended (autoplay policy)
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    return audioContext;
}

function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// --- Buzz sounds (5 variations) ---

function playBuzz(soundIndex, repeatCount) {
    repeatCount = repeatCount || 1;
    if (prefersReducedMotion()) return;

    var ctx = getAudioContext();
    if (!ctx) return;

    var duration = 0.2;
    var gap = 0.1;

    for (var i = 0; i < repeatCount; i++) {
        var startTime = ctx.currentTime + (i * (duration + gap));
        switch (soundIndex) {
            case 0: playBuzz0(ctx, startTime, duration); break;
            case 1: playBuzz1(ctx, startTime, duration); break;
            case 2: playBuzz2(ctx, startTime, duration); break;
            case 3: playBuzz3(ctx, startTime, duration); break;
            case 4: playBuzz4(ctx, startTime, duration); break;
        }
    }
}

// Buzz 0: Sawtooth wave (220 Hz, harsh)
function playBuzz0(ctx, startTime, duration) {
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = 220;
    gain.gain.setValueAtTime(0.3, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
}

// Buzz 1: Square wave (180 Hz, aggressive)
function playBuzz1(ctx, startTime, duration) {
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 180;
    gain.gain.setValueAtTime(0.3, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
}

// Buzz 2: Sawtooth + square mix (200 Hz, distorted)
function playBuzz2(ctx, startTime, duration) {
    var osc1 = ctx.createOscillator();
    var osc2 = ctx.createOscillator();
    var gain = ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.value = 200;
    osc2.type = 'square';
    osc2.frequency.value = 200;
    gain.gain.setValueAtTime(0.3, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
}

// Buzz 3: Triangle wave + frequency modulation (240 Hz, mechanical)
function playBuzz3(ctx, startTime, duration) {
    var osc = ctx.createOscillator();
    var lfo = ctx.createOscillator();
    var lfoGain = ctx.createGain();
    var gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 240;
    lfo.type = 'square';
    lfo.frequency.value = 30;
    lfoGain.gain.value = 20;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    gain.gain.setValueAtTime(0.3, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    lfo.start(startTime);
    osc.stop(startTime + duration);
    lfo.stop(startTime + duration);
}

// Buzz 4: Frequency sweep (190→150 Hz, warbling)
function playBuzz4(ctx, startTime, duration) {
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(190, startTime);
    osc.frequency.exponentialRampToValueAtTime(150, startTime + duration);
    gain.gain.setValueAtTime(0.3, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
}

// --- Victory fanfare ---

function playVictoryFanfare() {
    if (prefersReducedMotion()) return;

    var ctx = getAudioContext();
    if (!ctx) return;

    var notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    var noteDuration = 0.35;

    for (var i = 0; i < notes.length; i++) {
        var startTime = ctx.currentTime + (i * noteDuration);
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.value = notes[i];
        gain.gain.setValueAtTime(0.4, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + noteDuration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + noteDuration);
    }
}

// --- AHOOGA ---

function playAhooga() {
    if (prefersReducedMotion()) return;

    var ctx = getAudioContext();
    if (!ctx) return;

    var duration = 0.8;
    var startTime = ctx.currentTime;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, startTime);
    osc.frequency.exponentialRampToValueAtTime(220, startTime + duration * 0.5);
    osc.frequency.setValueAtTime(400, startTime + duration * 0.5);
    osc.frequency.exponentialRampToValueAtTime(220, startTime + duration);
    gain.gain.setValueAtTime(0.5, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
}

// --- Final combo: all judge sounds overlapping + AHOOGA ---

function playFinalCombo(judgeSounds) {
    if (prefersReducedMotion()) return;

    var ctx = getAudioContext();
    if (!ctx) return;

    // Play all judge sounds with 50ms offset
    for (var i = 0; i < judgeSounds.length; i++) {
        (function(idx) {
            setTimeout(function() {
                playBuzz(judgeSounds[idx], 1);
            }, idx * 50);
        })(i);
    }

    // Play AHOOGA after all buzzes start
    setTimeout(function() {
        playAhooga();
    }, judgeSounds.length * 50 + 100);
}
