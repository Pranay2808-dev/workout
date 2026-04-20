document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 1. Fetch Stats
    const statsRes = await window.api.get('/logs/stats');
    if (statsRes && statsRes.success) {
      const stats = statsRes.data;
      document.getElementById('stat-workouts').textContent = stats.totalWorkouts;
      document.getElementById('stat-minutes').textContent = stats.totalMinutes;
      document.getElementById('stat-calories').textContent = stats.totalCalories;
      document.getElementById('stat-streak').textContent = `${stats.streakDays} ${stats.streakDays === 1 ? 'Day' : 'Days'}`;

      // Render Weekly Chart
      renderWeeklyChart(stats.weeklyVolume);
    }

    // 2. Fetch Recent Logs
    const logsRes = await window.api.get('/logs?limit=5');
    if (logsRes && logsRes.success) {
      renderRecentLogs(logsRes.data);
    }

    // 3. Fetch Quick Start Plans
    const plansRes = await window.api.get('/plans?sort=newest');
    if (plansRes && plansRes.success) {
      renderQuickStart(plansRes.data.slice(0, 3));
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
});

function renderWeeklyChart(weeklyVolume) {
  const chartEl = document.getElementById('weekly-chart');
  chartEl.innerHTML = '';

  if (!weeklyVolume || weeklyVolume.length === 0) {
    chartEl.innerHTML = '<div style="width:100%; text-align:center; color:var(--color-text-muted); align-self:center;">No data this week</div>';
    return;
  }

  // Find max value to scale bars relative to max height
  const maxMins = Math.max(...weeklyVolume.map(d => d.minutes), 60); // min scale is 60m

  weeklyVolume.forEach(dayData => {
    const heightPercent = Math.min(100, Math.max(5, (dayData.minutes / maxMins) * 100));
    
    const colEl = document.createElement('div');
    colEl.className = 'bar-col';
    
    colEl.innerHTML = `
      <div class="bar" style="height: 100%">
        <div class="bar-fill" style="height: ${heightPercent}%" title="${dayData.minutes} min"></div>
      </div>
      <div class="bar-label">${dayData.day}</div>
    `;
    chartEl.appendChild(colEl);
  });
}

function renderRecentLogs(logs) {
  const container = document.getElementById('recent-logs-container');
  
  if (!logs || logs.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 2rem;">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" stroke-width="1.5" style="opacity:0.5; margin-bottom:1rem;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        <p class="text-muted">No workouts logged yet.</p>
        <a href="logs.html" class="btn btn-primary mt-2">Log your first workout</a>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  
  const moodEmojis = {
    'great': '🤩', 'good': '🙂', 'okay': '😐', 'tired': '😮‍💨', 'bad': '😩'
  };

  logs.forEach(log => {
    const dateObj = new Date(log.date);
    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const row = document.createElement('div');
    row.className = 'recent-log-row';
    
    let completionColor = 'var(--color-danger)';
    if (log.completionRate >= 80) completionColor = 'var(--color-accent)';
    else if (log.completionRate >= 50) completionColor = '#D97706';

    row.innerHTML = `
      <div class="log-date">${dateStr}</div>
      <div class="log-name">${log.planName}</div>
      <div class="log-meta">
        <span class="text-muted" style="font-size:0.85rem">${log.duration} min</span>
        <span class="badge" style="background:transparent; border:1px solid ${completionColor}; color:${completionColor}">${log.completionRate}%</span>
        <span title="Mood" style="font-size: 1.1rem">${moodEmojis[log.mood] || '🙂'}</span>
      </div>
    `;
    container.appendChild(row);
  });
}

function renderQuickStart(plans) {
  const container = document.getElementById('quick-start-container');
  
  if (!plans || plans.length === 0) {
    container.innerHTML = `
      <div style="grid-column: span 3; text-align:center; padding: 2rem; border: 1px dashed var(--color-border); border-radius: 10px;">
        <p class="text-muted mb-2">You don't have any custom workout plans yet.</p>
        <a href="generator.html" class="btn btn-secondary">Create a Plan</a>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  
  plans.forEach(plan => {
    const card = document.createElement('div');
    card.className = 'card quick-start-card';
    card.innerHTML = `
      <div class="card-body">
        <div class="d-flex justify-between mb-1">
          <span class="badge badge-${plan.type}">${plan.type}</span>
          <span class="badge badge-${plan.intensity}">${plan.intensity}</span>
        </div>
        <h3 style="margin-top:0.5rem; text-transform:none; font-family:'DM Serif Display', serif; font-size:1.3rem;">${plan.name}</h3>
        <p class="text-muted" style="font-size:0.85rem;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          ${plan.durationPerSession} min · ${plan.exercises.length} exercises
        </p>
      </div>
      <a href="logs.html?planId=${plan._id}" class="btn btn-primary">Start Workout</a>
    `;
    container.appendChild(card);
  });
}
