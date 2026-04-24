// Immediately execute theme initialization to prevent FOUC (Flash of Unstyled Content)
(function initTheme() {
  const savedMode = localStorage.getItem('theme-mode') || 'dark';
  const savedColor = localStorage.getItem('theme-color') || '45, 90, 61'; // default green

  // Wait for body to be available or run on DOMContentLoaded
  const applyTheme = () => {
    if (savedMode === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    document.documentElement.style.setProperty('--color-accent-rgb', savedColor);
  };

  if (document.body) {
    applyTheme();
  } else {
    document.addEventListener('DOMContentLoaded', applyTheme);
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  const colors = [
    { name: 'Green', rgb: '45, 90, 61' },
    { name: 'Orange', rgb: '234, 88, 12' },
    { name: 'Blue', rgb: '37, 99, 235' },
    { name: 'Violet', rgb: '124, 58, 237' },
    { name: 'Purple', rgb: '147, 51, 234' },
    { name: 'Pink', rgb: '219, 39, 119' },
    { name: 'Black', rgb: '0, 0, 0' }
  ];

  // Inject the Theme Switcher Widget HTML
  const widget = document.createElement('div');
  widget.className = 'theme-switcher-widget';
  
  // Create mode toggle button (Sun/Moon)
  const modeBtn = document.createElement('button');
  modeBtn.className = 'theme-mode-toggle';
  modeBtn.innerHTML = getModeIcon();
  modeBtn.title = 'Toggle Dark/Light Mode';
  
  modeBtn.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-theme');
    localStorage.setItem('theme-mode', isLight ? 'light' : 'dark');
    modeBtn.innerHTML = getModeIcon();
  });

  // Create color palette buttons
  const colorsContainer = document.createElement('div');
  colorsContainer.style.display = 'flex';
  colorsContainer.style.gap = '0.35rem';
  colorsContainer.style.borderLeft = '1px solid var(--color-border)';
  colorsContainer.style.paddingLeft = '0.5rem';

  const savedColor = localStorage.getItem('theme-color') || '45, 90, 61';

  colors.forEach(color => {
    const btn = document.createElement('button');
    btn.className = 'theme-color-btn';
    btn.style.backgroundColor = `rgb(${color.rgb})`;
    btn.title = color.name;
    
    if (color.rgb === savedColor) {
      btn.classList.add('active');
    }

    btn.addEventListener('click', () => {
      document.documentElement.style.setProperty('--color-accent-rgb', color.rgb);
      localStorage.setItem('theme-color', color.rgb);
      
      // Update active state
      document.querySelectorAll('.theme-color-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });

    colorsContainer.appendChild(btn);
  });

  widget.appendChild(modeBtn);
  widget.appendChild(colorsContainer);
  
  // Add to DOM
  document.body.appendChild(widget);

  function getModeIcon() {
    const isLight = document.body.classList.contains('light-theme');
    if (isLight) {
      // Moon icon for switching to dark
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    } else {
      // Sun icon for switching to light
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
    }
  }
});
