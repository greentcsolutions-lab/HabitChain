/* ═══════════════════════════════════════════════════
   HabitChain — app.js
   Vanilla JS + localStorage persistence
   No frameworks, no dependencies beyond CDNs
═══════════════════════════════════════════════════ */

'use strict';

// ── Constants ────────────────────────────────────────
const STORAGE_KEY  = 'habitchain_v1';
const WINS_KEY     = 'habitchain_wins_v1';
const MAX_HABITS   = 7;
const CHAIN_DAYS   = 21; // days to show in chain preview

const EMOJIS = ['🏃','📚','💧','🧘','✍️','🎯','💪','🌱','🍎','🛌','🎨','🎵','🧹','💊','🧘','🚴','🥗','📝','🌞','❤️','⭐','🔥','🏋️','🤸'];

const QUOTES = [
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { text: "Motivation gets you started. Habit keeps you going.", author: "Jim Ryun" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Don't break the chain.", author: "Jerry Seinfeld" },
  { text: "You'll never change your life until you change something you do daily.", author: "John Maxwell" },
  { text: "Habits are the compound interest of self-improvement.", author: "James Clear" },
  { text: "A small daily task, if it be really daily, will beat the labours of a spasmodic Hercules.", author: "Anthony Trollope" },
  { text: "First forget inspiration. Habit is more dependable.", author: "Octavia Butler" },
  { text: "The chains of habit are too light to be felt until they are too heavy to be broken.", author: "Warren Buffett" },
  { text: "Each morning we are born again. What we do today matters most.", author: "Buddha" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
];

// ── State ─────────────────────────────────────────────
let state = {
  habits: [],         // { id, name, icon, createdAt, completions: { 'YYYY-MM-DD': true } }
  theme: 'dark',
};
let wins = [];
let currentQuoteIndex = 0;
let heatmapYear, heatmapMonth;

// ── Helpers ───────────────────────────────────────────
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

const dateStr = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
};

const genId = () => Math.random().toString(36).slice(2,10);

const formatDate = (d) => d.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });

// Streak = consecutive days ending today (or yesterday)
const calcStreak = (completions) => {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i <= 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = dateStr(d);
    if (completions[key]) {
      streak++;
    } else {
      // Allow missing today (still building today's streak)
      if (i === 0) continue;
      break;
    }
  }
  return streak;
};

// Total completions
const calcTotal = (completions) => Object.keys(completions).length;

// ── Persistence ───────────────────────────────────────
const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state = { ...state, ...JSON.parse(raw) };
    const rawWins = localStorage.getItem(WINS_KEY);
    if (rawWins) wins = JSON.parse(rawWins);
  } catch(e) { /* fresh start */ }
};

const save = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem(WINS_KEY, JSON.stringify(wins));
  } catch(e) {}
};

// ── Render Habits ─────────────────────────────────────
const renderHabits = () => {
  const container = document.getElementById('habitsContainer');
  const empty = document.getElementById('emptyState');
  const exportSection = document.getElementById('exportSection');
  const heatmapSection = document.getElementById('heatmapSection');

  container.innerHTML = '';

  if (state.habits.length === 0) {
    empty.style.display = 'block';
    exportSection.style.display = 'none';
    heatmapSection.style.display = 'none';
    return;
  }

  empty.style.display = 'none';
  exportSection.style.display = 'block';
  heatmapSection.style.display = 'block';

  const today = todayStr();
  let totalDone = 0;

  state.habits.forEach(habit => {
    const streak = calcStreak(habit.completions);
    const isToday = !!habit.completions[today];
    if (isToday) totalDone++;

    const card = document.createElement('div');
    card.className = `habit-card ${isToday ? 'completed-today' : ''}`;
    card.dataset.id = habit.id;

    // Build last CHAIN_DAYS of chain links
    const links = [];
    for (let i = CHAIN_DAYS - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = dateStr(d);
      const done = !!habit.completions[key];
      const isT = key === today;

      if (isT) {
        links.push(`<div class="chain-link ${done ? 'today-filled' : 'today-unfilled'}" data-date="${key}" data-habit="${habit.id}" title="Today" onclick="toggleDay('${habit.id}','${key}')"></div>`);
      } else {
        links.push(`<div class="chain-link ${done ? 'filled' : ''}" title="${key}"></div>`);
      }
    }

    card.innerHTML = `
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <button class="check-btn ${isToday ? 'checked' : ''}" onclick="toggleDay('${habit.id}','${today}')" title="${isToday ? 'Unmark today' : 'Mark done today'}">
            ${isToday ? '✓' : habit.icon}
          </button>
          <div class="min-w-0">
            <p class="font-bold text-sm truncate ${isToday ? 'text-ember-400' : ''}">${escHtml(habit.name)}</p>
            <div class="flex items-center gap-2 mt-0.5">
              <span class="streak-badge">🔥 ${streak} day${streak !== 1 ? 's' : ''}</span>
              <span class="text-xs font-mono text-white/20">${calcTotal(habit.completions)} total</span>
            </div>
          </div>
        </div>
        <button class="delete-habit-btn" onclick="deleteHabit('${habit.id}')" title="Delete habit">✕</button>
      </div>
      <div class="chain-links mt-3">
        ${links.join('')}
      </div>
    `;

    container.appendChild(card);
  });

  document.getElementById('totalCompletions').textContent = totalDone + '/' + state.habits.length;
  updateHeatmap();
};

// ── Toggle Day ────────────────────────────────────────
window.toggleDay = (habitId, dateKey) => {
  const habit = state.habits.find(h => h.id === habitId);
  if (!habit) return;

  const wasChecked = !!habit.completions[dateKey];
  if (wasChecked) {
    delete habit.completions[dateKey];
  } else {
    habit.completions[dateKey] = true;
    if (dateKey === todayStr()) {
      spawnConfetti();
      checkAllDoneToast();
    }
  }
  save();
  renderHabits();
};

// ── Delete Habit ──────────────────────────────────────
window.deleteHabit = (id) => {
  if (!confirm('Delete this habit and all its history?')) return;
  state.habits = state.habits.filter(h => h.id !== id);
  save();
  renderHabits();
};

// ── Add Habit Modal ───────────────────────────────────
let selectedEmoji = EMOJIS[0];

const openModal = () => {
  if (state.habits.length >= MAX_HABITS) {
    showToast('Max 7 habits — keep it focused! 🎯');
    return;
  }
  document.getElementById('habitNameInput').value = '';
  selectedEmoji = EMOJIS[0];
  renderEmojiPicker();
  document.getElementById('addHabitModal').style.display = 'flex';
  setTimeout(() => document.getElementById('habitNameInput').focus(), 100);
};

const closeModal = () => {
  document.getElementById('addHabitModal').style.display = 'none';
};

const renderEmojiPicker = () => {
  const picker = document.getElementById('emojiPicker');
  picker.innerHTML = EMOJIS.map(e => `
    <button class="emoji-opt ${e === selectedEmoji ? 'selected' : ''}" onclick="selectEmoji('${e}')">${e}</button>
  `).join('');
};

window.selectEmoji = (e) => {
  selectedEmoji = e;
  renderEmojiPicker();
};

const saveHabit = () => {
  const name = document.getElementById('habitNameInput').value.trim();
  if (!name) {
    document.getElementById('habitNameInput').focus();
    return;
  }

  const newHabit = {
    id: genId(),
    name,
    icon: selectedEmoji,
    createdAt: todayStr(),
    completions: {},
  };

  state.habits.push(newHabit);
  save();
  closeModal();
  renderHabits();
  showToast('Chain started! 🔥 Don\'t break it.');
};

// ── Heatmap ───────────────────────────────────────────
const initHeatmapDate = () => {
  const now = new Date();
  heatmapYear = now.getFullYear();
  heatmapMonth = now.getMonth(); // 0-indexed
};

const updateHeatmap = () => {
  const label = document.getElementById('heatmapMonthLabel');
  const grid = document.getElementById('heatmapGrid');

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  label.textContent = `${monthNames[heatmapMonth]} ${heatmapYear}`;

  // Count completions per day this month
  const daysInMonth = new Date(heatmapYear, heatmapMonth + 1, 0).getDate();
  const completionMap = {};

  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${heatmapYear}-${String(heatmapMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const count = state.habits.filter(h => h.completions[key]).length;
    completionMap[key] = count;
  }

  const total = state.habits.length || 1;
  const firstDay = new Date(heatmapYear, heatmapMonth, 1).getDay(); // 0=Sun
  const dayLabels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const today = todayStr();

  let html = `
    <div class="heatmap-day-labels">
      ${dayLabels.map(d => `<div class="heatmap-day-label">${d}</div>`).join('')}
    </div>
    <div class="heatmap-days">
  `;

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    html += `<div class="heatmap-cell" style="visibility:hidden"></div>`;
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${heatmapYear}-${String(heatmapMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const count = completionMap[key] || 0;
    const ratio = count / total;
    let level = 0;
    if (ratio > 0)    level = 1;
    if (ratio >= 0.5) level = 2;
    if (ratio >= 0.75) level = 3;
    if (ratio >= 1.0 && count > 0) level = 4;

    const isToday = key === today;
    const todayBorder = isToday ? 'outline: 2px solid rgba(245,158,11,0.8); outline-offset: 1px;' : '';

    html += `<div class="heatmap-cell" data-level="${level}" style="${todayBorder}" title="${key}: ${count}/${total} habits"></div>`;
  }

  html += `</div>`;
  grid.innerHTML = html;
};

// ── Quotes ────────────────────────────────────────────
const showQuote = () => {
  const q = QUOTES[currentQuoteIndex % QUOTES.length];
  document.getElementById('quoteText').textContent = q.text;
  document.getElementById('quoteAuthor').textContent = '— ' + q.author;
};

const nextQuote = () => {
  currentQuoteIndex = (currentQuoteIndex + 1) % QUOTES.length;
  showQuote();
};

// ── Win Logger ────────────────────────────────────────
const renderWins = () => {
  const container = document.getElementById('winsList');
  const todayWins = wins.filter(w => w.date === todayStr()).slice(-4);
  container.innerHTML = todayWins.map(w => `
    <div class="win-entry">
      <span class="bullet">▸</span>${escHtml(w.text)}
    </div>
  `).join('') || '<p class="text-xs font-mono text-white/20 py-1">No wins logged yet today.</p>';
};

const logWin = () => {
  const input = document.getElementById('winInput');
  const text = input.value.trim();
  if (!text) return;
  wins.push({ text, date: todayStr(), ts: Date.now() });
  if (wins.length > 100) wins.shift(); // keep lean
  save();
  input.value = '';
  renderWins();
  showToast('Win logged! 💪');
};

// ── Theme ─────────────────────────────────────────────
const applyTheme = () => {
  document.documentElement.setAttribute('data-theme', state.theme);
  document.body.setAttribute('data-theme', state.theme);
  document.getElementById('themeToggle').textContent = state.theme === 'dark' ? '🌙' : '☀️';
};

const toggleTheme = () => {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  save();
  applyTheme();
};

// ── Export ────────────────────────────────────────────
const exportPng = async () => {
  showToast('Capturing snapshot... 📸');
  try {
    const el = document.querySelector('main');
    const canvas = await html2canvas(el, {
      backgroundColor: state.theme === 'dark' ? '#0f0e0c' : '#faf7f2',
      scale: 2,
      logging: false,
      useCORS: true,
    });
    const link = document.createElement('a');
    link.download = 'habitchain-snapshot.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('PNG saved! ✅');
  } catch(e) {
    showToast('Export failed — try again');
  }
};

const exportPdf = async () => {
  showToast('Building PDF... 📄');
  try {
    const el = document.querySelector('main');
    const canvas = await html2canvas(el, {
      backgroundColor: state.theme === 'dark' ? '#0f0e0c' : '#faf7f2',
      scale: 2,
      logging: false,
      useCORS: true,
    });
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const imgData = canvas.toDataURL('image/png');
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = (canvas.height * pdfW) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfW, Math.min(pdfH, pdf.internal.pageSize.getHeight()));
    pdf.save('habitchain-snapshot.pdf');
    showToast('PDF saved! ✅');
  } catch(e) {
    showToast('Export failed — try again');
  }
};

// ── Share ─────────────────────────────────────────────
const share = () => {
  const url = window.location.href;
  navigator.clipboard.writeText(url).then(() => {
    showToast('Link copied! Share it 🔗');
  }).catch(() => {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = url;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('Link copied! 🔗');
  });
};

// ── Toast ─────────────────────────────────────────────
let toastTimer = null;
const showToast = (msg) => {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
};

// ── Confetti ──────────────────────────────────────────
const spawnConfetti = () => {
  const emojis = ['🔥','⭐','✨','🎯','💪'];
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'confetti';
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.left = `${20 + Math.random() * 60}vw`;
      el.style.top = `${20 + Math.random() * 40}vh`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1300);
    }, i * 80);
  }
};

const checkAllDoneToast = () => {
  const today = todayStr();
  const allDone = state.habits.length > 0 && state.habits.every(h => h.completions[today]);
  if (allDone) {
    setTimeout(() => showToast('🏆 All habits done today! Legend.'), 400);
  }
};

// ── Escape HTML ───────────────────────────────────────
const escHtml = (str) => str.replace(/[&<>"']/g, m => ({
  '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'": '&#39;'
}[m]));

// ── Init ──────────────────────────────────────────────
const init = () => {
  load();
  initHeatmapDate();
  applyTheme();

  // Today's date
  document.getElementById('todayDate').textContent = formatDate(new Date());

  // Quote
  currentQuoteIndex = Math.floor(Math.random() * QUOTES.length);
  showQuote();
  renderWins();
  renderHabits();

  // ── Event listeners ──
  document.getElementById('addHabitBtn').addEventListener('click', openModal);
  document.getElementById('cancelHabitBtn').addEventListener('click', closeModal);
  document.getElementById('modalBackdrop').addEventListener('click', closeModal);
  document.getElementById('saveHabitBtn').addEventListener('click', saveHabit);
  document.getElementById('habitNameInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') saveHabit();
    if (e.key === 'Escape') closeModal();
  });
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  document.getElementById('nextQuote').addEventListener('click', nextQuote);
  document.getElementById('logWinBtn').addEventListener('click', logWin);
  document.getElementById('winInput').addEventListener('keydown', e => { if (e.key === 'Enter') logWin(); });
  document.getElementById('exportPng').addEventListener('click', exportPng);
  document.getElementById('exportPdf').addEventListener('click', exportPdf);

  // Share buttons
  ['shareBtn', 'shareBtn2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', share);
  });

  // Heatmap navigation
  document.getElementById('prevMonth').addEventListener('click', () => {
    heatmapMonth--;
    if (heatmapMonth < 0) { heatmapMonth = 11; heatmapYear--; }
    updateHeatmap();
  });
  document.getElementById('nextMonth').addEventListener('click', () => {
    heatmapMonth++;
    if (heatmapMonth > 11) { heatmapMonth = 0; heatmapYear++; }
    updateHeatmap();
  });

  // Auto-advance quote every 30s
  setInterval(nextQuote, 30000);

  // Re-render on midnight if tab stays open
  const checkDay = () => {
    const now = new Date();
    const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1) - now;
    setTimeout(() => {
      document.getElementById('todayDate').textContent = formatDate(new Date());
      renderHabits();
      checkDay();
    }, msUntilMidnight + 1000);
  };
  checkDay();
};

document.addEventListener('DOMContentLoaded', init);
