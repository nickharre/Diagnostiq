/* ===========================
   HERO CANVAS — NETWORK GRID
   =========================== */
const canvas = document.getElementById('heroCanvas');
const ctx = canvas.getContext('2d');
const nodes = [];
const NODE_COUNT = 50;
const CONNECT_DIST = 150;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

for (let i = 0; i < NODE_COUNT; i++) {
  nodes.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    r: Math.random() * 1.2 + 0.6,
  });
}

function animateNetwork() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const n of nodes) {
    n.x += n.vx;
    n.y += n.vy;
    if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
    if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
  }
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CONNECT_DIST) {
        const alpha = (1 - dist / CONNECT_DIST) * 0.08;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.strokeStyle = `rgba(122, 122, 133, ${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
  for (const n of nodes) {
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(122, 122, 133, 0.2)';
    ctx.fill();
  }
  requestAnimationFrame(animateNetwork);
}
animateNetwork();

/* ===========================
   SERVICE QUAD COLOURS
   =========================== */
const dimColors = {
  plan: '#4C7A56',
  can: '#D98324',
  do: '#4A90E2',
  review: '#7A7A85',
};

/* ===========================
   SURVEY ENGINE
   =========================== */
const dimensions = {
  plan: {
    label: 'Plan',
    description: 'Strategic planning & foresight',
    questions: [
      'Our organisation has a long-term infrastructure investment strategy aligned to demand forecasts.',
      'Asset condition data is systematically collected and used to inform capital planning.',
      'Infrastructure risks (climate, demographic, regulatory) are formally assessed during planning.',
    ],
  },
  can: {
    label: 'Can',
    description: 'Capability & capacity to deliver',
    questions: [
      'We have sufficient skilled workforce and supply-chain capacity to deliver our infrastructure programme.',
      'Procurement and consenting processes enable timely project commencement.',
      'Funding mechanisms (rates, grants, debt) are adequate and sustainable for planned works.',
    ],
  },
  do: {
    label: 'Do',
    description: 'Execution & delivery performance',
    questions: [
      'Infrastructure projects are consistently delivered on time and within budget.',
      'Asset maintenance programmes are executed to prevent unplanned failures.',
      'Construction quality meets or exceeds design specifications and standards.',
    ],
  },
  review: {
    label: 'Review',
    description: 'Monitoring, learning & improvement',
    questions: [
      'Post-completion reviews are conducted and lessons are fed back into future projects.',
      'Asset performance is monitored against service-level targets in real time.',
      'Infrastructure spending is transparently reported and benchmarked against peers.',
    ],
  },
};

const dimKeys = Object.keys(dimensions);
const allQuestions = [];
dimKeys.forEach(dk => {
  dimensions[dk].questions.forEach((q, i) => {
    allQuestions.push({ dim: dk, q, index: i });
  });
});

const likertLabels = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];
const totalSteps = allQuestions.length + 1;
const answers = new Array(allQuestions.length).fill(0);
let projectBudget = 0;
let currentStep = 0;

const surveyBody = document.getElementById('surveyBody');
const progressFill = document.getElementById('progressFill');
const stepLabel = document.getElementById('stepLabel');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

function renderSteps() {
  let html = '';
  allQuestions.forEach((item, i) => {
    const dim = dimensions[item.dim];
    html += `
      <div class="survey-step ${i === 0 ? 'active' : ''}" data-step="${i}">
        <div class="dim-badge dim-badge-${item.dim}">${dim.label}</div>
        <h3>${item.q}</h3>
        <div class="option-group likert-group">
          ${likertLabels.map((l, v) => `
            <label class="option-label likert-label" data-q="${i}" data-v="${v + 1}">
              <input type="radio" name="q${i}" value="${v + 1}">
              <span class="likert-num">${v + 1}</span>
              <span class="likert-text">${l}</span>
            </label>
          `).join('')}
        </div>
      </div>`;
  });

  html += `
    <div class="survey-step" data-step="${allQuestions.length}">
      <div class="dim-badge dim-badge-can">Value at Risk</div>
      <h3>What is the total project or programme budget?</h3>
      <p class="budget-hint">Enter the budget in dollars. This is used to calculate your Value at Risk.</p>
      <div class="budget-input-wrap">
        <span class="budget-prefix">$</span>
        <input type="text" id="budgetInput" class="budget-input" placeholder="e.g. 50,000,000" inputmode="numeric">
      </div>
    </div>`;

  surveyBody.innerHTML = html;

  surveyBody.querySelectorAll('.likert-label').forEach(label => {
    label.addEventListener('click', () => {
      const qi = +label.dataset.q;
      const vi = +label.dataset.v;
      answers[qi] = vi;
      label.closest('.option-group').querySelectorAll('.option-label').forEach(l => l.classList.remove('selected'));
      label.classList.add('selected');
    });
  });
}
renderSteps();

function goToStep(n) {
  document.querySelectorAll('.survey-step').forEach(s => s.classList.remove('active'));
  document.querySelector(`.survey-step[data-step="${n}"]`).classList.add('active');
  currentStep = n;
  progressFill.style.width = `${((n + 1) / totalSteps) * 100}%`;
  if (n < allQuestions.length) {
    const item = allQuestions[n];
    stepLabel.textContent = `${dimensions[item.dim].label} — Question ${n + 1} of ${allQuestions.length}`;
  } else {
    stepLabel.textContent = 'Final Step — Project Budget';
  }
  prevBtn.disabled = n === 0;
  nextBtn.textContent = n === totalSteps - 1 ? 'Calculate My Tax Risk' : 'Next →';
}

prevBtn.addEventListener('click', () => { if (currentStep > 0) goToStep(currentStep - 1); });
nextBtn.addEventListener('click', () => {
  if (currentStep < allQuestions.length) {
    if (answers[currentStep] === 0) {
      document.querySelector('.survey-step.active .option-group').style.animation = 'shake 0.3s ease';
      setTimeout(() => document.querySelector('.survey-step.active .option-group').style.animation = '', 300);
      return;
    }
  } else {
    const raw = document.getElementById('budgetInput').value.replace(/[^0-9.]/g, '');
    projectBudget = parseFloat(raw) || 0;
  }
  if (currentStep < totalSteps - 1) {
    goToStep(currentStep + 1);
  } else {
    beginAnalysis();
  }
});

/* ===========================
   CALCULATIONS
   =========================== */
function calcDimensionScore(dimKey) {
  let sum = 0, count = 0;
  allQuestions.forEach((q, i) => {
    if (q.dim === dimKey) { sum += answers[i]; count++; }
  });
  return ((sum / count - 1) / 4) * 100;
}

function calcResults() {
  const dimScores = {};
  dimKeys.forEach(dk => { dimScores[dk] = calcDimensionScore(dk); });
  const maturityPct = dimKeys.reduce((s, dk) => s + dimScores[dk], 0) / dimKeys.length;
  const taxRiskPct = 100 - maturityPct;
  const valueAtRisk = projectBudget * (taxRiskPct / 100);
  return { dimScores, maturityPct, taxRiskPct, valueAtRisk };
}

/* ===========================
   HEAVY EASING UTILITY
   =========================== */
function heavyAnimate(duration, onUpdate, onDone) {
  const start = performance.now();
  function tick(now) {
    const raw = Math.min((now - start) / duration, 1);
    const t = raw < 0.5 ? 4 * raw * raw * raw : 1 - Math.pow(-2 * raw + 2, 3) / 2;
    onUpdate(t);
    if (raw < 1) {
      requestAnimationFrame(tick);
    } else {
      onUpdate(1);
      if (onDone) onDone();
    }
  }
  requestAnimationFrame(tick);
}

/* ===========================
   ANALYSING STATE → DASHBOARD
   =========================== */
function beginAnalysis() {
  document.getElementById('survey').style.display = 'none';
  const overlay = document.getElementById('analysingOverlay');
  overlay.classList.remove('hidden');
  overlay.scrollIntoView({ behavior: 'smooth' });

  setTimeout(() => {
    overlay.classList.add('hidden');
    showDashboard();
  }, 2000);
}

/* ===========================
   DASHBOARD
   =========================== */
function showDashboard() {
  const dash = document.getElementById('dashboard');
  dash.classList.remove('hidden');
  dash.scrollIntoView({ behavior: 'smooth' });

  const results = calcResults();

  // Trigger scan line
  const scanLine = document.getElementById('scanLine');
  scanLine.classList.add('active');

  // Animate tax hero number with rapid count-up
  const taxHeroValue = document.getElementById('taxHeroValue');
  heavyAnimate(1200, (t) => {
    const v = results.taxRiskPct * t;
    taxHeroValue.textContent = v.toFixed(1) + '%';
  }, () => {
    taxHeroValue.textContent = results.taxRiskPct.toFixed(1) + '%';
  });

  // Stagger card reveals
  const cards = dash.querySelectorAll('.card');
  cards.forEach((card, i) => {
    setTimeout(() => card.classList.add('revealed'), 400 + i * 200);
  });

  setTimeout(() => drawRadar(results.dimScores), 600);
  setTimeout(() => drawGauges(results), 800);
  setTimeout(() => drawFrontline(results.dimScores), 1000);
  setTimeout(() => writeSummary(results), 1200);
}

/* --- RADAR CHART (service quad colours) --- */
function drawRadar(dimScores) {
  const rc = document.getElementById('radarChart');
  const c = rc.getContext('2d');
  const W = rc.width, H = rc.height;
  const cx = W / 2, cy = H / 2, R = Math.min(W, H) / 2 - 55;
  const labels = dimKeys.map(dk => dimensions[dk].label);
  const scores = dimKeys.map(dk => dimScores[dk]);
  const colors = dimKeys.map(dk => dimColors[dk]);
  const n = labels.length;
  const angleStep = (Math.PI * 2) / n;
  const startAngle = -Math.PI / 2;

  heavyAnimate(1400, (progress) => {
    c.clearRect(0, 0, W, H);

    // Grid rings
    for (let ring = 1; ring <= 4; ring++) {
      const r = (R / 4) * ring;
      c.beginPath();
      for (let i = 0; i <= n; i++) {
        const a = startAngle + angleStep * i;
        c[i === 0 ? 'moveTo' : 'lineTo'](cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      }
      c.strokeStyle = 'rgba(255,255,255,0.04)';
      c.lineWidth = 0.5;
      c.stroke();
    }

    // Axes + labels
    for (let i = 0; i < n; i++) {
      const a = startAngle + angleStep * i;
      c.beginPath(); c.moveTo(cx, cy);
      c.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
      c.strokeStyle = 'rgba(255,255,255,0.04)';
      c.lineWidth = 0.5;
      c.stroke();

      let lx = cx + Math.cos(a) * (R + 32);
      const ly = cy + Math.sin(a) * (R + 32);
      c.fillStyle = colors[i];
      c.font = '600 12px Inter';
      if (lx < cx - 10) {
        c.textAlign = 'left';
        lx = Math.max(4, lx);
      } else if (lx > cx + 10) {
        c.textAlign = 'right';
        lx = Math.min(W - 4, lx);
      } else {
        c.textAlign = 'center';
      }
      c.textBaseline = 'middle';
      c.fillText(labels[i], lx, ly);
    }

    // Data polygon — grows from centre
    c.beginPath();
    for (let i = 0; i < n; i++) {
      const a = startAngle + angleStep * i;
      const val = (scores[i] / 100) * R * progress;
      c[i === 0 ? 'moveTo' : 'lineTo'](cx + Math.cos(a) * val, cy + Math.sin(a) * val);
    }
    c.closePath();

    // Gradient fill using service colours
    c.fillStyle = 'rgba(217, 131, 36, 0.08)';
    c.fill();

    // Draw each edge segment in its dimension colour
    for (let i = 0; i < n; i++) {
      const a1 = startAngle + angleStep * i;
      const a2 = startAngle + angleStep * ((i + 1) % n);
      const v1 = (scores[i] / 100) * R * progress;
      const v2 = (scores[(i + 1) % n] / 100) * R * progress;
      c.beginPath();
      c.moveTo(cx + Math.cos(a1) * v1, cy + Math.sin(a1) * v1);
      c.lineTo(cx + Math.cos(a2) * v2, cy + Math.sin(a2) * v2);
      c.strokeStyle = colors[i];
      c.lineWidth = 1.5;
      c.stroke();
    }

    // Data points in dimension colours
    for (let i = 0; i < n; i++) {
      const a = startAngle + angleStep * i;
      const val = (scores[i] / 100) * R * progress;
      c.beginPath();
      c.arc(cx + Math.cos(a) * val, cy + Math.sin(a) * val, 3, 0, Math.PI * 2);
      c.fillStyle = colors[i];
      c.fill();
    }
  });
}

/* --- GAUGES --- */
function drawGauges({ dimScores, maturityPct, taxRiskPct, valueAtRisk }) {
  const container = document.getElementById('gauges');
  const fmt = n => n.toLocaleString('en-US', { maximumFractionDigits: 1 });
  const fmtCurrency = n => '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });

  let html = '<div class="gauge-section-label">Dimension Maturity</div>';
  dimKeys.forEach(dk => {
    const s = dimScores[dk];
    html += `
      <div class="gauge-item">
        <label>${dimensions[dk].label} <span class="gauge-desc">— ${dimensions[dk].description}</span></label>
        <div class="gauge-track"><div class="gauge-fill" data-target="${s}" style="background:${dimColors[dk]}"></div></div>
        <div class="gauge-value mono">${fmt(s)}%</div>
      </div>`;
  });

  html += '<div class="gauge-divider"></div>';
  html += '<div class="gauge-section-label">Overall</div>';

  html += `
    <div class="gauge-item">
      <label>Infrastructure Maturity</label>
      <div class="gauge-track"><div class="gauge-fill" data-target="${maturityPct}" style="background:var(--text-muted)"></div></div>
      <div class="gauge-value mono">${fmt(maturityPct)}%</div>
    </div>`;

  html += `
    <div class="gauge-item" id="taxRiskGauge">
      <label>Infrastructure Tax Risk</label>
      <div class="gauge-track"><div class="gauge-fill spring" id="taxRiskFill" style="background:var(--orange)"></div></div>
      <div class="gauge-value mono" id="taxRiskValue">0%</div>
    </div>`;

  if (projectBudget > 0) {
    html += `
      <div class="var-card">
        <div class="var-label">Value at Risk</div>
        <div class="var-amount" id="varAmount">$0</div>
        <div class="var-detail">${fmt(taxRiskPct)}% of ${fmtCurrency(projectBudget)} budget</div>
      </div>`;
  }

  container.innerHTML = html;

  requestAnimationFrame(() => {
    container.querySelectorAll('.gauge-fill:not(.spring)').forEach(el => {
      el.style.width = el.dataset.target + '%';
    });
  });

  // Tax Risk gauge — heavy easing count-up
  const taxFill = document.getElementById('taxRiskFill');
  const taxValue = document.getElementById('taxRiskValue');
  const varAmount = document.getElementById('varAmount');

  heavyAnimate(1200, (t) => {
    const v = taxRiskPct * t;
    taxFill.style.width = v + '%';
    taxValue.textContent = fmt(v) + '%';
    if (varAmount && projectBudget > 0) {
      varAmount.textContent = fmtCurrency(projectBudget * (v / 100));
    }
  }, () => {
    taxFill.style.width = taxRiskPct + '%';
    taxValue.textContent = fmt(taxRiskPct) + '%';
    if (varAmount && projectBudget > 0) {
      varAmount.textContent = fmtCurrency(projectBudget * (taxRiskPct / 100));
    }
  });
}

/* --- FRONTLINE REALITY --- */
function drawFrontline(dimScores) {
  const planScore = dimScores.plan;
  const doScore = dimScores.do;
  const gap = Math.abs(planScore - doScore);
  const higher = planScore >= doScore ? 'Plan' : 'Do';
  const lower = planScore >= doScore ? 'Do' : 'Plan';

  const text = document.getElementById('frontlineText');
  const bars = document.getElementById('frontlineBars');

  if (gap < 10) {
    text.textContent = `Your planning maturity (${Math.round(planScore)}%) and delivery execution (${Math.round(doScore)}%) are closely aligned. This coherence between boardroom strategy and site-level performance is a sign of organisational discipline.`;
  } else {
    text.textContent = `There is a ${Math.round(gap)}-point gap between ${higher} (${Math.round(higher === 'Plan' ? planScore : doScore)}%) and ${lower} (${Math.round(lower === 'Plan' ? planScore : doScore)}%). ${higher === 'Plan' ? 'Strategic intent is not translating into delivery outcomes — plans are being made that the organisation cannot reliably execute.' : 'Delivery capability exceeds strategic direction — operational teams are performing well despite weak upstream planning.'}`;
  }

  bars.innerHTML = `
    <div class="frontline-row">
      <div class="frontline-label">Plan</div>
      <div class="frontline-track">
        <div class="frontline-fill" id="flPlan" style="background:${dimColors.plan}"><span>${Math.round(planScore)}%</span></div>
      </div>
    </div>
    <div class="frontline-row">
      <div class="frontline-label">Do</div>
      <div class="frontline-track">
        <div class="frontline-fill" id="flDo" style="background:${dimColors.do}"><span>${Math.round(doScore)}%</span></div>
      </div>
    </div>
    ${gap >= 10 ? `<div class="frontline-gap"><span class="frontline-gap-label">↕ ${Math.round(gap)}pt gap — ${higher === 'Plan' ? 'execution deficit' : 'strategy deficit'}</span></div>` : ''}
  `;

  requestAnimationFrame(() => {
    document.getElementById('flPlan').style.width = planScore + '%';
    document.getElementById('flDo').style.width = doScore + '%';
    setTimeout(() => {
      document.getElementById('flPlan').classList.add('revealed');
      document.getElementById('flDo').classList.add('revealed');
    }, 1200);
  });
}

/* --- SUMMARY --- */
function writeSummary({ dimScores, maturityPct, taxRiskPct, valueAtRisk }) {
  const el = document.getElementById('summaryText');
  const badge = document.getElementById('scoreBadge');
  const fmtCurrency = n => '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
  let level, cls, text;

  if (maturityPct >= 66) {
    level = 'Low Risk'; cls = 'score-low';
    text = 'Your infrastructure programme demonstrates strong maturity across planning, capability, delivery, and review.';
  } else if (maturityPct >= 33) {
    level = 'Moderate Risk'; cls = 'score-med';
    text = 'There are material gaps in your infrastructure maturity that create delivery and fiscal risk.';
  } else {
    level = 'High Risk'; cls = 'score-high';
    text = 'Your infrastructure programme faces significant maturity challenges across multiple dimensions. Without intervention, project delays, cost escalation, and asset failures are likely.';
  }

  // Always identify weakest dimension and frame as opportunity
  const weakest = dimKeys.reduce((a, b) => dimScores[a] < dimScores[b] ? a : b);
  const weakScore = Math.round(dimScores[weakest]);
  const strongest = dimKeys.reduce((a, b) => dimScores[a] > dimScores[b] ? a : b);
  const strongScore = Math.round(dimScores[strongest]);
  const gap = strongScore - weakScore;

  const dimInsights = {
    plan: 'strategic planning and long-term investment foresight',
    can: 'organisational capability and delivery capacity',
    do: 'on-the-ground execution and project delivery',
    review: 'post-delivery review and continuous improvement',
  };

  if (gap > 10) {
    text += ` Your strongest dimension is ${dimensions[strongest].label} (${strongScore}%), but ${dimensions[weakest].label} lags at ${weakScore}% — a ${gap}-point gap. Strengthening ${dimInsights[weakest]} represents the highest-leverage opportunity to reduce overall programme risk.`;
  } else {
    text += ` Scores are relatively balanced, with ${dimensions[weakest].label} (${weakScore}%) as the area with most room for improvement. Even incremental gains in ${dimInsights[weakest]} would reduce residual risk.`;
  }

  if (projectBudget > 0) {
    text += ` With a programme budget of ${fmtCurrency(projectBudget)}, an estimated ${fmtCurrency(valueAtRisk)} is exposed to infrastructure immaturity risk.`;
  }

  el.textContent = text;
  badge.textContent = `Infrastructure Tax: ${level} (${Math.round(taxRiskPct)}%)`;
  badge.className = `score-badge ${cls}`;
}
