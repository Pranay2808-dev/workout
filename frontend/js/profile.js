document.addEventListener('DOMContentLoaded', async () => {
  // --- DOM ---
  const dom = {
    profName: document.getElementById('prof-name'),
    profEmail: document.getElementById('prof-email'),
    profDate: document.getElementById('prof-date'),
    profAvatar: document.getElementById('prof-avatar'),
    inputName: document.getElementById('input-name'),
    inputAge: document.getElementById('input-age'),
    inputWeight: document.getElementById('input-weight'),
    inputGoal: document.getElementById('input-goal'),
    inputLevel: document.getElementById('input-level'),
    profileForm: document.getElementById('profile-form'),
    profileMsg: document.getElementById('profile-msg'),
    passwordForm: document.getElementById('password-form'),
    passwordMsg: document.getElementById('password-msg'),
    btnDeleteLogs: document.getElementById('btn-delete-logs'),
    statWorkouts: document.getElementById('stat-workouts'),
    statMinutes: document.getElementById('stat-minutes'),
    statCalories: document.getElementById('stat-calories')
  };

  let currentUser = null;

  // --- INIT ---
  await loadProfile();
  await loadStats();

  // --- EVENTS ---
  
  dom.profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    dom.profileMsg.textContent = '';
    const btn = e.target.querySelector('button');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>';

    const data = {
      name: dom.inputName.value,
      age: dom.inputAge.value ? Number(dom.inputAge.value) : undefined,
      weight: dom.inputWeight.value ? Number(dom.inputWeight.value) : undefined,
      fitnessGoal: dom.inputGoal.value,
      fitnessLevel: dom.inputLevel.value
    };

    const res = await window.api.put('/auth/profile', data);
    
    if (res && res.success) {
      dom.profileMsg.textContent = 'Profile updated successfully!';
      dom.profileMsg.style.color = 'var(--color-accent)';
      localStorage.setItem('user', JSON.stringify(res.data));
      updateUI(res.data);
    } else {
      dom.profileMsg.textContent = res ? res.error : 'Update failed';
      dom.profileMsg.style.color = 'var(--color-danger)';
    }
    
    btn.disabled = false;
    btn.textContent = 'Save Changes';
    setTimeout(() => dom.profileMsg.textContent = '', 3000);
  });

  dom.passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    dom.passwordMsg.textContent = '';
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    if (data.newPassword !== data.confirmPassword) {
      dom.passwordMsg.textContent = 'New passwords do not match';
      dom.passwordMsg.style.color = 'var(--color-danger)';
      return;
    }

    const btn = e.target.querySelector('button');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>';

    const res = await window.api.put('/auth/profile', {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    });

    if (res && res.success) {
      dom.passwordMsg.textContent = 'Password updated successfully!';
      dom.passwordMsg.style.color = 'var(--color-accent)';
      e.target.reset();
    } else {
      dom.passwordMsg.textContent = res ? res.error : 'Update failed';
      dom.passwordMsg.style.color = 'var(--color-danger)';
    }

    btn.disabled = false;
    btn.textContent = 'Update Password';
    setTimeout(() => dom.passwordMsg.textContent = '', 3000);
  });

  dom.btnDeleteLogs.addEventListener('click', async () => {
    if (confirm('Are you absolutely sure? This will delete ALL your workout history permanently.')) {
      if (confirm('Final warning: Delete all logs?')) {
        dom.btnDeleteLogs.disabled = true;
        dom.btnDeleteLogs.textContent = 'Deleting...';
        
        // Fetch all logs then delete them one by one since we don't have a bulk delete route
        const res = await window.api.get('/logs');
        if (res && res.success) {
          const logs = res.data;
          for (let log of logs) {
            await window.api.delete(`/logs/${log._id}`);
          }
          alert('All logs deleted.');
          window.location.reload();
        } else {
          alert('Failed to delete logs.');
          dom.btnDeleteLogs.disabled = false;
          dom.btnDeleteLogs.textContent = 'Delete All Workout Logs';
        }
      }
    }
  });

  // --- FUNCTIONS ---

  async function loadProfile() {
    const res = await window.api.get('/auth/me');
    if (res && res.success) {
      currentUser = res.data;
      updateUI(currentUser);
    }
  }

  function updateUI(user) {
    dom.profName.textContent = user.name;
    dom.profEmail.textContent = user.email;
    
    const d = new Date(user.createdAt);
    dom.profDate.textContent = `Member since ${d.getFullYear()}`;
    
    const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    dom.profAvatar.textContent = initials;

    dom.inputName.value = user.name || '';
    dom.inputAge.value = user.age || '';
    dom.inputWeight.value = user.weight || '';
    dom.inputGoal.value = user.fitnessGoal || 'general';
    dom.inputLevel.value = user.fitnessLevel || 'beginner';
  }

  async function loadStats() {
    const res = await window.api.get('/logs/stats');
    if (res && res.success) {
      dom.statWorkouts.textContent = res.data.totalWorkouts;
      dom.statMinutes.textContent = res.data.totalMinutes;
      dom.statCalories.textContent = res.data.totalCalories;
    }
  }
});
