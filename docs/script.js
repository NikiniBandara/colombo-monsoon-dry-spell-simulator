'use strict';

// Dry probabilities are the full-precision second column of
// models/seasonal_markov_model.json: [P(Dry | Wet), P(Dry | Dry)].
const MATRIX = {
  NE: [0.3008658008658009, 0.8270911360799001],
  FI: [0.17287234042553193, 0.6431034482758621],
  SW: [0.03711034141514102, 0.371900826446281],
  SI: [0.07844474761255116, 0.5826446280991735]
};
const REF = Object.freeze({
  date: '2026-01-01',
  days: 90,
  runs: 10000,
  threshold: 7,
  initial: 0,
  seed: 42
});
const NOTEBOOK_PROBABILITY = 97.12;
const TOLERANCE_PP = 1;
const BATCH_SIZE = 100;
const SAMPLE_COUNT = 12;

function season(month) {
  return month === 12 || month <= 2 ? 'NE'
    : month <= 4 ? 'FI'
    : month <= 9 ? 'SW' : 'SI';
}

function probabilities(config) {
  const start = Date.parse(config.date + 'T00:00:00Z');
  return Array.from({length: config.days}, (_, day) => {
    const date = new Date(start + day * 86400000);
    return MATRIX[season(date.getUTCMonth() + 1)];
  });
}

// Seeded Mulberry32 from the supplied starter.
function random(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function scenario(probs, initial, rng) {
  let state = initial;
  let streak = 0;
  let longest = 0;
  let dry = 0;
  const seq = [];
  for (const p of probs) {
    state = Number(rng() < p[state]);
    seq.push(state);
    dry += state;
    streak = state ? streak + 1 : 0;
    longest = Math.max(longest, streak);
  }
  return {seq, dry, longest};
}

function runState(config) {
  return {
    c: config,
    probs: probabilities(config),
    rng: random(config.seed),
    n: 0,
    hits: 0,
    dry: 0,
    longest: 0,
    hist: Array(config.days + 1).fill(0),
    samples: []
  };
}

function advance(state, count) {
  for (let i = 0; i < count && state.n < state.c.runs; i++) {
    const result = scenario(state.probs, state.c.initial, state.rng);
    state.n++;
    state.hits += Number(result.longest >= state.c.threshold);
    state.dry += result.dry;
    state.longest += result.longest;
    state.hist[result.longest]++;
    state.samples.push(result.seq);
    if (state.samples.length > SAMPLE_COUNT) state.samples.shift();
  }
}

function wilson(hits, count) {
  const p = hits / count;
  const z = 1.96;
  const d = 1 + z * z / count;
  const middle = (p + z * z / (2 * count)) / d;
  const half = z * Math.sqrt(p * (1 - p) / count + z * z / (4 * count * count)) / d;
  return [Math.max(0, middle - half), Math.min(1, middle + half)];
}

if (typeof module !== 'undefined') {
  module.exports = {
    MATRIX, REF, NOTEBOOK_PROBABILITY, TOLERANCE_PP,
    season, probabilities, random, scenario, runState, advance, wilson
  };
}

if (typeof document !== 'undefined') {
  const $ = id => document.getElementById(id);
  const keys = Object.keys(REF);
  let state = null;
  let timer = null;
  let mode = 'ready';

  function fields(config) {
    keys.forEach(key => { $(key).value = config[key]; });
  }

  function showError(message) {
    $('error').textContent = message;
    $('error').hidden = !message;
  }

  function config() {
    if (!$('settings').reportValidity()) {
      showError('Check the highlighted setting and try again.');
      return null;
    }
    const values = Object.fromEntries(keys.map(key => [
      key, key === 'date' ? $(key).value : Number($(key).value)
    ]));
    const date = new Date(values.date + 'T00:00:00Z');
    const validDate = /^\d{4}-\d{2}-\d{2}$/.test(values.date)
      && !Number.isNaN(date.getTime())
      && date.toISOString().slice(0, 10) === values.date;
    const withinLimits = Number.isInteger(values.days) && values.days >= 1 && values.days <= 366
      && Number.isInteger(values.runs) && values.runs >= 1 && values.runs <= 50000
      && Number.isInteger(values.threshold) && values.threshold >= 1 && values.threshold <= values.days
      && (values.initial === 0 || values.initial === 1)
      && Number.isInteger(values.seed) && values.seed >= 0 && values.seed <= 4294967295;
    if (!validDate || !withinLimits) {
      showError('Use a valid date, whole-number settings, and a minimum spell no longer than the duration.');
      return null;
    }
    showError('');
    return values;
  }

  function controls() {
    const active = mode === 'running' || mode === 'paused';
    keys.forEach(key => { $(key).disabled = active; });
    $('start').disabled = mode === 'running';
    $('start').textContent = mode === 'paused' ? 'Resume' : 'Start';
    $('pause').disabled = mode !== 'running';
    $('reference').disabled = active;
  }

  function clearCanvas(id) {
    const canvas = $(id);
    const width = Math.round(canvas.clientWidth || canvas.width || 720);
    const height = id === 'hist' ? (width < 480 ? 230 : 260) : 180;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return [canvas, ctx];
  }

  function drawSamples() {
    const [canvas, ctx] = clearCanvas('samples');
    if (!state || !state.n) return;
    const cellWidth = canvas.width / state.c.days;
    const cellHeight = canvas.height / SAMPLE_COUNT;
    state.samples.forEach((row, rowIndex) => {
      row.forEach((value, dayIndex) => {
        ctx.fillStyle = value ? '#a96719' : '#28749c';
        ctx.fillRect(dayIndex * cellWidth, rowIndex * cellHeight,
          Math.max(cellWidth - 0.5, 0.5), cellHeight - 1);
      });
    });
  }

  function drawHistogram() {
    const [canvas, ctx] = clearCanvas('hist');
    if (!state || !state.n) return;
    const {hist, c} = state;
    const peak = Math.max(...hist, 1);
    const left = 45;
    const right = canvas.width - 12;
    const top = 28;
    const bottom = canvas.height - 42;
    const barWidth = (right - left) / hist.length;
    ctx.strokeStyle = '#aabac0';
    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(left, bottom);
    ctx.lineTo(right, bottom);
    ctx.stroke();
    ctx.fillStyle = '#263650';
    ctx.font = '12px system-ui';
    ctx.fillText(String(peak), 5, top + 4);
    ctx.fillText('0', 27, bottom + 4);
    ctx.fillText('Scenarios', 5, 12);
    hist.forEach((count, spell) => {
      const height = count / peak * (bottom - top - 7);
      ctx.fillStyle = spell >= c.threshold ? '#a96719' : '#28749c';
      ctx.fillRect(left + spell * barWidth, bottom - height,
        Math.max(barWidth - 0.5, 0.5), height);
    });
    ctx.fillStyle = '#263650';
    const slots = Math.max(3, Math.floor((right - left) / 70));
    const step = Math.max(1, Math.ceil(c.days / slots));
    for (let day = 0; day < hist.length; day += step) {
      ctx.fillText(String(day), left + day * barWidth, bottom + 16);
    }
    if (c.days % step !== 0) {
      ctx.fillText(String(c.days), right - 18, bottom + 16);
    }
    ctx.fillText('Longest spell (days)', canvas.width / 2 - 60, canvas.height - 5);
  }

  function render() {
    const count = state?.n || 0;
    const total = state?.c.runs || REF.runs;
    $('progress').max = total;
    $('progress').value = count;
    $('completed').textContent = count.toLocaleString() + ' / ' + total.toLocaleString();
    $('status').textContent = mode === 'ready' ? 'Ready'
      : mode === 'running' ? 'Running'
      : mode === 'paused' ? 'Paused' : 'Complete';
    $('risk').textContent = count ? (100 * state.hits / count).toFixed(2) + '%' : '—';
    $('dry').textContent = count ? (state.dry / count).toFixed(2) : '—';
    $('longest').textContent = count ? (state.longest / count).toFixed(2) : '—';
    $('interval').textContent = count
      ? '95% Monte Carlo sampling interval (Wilson): ' +
        wilson(state.hits, count).map(value => (100 * value).toFixed(2) + '%').join(' – ')
      : '95% Monte Carlo sampling interval (Wilson): —';

    const matchesReference = state && keys.every(key => state.c[key] === REF[key]);
    $('browser-probability').textContent = count && matchesReference
      ? (100 * state.hits / count).toFixed(2) + '%' : '—';
    $('difference').textContent = count && matchesReference
      ? Math.abs(100 * state.hits / count - NOTEBOOK_PROBABILITY).toFixed(2) + ' percentage points'
      : '—';
    if (mode === 'complete' && matchesReference) {
      const difference = Math.abs(100 * state.hits / count - NOTEBOOK_PROBABILITY);
      const passed = difference <= TOLERANCE_PP;
      $('verification').textContent = (passed ? 'PASS' : 'FAIL') +
        ' — browser ' + (100 * state.hits / count).toFixed(2) +
        '%; absolute difference ' + difference.toFixed(2) + ' percentage points.';
      $('verification').className = passed ? 'pass' : 'fail';
    } else {
      $('verification').textContent = matchesReference && count
        ? 'Reference run in progress; the final check appears when all simulations finish.'
        : 'Not run. Use “Load and run reference” to compare the same settings.';
      $('verification').className = '';
    }
    drawSamples();
    drawHistogram();
    controls();
  }

  function stop() {
    if (timer !== null) clearTimeout(timer);
    timer = null;
  }

  function tick() {
    timer = null;
    if (mode !== 'running') return;
    advance(state, BATCH_SIZE);
    if (state.n === state.c.runs) mode = 'complete';
    render();
    if (mode === 'running') timer = setTimeout(tick, 16);
  }

  function start() {
    if (mode === 'running') return;
    if (mode === 'paused') {
      mode = 'running';
      render();
      timer = setTimeout(tick, 16);
      return;
    }
    const settings = config();
    if (!settings) return;
    stop();
    state = runState(settings);
    mode = 'running';
    render();
    timer = setTimeout(tick, 16);
  }

  $('settings').addEventListener('submit', event => {
    event.preventDefault();
    start();
  });
  $('start').addEventListener('click', start);
  $('pause').addEventListener('click', () => {
    if (mode !== 'running') return;
    stop();
    mode = 'paused';
    render();
  });
  $('reset').addEventListener('click', () => {
    stop();
    state = null;
    mode = 'ready';
    fields(REF);
    showError('');
    render();
  });
  $('reference').addEventListener('click', () => {
    if (mode === 'running' || mode === 'paused') return;
    fields(REF);
    start();
  });
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', () => {
      drawSamples();
      drawHistogram();
    });
  }
  fields(REF);
  render();
}
