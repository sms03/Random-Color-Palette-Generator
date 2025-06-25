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
    this.setHex(hex);
    this.setLocked(false);
    this.addListeners();
  }

  setHex(hex) {
    if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return;
    this.hex = hex.toUpperCase();
    
    // Batch DOM updates to prevent glitching
    this.element.style.backgroundColor = this.hex;
    
    // Use a more reliable method to update text without glitching
    const updateInput = () => {
      if (this.input.value !== this.hex) {
        this.input.value = this.hex;
      }
      // Always use white text with dark background for maximum visibility
      this.input.style.color = '#ffffff';
      this.input.style.background = 'rgba(35, 35, 54, 0.95)';
    };
    
    // Use setTimeout to ensure smooth updates
    setTimeout(updateInput, 0);
  }

  setLocked(locked) {
    this.locked = locked;
    this.lockBtn.classList.toggle('is-locked', locked);
    this.element.classList.toggle('locked', locked);
    this.img.src = locked ? 'icons/lock-closed.svg' : 'icons/lock-open.svg';
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
    const hex = '#' + Array.from({length:6},()=>Math.floor(Math.random()*16).toString(16)).join('').toUpperCase();
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
  static hslToHex(h, s, l) {
    // Normalize values
    h = ((h % 360) + 360) % 360; // Ensure h is between 0-360
    s = Math.max(0, Math.min(100, s)); // Clamp s between 0-100
    l = Math.max(0, Math.min(100, l)); // Clamp l between 0-100
    
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
  }

  static hexToHsl(hex) {
    // Remove # if present
    hex = hex.replace('#', '');
    
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;

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

  static generateComplementary(baseHex) {
    const [h, s, l] = this.hexToHsl(baseHex);
    const complementHue = (h + 180) % 360;
    
    return [
      baseHex,
      this.hslToHex(complementHue, s, l),
      this.hslToHex(h, Math.max(30, s - 15), Math.min(80, l + 10)),
      this.hslToHex(complementHue, Math.max(30, s - 15), Math.min(80, l + 10))
    ];
  }

  static generateAnalogous(baseHex) {
    const [h, s, l] = this.hexToHsl(baseHex);
    
    return [
      this.hslToHex((h - 30 + 360) % 360, s, l),
      this.hslToHex((h - 15 + 360) % 360, s, l),
      baseHex,
      this.hslToHex((h + 30) % 360, s, l)
    ];
  }

  static generateSplitComplementary(baseHex) {
    const [h, s, l] = this.hexToHsl(baseHex);
    const complement = (h + 180) % 360;
    
    return [
      baseHex,
      this.hslToHex((complement - 30 + 360) % 360, s, l),
      this.hslToHex((complement + 30) % 360, s, l),
      this.hslToHex(h, Math.max(20, s - 20), Math.max(20, l - 15))
    ];
  }

  static generateMonochromatic(baseHex) {
    const [h, s, l] = this.hexToHsl(baseHex);
    
    return [
      this.hslToHex(h, s, Math.min(85, l + 25)),
      this.hslToHex(h, s, Math.min(75, l + 15)),
      baseHex,
      this.hslToHex(h, s, Math.max(15, l - 20))
    ];
  }

  static generateTriadic(baseHex) {
    const [h, s, l] = this.hexToHsl(baseHex);
    
    return [
      baseHex,
      this.hslToHex((h + 120) % 360, s, l),
      this.hslToHex((h + 240) % 360, s, l),
      this.hslToHex(h, Math.max(25, s - 15), Math.max(25, l - 10))
    ];
  }

  static generateCompound(baseHex) {
    const [h, s, l] = this.hexToHsl(baseHex);
    const complement = (h + 180) % 360;
    
    return [
      baseHex,
      this.hslToHex((h + 30) % 360, s, l),
      this.hslToHex(complement, s, l),
      this.hslToHex((complement + 30) % 360, s, l)
    ];
  }

  static generateShades(baseHex) {
    const [h, s, l] = this.hexToHsl(baseHex);
    
    return [
      this.hslToHex(h, s, Math.min(90, l + 35)),
      this.hslToHex(h, s, Math.min(80, l + 20)),
      baseHex,
      this.hslToHex(h, s, Math.max(10, l - 25))
    ];
  }
}

const colourElements = document.querySelectorAll('.colours .colour');
const colours = Array.from(colourElements).map(el => new Colour('#000000', el));
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
        // Generate a vibrant base color with good saturation and lightness
        const baseHue = Math.floor(Math.random() * 360);
        const baseSat = 60 + Math.floor(Math.random() * 30); // 60-90% saturation
        const baseLightness = 45 + Math.floor(Math.random() * 20); // 45-65% lightness
        baseColor = ColorHarmony.hslToHex(baseHue, baseSat, baseLightness);
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

document.querySelector('.generator-button').addEventListener('click', generatePalette);
document.addEventListener('keydown', e => {
  if (e.code === 'Space' && !e.repeat) {
    e.preventDefault();
    generatePalette();
  }
});

generatePalette();
