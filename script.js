class Colour {
  constructor(hex, element) {
    this.hex = hex;
    this.element = element;
    this.locked = false;
    this.input = element.querySelector('.colour-input');
    this.lockBtn = element.querySelector('.lock-toggle');
    this.copyBtn = element.querySelector('.copy-hex');
    this.img = this.lockBtn.querySelector('img');
    this.lockStatus = element.querySelector('.lock-status');
    this.preview = element.querySelector('.colour-preview');
    
    this.addListeners();
    this.setLocked(false);
    this.setHex(hex);
  }

  setHex(hex) {
    if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return;
    this.hex = hex.toUpperCase();
    
    // Update the color preview element
    if (this.preview) {
      this.preview.style.backgroundColor = this.hex;
    } else {
      // Fallback for older structure
      this.element.style.backgroundColor = this.hex;
    }
    
    // Use a more reliable method to update text without glitching
    const updateInput = () => {
      if (this.input && this.input.value !== this.hex) {
        this.input.value = this.hex;
      }
      // Always use white text with dark background for maximum visibility
      if (this.input) {
        this.input.style.color = '#ffffff';
        this.input.style.background = 'rgba(35, 35, 54, 0.95)';
      }
    };
    
    // Use setTimeout to ensure smooth updates
    setTimeout(updateInput, 0);
  }

  setLocked(locked) {
    this.locked = locked;
    this.lockBtn.classList.toggle('is-locked', locked);
    this.element.classList.toggle('locked', locked);
    this.img.src = locked ? 'Icons/lock-closed.svg' : 'Icons/lock-open.svg';
    this.lockBtn.setAttribute('aria-label', locked ? 'Unlock color' : 'Lock color');
    this.lockBtn.title = locked ? 'Unlock color' : 'Lock color';
    this.input.readOnly = locked;
    if (locked) {
      this.lockStatus.textContent = 'Locked';
    } else {
      this.lockStatus.textContent = '';
    }
  }

  toggleLocked() {
    this.setLocked(!this.locked);
  }

  generateHex() {
    if (this.locked) return;
    // Generate RGB values from 0-255 and convert to hex
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
    this.setHex(hex);
  }

  setSpecificHex(hex) {
    if (this.locked) return;
    
    // Add a small delay to prevent rapid updates that cause glitching
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
    
    this.updateTimeout = setTimeout(() => {
      this.setHex(hex);
    }, 10);
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.hex).then(() => {
      this.element.classList.add('copied');
      this.copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        this.element.classList.remove('copied');
        this.copyBtn.textContent = 'Copy';
      }, 1000);
    });
  }

  addListeners() {
    this.input.addEventListener('input', e => {
      const val = e.target.value;
      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
        this.setHex(val);
      }
    });
    this.lockBtn.addEventListener('click', () => this.toggleLocked());
    this.copyBtn.addEventListener('click', () => this.copyToClipboard());
    this.input.addEventListener('focus', () => this.input.select());
  }

  getContrastYIQ(hex) {
    let r = parseInt(hex.substr(1,2),16);
    let g = parseInt(hex.substr(3,2),16);
    let b = parseInt(hex.substr(5,2),16);
    let yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? 'black' : 'white';
  }
}

class ColorHarmony {
  static rgbToHex(r, g, b) {
    // Clamp RGB values to 0-255 range
    r = Math.max(0, Math.min(255, Math.round(r)));
    g = Math.max(0, Math.min(255, Math.round(g)));
    b = Math.max(0, Math.min(255, Math.round(b)));
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  static hexToRgb(hex) {
    hex = hex.replace('#', '');
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16)
    ];
  }

  static rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  }

  static hslToRgb(h, s, l) {
    // Normalize values
    h = ((h % 360) + 360) % 360; // Ensure h is between 0-360
    s = Math.max(0, Math.min(100, s)) / 100; // Clamp s between 0-1
    l = Math.max(0, Math.min(100, l)) / 100; // Clamp l between 0-1

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r, g, b;

    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }

    // Convert to 0-255 range
    return [
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255)
    ];
  }

  static hslToHex(h, s, l) {
    const [r, g, b] = this.hslToRgb(h, s, l);
    return this.rgbToHex(r, g, b);
  }

  static hexToHsl(hex) {
    const [r, g, b] = this.hexToRgb(hex);
    return this.rgbToHsl(r, g, b);
  }

  static generateComplementary(baseHex) {
    const [h, s, l] = this.hexToHsl(baseHex);
    const complementHue = (h + 180) % 360;
    
    return [
      baseHex,
      this.hslToHex(complementHue, s, l),
      this.hslToHex((h + 30) % 360, Math.max(40, s - 10), Math.min(80, l + 5)),
      this.hslToHex((complementHue + 30) % 360, Math.max(40, s - 10), Math.min(80, l + 5)),
      this.hslToHex(h, Math.max(30, s - 15), Math.min(80, l + 10)),
      this.hslToHex(complementHue, Math.max(30, s - 15), Math.min(80, l + 10))
    ];
  }

  static generateAnalogous(baseHex) {
    const [h, s, l] = this.hexToHsl(baseHex);
    
    return [
      this.hslToHex((h - 40 + 360) % 360, s, l),
      this.hslToHex((h - 20 + 360) % 360, s, l),
      baseHex,
      this.hslToHex((h + 20) % 360, s, l),
      this.hslToHex((h + 40) % 360, s, l),
      this.hslToHex((h + 60) % 360, s, l)
    ];
  }

  static generateSplitComplementary(baseHex) {
    const [h, s, l] = this.hexToHsl(baseHex);
    const complement = (h + 180) % 360;
    
    return [
      baseHex,
      this.hslToHex((complement - 30 + 360) % 360, s, l),
      this.hslToHex((complement + 30) % 360, s, l),
      this.hslToHex((h + 30) % 360, Math.max(35, s - 10), Math.max(25, l - 5)),
      this.hslToHex((h - 30 + 360) % 360, Math.max(35, s - 10), Math.max(25, l - 5)),
      this.hslToHex(h, Math.max(20, s - 20), Math.max(20, l - 15))
    ];
  }

  static generateMonochromatic(baseHex) {
    const [h, s, l] = this.hexToHsl(baseHex);
    
    return [
      this.hslToHex(h, s, Math.min(90, l + 30)),
      this.hslToHex(h, s, Math.min(80, l + 20)),
      this.hslToHex(h, s, Math.min(70, l + 10)),
      baseHex,
      this.hslToHex(h, s, Math.max(20, l - 15)),
      this.hslToHex(h, s, Math.max(10, l - 25))
    ];
  }

  static generateTriadic(baseHex) {
    const [h, s, l] = this.hexToHsl(baseHex);
    
    return [
      baseHex,
      this.hslToHex((h + 120) % 360, s, l),
      this.hslToHex((h + 240) % 360, s, l),
      this.hslToHex((h + 60) % 360, Math.max(30, s - 10), Math.max(25, l - 5)),
      this.hslToHex((h + 180) % 360, Math.max(30, s - 10), Math.max(25, l - 5)),
      this.hslToHex((h + 300) % 360, Math.max(30, s - 10), Math.max(25, l - 5))
    ];
  }

  static generateCompound(baseHex) {
    const [h, s, l] = this.hexToHsl(baseHex);
    const complement = (h + 180) % 360;
    
    return [
      baseHex,
      this.hslToHex((h + 30) % 360, s, l),
      this.hslToHex((h + 60) % 360, s, l),
      this.hslToHex(complement, s, l),
      this.hslToHex((complement + 30) % 360, s, l),
      this.hslToHex((complement + 60) % 360, s, l)
    ];
  }

  static generateShades(baseHex) {
    const [h, s, l] = this.hexToHsl(baseHex);
    
    return [
      this.hslToHex(h, s, Math.min(95, l + 40)),
      this.hslToHex(h, s, Math.min(85, l + 25)),
      this.hslToHex(h, s, Math.min(75, l + 15)),
      baseHex,
      this.hslToHex(h, s, Math.max(15, l - 20)),
      this.hslToHex(h, s, Math.max(5, l - 35))
    ];
  }
}

const colourElements = document.querySelectorAll('.colours .colour');
const colours = Array.from(colourElements).map((el, index) => {
  // Start with different colors instead of all black
  const initialColors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
  return new Colour(initialColors[index] || '#3B82F6', el);
});
const colorModeSelect = document.getElementById('color-mode');

function generatePalette() {
  const mode = colorModeSelect.value;
  
  // Add a small delay to prevent rapid successive calls
  if (generatePalette.isGenerating) return;
  generatePalette.isGenerating = true;
  
  setTimeout(() => {
    if (mode === 'random') {
      colours.forEach(colour => colour.generateHex());
    } else {
      // Find the first unlocked color or generate a base color
      let baseColor = colours.find(c => !c.locked)?.hex;
      if (!baseColor || !/^#[0-9A-Fa-f]{6}$/.test(baseColor)) {
        // Generate a vibrant base color with RGB values from 0-255
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        baseColor = ColorHarmony.rgbToHex(r, g, b);
      }
      
      let generatedColors = [];
      
      try {
        switch(mode) {
          case 'complementary':
            generatedColors = ColorHarmony.generateComplementary(baseColor);
            break;
          case 'analogous':
            generatedColors = ColorHarmony.generateAnalogous(baseColor);
            break;
          case 'split-complementary':
            generatedColors = ColorHarmony.generateSplitComplementary(baseColor);
            break;
          case 'monochromatic':
            generatedColors = ColorHarmony.generateMonochromatic(baseColor);
            break;
          case 'triadic':
            generatedColors = ColorHarmony.generateTriadic(baseColor);
            break;
          case 'compound':
            generatedColors = ColorHarmony.generateCompound(baseColor);
            break;
          case 'shades':
            generatedColors = ColorHarmony.generateShades(baseColor);
            break;
          default:
            // Fallback to random if mode is unrecognized
            colours.forEach(colour => colour.generateHex());
            generatePalette.isGenerating = false;
            return;
        }
        
        // Ensure we have 6 colors, fill with variations if needed
        while (generatedColors.length < 6) {
          const [h, s, l] = ColorHarmony.hexToHsl(baseColor);
          const variation = ColorHarmony.hslToHex(
            (h + Math.random() * 60 - 30 + 360) % 360,
            Math.max(20, Math.min(90, s + Math.random() * 40 - 20)),
            Math.max(10, Math.min(90, l + Math.random() * 40 - 20))
          );
          generatedColors.push(variation);
        }
        
        // Validate generated colors and apply them
        colours.forEach((colour, index) => {
          if (generatedColors[index] && /^#[0-9A-Fa-f]{6}$/i.test(generatedColors[index])) {
            colour.setSpecificHex(generatedColors[index]);
          } else {
            // Fallback to random color if generated color is invalid
            colour.generateHex();
          }
        });
      } catch (error) {
        console.error('Error generating color harmony:', error);
        // Fallback to random generation
        colours.forEach(colour => colour.generateHex());
      }
    }
    
    generatePalette.isGenerating = false;
  }, 50);
}

// Enhanced UI Interactions and Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
  // Prevent actions when user is typing in input field
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
  
  switch (e.code) {
    case 'Space':
      if (!e.repeat) {
        e.preventDefault();
        generatePaletteWithFeedback();
      }
      break;
    case 'KeyC':
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        copyAllColors();
      }
      break;
    case 'KeyL':
      e.preventDefault();
      toggleRandomLock();
      break;
    case 'KeyR':
      e.preventDefault();
      resetAllLocks();
      break;
    case 'Escape':
      clearAllFocus();
      break;
  }
});

// Enhanced generate function with visual feedback
function generatePaletteWithFeedback() {
  const button = document.querySelector('.generator-button');
  button.classList.add('loading');
  
  // Add a slight delay for better UX
  setTimeout(() => {
    generatePalette();
    button.classList.remove('loading');
  }, 150);
}

// Copy all color hex codes to clipboard
function copyAllColors() {
  const hexCodes = colours.map(colour => colour.hex).join(', ');
  navigator.clipboard.writeText(hexCodes).then(() => {
    showNotification('All colors copied to clipboard!', 'success');
  }).catch(() => {
    showNotification('Failed to copy colors', 'error');
  });
}

// Toggle lock on a random unlocked color
function toggleRandomLock() {
  const unlockedColors = colours.filter(colour => !colour.locked);
  if (unlockedColors.length > 0) {
    const randomColor = unlockedColors[Math.floor(Math.random() * unlockedColors.length)];
    randomColor.toggleLocked();
    showNotification(`Color ${randomColor.hex} ${randomColor.locked ? 'locked' : 'unlocked'}`, 'info');
  }
}

// Reset all locks
function resetAllLocks() {
  colours.forEach(colour => {
    if (colour.locked) {
      colour.setLocked(false);
    }
  });
  showNotification('All colors unlocked', 'info');
}

// Clear focus from all elements
function clearAllFocus() {
  document.activeElement.blur();
}

// Notification system
function showNotification(message, type = 'info') {
  // Remove existing notification
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  // Add styles
  Object.assign(notification.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '12px 20px',
    borderRadius: '8px',
    color: 'white',
    fontWeight: '600',
    fontSize: '14px',
    zIndex: '10000',
    transform: 'translateX(100%)',
    opacity: '0',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    backdropFilter: 'blur(8px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
  });

  // Set background color based on type
  const backgrounds = {
    success: 'linear-gradient(135deg, #10b981, #22d3ee)',
    error: 'linear-gradient(135deg, #ef4444, #f97316)',
    info: 'linear-gradient(135deg, #8b5cf6, #a78bfa)'
  };
  notification.style.background = backgrounds[type] || backgrounds.info;

  document.body.appendChild(notification);

  // Animate in
  requestAnimationFrame(() => {
    notification.style.transform = 'translateX(0)';
    notification.style.opacity = '1';
  });

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Enhanced color card interactions
colours.forEach((colour, index) => {
  const element = colour.element;
  const preview = element.querySelector('.colour-preview');
  
  if (preview) {
    // Add number indicator
    const numberIndicator = document.createElement('div');
    numberIndicator.className = 'color-number';
    numberIndicator.textContent = index + 1;
    Object.assign(numberIndicator.style, {
      position: 'absolute',
      top: '8px',
      right: '8px',
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      background: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      fontWeight: '600',
      zIndex: '2',
      opacity: '0.8'
    });
    
    preview.style.position = 'relative';
    preview.appendChild(numberIndicator);
    
    // Add click to copy functionality to the color preview
    preview.addEventListener('click', () => {
      colour.copyToClipboard();
    });
    
    // Add hover effects for better interactivity
    element.addEventListener('mouseenter', () => {
      numberIndicator.style.opacity = '1';
      numberIndicator.style.transform = 'scale(1.1)';
    });
    
    element.addEventListener('mouseleave', () => {
      numberIndicator.style.opacity = '0.8';
      numberIndicator.style.transform = 'scale(1)';
    });
  }
});

// Add loading states and error handling for color mode changes
const colorModeSelectElement = document.getElementById('color-mode');
colorModeSelectElement.addEventListener('change', (e) => {
  showNotification(`Switched to ${e.target.options[e.target.selectedIndex].text} mode`, 'info');
  generatePaletteWithFeedback();
});

// Add help tooltip
function createHelpTooltip() {
  const helpButton = document.createElement('button');
  helpButton.innerHTML = '?';
  helpButton.className = 'help-button';
  Object.assign(helpButton.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'var(--accent)',
    color: 'white',
    border: 'none',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    zIndex: '1000',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 16px rgba(139, 92, 246, 0.3)'
  });

  helpButton.addEventListener('click', () => {
    const helpText = `Keyboard Shortcuts:
• Space - Generate new palette
• L - Lock/unlock random color
• R - Reset all locks
• Ctrl/Cmd + C - Copy all colors
• Esc - Clear focus

Tips:
• Click color preview to copy
• Lock colors to keep them
• Try different harmony modes`;
    
    showNotification(helpText, 'info');
  });

  helpButton.addEventListener('mouseenter', () => {
    helpButton.style.transform = 'scale(1.1)';
    helpButton.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.4)';
  });

  helpButton.addEventListener('mouseleave', () => {
    helpButton.style.transform = 'scale(1)';
    helpButton.style.boxShadow = '0 4px 16px rgba(139, 92, 246, 0.3)';
  });

  document.body.appendChild(helpButton);
}

// Initialize enhanced features
createHelpTooltip();

// Generate initial palette and show welcome notification
generatePalette();

// Show welcome notification after a delay
setTimeout(() => {
  showNotification('Welcome! Press ? for keyboard shortcuts', 'info');
}, 1500);

// Add event listeners for the main functionality
document.querySelector('.generator-button').addEventListener('click', generatePaletteWithFeedback);
