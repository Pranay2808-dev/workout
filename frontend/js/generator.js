document.addEventListener('DOMContentLoaded', () => {
  // --- STATE ---
  const state = {
    step: 1,
    plan: {
      name: '',
      description: '',
      goal: '',
      type: 'strength',
      intensity: 'intermediate',
      durationPerSession: 45,
      daysPerWeek: 3,
      exercises: [],
      isTemplate: false,
      isPublic: false
    },
    library: []
  };

  // --- DOM ELEMENTS ---
  const dom = {
    panels: [
      document.getElementById('step-1'),
      document.getElementById('step-2'),
      document.getElementById('step-3')
    ],
    indicators: [
      document.getElementById('step-ind-1'),
      document.getElementById('step-ind-2'),
      document.getElementById('step-ind-3')
    ],
    buttons: {
      next1: document.getElementById('btn-next-1'),
      next2: document.getElementById('btn-next-2'),
      prev2: document.getElementById('btn-prev-2'),
      prev3: document.getElementById('btn-prev-3'),
      save: document.getElementById('btn-save')
    },
    inputs: {
      name: document.getElementById('gen-name'),
      desc: document.getElementById('gen-desc'),
      goal: document.getElementById('gen-goal'),
      duration: document.getElementById('gen-duration'),
      public: document.getElementById('gen-public'),
      libSearch: document.getElementById('lib-search')
    },
    ui: {
      typeSelection: document.querySelectorAll('#type-selection .selectable-card'),
      intensitySelection: document.querySelectorAll('#intensity-selection .selectable-card'),
      daysSelection: document.querySelectorAll('#days-selection .day-btn'),
      durationVal: document.getElementById('duration-val'),
      libraryList: document.getElementById('library-list'),
      planList: document.getElementById('plan-list'),
      planEmpty: document.getElementById('plan-empty'),
      planExCount: document.getElementById('plan-ex-count'),
      saveError: document.getElementById('save-error')
    }
  };

  // --- INIT ---
  init();

  function init() {
    setupStep1();
    setupNavigation();
    fetchLibrary();
  }

  // --- SETUP & EVENT LISTENERS ---

  function setupStep1() {
    // Selection Cards (Type)
    dom.ui.typeSelection.forEach(card => {
      card.addEventListener('click', () => {
        dom.ui.typeSelection.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        state.plan.type = card.dataset.val;
      });
      if (card.dataset.val === state.plan.type) card.classList.add('selected');
    });

    // Selection Cards (Intensity)
    dom.ui.intensitySelection.forEach(card => {
      card.addEventListener('click', () => {
        dom.ui.intensitySelection.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        state.plan.intensity = card.dataset.val;
      });
      if (card.dataset.val === state.plan.intensity) card.classList.add('selected');
    });

    // Days per week
    dom.ui.daysSelection.forEach(btn => {
      btn.addEventListener('click', () => {
        dom.ui.daysSelection.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        state.plan.daysPerWeek = parseInt(btn.dataset.val, 10);
      });
    });

    // Duration slider
    dom.inputs.duration.addEventListener('input', (e) => {
      dom.ui.durationVal.textContent = `${e.target.value} min`;
      state.plan.durationPerSession = parseInt(e.target.value, 10);
    });

    // Inputs update state on blur
    ['name', 'desc', 'goal'].forEach(key => {
      dom.inputs[key].addEventListener('blur', (e) => {
        state.plan[key] = e.target.value;
      });
    });
  }

  function setupNavigation() {
    dom.buttons.next1.addEventListener('click', () => {
      if (!dom.inputs.name.value.trim()) {
        dom.inputs.name.focus();
        alert('Please enter a plan name.');
        return;
      }
      state.plan.name = dom.inputs.name.value;
      state.plan.description = dom.inputs.desc.value;
      state.plan.goal = dom.inputs.goal.value;
      goToStep(2);
    });

    dom.buttons.prev2.addEventListener('click', () => goToStep(1));
    
    dom.buttons.next2.addEventListener('click', () => {
      if (state.plan.exercises.length === 0) {
        alert('Please add at least one exercise to your plan.');
        return;
      }
      prepareReview();
      goToStep(3);
    });

    dom.buttons.prev3.addEventListener('click', () => goToStep(2));
    
    dom.buttons.save.addEventListener('click', savePlan);
  }

  function goToStep(num) {
    state.step = num;
    
    // Update Panels
    dom.panels.forEach((p, idx) => {
      if (idx + 1 === num) p.classList.add('active');
      else p.classList.remove('active');
    });

    // Update Indicators
    dom.indicators.forEach((ind, idx) => {
      ind.classList.remove('active', 'completed');
      if (idx + 1 === num) ind.classList.add('active');
      else if (idx + 1 < num) ind.classList.add('completed');
    });

    window.scrollTo(0, 0);
  }

  async function fetchLibrary() {
    const res = await window.api.get('/exercises');
    if (res && res.success) {
      state.library = res.data;
      renderLibrary();
    } else {
      dom.ui.libraryList.innerHTML = '<div class="text-danger">Failed to load exercises.</div>';
    }
  }

  // --- STEP 2 LOGIC (Exercises) ---

  function renderLibrary(filter = '') {
    dom.ui.libraryList.innerHTML = '';
    const filtered = state.library.filter(ex => ex.name.toLowerCase().includes(filter.toLowerCase()));
    
    filtered.forEach(ex => {
      const el = document.createElement('div');
      el.className = 'lib-exercise';
      el.innerHTML = `
        <div>
          <div style="font-weight:500">${ex.name}</div>
          <div class="text-muted" style="font-size:0.75rem">${ex.muscleGroup.replace('_',' ')} · ${ex.equipment}</div>
        </div>
        <button class="btn-icon" title="Add to plan" data-id="${ex._id}">+</button>
      `;
      el.querySelector('.btn-icon').addEventListener('click', () => addExerciseToPlan(ex));
      dom.ui.libraryList.appendChild(el);
    });
  }

  dom.inputs.libSearch.addEventListener('input', (e) => {
    renderLibrary(e.target.value);
  });

  function addExerciseToPlan(ex) {
    const newEx = {
      exerciseId: ex._id,
      name: ex.name,
      sets: ex.defaultSets || 3,
      reps: ex.defaultReps || 10,
      duration: ex.defaultDuration || 0,
      restSeconds: 60,
      order: state.plan.exercises.length
    };
    state.plan.exercises.push(newEx);
    renderPlanExercises();
  }

  function removeExercise(idx) {
    state.plan.exercises.splice(idx, 1);
    // update order
    state.plan.exercises.forEach((ex, i) => ex.order = i);
    renderPlanExercises();
  }

  function renderPlanExercises() {
    dom.ui.planExCount.textContent = state.plan.exercises.length;
    
    if (state.plan.exercises.length === 0) {
      dom.ui.planEmpty.style.display = 'block';
      dom.ui.planList.innerHTML = '';
      dom.ui.planList.appendChild(dom.ui.planEmpty);
      return;
    }

    dom.ui.planEmpty.style.display = 'none';
    dom.ui.planList.innerHTML = '';

    state.plan.exercises.forEach((ex, idx) => {
      const el = document.createElement('div');
      el.className = 'plan-exercise';
      el.draggable = true;
      el.dataset.idx = idx;
      
      const isCardio = ex.duration > 0;
      
      el.innerHTML = `
        <div class="d-flex justify-between align-center">
          <div style="font-weight:500"><span class="text-muted" style="margin-right:8px">${idx + 1}.</span>${ex.name}</div>
          <button class="btn-icon" style="width:24px; height:24px; font-size:1rem; border:none" title="Remove" onclick="event.stopPropagation()">×</button>
        </div>
        <div class="exercise-inputs">
          <label>Sets <input type="number" min="1" class="in-sets" value="${ex.sets}"></label>
          ${isCardio 
            ? `<label>Min <input type="number" min="1" class="in-dur" value="${ex.duration}"></label>`
            : `<label>Reps <input type="number" min="1" class="in-reps" value="${ex.reps}"></label>`
          }
          <label>Rest (s) <input type="number" min="0" step="15" class="in-rest" value="${ex.restSeconds}"></label>
        </div>
      `;

      el.querySelector('.btn-icon').addEventListener('click', () => removeExercise(idx));
      
      // Update state on input change
      el.querySelector('.in-sets').addEventListener('change', e => state.plan.exercises[idx].sets = Number(e.target.value));
      el.querySelector('.in-rest').addEventListener('change', e => state.plan.exercises[idx].restSeconds = Number(e.target.value));
      
      if (isCardio) {
        el.querySelector('.in-dur').addEventListener('change', e => state.plan.exercises[idx].duration = Number(e.target.value));
      } else {
        el.querySelector('.in-reps').addEventListener('change', e => state.plan.exercises[idx].reps = Number(e.target.value));
      }

      setupDragAndDrop(el, idx);
      dom.ui.planList.appendChild(el);
    });
  }

  // Simple drag and drop
  let dragSrcIdx = null;
  function setupDragAndDrop(el, idx) {
    el.addEventListener('dragstart', (e) => {
      dragSrcIdx = idx;
      e.target.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    
    el.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });
    
    el.addEventListener('dragend', (e) => {
      e.target.classList.remove('dragging');
    });
    
    el.addEventListener('drop', (e) => {
      e.stopPropagation();
      const dropTargetIdx = idx;
      if (dragSrcIdx !== null && dragSrcIdx !== dropTargetIdx) {
        // Swap or move
        const draggedItem = state.plan.exercises.splice(dragSrcIdx, 1)[0];
        state.plan.exercises.splice(dropTargetIdx, 0, draggedItem);
        // update order
        state.plan.exercises.forEach((ex, i) => ex.order = i);
        renderPlanExercises();
      }
      return false;
    });
  }

  // --- STEP 3 LOGIC (Review & Save) ---

  function prepareReview() {
    document.getElementById('review-name').textContent = state.plan.name;
    document.getElementById('review-desc').textContent = state.plan.description || (state.plan.goal ? `Goal: ${state.plan.goal}` : 'Custom Workout Plan');
    document.getElementById('review-type').textContent = state.plan.type.toUpperCase();
    document.getElementById('review-intensity').textContent = state.plan.intensity.toUpperCase();
    document.getElementById('review-meta').textContent = `${state.plan.durationPerSession} Min / ${state.plan.daysPerWeek} Days per week`;

    const exList = document.getElementById('review-exercises');
    exList.innerHTML = '';
    state.plan.exercises.forEach((ex, idx) => {
      exList.innerHTML += `
        <div style="padding: 0.75rem 0; border-bottom: 1px solid var(--color-border); display:flex; justify-content:space-between">
          <div><span class="text-muted mr-2">${idx + 1}.</span> <strong>${ex.name}</strong></div>
          <div class="text-muted" style="font-size:0.85rem">
            ${ex.sets} Sets × ${ex.duration > 0 ? ex.duration + ' Min' : ex.reps + ' Reps'} 
            · ${ex.restSeconds}s Rest
          </div>
        </div>
      `;
    });
  }

  async function savePlan() {
    dom.ui.saveError.textContent = '';
    const btn = dom.buttons.save;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Saving...';

    state.plan.isTemplate = dom.inputs.public.checked;
    state.plan.isPublic = dom.inputs.public.checked;

    const res = await window.api.post('/plans', state.plan);
    
    if (res && res.success) {
      window.location.href = '/plans.html';
    } else {
      dom.ui.saveError.textContent = res ? res.error : 'Failed to save plan';
      btn.disabled = false;
      btn.innerHTML = 'Save Plan';
    }
  }
});
