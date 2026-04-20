document.addEventListener('DOMContentLoaded', () => {
  // --- STATE ---
  const state = {
    activePlan: null,
    timerInterval: null,
    secondsElapsed: 0,
    mood: 'okay',
    history: []
  };

  const urlParams = new URLSearchParams(window.location.search);
  const planId = urlParams.get('planId');

  // --- DOM ---
  const dom = {
    tabs: {
      active: document.getElementById('tab-active'),
      history: document.getElementById('tab-history'),
      contentActive: document.getElementById('content-active'),
      contentHistory: document.getElementById('content-history')
    },
    activePanel: document.getElementById('active-workout-panel'),
    noActivePlan: document.getElementById('no-active-plan'),
    exercisesContainer: document.getElementById('active-exercises'),
    timer: document.getElementById('timer'),
    btnStart: document.getElementById('btn-start-timer'),
    btnPause: document.getElementById('btn-pause-timer'),
    btnFinish: document.getElementById('btn-finish-workout'),
    moodBtns: document.querySelectorAll('.mood-btn'),
    notes: document.getElementById('workout-notes'),
    historyContainer: document.getElementById('timeline-container'),
    historyFilter: document.getElementById('history-filter'),
    modal: document.getElementById('completion-modal')
  };

  // --- INIT ---
  init();

  async function init() {
    setupTabs();
    setupMood();
    
    if (planId) {
      await loadActivePlan(planId);
      dom.tabs.active.click();
    } else {
      dom.tabs.history.click();
    }

    loadHistory();
    loadStats();
  }

  // --- EVENT LISTENERS & SETUP ---
  
  function setupTabs() {
    dom.tabs.active.addEventListener('click', () => {
      dom.tabs.active.classList.add('active');
      dom.tabs.history.classList.remove('active');
      dom.tabs.contentActive.classList.add('active');
      dom.tabs.contentHistory.classList.remove('active');
    });

    dom.tabs.history.addEventListener('click', () => {
      dom.tabs.history.classList.add('active');
      dom.tabs.active.classList.remove('active');
      dom.tabs.contentHistory.classList.add('active');
      dom.tabs.contentActive.classList.remove('active');
    });

    dom.historyFilter.addEventListener('change', loadHistory);
  }

  function setupMood() {
    dom.moodBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        dom.moodBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        state.mood = btn.dataset.val;
      });
    });
  }

  // --- ACTIVE WORKOUT ---

  async function loadActivePlan(id) {
    const res = await window.api.get(`/plans/${id}`);
    if (res && res.success) {
      state.activePlan = res.data;
      
      dom.noActivePlan.style.display = 'none';
      dom.activePanel.style.display = 'block';
      
      document.getElementById('active-plan-name').textContent = state.activePlan.name;
      
      renderActiveExercises();
      setupTimer();
      
      dom.btnFinish.addEventListener('click', finishWorkout);
    } else {
      alert('Failed to load plan');
    }
  }

  function renderActiveExercises() {
    dom.exercisesContainer.innerHTML = '';
    
    state.activePlan.exercises.forEach((ex, exIdx) => {
      const isCardio = ex.duration > 0;
      
      const card = document.createElement('div');
      card.className = 'workout-ex-card';
      card.dataset.id = ex.exerciseId;
      card.dataset.name = ex.name;
      
      let rowsHTML = '';
      for(let i=0; i<ex.sets; i++) {
        rowsHTML += `
          <div class="set-row">
            <div class="set-num">Set ${i+1}</div>
            <input type="number" class="set-input set-val1" placeholder="${isCardio ? 'Min' : 'Reps'}" value="${isCardio ? ex.duration : ex.reps}">
            <input type="number" class="set-input set-val2" placeholder="kg" value="">
            <div style="text-align:right">
              <input type="checkbox" class="set-check">
            </div>
          </div>
        `;
      }
      
      card.innerHTML = `
        <h3 style="margin-bottom:1rem">${exIdx + 1}. ${ex.name}</h3>
        <div class="d-flex" style="padding: 0 0 0.5rem 0; border-bottom:1px solid var(--color-border); font-size:0.75rem; color:var(--color-text-muted); text-transform:uppercase; letter-spacing:0.05em">
          <div style="width:50px"></div>
          <div style="flex:1; padding-left:0.4rem">${isCardio ? 'Duration' : 'Reps'}</div>
          <div style="flex:1; padding-left:0.4rem">Weight</div>
          <div style="width:60px; text-align:right">Done</div>
        </div>
        ${rowsHTML}
      `;
      
      // Auto-check logic (if inputs are focused then blurred, assume done if not empty)
      // Visual feedback on row completion
      const checkboxes = card.querySelectorAll('.set-check');
      checkboxes.forEach(cb => {
        cb.addEventListener('change', (e) => {
          const row = e.target.closest('.set-row');
          if (e.target.checked) row.style.backgroundColor = 'var(--color-accent-lt)';
          else row.style.backgroundColor = 'transparent';
        });
      });
      
      dom.exercisesContainer.appendChild(card);
    });
  }

  function setupTimer() {
    function updateDisplay() {
      const m = Math.floor(state.secondsElapsed / 60).toString().padStart(2, '0');
      const s = (state.secondsElapsed % 60).toString().padStart(2, '0');
      dom.timer.textContent = `${m}:${s}`;
    }

    dom.btnStart.addEventListener('click', () => {
      dom.btnStart.style.display = 'none';
      dom.btnPause.style.display = 'block';
      state.timerInterval = setInterval(() => {
        state.secondsElapsed++;
        updateDisplay();
      }, 1000);
    });

    dom.btnPause.addEventListener('click', () => {
      dom.btnPause.style.display = 'none';
      dom.btnStart.style.display = 'block';
      dom.btnStart.textContent = 'Resume';
      clearInterval(state.timerInterval);
    });
  }

  async function finishWorkout() {
    clearInterval(state.timerInterval);
    
    dom.btnFinish.disabled = true;
    dom.btnFinish.innerHTML = '<span class="spinner"></span> Saving...';

    const exercisesCompleted = [];
    const cards = dom.exercisesContainer.querySelectorAll('.workout-ex-card');
    
    let totalSets = 0;
    let completedSets = 0;

    cards.forEach(card => {
      const exData = {
        exerciseId: card.dataset.id,
        name: card.dataset.name,
        sets: []
      };
      
      const rows = card.querySelectorAll('.set-row');
      rows.forEach(row => {
        totalSets++;
        const isDone = row.querySelector('.set-check').checked;
        if (isDone) completedSets++;
        
        const val1 = Number(row.querySelector('.set-val1').value || 0);
        const val2 = Number(row.querySelector('.set-val2').value || 0);
        
        const isCardio = row.querySelector('.set-val1').placeholder === 'Min';
        
        exData.sets.push({
          reps: isCardio ? 0 : val1,
          duration: isCardio ? val1 : 0,
          weight: val2,
          completed: isDone
        });
      });
      
      exercisesCompleted.push(exData);
    });

    const completionRate = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
    const durationMinutes = Math.max(1, Math.round(state.secondsElapsed / 60));

    // Dummy calorie calc: 8 cal per minute * duration + (completion rate factor)
    const calories = Math.round(durationMinutes * 8 * (completionRate / 100));

    const logData = {
      planId: state.activePlan._id,
      planName: state.activePlan.name,
      date: new Date().toISOString(),
      duration: durationMinutes,
      exercisesCompleted,
      totalCaloriesBurned: calories,
      notes: dom.notes.value,
      mood: state.mood,
      completionRate
    };

    const res = await window.api.post('/logs', logData);
    
    if (res && res.success) {
      document.getElementById('modal-duration').textContent = durationMinutes;
      document.getElementById('modal-completion').textContent = completionRate;
      dom.modal.classList.add('active');
    } else {
      alert('Failed to save log');
      dom.btnFinish.disabled = false;
      dom.btnFinish.innerHTML = 'Finish Workout';
    }
  }

  // --- HISTORY ---

  async function loadHistory() {
    dom.historyContainer.innerHTML = '<div class="text-center"><span class="spinner" style="border-top-color:var(--color-accent)"></span></div>';
    
    const filter = dom.historyFilter.value;
    let query = '';
    
    if (filter === 'week') {
      const d = new Date(); d.setDate(d.getDate() - 7);
      query = `?startDate=${d.toISOString()}`;
    } else if (filter === 'month') {
      const d = new Date(); d.setDate(d.getDate() - 30);
      query = `?startDate=${d.toISOString()}`;
    }

    const res = await window.api.get(`/logs${query}`);
    if (res && res.success) {
      state.history = res.data;
      renderHistory();
    } else {
      dom.historyContainer.innerHTML = '<div class="text-danger">Failed to load history</div>';
    }
  }

  function renderHistory() {
    dom.historyContainer.innerHTML = '';
    
    if (state.history.length === 0) {
      dom.historyContainer.innerHTML = '<p class="text-muted text-center">No logs found for this period.</p>';
      return;
    }

    const moodEmojis = {
      'great': '🤩', 'good': '🙂', 'okay': '😐', 'tired': '😮‍💨', 'bad': '😩'
    };

    state.history.forEach(log => {
      const dateObj = new Date(log.date);
      const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      let completionColor = 'var(--color-danger)';
      if (log.completionRate >= 80) completionColor = 'var(--color-accent)';
      else if (log.completionRate >= 50) completionColor = '#D97706';

      const el = document.createElement('div');
      el.className = 'timeline-item';
      
      el.innerHTML = `
        <div class="timeline-date">${dateStr}<br><span style="font-size:0.7rem; font-weight:normal">${timeStr}</span></div>
        <div class="timeline-dot"></div>
        <div class="card log-card">
          <div class="log-card-header">
            <div>
              <h3 style="font-family:'DM Serif Display', serif; font-size:1.3rem; margin-bottom:0.25rem; text-transform:none">${log.planName}</h3>
              <p class="text-muted" style="font-size:0.85rem">
                ${log.duration} min · ${log.totalCaloriesBurned} kcal
              </p>
            </div>
            <div style="display:flex; gap:1rem; align-items:center">
              <span style="font-size:1.5rem" title="${log.mood}">${moodEmojis[log.mood] || '🙂'}</span>
              <div class="completion-ring" style="--pct: ${log.completionRate}%; background: conic-gradient(${completionColor} var(--pct), var(--color-bg) 0);">
                <div class="completion-inner" style="color:${completionColor}">${log.completionRate}%</div>
              </div>
            </div>
          </div>
          
          <div class="log-details">
            <h4 class="mb-2" style="font-size:0.9rem">Exercises</h4>
            ${log.exercisesCompleted.map(ex => `
              <div style="font-size:0.85rem; border-bottom:1px solid var(--color-border); padding:0.5rem 0">
                <span style="font-weight:500">${ex.name}</span>: 
                <span class="text-muted">${ex.sets.filter(s=>s.completed).length}/${ex.sets.length} sets completed</span>
              </div>
            `).join('')}
            ${log.notes ? `<div class="mt-2 text-muted" style="font-size:0.85rem; font-style:italic">"${log.notes}"</div>` : ''}
            <div class="mt-3 text-right">
              <button class="btn-delete" style="background:none; border:none; color:var(--color-danger); cursor:pointer; font-size:0.85rem">Delete Log</button>
            </div>
          </div>
        </div>
      `;

      el.querySelector('.log-card-header').addEventListener('click', () => {
        el.querySelector('.log-details').classList.toggle('open');
      });

      el.querySelector('.btn-delete').addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this log?')) {
          const res = await window.api.delete(`/logs/${log._id}`);
          if (res && res.success) loadHistory();
        }
      });

      dom.historyContainer.appendChild(el);
    });
  }

  async function loadStats() {
    const res = await window.api.get('/logs/stats');
    if (res && res.success) {
      document.getElementById('hist-stat-workouts').textContent = res.data.totalWorkouts;
      document.getElementById('hist-stat-minutes').textContent = res.data.totalMinutes;
      document.getElementById('hist-stat-completion').textContent = res.data.avgCompletion + '%';
    }
  }
});
