/* ScholarSync — offline ambient sounds and chime (Web Audio, no media files) */
(function () {
  'use strict';

  let ctx = null, master = null;
  let volume = 0.6;
  let current = null;      // { nodes: [], timers: [] }
  let currentType = null;
  const buffers = {};

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = volume;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return true;
  }

  function noise(type, seconds) {
    const key = type + seconds;
    if (buffers[key]) return buffers[key];
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    if (type === 'white') {
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    } else if (type === 'pink') {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.96900 * b2 + w * 0.1538520;
        b3 = 0.86650 * b3 + w * 0.3104856; b4 = 0.55000 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
        b6 = w * 0.115926;
      }
    } else { // brown
      let last = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        last = (last + 0.02 * w) / 1.02;
        data[i] = last * 3.5;
      }
    }
    buffers[key] = buf;
    return buf;
  }

  function loopSource(buf) {
    const src = ctx.createBufferSource();
    src.buffer = buf; src.loop = true;
    // random start so overlapping loops don't phase together
    src.start(0, Math.random() * buf.duration);
    return src;
  }
  function gain(v) { const g = ctx.createGain(); g.gain.value = v; return g; }
  function filter(type, freq, q) { const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; if (q) f.Q.value = q; return f; }
  function chain() { // chain(a, b, c) connects a->b->c and returns the last
    for (let i = 0; i < arguments.length - 1; i++) arguments[i].connect(arguments[i + 1]);
    return arguments[arguments.length - 1];
  }

  function burst(dest, freq, filterType, peak, dur) {
    const src = ctx.createBufferSource();
    src.buffer = noise('white', 0.25);
    const f = filter(filterType, freq, 1.2);
    const g = gain(0);
    const t = ctx.currentTime;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    chain(src, f, g, dest);
    src.start(t); src.stop(t + dur + 0.05);
  }

  const BUILDERS = {
    white() {
      const g = gain(0.18);
      chain(loopSource(noise('white', 4)), filter('lowpass', 9000), g, master);
      return { nodes: [g], timers: [] };
    },
    brown() {
      const g = gain(0.55);
      chain(loopSource(noise('brown', 6)), g, master);
      return { nodes: [g], timers: [] };
    },
    rain() {
      const bed = gain(0.5);
      chain(loopSource(noise('pink', 5)), filter('highpass', 500), filter('lowpass', 4000), bed, master);
      // slow swell so the rain breathes
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.08;
      const lfoGain = gain(0.12); chain(lfo, lfoGain, bed.gain); lfo.start();
      const drops = gain(0.9); drops.connect(master);
      const timers = [];
      const schedule = () => {
        burst(drops, 2500 + Math.random() * 3500, 'bandpass', 0.12 + Math.random() * 0.2, 0.03 + Math.random() * 0.05);
        timers[0] = setTimeout(schedule, 40 + Math.random() * 160);
      };
      schedule();
      return { nodes: [bed, lfo, drops], timers };
    },
    cafe() {
      const murmur = gain(0.75);
      chain(loopSource(noise('brown', 6)), filter('lowpass', 420), murmur, master);
      const voices = gain(0.08);
      chain(loopSource(noise('pink', 5)), filter('bandpass', 700, 0.8), voices, master);
      const lfo = ctx.createOscillator(); lfo.type = 'triangle'; lfo.frequency.value = 0.35;
      const lfoGain = gain(0.05); chain(lfo, lfoGain, voices.gain); lfo.start();
      const fx = gain(1); fx.connect(master);
      const timers = [];
      const clink = () => {
        const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = 1800 + Math.random() * 2600;
        const g = gain(0); const t = ctx.currentTime;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.035 + Math.random() * 0.03, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
        chain(o, g, fx); o.start(t); o.stop(t + 0.3);
        if (Math.random() < 0.4) burst(fx, 180, 'lowpass', 0.2, 0.12); // a cup set down
        timers[0] = setTimeout(clink, 2500 + Math.random() * 6000);
      };
      timers[0] = setTimeout(clink, 1500);
      return { nodes: [murmur, voices, lfo, fx], timers };
    }
  };

  function stop() {
    if (current) {
      current.timers.forEach(clearTimeout);
      current.nodes.forEach(n => { try { if (n.stop) n.stop(); n.disconnect(); } catch (e) { /* ignore */ } });
    }
    current = null; currentType = null;
  }

  /** Toggle an ambient sound; returns the type now playing (or null). */
  function toggle(type) {
    if (currentType === type) { stop(); return null; }
    if (!ensure()) return null;
    stop();
    try { current = BUILDERS[type](); currentType = type; } catch (e) { console.error(e); current = null; currentType = null; }
    return currentType;
  }

  function setVolume(v) {
    volume = Math.max(0, Math.min(1, v));
    if (master) master.gain.setTargetAtTime(volume, ctx.currentTime, 0.05);
  }

  /** Create the audio context during a user gesture so the chime can play later. */
  function prime() { ensure(); }

  function chime() {
    if (!ensure()) return;
    const notes = [659.25, 830.61, 987.77]; // E5, G#5, B5
    const t0 = ctx.currentTime;
    notes.forEach((f, i) => {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
      const g = gain(0); const t = t0 + i * 0.16;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.22, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
      chain(o, g, ctx.destination); o.start(t); o.stop(t + 1.2);
    });
  }

  window.SS = window.SS || {};
  window.SS.audio = { toggle, stop, setVolume, prime, chime, get playing() { return currentType; } };
})();
