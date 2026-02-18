# Light Green Design System

A design language for premium, light-themed health-tech interfaces.

---

## Philosophy

> "Quiet confidence. Let the product speak."

This system creates interfaces that feel like high-end wellness technology—serene, trustworthy, and effortlessly premium. Think Oura Ring meets Apple Health meets a boutique hotel. The design should feel expensive without being flashy, healthy without being clinical.

### Core Beliefs

1. **Scroll as narrative** — The page tells a story; scrolling reveals chapters
2. **Dimensional depth** — Cards lift, shadows breathe, surfaces have weight
3. **Seamless morphing** — Elements transform rather than cut; nothing jarring
4. **Restrained color** — Green whispers, never shouts; mostly neutral canvas
5. **Typography-led hierarchy** — Serif for headlines, sans for function

### Strict Rules

- **No Harsh Transitions** — Everything eases, nothing snaps
- **No Flat Cards** — Shadows and borders create tactile depth
- **No Generic Greens** — Only the specific brand gradient palette
- **No Dense Layouts** — Generous whitespace is non-negotiable
- **No Decorative Elements** — Every pixel serves the narrative

---

## Color Palette

### Brand Gradient System
The palette centers on a sophisticated green-to-teal gradient. Used sparingly for CTAs, accents, and key moments. The rest is warm neutrals.

```css
/* Primary Brand Gradient */
--brand-gradient: linear-gradient(135deg, #4ADE80 0%, #0D9488 100%);
--brand-gradient-hover: linear-gradient(135deg, #3BD975 0%, #0B8577 100%);
--brand-gradient-pressed: linear-gradient(135deg, #2AB862 0%, #097A6B 100%);

/* Brand Solids */
--brand-primary: #4ADE80;        /* Emerald - primary accent */
--brand-secondary: #0D9488;      /* Teal - secondary accent */
--brand-dark: #059669;           /* Deep green - tertiary */
--brand-deeper: #047857;         /* Forest - darkest accent */

/* Brand with Opacity (for backgrounds) */
rgba(74, 222, 128, 0.08)         /* Subtle tint */
rgba(74, 222, 128, 0.12)         /* Light background */
rgba(74, 222, 128, 0.15)         /* Dot patterns */
rgba(74, 222, 128, 0.20)         /* Spotlight core */
rgba(74, 222, 128, 0.30)         /* Glow effects */
rgba(74, 222, 128, 0.40)         /* Strong glow */
rgba(13, 148, 136, 0.08)         /* Teal tint */
rgba(13, 148, 136, 0.15)         /* Teal background */
```

### Neutral Scale (Zinc-based)
```css
/* Backgrounds */
--bg-white: #FFFFFF;             /* Primary background */
--bg-off-white: #FAFAFA;         /* Section backgrounds */
--bg-warm: #F5F5F5;              /* Card backgrounds */
--bg-soft: #F4F4F5;              /* Subtle containers */

/* Text Hierarchy */
--text-primary: #18181B;         /* Headlines, primary text */
--text-secondary: #27272A;       /* Subheadings */
--text-body: #71717A;            /* Body text, descriptions */
--text-muted: #A3A3A3;           /* Metadata, hints */
--text-placeholder: #D4D4D8;     /* Placeholders */

/* Borders */
--border-subtle: rgba(0, 0, 0, 0.04);   /* Card borders */
--border-default: #E5E5E5;              /* Standard borders */
--border-hover: rgba(74, 222, 128, 0.15); /* Hover state */
--border-active: rgba(74, 222, 128, 0.30); /* Active/focus */

/* Shadows (color-tinted) */
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.04);
--shadow-md: 0 4px 24px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 12px 48px rgba(74, 222, 128, 0.12);
--shadow-xl: 0 20px 60px rgba(0, 0, 0, 0.12);
--shadow-glow: 0 0 60px rgba(74, 222, 128, 0.3);
```

### Dark Mode Elements (Phone UI, Dark Cards)
```css
/* Dark surfaces */
--dark-bg: #18181B;              /* Card background */
--dark-bg-gradient: linear-gradient(135deg, #18181B 0%, #27272A 100%);
--dark-surface: #27272A;         /* Elevated dark surface */
--dark-border: rgba(255, 255, 255, 0.08);

/* Dark text */
--dark-text-primary: #FFFFFF;
--dark-text-secondary: #A3A3A3;
--dark-text-muted: #71717A;
```

### Semantic Colors (Use Sparingly)
```css
/* Accent colors for specific contexts */
--amber-bg: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
--amber-stroke: #92400E;         /* Food/meal icons */

/* Status (rarely needed) */
--success: #4ADE80;              /* Same as brand */
--error: #EF4444;                /* Destructive actions only */
```

---

## Typography

### Font Families
Two typefaces create the entire typographic system. Serif for editorial moments, sans for interface.

```css
/* Headlines, Hero Text, Editorial */
font-family: 'Instrument Serif', serif;

/* Body, UI, Labels, Buttons */
font-family: 'DM Sans', sans-serif;
```

### Font Import
```css
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap');
```

### Type Scale

| Element | Font | Size | Weight | Color | Letter Spacing |
|---------|------|------|--------|-------|----------------|
| Hero headline | Instrument Serif | 60px | 400 | --text-primary | -0.02em |
| Hero headline italic | Instrument Serif | 60px | 400 italic | --text-body | -0.02em |
| Section title | Instrument Serif | 44px | 400 | --text-primary | -0.02em |
| Card title | Instrument Serif | 22-28px | 400 | --text-primary | normal |
| Feature title | Instrument Serif | 36px | 400 | --text-primary | normal |
| Section label | DM Sans | 12px | 600 | --brand-secondary | 0.15em, uppercase |
| Body large | DM Sans | 18px | 400 | --text-body | normal |
| Body | DM Sans | 15px | 400 | --text-body | normal |
| Body small | DM Sans | 14px | 400 | --text-body | normal |
| Caption | DM Sans | 13px | 400 | --text-muted | normal |
| Micro | DM Sans | 11-12px | 500 | --text-muted | 0.02em |
| Stats large | DM Sans | 28-32px | 700 | --text-primary | tight |
| Stats label | DM Sans | 12px | 400 | --text-body | 0.02em |
| Button | DM Sans | 15px | 600 | white | normal |
| Badge | DM Sans | 11px | 600 | --brand-secondary | 0.08-0.1em |
| Nav link | DM Sans | 14px | 400/500 | --text-body | normal |

### Line Heights
```css
line-height: 1.08;    /* Hero headlines */
line-height: 1.1;     /* Section titles */
line-height: 1.2;     /* Card titles */
line-height: 1.3;     /* Subheadings */
line-height: 1.4;     /* Tight body */
line-height: 1.5;     /* Default body */
line-height: 1.6;     /* Relaxed body */
line-height: 1.7;     /* Spacious paragraphs */
```

### Italic Usage
Italics in Instrument Serif create emphasis and visual interest:
- Second line of two-line headlines
- "What you eat" moments (the human element)
- Design system taglines ("By design.")

```tsx
// Pattern: First line normal, second line italic + muted
<h1>
  You've optimized everything.
  <br />
  <span style={{ fontStyle: 'italic', color: '#71717A' }}>
    Except what you eat.
  </span>
</h1>
```

---

## Spacing System

### Base Unit
4px base unit. All spacing derives from this.

```css
/* Spacing Scale */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-14: 56px;
--space-16: 64px;
--space-20: 80px;
```

### Layout Constants
```css
/* Page Layout */
--page-padding: 56px;            /* Horizontal page padding */
--nav-height: 84px;              /* Navigation bar height */
--section-gap: 120px;            /* Between major sections */

/* Card Padding */
--card-padding-sm: 14px;         /* Compact cards */
--card-padding-md: 18-22px;      /* Standard cards */
--card-padding-lg: 24-28px;      /* Feature cards */

/* Component Gaps */
--gap-tight: 6-8px;              /* Inline elements */
--gap-default: 10-12px;          /* Standard spacing */
--gap-relaxed: 14-16px;          /* Between sections */
--gap-loose: 20-24px;            /* Major separations */
```

### Border Radius Scale
```css
--radius-sm: 8px;                /* Small elements, pills */
--radius-md: 10px;               /* Badges, small cards */
--radius-lg: 14px;               /* Buttons, inputs */
--radius-xl: 16px;               /* Standard cards */
--radius-2xl: 24px;              /* Feature cards */
--radius-3xl: 28px;              /* Spotlight cards */
--radius-full: 100px;            /* Pills, badges */
--radius-phone: 52px;            /* Phone outer frame */
--radius-phone-inner: 42px;      /* Phone screen */
```

---

## Shadow System

### Multi-Layer Shadows
Shadows are built in layers for realistic depth. Brand color tinting adds warmth.

```css
/* Card Shadows (ascending depth) */
--shadow-card-rest: 
  0 2px 8px rgba(0, 0, 0, 0.04),
  inset 0 1px 1px rgba(255, 255, 255, 0.8);

--shadow-card-hover: 
  0 4px 24px rgba(0, 0, 0, 0.08),
  0 12px 48px rgba(74, 222, 128, 0.12),
  inset 0 1px 1px rgba(255, 255, 255, 0.8);

--shadow-card-lifted: 
  0 12px 40px rgba(0, 0, 0, 0.12),
  0 0 0 1px rgba(74, 222, 128, 0.2);

/* Button Shadows (3D effect) */
--shadow-button-rest:
  inset 0 1px 1px rgba(255, 255, 255, 0.3),
  0 4px 12px -2px rgba(74, 222, 128, 0.4),
  0 8px 25px -5px rgba(13, 148, 136, 0.2);

--shadow-button-hover:
  inset 0 1px 1px rgba(255, 255, 255, 0.4),
  0 10px 30px -5px rgba(74, 222, 128, 0.5),
  0 20px 50px -10px rgba(13, 148, 136, 0.3);

--shadow-button-pressed:
  inset 0 2px 4px rgba(0, 0, 0, 0.2),
  0 1px 2px rgba(0, 0, 0, 0.1);

/* Glow Effects */
--shadow-glow-subtle: 0 0 12px rgba(74, 222, 128, 0.3);
--shadow-glow-medium: 0 0 20px rgba(74, 222, 128, 0.4);
--shadow-glow-strong: 0 0 60px rgba(74, 222, 128, 0.3);

/* Phone Rim Glow */
--shadow-phone: 
  0 0 60px rgba(74, 222, 128, 0.3),
  0 0 120px rgba(74, 222, 128, 0.2);
```

### Shadow Animation on Hover
```tsx
// Cards lift and glow on hover
transition: 'box-shadow 0.3s ease, transform 0.3s ease'
// Rest → Hover: shadow expands, card lifts slightly
transform: isHovered ? 'translateY(-8px)' : 'translateY(0)'
```

---

## Animation System

### Core Philosophy: Sequential Revelation
The page "wakes up" as you scroll. Elements appear in sequence, never all at once. Animations serve the narrative, not decoration.

### Signature Easing Curves
```tsx
/* Standard Easings */
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
const easeInOutQuart = (t) => t < 0.5 
  ? 8 * t * t * t * t 
  : 1 - Math.pow(-2 * t + 2, 4) / 2;

/* Bounce/Overshoot */
const easeOutBack = (t) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

/* CSS Equivalents */
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);  /* Standard */
transition-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);  /* Smooth */
```

### Text Generate Effect
Words animate in with staggered blur-to-clear. The signature text reveal.

```tsx
// Each word animates separately
initial={{ opacity: 0, transform: 'translateY(12px)', filter: 'blur(4px)' }}
animate={{ opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' }}
transition={{ duration: 0.5, delay: index * 0.06 }}  /* 60ms stagger */
```

### Hand-Drawn Circle
SVG stroke animation that "draws" around text. Creates organic, human moments.

```tsx
// Ellipse strokes animate from 0 to full
strokeDasharray: 350
strokeDashoffset: isActive ? 0 : 350
transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
```

### Card Lift & Float
Cards emerge from surfaces with shadow and position changes.

```tsx
// Lift animation (emerging from phone)
const liftDistance = 30;
scale: phoneScale + (1 - phoneScale) * easedLift;
liftZ: Math.sin(easedLift * Math.PI) * 0.08;  /* Subtle 3D pop */

// Float animation (idle state)
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}
animation: float 6s ease-in-out infinite;
```

### Number Ticker
Numbers count up from zero. Values build rather than appear.

```tsx
// Animated counter
duration: 1200ms
easing: easeOutCubic
const animate = () => {
  const progress = Math.min(1, elapsed / duration);
  const eased = 1 - Math.pow(1 - progress, 3);
  const current = startValue + (endValue - startValue) * eased;
  setDisplayValue(current);
};
```

### Progress Bar Growth
Horizontal bars fill with staggered delays.

```tsx
width: isActive ? `${percentage}%` : '0%'
transition: 'width 0.8s ease-out'
transitionDelay: `${index * 150}ms`  /* Stagger bars */
```

### Circular Progress Ring
SVG circle with animated strokeDashoffset.

```tsx
const circumference = 2 * Math.PI * radius;
strokeDasharray: circumference
strokeDashoffset: circumference - (circumference * percentage / 100)
transition: 'stroke-dashoffset 1s ease-out'
```

### Auto-Shuffle Card Stack
Cards cycle automatically with 3D stacking effect.

```tsx
// Position calculation
const relativeIndex = (index - activeIndex + total) % total;
const scale = 1 - relativeIndex * 0.05;
const translateY = relativeIndex * 15;
const translateX = relativeIndex * 8;
const rotateZ = relativeIndex * 2;

// Transition
transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
```

### Shimmer Effect
Traveling highlight across surfaces for premium feel.

```tsx
@keyframes shimmer {
  0% { left: -100%; }
  50%, 100% { left: 200%; }
}

// Shimmer layer
background: linear-gradient(90deg, 
  transparent 0%, 
  rgba(255, 255, 255, 0.2) 50%, 
  transparent 100%
);
animation: shimmer 2.5s ease-in-out infinite;
```

### Pulse & Breathe
Subtle ambient animations for live elements.

```tsx
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

@keyframes breathe {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.08); opacity: 0.8; }
}
```

---

## UI Components

### Navigation
Minimal, transparent header with logo and links.

```tsx
// Structure
<nav style={{
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  padding: '28px 56px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}}>
  <Logo />
  <NavLinks />
  <SignInButton />
</nav>

// Logo treatment
<div style={{
  width: '36px',
  height: '36px',
  background: 'var(--brand-gradient)',
  borderRadius: '10px',
  boxShadow: '0 4px 12px rgba(74, 222, 128, 0.3)',
}} />
```

### AI-Powered Badge
Premium pill with shimmer and pulse effects.

```tsx
<div style={{
  display: 'inline-flex',
  alignItems: 'center',
  gap: '10px',
  padding: '10px 18px 10px 14px',
  background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FDF9 50%, #F0FDF4 100%)',
  borderRadius: '100px',
  boxShadow: `
    0 0 0 1px rgba(74, 222, 128, 0.2),
    0 4px 8px -2px rgba(74, 222, 128, 0.1),
    0 8px 16px -4px rgba(13, 148, 136, 0.08),
    inset 0 1px 1px rgba(255, 255, 255, 0.8)
  `,
}}>
  <PulsingDot />
  <GradientText>AI-powered nutrition</GradientText>
  <ShimmerOverlay />
</div>
```

### 3D Button
Multi-layer gradient button with press states.

```tsx
// Three gradient states
rest: 'linear-gradient(180deg, #4ADE80 0%, #3ACC72 50%, #2AB862 100%)'
hover: 'linear-gradient(180deg, #3BD975 0%, #2EBE68 50%, #25A85C 100%)'
pressed: 'linear-gradient(180deg, #1D8B54 0%, #2AA06A 50%, #34D480 100%)'

// Transform states
rest: 'translateY(0)'
hover: 'translateY(-2px)'
pressed: 'translateY(2px) scale(0.98)'

// Top highlight line
<div style={{
  position: 'absolute',
  top: '1px',
  left: '10%',
  right: '10%',
  height: '1px',
  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
}} />
```

### Phone Mockup
Premium device frame with rim lighting and glow.

```tsx
// Rim lights (left, right, top)
<div style={{
  position: 'absolute',
  left: '-8px',
  top: '5%',
  bottom: '5%',
  width: '16px',
  background: 'linear-gradient(180deg, transparent, rgba(74, 222, 128, 1), transparent)',
  filter: 'blur(8px)',
}} />

// Phone body layers
Outer frame: 'linear-gradient(165deg, #3A3A3A, #1A1A1A, #0D0D0D, #1A1A1A)'
Inner bezel: '#000000'
Screen: 'linear-gradient(180deg, #FAFAFA, #F5F5F5)'
```

### Feature Cards (Standard)
White cards with subtle borders and hover states.

```tsx
<div style={{
  background: '#FFFFFF',
  borderRadius: '24px',
  padding: '22px',
  border: '1px solid rgba(74, 222, 128, 0.15)',
  boxShadow: `
    0 4px 24px rgba(0, 0, 0, 0.08),
    0 12px 48px rgba(74, 222, 128, 0.12),
    inset 0 1px 1px rgba(255, 255, 255, 0.8)
  `,
}}>
  {/* Card content */}
</div>

// Hover state
boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(74, 222, 128, 0.2)'
transform: 'translateY(-8px)'
border: '1px solid rgba(74, 222, 128, 0.3)'
```

### Feature Cards (Dark)
Dark cards for AI insights and premium moments.

```tsx
<div style={{
  background: 'linear-gradient(135deg, #18181B 0%, #27272A 100%)',
  borderRadius: '24px',
  padding: '22px',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  boxShadow: `
    0 4px 24px rgba(0, 0, 0, 0.15),
    0 12px 48px rgba(13, 148, 136, 0.15),
    inset 0 1px 1px rgba(255, 255, 255, 0.1)
  `,
}}>
  {/* Dark card content */}
</div>
```

### Spotlight Card
Cards with mouse-follow gradient spotlight effect.

```tsx
// Mouse tracking
const handleMouseMove = (e) => {
  const rect = cardRef.current.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top) / rect.height;
  setMousePos({ x, y });
};

// Spotlight gradient overlay
<div style={{
  position: 'absolute',
  inset: 0,
  background: `radial-gradient(
    600px circle at ${mousePos.x * 100}% ${mousePos.y * 100}%,
    rgba(74, 222, 128, ${isHovered ? 0.15 : 0.08}),
    transparent 40%
  )`,
}} />

// Gradient border on hover
<div style={{
  position: 'absolute',
  inset: 0,
  borderRadius: '28px',
  padding: '1px',
  background: `linear-gradient(135deg, 
    rgba(74, 222, 128, 0.5) 0%, 
    rgba(13, 148, 136, 0.3) 50%,
    rgba(74, 222, 128, 0.5) 100%
  )`,
  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
  WebkitMaskComposite: 'xor',
}} />
```

### Step Badge
Numbered circles for process steps.

```tsx
<div style={{
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  background: 'var(--brand-gradient)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 4px 12px rgba(74, 222, 128, 0.4)',
}}>
  <span style={{
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '14px',
    fontWeight: '700',
    color: '#FFFFFF',
  }}>
    01
  </span>
</div>
```

### Progress Dots
Horizontal navigation indicators.

```tsx
// Inactive dot
width: '10px'
height: '10px'
borderRadius: '5px'
background: 'rgba(0, 0, 0, 0.1)'

// Active dot
width: '32px'
background: 'linear-gradient(90deg, #4ADE80, #0D9488)'
boxShadow: '0 0 12px rgba(74, 222, 128, 0.5)'

// Transition
transition: 'all 0.3s ease'
```

### Connecting Line
Animated line with progress dots for step sequences.

```tsx
// Background track
height: '2px'
background: '#E5E5E5'
borderRadius: '2px'

// Progress fill
background: 'linear-gradient(90deg, #4ADE80, #0D9488)'
width: `${progress * 100}%`
boxShadow: '0 0 12px rgba(74, 222, 128, 0.5)'

// Node dots
width: '12px'
height: '12px'
borderRadius: '50%'
background: isActive ? 'var(--brand-gradient)' : '#E5E5E5'
border: '3px solid #FFFFFF'
```

### Social Proof Stack
Overlapping avatars with count.

```tsx
// Avatar stack
{avatars.map((src, i) => (
  <div style={{
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: '2px solid #FFFFFF',
    marginLeft: i > 0 ? '-10px' : 0,
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  }}>
    <img src={src} />
  </div>
))}
```

---

## Background Patterns

### Dot Pattern
Subtle repeating dots that fade toward edges.

```tsx
<div style={{
  backgroundImage: 'radial-gradient(#E5E5E5 1px, transparent 1px)',
  backgroundSize: '32px 32px',
  maskImage: 'linear-gradient(to right, black 0%, transparent 60%)',
  WebkitMaskImage: 'linear-gradient(to right, black 0%, transparent 60%)',
}} />
```

### Section 6 Dot Pattern (Tinted)
Green-tinted dots for health section.

```tsx
<div style={{
  backgroundImage: 'radial-gradient(rgba(74, 222, 128, 0.12) 1px, transparent 1px)',
  backgroundSize: '40px 40px',
  opacity: 0.5,
}} />
```

### Ambient Spotlight
Large, soft radial gradient for depth.

```tsx
<div style={{
  position: 'absolute',
  width: '900px',
  height: '900px',
  background: `radial-gradient(
    circle at center,
    rgba(74, 222, 128, 0.2) 0%,
    rgba(74, 222, 128, 0.12) 25%,
    rgba(13, 148, 136, 0.06) 50%,
    transparent 70%
  )`,
  animation: 'megaPulse 4s ease-in-out infinite',
}} />
```

---

## Scroll-Driven Architecture

### Timeline Structure
The page is a narrative told through scroll position.

```
Total Height: 750vh (reduced from 1000vh with auto-shuffle)

0% - 12%    Hero Section
            - Phone floats, hero copy visible
            - Cards visible inside phone

5% - 18%    Card Emergence
            - Cards lift from phone with shadow animation
            - Sequential reveal (metrics → insight → meal)

12% - 45%   Comparison Section
            - "What if food knew you?"
            - Three comparisons with hand-drawn circles

45% - 68%   How It Works
            - Cards morph to step cards
            - Connecting line draws
            - Header fades in

68% - 100%  Health Features
            - Auto-shuffle card stack
            - No additional scrolling needed
```

### Scroll Progress Calculation
```tsx
const handleScroll = () => {
  const scrollTop = window.scrollY;
  const scrollHeight = container.scrollHeight - window.innerHeight;
  const progress = Math.min(Math.max(scrollTop / scrollHeight, 0), 1);
  setScrollProgress(progress);
};
```

### Phase-Based Visibility
```tsx
// Calculate visibility for each section
const fadeInProgress = Math.min(1, Math.max(0, (scrollProgress - startPhase) / 0.08));
const fadeOutProgress = Math.max(0, 1 - (scrollProgress - endPhase) / 0.06);
const sectionOpacity = fadeInProgress * fadeOutProgress;
```

---

## Interaction States

### Hover States
```tsx
// Cards
hover:border-color: rgba(74, 222, 128, 0.3)
hover:transform: translateY(-8px)
hover:box-shadow: elevated with glow

// Buttons
hover:background: lighter gradient
hover:transform: translateY(-2px)
hover:box-shadow: expanded glow

// Text links
hover:color: --text-primary (from --text-body)

// Icons
hover:opacity: 1 (from 0.6)
hover:transform: scale(1.1)
```

### Active/Pressed States
```tsx
// Buttons
active:transform: translateY(2px) scale(0.98)
active:box-shadow: inset shadow
active:background: darker gradient

// Cards
active:transform: scale(0.98)
```

### Focus States
```tsx
// Focus ring (keyboard navigation)
focus:outline: none
focus:ring: 2px solid rgba(74, 222, 128, 0.5)
focus:ring-offset: 2px
```

### Disabled States
```tsx
disabled:opacity: 0.5
disabled:cursor: not-allowed
disabled:pointer-events: none
```

---

## Content Guidelines

### Voice & Tone
- **Confident, not boastful** — "You've optimized everything" not "We're the best"
- **Specific, not vague** — "32g protein" not "lots of protein"
- **Benefit-led, not feature-led** — "Eat without thinking" not "Automated meal planning"
- **Human, not clinical** — "Your body today" not "Biometric dashboard"

### Headlines
- Two-line structure: Statement + italic qualifier
- Use questions to create curiosity
- Lead with the user, not the product

```
✓ "You've optimized everything. Except what you eat."
✓ "What if your food actually knew you?"
✓ "Built different. By design."

✗ "Introducing Swiggy Premium"
✗ "The best meal delivery service"
✗ "AI-powered nutrition platform"
```

### Microcopy
- Keep UI text minimal
- Use verbs: "Get Started" not "Start Now Button"
- Include specifics: "Free for 7 days · No credit card required"

### Data Display
- Large numbers for impact: "847 meals designed"
- Precision signals credibility: "99.2% accuracy"
- Units are secondary: "32g" with smaller "protein" below

---

## Responsive Considerations

### Breakpoints
```css
/* Mobile first approach */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg - primary desktop */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

### Scaling Recommendations
| Element | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| Hero headline | 60px | 48px | 36px |
| Section title | 44px | 36px | 28px |
| Page padding | 56px | 32px | 20px |
| Card padding | 22-28px | 18px | 14px |
| Phone mockup | 290×600 | 240×500 | Hide or 200×420 |

---

## Performance Guidelines

### Animation Performance
- Use `transform` and `opacity` for animations (GPU-accelerated)
- Avoid animating `width`, `height`, `top`, `left`
- Add `will-change: transform` sparingly for heavy animations
- Use `requestAnimationFrame` for JS animations

### Image Optimization
- Avatars: 64×64 or smaller
- Use WebP format when possible
- Lazy load below-fold images

### Scroll Performance
- Use `passive: true` on scroll listeners
- Throttle scroll calculations if needed
- Fixed positioning for the viewport container

---

## Quality Checklist

Before considering a section complete:

- [ ] Does typography use Instrument Serif for headlines, DM Sans for body?
- [ ] Are italics used purposefully (second lines, emphasis)?
- [ ] Is the brand gradient used only for CTAs, badges, and accents?
- [ ] Are cards lifted with proper shadow layers?
- [ ] Do animations stagger sequentially?
- [ ] Is there generous whitespace between sections?
- [ ] Do hover states feel tactile (lift, glow, brighten)?
- [ ] Are numbers large and labels tiny?
- [ ] Does the scroll tell a clear story?
- [ ] Is the overall feeling calm and premium?

---

## Allowed vs Not Allowed

### ✓ Allowed
- Brand gradient (green-to-teal) for primary accents
- Warm neutral backgrounds (#FFFFFF, #FAFAFA, #F5F5F5)
- Instrument Serif for headlines, DM Sans for body
- Italic Instrument Serif for secondary headlines
- Multi-layer shadows with color tinting
- Sequential staggered animations
- Text generate effect (word-by-word blur reveal)
- Hand-drawn circle SVG animations
- 3D button with gradient states
- Spotlight cards with mouse-follow gradient
- Generous whitespace
- Numbered stats with tiny labels
- Subtle dot patterns

### ✗ Not Allowed
- Rainbow or arbitrary accent colors
- Heavy/solid borders
- Bold text for emphasis (use size instead)
- Simultaneous animations (everything at once)
- Harsh/instant transitions
- Dense, cramped layouts
- Generic stock photography
- Emojis or decorative icons
- Drop shadows without blur
- Purely flat design (no depth)
- Clinical/medical aesthetic
- Feature-first copy

---

## Component Reference

### Quick Copy-Paste

#### Brand Gradient Text
```tsx
style={{
  background: 'linear-gradient(135deg, #0D9488 0%, #059669 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}}
```

#### Standard Card
```tsx
style={{
  background: '#FFFFFF',
  borderRadius: '24px',
  padding: '22px',
  border: '1px solid rgba(74, 222, 128, 0.15)',
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08), 0 12px 48px rgba(74, 222, 128, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
}}
```

#### Section Label
```tsx
style={{
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '12px',
  fontWeight: '600',
  letterSpacing: '0.15em',
  color: '#0D9488',
  textTransform: 'uppercase',
}}
```

#### Headline
```tsx
style={{
  fontFamily: "'Instrument Serif', serif",
  fontSize: '44px',
  fontWeight: '400',
  color: '#18181B',
  letterSpacing: '-0.02em',
  lineHeight: 1.1,
}}
```

#### Stat Display
```tsx
<div>
  <div style={{
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '32px',
    fontWeight: '700',
    color: '#18181B',
    lineHeight: 1,
  }}>
    847
  </div>
  <p style={{
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '12px',
    color: '#71717A',
    letterSpacing: '0.02em',
  }}>
    meals designed
  </p>
</div>
```