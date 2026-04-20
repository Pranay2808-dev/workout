document.addEventListener('DOMContentLoaded', () => {
  const isAuthPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';
  const token = localStorage.getItem('token');

  if (!isAuthPage && !token) {
    // Protected page, no token
    window.location.href = '/index.html';
  } else if (isAuthPage && token) {
    // Auth page, already logged in
    window.location.href = '/dashboard.html';
  }

  // Handle logout buttons
  const logoutBtns = document.querySelectorAll('.logout-btn');
  logoutBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/index.html';
    });
  });

  // Render user info in sidebar if present
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && !isAuthPage) {
    const nameEls = document.querySelectorAll('.user-name-display');
    const avatarEls = document.querySelectorAll('.user-avatar-display');
    
    nameEls.forEach(el => el.textContent = user.name);
    
    // Create initials for avatar
    const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    avatarEls.forEach(el => el.textContent = initials);
  }
});
