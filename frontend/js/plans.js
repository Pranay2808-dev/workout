document.addEventListener('DOMContentLoaded', () => {
  let currentMode = 'my-plans'; // 'my-plans' or 'templates'
  let allPlans = [];

  const dom = {
    container: document.getElementById('plans-container'),
    searchInput: document.getElementById('search-input'),
    durationSelect: document.getElementById('duration-select'),
    sortSelect: document.getElementById('sort-select'),
    typePills: document.querySelectorAll('#type-filters .filter-pill'),
    intensityPills: document.querySelectorAll('#intensity-filters .filter-pill'),
    tabMyPlans: document.getElementById('tab-my-plans'),
    tabTemplates: document.getElementById('tab-templates'),
    modal: document.getElementById('plan-modal'),
    closeModal: document.getElementById('close-modal')
  };

  const filters = {
    search: '', duration: '', sort: 'newest', type: 'all', intensity: 'all'
  };

  // --- Init ---
  fetchPlans();

  // --- Event Listeners ---
  dom.tabMyPlans.addEventListener('click', () => setMode('my-plans'));
  dom.tabTemplates.addEventListener('click', () => setMode('templates'));

  dom.searchInput.addEventListener('input', (e) => { filters.search = e.target.value.toLowerCase(); renderPlans(); });
  dom.durationSelect.addEventListener('change', (e) => { filters.duration = e.target.value; fetchPlans(); });
  dom.sortSelect.addEventListener('change', (e) => { filters.sort = e.target.value; fetchPlans(); });

  setupPillFilters(dom.typePills, 'type');
  setupPillFilters(dom.intensityPills, 'intensity');

  dom.closeModal.addEventListener('click', () => dom.modal.classList.remove('active'));
  dom.modal.addEventListener('click', (e) => {
    if (e.target === dom.modal) dom.modal.classList.remove('active');
  });

  // --- Functions ---
  function setupPillFilters(pills, filterKey) {
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        filters[filterKey] = pill.dataset.val;
        fetchPlans();
      });
    });
  }

  function setMode(mode) {
    currentMode = mode;
    if (mode === 'my-plans') {
      dom.tabMyPlans.classList.add('active');
      dom.tabTemplates.classList.remove('active');
    } else {
      dom.tabMyPlans.classList.remove('active');
      dom.tabTemplates.classList.add('active');
    }
    fetchPlans();
  }

  async function fetchPlans() {
    dom.container.innerHTML = '<div class="text-center text-muted" style="grid-column: span 2; padding: 4rem 0;"><span class="spinner" style="border-top-color:var(--color-accent)"></span></div>';
    
    let endpoint = currentMode === 'templates' ? '/plans/templates' : '/plans';
    
    if (currentMode === 'my-plans') {
      const params = new URLSearchParams();
      if (filters.type !== 'all') params.append('type', filters.type);
      if (filters.intensity !== 'all') params.append('intensity', filters.intensity);
      if (filters.duration) params.append('duration', filters.duration);
      params.append('sort', filters.sort);
      endpoint += '?' + params.toString();
    }

    const res = await window.api.get(endpoint);
    if (res && res.success) {
      allPlans = res.data;
      renderPlans();
    } else {
      dom.container.innerHTML = '<div class="text-center text-danger" style="grid-column: span 2;">Failed to load plans.</div>';
    }
  }

  function renderPlans() {
    dom.container.innerHTML = '';
    
    // Client side search filter
    const filtered = allPlans.filter(p => p.name.toLowerCase().includes(filters.search));

    if (filtered.length === 0) {
      dom.container.innerHTML = `
        <div style="grid-column: span 2; text-align:center; padding: 4rem 0;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" stroke-width="1" style="opacity:0.5; margin-bottom:1rem;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
          <p class="text-muted text-lg mb-2">No plans found matching your criteria.</p>
          ${currentMode === 'my-plans' ? '<a href="generator.html" class="btn btn-primary">Create a New Plan</a>' : ''}
        </div>
      `;
      return;
    }

    filtered.forEach(plan => {
      const card = document.createElement('div');
      card.className = 'card plan-card';
      
      const exNames = plan.exercises.slice(0, 3).map(e => e.name).join(', ') + (plan.exercises.length > 3 ? '...' : '');

      card.innerHTML = `
        <div class="plan-card-header">
          <div>
            <h3 class="plan-title">${plan.name}</h3>
            ${plan.goal ? `<p class="text-muted" style="font-size:0.85rem; margin-bottom:0.5rem">${plan.goal}</p>` : ''}
          </div>
          ${currentMode === 'my-plans' ? 
            `<button class="btn-delete" title="Delete Plan" style="background:none; border:none; cursor:pointer; color:var(--color-danger); opacity:0.5; transition:opacity 0.2s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
             </button>` : ''}
        </div>
        
        <div class="plan-meta">
          <span class="badge badge-${plan.type}">${plan.type}</span>
          <span class="badge badge-${plan.intensity}">${plan.intensity}</span>
        </div>
        
        <p class="text-muted" style="font-size:0.85rem; margin-bottom:0.5rem">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:4px"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          ${plan.durationPerSession} min per session · ${plan.daysPerWeek} days/week
        </p>
        
        <p class="plan-exercises-preview">
          <strong>${plan.exercises.length} exercises:</strong> ${exNames || 'No exercises added yet'}
        </p>
        
        <div class="plan-actions">
          <button class="btn btn-secondary btn-view" style="flex:1">View Details</button>
          ${currentMode === 'my-plans' ? 
            `<a href="logs.html?planId=${plan._id}" class="btn btn-primary" style="flex:1">Start</a>` : 
            `<button class="btn btn-primary btn-clone" style="flex:1">Save to My Plans</button>`}
        </div>
      `;

      card.querySelector('.btn-view').addEventListener('click', () => openModal(plan));
      
      if (currentMode === 'my-plans') {
        card.querySelector('.btn-delete').addEventListener('click', async (e) => {
          e.stopPropagation();
          if (confirm('Are you sure you want to delete this plan? This cannot be undone.')) {
            const res = await window.api.delete(`/plans/${plan._id}`);
            if (res && res.success) fetchPlans();
          }
        });
      } else {
        card.querySelector('.btn-clone').addEventListener('click', async (e) => {
          e.stopPropagation();
          const btn = e.currentTarget;
          btn.disabled = true;
          btn.innerHTML = '<span class="spinner"></span>';
          const res = await window.api.post(`/plans/${plan._id}/clone`);
          if (res && res.success) {
            btn.innerHTML = 'Saved!';
            setTimeout(() => setMode('my-plans'), 1000);
          } else {
            btn.innerHTML = 'Error';
            btn.disabled = false;
          }
        });
      }

      dom.container.appendChild(card);
    });
  }

  function openModal(plan) {
    document.getElementById('modal-title').textContent = plan.name;
    document.getElementById('modal-badges').innerHTML = `
      <span class="badge badge-${plan.type}">${plan.type}</span>
      <span class="badge badge-${plan.intensity}">${plan.intensity}</span>
    `;
    document.getElementById('modal-meta').innerHTML = `
      ${plan.durationPerSession} min · ${plan.daysPerWeek} days/week
      ${plan.goal ? `<br>Goal: ${plan.goal}` : ''}
    `;
    document.getElementById('modal-desc').textContent = plan.description || '';
    document.getElementById('modal-ex-count').textContent = plan.exercises.length;

    const exList = document.getElementById('modal-exercises-list');
    exList.innerHTML = '';
    plan.exercises.forEach((ex, idx) => {
      exList.innerHTML += `
        <div class="exercise-list-item">
          <div class="exercise-order">${idx + 1}</div>
          <div>
            <div style="font-weight:500; font-size:1.05rem">${ex.name}</div>
            <div class="text-muted" style="font-size:0.85rem; margin-top:0.25rem">
              ${ex.sets} Sets × ${ex.reps > 0 ? ex.reps + ' Reps' : ex.duration + ' Min'} 
              · ${ex.restSeconds}s Rest
            </div>
          </div>
        </div>
      `;
    });

    const footer = document.getElementById('modal-footer');
    if (currentMode === 'my-plans') {
      footer.innerHTML = `
        <button class="btn btn-secondary" onclick="document.getElementById('plan-modal').classList.remove('active')">Close</button>
        <a href="logs.html?planId=${plan._id}" class="btn btn-primary">Start Workout</a>
      `;
    } else {
      footer.innerHTML = `
        <button class="btn btn-secondary" onclick="document.getElementById('plan-modal').classList.remove('active')">Close</button>
        <button class="btn btn-primary" id="modal-btn-clone">Save to My Plans</button>
      `;
      footer.querySelector('#modal-btn-clone').addEventListener('click', async (e) => {
        const btn = e.currentTarget;
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span>';
        const res = await window.api.post(`/plans/${plan._id}/clone`);
        if (res && res.success) {
          dom.modal.classList.remove('active');
          setMode('my-plans');
        }
      });
    }

    dom.modal.classList.add('active');
  }
});
