// Application state
let currentSettings = {
  blur: 20,
  transparency: 20,
  borderRadius: 20,
  iridescence: 60,
  glow: 30,
  distortion: 40,
  colorTint: 'rgba(255, 255, 255, 0.1)'
};

// Presets data
const presets = {
  "iOS 26": {
    blur: 20,
    transparency: 20,
    borderRadius: 20,
    iridescence: 60,
    glow: 30,
    colorTint: "rgba(255, 255, 255, 0.1)",
    distortion: 40
  },
  "Clean": {
    blur: 10,
    transparency: 40,
    borderRadius: 15,
    iridescence: 20,
    glow: 10,
    colorTint: "rgba(255, 255, 255, 0.2)",
    distortion: 10
  },
  "Intense": {
    blur: 30,
    transparency: 10,
    borderRadius: 25,
    iridescence: 80,
    glow: 50,
    colorTint: "rgba(100, 200, 255, 0.15)",
    distortion: 70
  }
};

// DOM Elements
let glassElement, themeToggle, sliders, valueDisplays, presetButtons, colorButtons, copyCssBtn, resetBtn, toast;

// Drag functionality
let isDragging = false;
let startX, startY, initialX, initialY;

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
  initializeElements();
  initializeEventListeners();
  initializeDragFunctionality();
  applySettings();
  initializeTheme();
});

function initializeElements() {
  glassElement = document.getElementById('glassElement');
  themeToggle = document.getElementById('themeToggle');
  copyCssBtn = document.getElementById('copyCssBtn');
  resetBtn = document.getElementById('resetBtn');
  toast = document.getElementById('toast');
  
  // Sliders and their value displays
  sliders = {
    blur: document.getElementById('blurSlider'),
    transparency: document.getElementById('transparencySlider'),
    borderRadius: document.getElementById('radiusSlider'),
    iridescence: document.getElementById('iridescenceSlider'),
    glow: document.getElementById('glowSlider'),
    distortion: document.getElementById('distortionSlider')
  };
  
  valueDisplays = {
    blur: document.getElementById('blurValue'),
    transparency: document.getElementById('transparencyValue'),
    borderRadius: document.getElementById('radiusValue'),
    iridescence: document.getElementById('iridescenceValue'),
    glow: document.getElementById('glowValue'),
    distortion: document.getElementById('distortionValue')
  };
  
  presetButtons = document.querySelectorAll('.preset-btn');
  colorButtons = document.querySelectorAll('.color-btn');
}

function initializeEventListeners() {
  // Slider event listeners
  Object.keys(sliders).forEach(key => {
    sliders[key].addEventListener('input', (e) => updateSetting(key, e.target.value));
  });
  
  // Preset button event listeners
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
  });
  
  // Color button event listeners
  colorButtons.forEach(btn => {
    btn.addEventListener('click', () => selectColor(btn.dataset.color, btn));
  });
  
  // Action button event listeners
  copyCssBtn.addEventListener('click', copyCSS);
  resetBtn.addEventListener('click', resetSettings);
  themeToggle.addEventListener('click', toggleTheme);
  
  // Glass element click event
  glassElement.addEventListener('click', () => {
    glassElement.style.animation = 'none';
    glassElement.offsetHeight; // Trigger reflow
    glassElement.style.animation = '';
  });
}

function initializeDragFunctionality() {
  // Mouse events
  glassElement.addEventListener('mousedown', startDrag);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', endDrag);
  
  // Touch events for mobile
  glassElement.addEventListener('touchstart', startDrag);
  document.addEventListener('touchmove', drag);
  document.addEventListener('touchend', endDrag);
}

function startDrag(e) {
  isDragging = true;
  glassElement.classList.add('dragging');
  // Remove centering transform when dragging
  glassElement.style.transform = '';
  
  const clientX = e.clientX || e.touches[0].clientX;
  const clientY = e.clientY || e.touches[0].clientY;
  
  startX = clientX;
  startY = clientY;
  
  const rect = glassElement.getBoundingClientRect();
  initialX = rect.left;
  initialY = rect.top;
  
  e.preventDefault();
}

function drag(e) {
  if (!isDragging) return;
  
  e.preventDefault();
  
  const clientX = e.clientX || e.touches[0].clientX;
  const clientY = e.clientY || e.touches[0].clientY;
  
  const deltaX = clientX - startX;
  const deltaY = clientY - startY;
  
  const newX = initialX + deltaX;
  const newY = initialY + deltaY;
  
  // Constrain to viewport
  const rect = glassElement.getBoundingClientRect();
  const maxX = window.innerWidth - rect.width;
  const maxY = window.innerHeight - rect.height;
  
  const constrainedX = Math.max(0, Math.min(maxX, newX));
  const constrainedY = Math.max(0, Math.min(maxY, newY));
  
  glassElement.style.position = 'fixed';
  glassElement.style.left = constrainedX + 'px';
  glassElement.style.top = constrainedY + 'px';
  glassElement.style.zIndex = '1000';
}

function endDrag() {
  if (!isDragging) return;
  
  isDragging = false;
  glassElement.classList.remove('dragging');
  // Do not auto-return to center after drag
}

function updateSetting(key, value) {
  currentSettings[key] = parseFloat(value);
  valueDisplays[key].textContent = value;
  applySettings();
  updateActivePreset();
}

function applySettings() {
  const root = document.documentElement;
  // Update CSS variables
  root.style.setProperty('--glass-blur', currentSettings.blur + 'px');
  root.style.setProperty('--glass-transparency', currentSettings.transparency / 100);
  root.style.setProperty('--glass-radius', currentSettings.borderRadius + 'px');
  root.style.setProperty('--glass-iridescence', currentSettings.iridescence + '%');
  root.style.setProperty('--glass-glow', currentSettings.glow + '%');
  root.style.setProperty('--glass-distortion', currentSettings.distortion + '%');
  root.style.setProperty('--glass-color-tint', currentSettings.colorTint);

  // Apply advanced effects
  updateGlassElement();
  // Remove forced centering on every customize
  // centerGlassElement(); // <-- Remove this line
}

function centerGlassElement() {
  // Center the glass element in its container
  const container = document.querySelector('.glass-container');
  if (!container || !glassElement) return;
  glassElement.style.position = 'absolute';
  glassElement.style.left = '50%';
  glassElement.style.top = '50%';
  glassElement.style.transform = 'translate(-50%, -50%)';
  glassElement.style.zIndex = '';
}

function updateGlassElement() {
  const transparency = currentSettings.transparency / 100;
  const glow = currentSettings.glow / 100;
  const distortion = currentSettings.distortion / 100;
  
  // Update background with transparency
  const colorTint = currentSettings.colorTint.replace(/[\d.]+\)$/, `${transparency})`);
  
  // Calculate glow intensity
  const glowIntensity = glow * 0.3;
  const glowRadius = glow * 0.5;
  
  // Calculate chromatic aberration based on distortion
  const aberrationX = distortion * 2;
  const aberrationY = distortion * 1;
  
  glassElement.style.background = colorTint;
  glassElement.style.boxShadow = `
    0 ${8 + glow * 0.4}px ${32 + glow * 0.6}px rgba(0, 0, 0, ${0.1 + glowIntensity}),
    inset 0 1px 0 rgba(255, 255, 255, ${0.2 + glowIntensity}),
    inset 0 -1px 0 rgba(255, 255, 255, ${0.1 + glowIntensity * 0.5}),
    0 0 0 1px rgba(255, 255, 255, ${0.05 + glowIntensity * 0.3}),
    0 0 ${glowRadius * 20}px ${glowRadius * 10}px rgba(255, 255, 255, ${glowIntensity * 0.1})
  `;
  
  glassElement.style.filter = `
    drop-shadow(${aberrationX}px 0 0 rgba(255, 0, 0, ${distortion * 0.001}))
    drop-shadow(-${aberrationX}px 0 0 rgba(0, 255, 255, ${distortion * 0.001}))
    drop-shadow(0 ${aberrationY}px 0 rgba(0, 255, 0, ${distortion * 0.0005}))
  `;
}

function applyPreset(presetName) {
  const preset = presets[presetName];
  if (!preset) return;
  // Update current settings
  Object.assign(currentSettings, preset);
  // Update sliders
  Object.keys(sliders).forEach(key => {
    if (currentSettings[key] !== undefined) {
      sliders[key].value = currentSettings[key];
      valueDisplays[key].textContent = currentSettings[key];
    }
  });
  // Update color selection
  selectColor(preset.colorTint);
  // Apply settings (do not center)
  applySettings();
  // Update active preset button
  presetButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.preset === presetName);
  });
  // Center only on preset change or reset
  centerGlassElement();
}

function selectColor(colorValue, buttonElement = null) {
  currentSettings.colorTint = colorValue;
  applySettings();
  
  // Update active color button
  colorButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.color === colorValue);
  });
  
  updateActivePreset();
}

function updateActivePreset() {
  // Check if current settings match any preset
  let matchingPreset = null;
  
  Object.keys(presets).forEach(presetName => {
    const preset = presets[presetName];
    const matches = Object.keys(preset).every(key => 
      Math.abs(currentSettings[key] - preset[key]) < 1 || currentSettings[key] === preset[key]
    );
    
    if (matches) {
      matchingPreset = presetName;
    }
  });
  
  // Update preset button states
  presetButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.preset === matchingPreset);
  });
}

function resetSettings() {
  applyPreset('iOS 26');
  // Already recenters via applyPreset
}

function copyCSS() {
  const css = generateCSS();
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(css).then(() => {
      showToast('CSS copied to clipboard!');
    }).catch(() => {
      fallbackCopyCSS(css);
    });
  } else {
    fallbackCopyCSS(css);
  }
}

function fallbackCopyCSS(css) {
  const textArea = document.createElement('textarea');
  textArea.value = css;
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.select();
  
  try {
    document.execCommand('copy');
    showToast('CSS copied to clipboard!');
  } catch (err) {
    showToast('Failed to copy CSS');
  }
  
  document.body.removeChild(textArea);
}

function generateCSS() {
  const transparency = currentSettings.transparency / 100;
  const glow = currentSettings.glow / 100;
  const distortion = currentSettings.distortion / 100;
  
  const colorTint = currentSettings.colorTint.replace(/[\d.]+\)$/, `${transparency})`);
  const glowIntensity = glow * 0.3;
  const glowRadius = glow * 0.5;
  const aberrationX = distortion * 2;
  const aberrationY = distortion * 1;
  
  return `.liquid-glass {
  background: ${colorTint};
  backdrop-filter: blur(${currentSettings.blur}px) saturate(1.5);
  -webkit-backdrop-filter: blur(${currentSettings.blur}px) saturate(1.5);
  border-radius: ${currentSettings.borderRadius}px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  box-shadow: 
    0 ${8 + glow * 0.4}px ${32 + glow * 0.6}px rgba(0, 0, 0, ${0.1 + glowIntensity}),
    inset 0 1px 0 rgba(255, 255, 255, ${0.2 + glowIntensity}),
    inset 0 -1px 0 rgba(255, 255, 255, ${0.1 + glowIntensity * 0.5}),
    0 0 0 1px rgba(255, 255, 255, ${0.05 + glowIntensity * 0.3}),
    0 0 ${glowRadius * 20}px ${glowRadius * 10}px rgba(255, 255, 255, ${glowIntensity * 0.1});
    
  filter: 
    drop-shadow(${aberrationX}px 0 0 rgba(255, 0, 0, ${distortion * 0.001}))
    drop-shadow(-${aberrationX}px 0 0 rgba(0, 255, 255, ${distortion * 0.001}))
    drop-shadow(0 ${aberrationY}px 0 rgba(0, 255, 0, ${distortion * 0.0005}));
}

/* Iridescence overlay */
.liquid-glass::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  background: linear-gradient(
    45deg,
    transparent 0%,
    rgba(255, 255, 255, 0.1) 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.05) 75%,
    transparent 100%
  );
  opacity: ${currentSettings.iridescence / 100};
  mix-blend-mode: overlay;
  animation: liquidDistortion 8s ease-in-out infinite;
}

@keyframes liquidDistortion {
  0%, 100% { 
    transform: translate(0, 0) rotate(0deg) scale(1);
    filter: hue-rotate(0deg);
  }
  25% { 
    transform: translate(2px, -1px) rotate(0.5deg) scale(1.01);
    filter: hue-rotate(90deg);
  }
  50% { 
    transform: translate(-1px, 2px) rotate(-0.5deg) scale(0.99);
    filter: hue-rotate(180deg);
  }
  75% { 
    transform: translate(-2px, -1px) rotate(0.3deg) scale(1.01);
    filter: hue-rotate(270deg);
  }
}`;
}

function showToast(message) {
  const toastText = toast.querySelector('.toast-text');
  toastText.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-color-scheme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-color-scheme', newTheme);
  
  // Update theme toggle button
  const icon = themeToggle.querySelector('.theme-icon');
  const text = themeToggle.querySelector('.theme-text');
  
  if (newTheme === 'dark') {
    icon.textContent = '☀️';
    text.textContent = 'Light Mode';
  } else {
    icon.textContent = '🌙';
    text.textContent = 'Dark Mode';
  }
  
  // Store preference
  localStorage.setItem('theme-preference', newTheme);
}

function initializeTheme() {
  // Check for saved theme preference or default to system preference
  const savedTheme = localStorage.getItem('theme-preference');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  
  if (initialTheme === 'dark') {
    document.documentElement.setAttribute('data-color-scheme', 'dark');
    const icon = themeToggle.querySelector('.theme-icon');
    const text = themeToggle.querySelector('.theme-text');
    icon.textContent = '☀️';
    text.textContent = 'Light Mode';
  }
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme-preference')) {
      const newTheme = e.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-color-scheme', newTheme);
    }
  });
}

// Prevent context menu on glass element
document.addEventListener('contextmenu', (e) => {
  if (e.target.closest('.glass-element')) {
    e.preventDefault();
  }
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey) {
    switch (e.key) {
      case 'c':
        if (e.target.closest('.glass-element')) {
          e.preventDefault();
          copyCSS();
        }
        break;
      case 'r':
        if (e.target.closest('.app-container')) {
          e.preventDefault();
          resetSettings();
        }
        break;
    }
  }
  
  // Theme toggle with 't' key
  if (e.key === 't' && !e.ctrlKey && !e.metaKey && !e.altKey) {
    if (!e.target.matches('input, textarea, select')) {
      toggleTheme();
    }
  }
});
