# Design System - AI Service Call Agent

## Design Philosophy

### Customer-Facing Pages (Homepage, Marketing)
**Inspiration:** Stripe
- Clean, modern, spacious
- Smooth animations and micro-interactions
- Grid-based layouts with subtle gradients
- Interactive elements with depth
- Trust-building through visual polish

### Admin/CRM Pages (Dashboard, Internal Tools)
**Inspiration:** Linear
- Calm, neutral, trust-heavy
- Sidebar-first navigation
- High information density without clutter
- Feels custom even though it's simple
- Strong precedent for ops/admin/internal tools

---

## Color Palette

### Admin/CRM Theme (Linear-inspired)
```css
/* Neutrals - Primary */
--neutral-50: #fafafa;
--neutral-100: #f5f5f5;
--neutral-200: #e5e5e5;
--neutral-300: #d4d4d4;
--neutral-400: #a3a3a3;
--neutral-500: #737373;
--neutral-600: #525252;
--neutral-700: #404040;
--neutral-800: #262626;
--neutral-900: #171717;

/* Accent - Subtle Purple/Blue */
--accent-50: #f5f3ff;
--accent-100: #ede9fe;
--accent-200: #ddd6fe;
--accent-300: #c4b5fd;
--accent-400: #a78bfa;
--accent-500: #8b5cf6;
--accent-600: #7c3aed;
--accent-700: #6d28d9;

/* Status Colors */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;
```

### Marketing Theme (Stripe-inspired)
```css
/* Brand Colors */
--brand-50: #eff6ff;
--brand-100: #dbeafe;
--brand-200: #bfdbfe;
--brand-300: #93c5fd;
--brand-400: #60a5fa;
--brand-500: #3b82f6;
--brand-600: #2563eb;
--brand-700: #1d4ed8;
--brand-800: #1e40af;
--brand-900: #1e3a8a;

/* Gradients */
--gradient-hero: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--gradient-card: linear-gradient(to bottom right, white, #f8fafc);
```

---

## Typography

### Admin/CRM
```css
/* Font Family */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Scale */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */

/* Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
```

### Marketing
```css
/* Font Family */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Scale - Larger for impact */
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
--text-3xl: 1.875rem;
--text-4xl: 2.25rem;
--text-5xl: 3rem;
--text-6xl: 3.75rem;
```

---

## Spacing

### Linear-style (Compact)
```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
```

### Stripe-style (Spacious)
```css
--space-4: 1rem;
--space-6: 1.5rem;
--space-8: 2rem;
--space-12: 3rem;
--space-16: 4rem;
--space-24: 6rem;
```

---

## Components

### Admin Sidebar (Linear-inspired)
```tsx
- Width: 240px
- Background: neutral-900
- Text: neutral-400
- Active: accent-500
- Hover: neutral-800
- Icons: 20px
- Padding: 12px 16px
```

### Marketing Hero (Stripe-inspired)
```tsx
- Full viewport height
- Gradient background
- Animated grid pattern
- Floating cards with blur backdrop
- Smooth scroll animations
```

### Buttons

#### Admin/CRM
```tsx
Primary: bg-accent-600 hover:bg-accent-700 text-white
Secondary: bg-neutral-800 hover:bg-neutral-700 text-white
Ghost: hover:bg-neutral-800 text-neutral-400
```

#### Marketing
```tsx
Primary: bg-brand-600 hover:bg-brand-700 shadow-lg
Secondary: border-2 border-brand-600 text-brand-600
Ghost: hover:bg-brand-50
```

---

## Layout Patterns

### Admin/CRM Layout
```
┌─────────────────────────────────────┐
│ Sidebar │ Header                    │
│         ├───────────────────────────┤
│  Nav    │                           │
│  Items  │     Content Area          │
│         │                           │
│         │                           │
└─────────────────────────────────────┘
```

### Marketing Layout
```
┌─────────────────────────────────────┐
│         Top Nav (Transparent)       │
├─────────────────────────────────────┤
│                                     │
│         Hero Section                │
│         (Full viewport)             │
│                                     │
├─────────────────────────────────────┤
│         Features Grid               │
├─────────────────────────────────────┤
│         Pricing Cards               │
└─────────────────────────────────────┘
```

---

## Animation Principles

### Admin/CRM (Subtle)
- Transitions: 150ms ease
- Hover states: opacity/background only
- No page transitions
- Focus on speed and clarity

### Marketing (Engaging)
- Transitions: 300ms ease-out
- Scroll-triggered animations
- Parallax effects
- Gradient animations
- Card hover: lift + shadow

---

## Implementation Priority

1. ✅ Update pricing (DONE)
2. 🎨 Create Linear-inspired admin layout
3. 🎨 Redesign dashboard with new theme
4. 🎨 Create Stripe-inspired homepage
5. 🎨 Add animations to marketing pages
6. 🎨 Update all CRM pages with Linear theme

---

## Key Differences

| Aspect | Admin/CRM (Linear) | Marketing (Stripe) |
|--------|-------------------|-------------------|
| Colors | Neutral, muted | Vibrant, gradients |
| Spacing | Compact, dense | Spacious, airy |
| Animation | Minimal | Prominent |
| Typography | Smaller, efficient | Larger, impactful |
| Layout | Sidebar-first | Top nav, sections |
| Focus | Productivity | Conversion |
