/* ===========================
   HERO CANVAS — NETWORK GRID
   =========================== */
const canvas = document.getElementById('heroCanvas');
const ctx = canvas.getContext('2d');
const nodes = [];
const NODE_COUNT = 60;
const CONNECT_DIST = 140;

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
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: Math.random() * 1.5 + 0.8,
  });
}

function animateNetwork() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update positions
  for (const n of nodes) {
    n.x += n.vx;
    n.y += n.vy;
    if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
    if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
  }

  // Draw connections
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CONNECT_DIST) {
        const alpha = (1 - dist / CONNECT_DIST) * 0.12;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.strokeStyle = `rgba(255, 92, 53, ${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }
  }

  // Draw nodes
  for (const n of nodes) {
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(224, 224, 230, 0.25)';
    ctx.fill();
  }

  requestAnimationFrame(animateNetwork);
}
animateNetwork();

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
      'Stakeholder and community needs are incorporated into infrastructure prioritisation.',
      'There is a clear, funded pipeline of infrastructure projects for the next 10+ years.',
    ],
  },
  can: {
    label: 'Can',
    description: 'Capability & capacity to deliver',
    questions: [
      'We have sufficient skilled workforce and supply-chain capacity to deliver our infrastructure programme.',
      'Procurement and consenting processes enable timely project commencement.',
      'Funding mechanisms (rates, grants, debt) are adequate and sustainable for planned works.',
      'Our organisation has access to modern construction methods and technology.',
      'Cross-agency coordination is effective when projects span multiple jurisdictions.',
    ],
  },
  do: {
    label: 'Do',
    description: 'Execution & delivery performance',
    questions: [
      'Infrastructure projects are consistently delivered on time and within budget.',
      'Asset maintenance programmes are executed to prevent unplanned failures.',
      'Construction quality meets or exceeds design specifications and standards.',
      'Health, safety, and environmental performance on infrastructure sites is strong.',
      'Disruption to the public during construction is actively minimised.',
    ],
  },
  review: {
    label: 'Review',
    description: 'Monitoring, learning & improvement',
    questions: [
      'Post-completion reviews are conducted and lessons are fed back into future projects.',
      'Asset performance is monitored against service-level targets in real time.',
      'Infrastructure spending is transparently reported and benchmarked against peers.',
      'Community satisfaction with infrastructure services is regularly measured.',
      'Audit and assurance processes drive continuous improvement in delivery.',
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
        <div class="dim-badge">${dim.label}</div>
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
      <div class="dim-badge">Value at Risk</div>
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
   SPRING PHYSICS UTILITY
   =========================== */
function springAnimate(from, to, onUpdate, onDone) {
  const stiffness = 170, damping = 14, mass = 1;
  let pos = from, vel = 0;
  const threshold = 0.01;
  function tick() {
    const displacement = pos - to;
    const springForce = -stiffness * displacement;
    const dampForce = -damping * vel;
    const accel = (springForce + dampForce) / mass;
    vel += accel * (1 / 60);
    pos += vel * (1 / 60);
    onUpdate(pos);
    if (Math.abs(pos - to) < threshold && Math.abs(vel) < threshold) {
      onUpdate(to);
      if (onDone) onDone();
    } else {
      requestAnimationFrame(tick);
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

  const cards = dash.querySelectorAll('.card');
  cards.forEach((card, i) => {
    setTimeout(() => card.classList.add('revealed'), i * 200);
  });

  setTimeout(() => drawRadar(results.dimScores), 200);
  setTimeout(() => drawGauges(results), 400);
  setTimeout(() => drawFrontline(results.dimScores), 600);
  setTimeout(() => writeSummary(results.maturityPct, results.taxRiskPct, results.valueAtRisk), 800);
}

/* --- RADAR CHART --- */
function drawRadar(dimScores) {
  const rc = document.getElementById('radarChart');
  const c = rc.getContext('2d');
  const W = rc.width, H = rc.height;
  const cx = W / 2, cy = H / 2, R = Math.min(W, H) / 2 - 40;
  const labels = dimKeys.map(dk => dimensions[dk].label);
  const scores = dimKeys.map(dk => dimScores[dk]);
  const n = labels.length;
  const angleStep = (Math.PI * 2) / n;
  const startAngle = -Math.PI / 2;

  springAnimate(0, 1, (progress) => {
    c.clearRect(0, 0, W, H);

    for (let ring = 1; ring <= 4; ring++) {
      const r = (R / 4) * ring;
      c.beginPath();
      for (let i = 0; i <= n; i++) {
        const a = startAngle + angleStep * i;
        c[i === 0 ? 'moveTo' : 'lineTo'](cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      }
      c.strokeStyle = 'rgba(255,255,255,0.06)';
      c.lineWidth = 1;
      c.stroke();
    }

    for (let i = 0; i < n; i++) {
      const a = startAngle + angleStep * i;
      c.beginPath(); c.moveTo(cx, cy);
      c.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
      c.strokeStyle = 'rgba(255,255,255,0.06)';
      c.stroke();
      const lx = cx + Math.cos(a) * (R + 24);
      const ly = cy + Math.sin(a) * (R + 24);
      c.fillStyle = '#8a8a96';
      c.font = '13px Inter';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(labels[i], lx, ly);
    }

    const p = Math.max(0, Math.min(progress, 1.3));
    c.beginPath();
    for (let i = 0; i < n; i++) {
      const a = startAngle + angleStep * i;
      const val = (scores[i] / 100) * R * p;
      c[i === 0 ? 'moveTo' : 'lineTo'](cx + Math.cos(a) * val, cy + Math.sin(a) * val);
    }
    c.closePath();
    c.fillStyle = 'rgba(255, 92, 53, 0.15)';
    c.fill();
    c.strokeStyle = '#ff5c35';
    c.lineWidth = 2;
    c.stroke();

    for (let i = 0; i < n; i++) {
      const a = startAngle + angleStep * i;
      const val = (scores[i] / 100) * R * p;
      c.beginPath();
      c.arc(cx + Math.cos(a) * val, cy + Math.sin(a) * val, 4, 0, Math.PI * 2);
      c.fillStyle = '#ff5c35';
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
    const color = s >= 66 ? '#50dc78' : s >= 33 ? '#ffc832' : '#ff5c35';
    html += `
      <div class="gauge-item">
        <label>${dimensions[dk].label} <span class="gauge-desc">— ${dimensions[dk].description}</span></label>
        <div class="gauge-track"><div class="gauge-fill" data-target="${s}" style="background:${color}"></div></div>
        <div class="gauge-value">${fmt(s)}%</div>
      </div>`;
  });

  html += '<div class="gauge-divider"></div>';
  html += '<div class="gauge-section-label">Overall</div>';

  const matColor = maturityPct >= 66 ? '#50dc78' : maturityPct >= 33 ? '#ffc832' : '#ff5c35';
  html += `
    <div class="gauge-item">
      <label>Infrastructure Maturity</label>
      <div class="gauge-track"><div class="gauge-fill" data-target="${maturityPct}" style="background:${matColor}"></div></div>
      <div class="gauge-value">${fmt(maturityPct)}%</div>
    </div>`;

  const taxColor = taxRiskPct <= 34 ? '#50dc78' : taxRiskPct <= 66 ? '#ffc832' : '#ff5c35';
  html += `
    <div class="gauge-item" id="taxRiskGauge">
      <label>Infrastructure Tax Risk</label>
      <div class="gauge-track"><div class="gauge-fill spring" id="taxRiskFill" style="background:${taxColor}"></div></div>
      <div class="gauge-value" id="taxRiskValue">0%</div>
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

  const taxFill = document.getElementById('taxRiskFill');
  const taxValue = document.getElementById('taxRiskValue');
  const varAmount = document.getElementById('varAmount');

  springAnimate(0, taxRiskPct, (v) => {
    const clamped = Math.max(0, v);
    taxFill.style.width = clamped + '%';
    taxValue.textContent = fmt(clamped) + '%';
    if (varAmount && projectBudget > 0) {
      varAmount.textContent = fmtCurrency(projectBudget * (clamped / 100));
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

  const planColor = planScore >= 66 ? '#50dc78' : planScore >= 33 ? '#ffc832' : '#ff5c35';
  const doColor = doScore >= 66 ? '#50dc78' : doScore >= 33 ? '#ffc832' : '#ff5c35';

  bars.innerHTML = `
    <div class="frontline-row">
      <div class="frontline-label">Plan</div>
      <div class="frontline-track">
        <div class="frontline-fill" id="flPlan" style="background:${planColor}"><span>${Math.round(planScore)}%</span></div>
      </div>
    </div>
    <div class="frontline-row">
      <div class="frontline-label">Do</div>
      <div class="frontline-track">
        <div class="frontline-fill" id="flDo" style="background:${doColor}"><span>${Math.round(doScore)}%</span></div>
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
function writeSummary(maturityPct, taxRiskPct, valueAtRisk) {
  const el = document.getElementById('summaryText');
  const badge = document.getElementById('scoreBadge');
  let level, cls, text;

  if (maturityPct >= 66) {
    level = 'Low Risk'; cls = 'score-low';
    text = 'Your infrastructure programme demonstrates strong maturity across planning, capability, delivery, and review. Maintain current disciplines and focus on continuous improvement to sustain this position.';
  } else if (maturityPct >= 33) {
    level = 'Moderate Risk'; cls = 'score-med';
    text = 'There are material gaps in your infrastructure maturity that create delivery and fiscal risk. Targeted improvements in your weakest dimensions could significantly reduce cost overruns and service disruptions.';
  } else {
    level = 'High Risk'; cls = 'score-high';
    text = 'Your infrastructure programme faces significant maturity challenges across multiple dimensions. Without intervention, project delays, cost escalation, and asset failures are likely. A structured remediation programme is recommended.';
  }

  if (projectBudget > 0) {
    const fmtCurrency = n => '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
    text += ` With a project budget of ${fmtCurrency(projectBudget)}, an estimated ${fmtCurrency(valueAtRisk)} is at risk due to infrastructure immaturity.`;
  }

  el.textContent = text;
  badge.textContent = `Infrastructure Tax: ${level} (${Math.round(taxRiskPct)}%)`;
  badge.className = `score-badge ${cls}`;
}
