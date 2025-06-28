# One Piece TCG Color Palette

This document outlines the color palette for the One Piece TCG application and how to use it.

## Color Categories

### 1. Standard Blue Back Palette
Used for regular cards and standard UI elements.

**Tailwind Classes:**
- `bg-op-blue-deep-navy` / `text-op-blue-deep-navy` - #1B3A57
- `bg-op-blue-deep-navy-alt` / `text-op-blue-deep-navy-alt` - #2C4A6B
- `bg-op-blue-medium` / `text-op-blue-medium` - #4A6FA5
- `bg-op-blue-medium-alt` / `text-op-blue-medium-alt` - #5B7BB8
- `bg-op-blue-light` / `text-op-blue-light` - #7BA7D9
- `bg-op-blue-light-alt` / `text-op-blue-light-alt` - #A8C8E8

**CSS Variables:**
- `var(--op-blue-deep-navy)`
- `var(--op-blue-deep-navy-alt)`
- `var(--op-blue-medium)`
- `var(--op-blue-medium-alt)`
- `var(--op-blue-light)`
- `var(--op-blue-light-alt)`

### 2. Leader Red Back Palette
Used for leader cards and special UI elements.

**Tailwind Classes:**
- `bg-op-red-deep-crimson` / `text-op-red-deep-crimson` - #8B1538
- `bg-op-red-deep-crimson-alt` / `text-op-red-deep-crimson-alt` - #A91E47
- `bg-op-red-medium` / `text-op-red-medium` - #C73E1D
- `bg-op-red-medium-alt` / `text-op-red-medium-alt` - #D4462A
- `bg-op-red-bright` / `text-op-red-bright` - #FF4444
- `bg-op-red-bright-alt` / `text-op-red-bright-alt` - #E55B5B

**CSS Variables:**
- `var(--op-red-deep-crimson)`
- `var(--op-red-deep-crimson-alt)`
- `var(--op-red-medium)`
- `var(--op-red-medium-alt)`
- `var(--op-red-bright)`
- `var(--op-red-bright-alt)`

### 3. Gold/Yellow Details
Used for highlights, borders, and special accents.

**Tailwind Classes:**
- `bg-op-gold-primary` / `text-op-gold-primary` - #FFD700
- `bg-op-gold-secondary` / `text-op-gold-secondary` - #F4C842
- `bg-op-gold-metallic` / `text-op-gold-metallic` - #B8860B
- `bg-op-gold-metallic-alt` / `text-op-gold-metallic-alt` - #CD853F
- `bg-op-gold-dark` / `text-op-gold-dark` - #DAA520

**CSS Variables:**
- `var(--op-gold-primary)`
- `var(--op-gold-secondary)`
- `var(--op-gold-metallic)`
- `var(--op-gold-metallic-alt)`
- `var(--op-gold-dark)`

### 4. White/Cream
Used for backgrounds and text on dark surfaces.

**Tailwind Classes:**
- `bg-op-white-pure` / `text-op-white-pure` - #FFFFFF
- `bg-op-white-cream` / `text-op-white-cream` - #FFFEF7
- `bg-op-white-cream-alt` / `text-op-white-cream-alt` - #F8F5E4

**CSS Variables:**
- `var(--op-white-pure)`
- `var(--op-white-cream)`
- `var(--op-white-cream-alt)`

### 5. Common Design Elements
Used for outlines, shadows, and neutral elements.

**Tailwind Classes:**
- `bg-op-neutral-black` / `text-op-neutral-black` - #000000
- `bg-op-neutral-black-alt` / `text-op-neutral-black-alt` - #1A1A1A
- `bg-op-neutral-dark-gray` / `text-op-neutral-dark-gray` - #333333
- `bg-op-neutral-dark-gray-alt` / `text-op-neutral-dark-gray-alt` - #4A4A4A
- `bg-op-neutral-silver` / `text-op-neutral-silver` - #C0C0C0
- `bg-op-neutral-silver-alt` / `text-op-neutral-silver-alt` - #D3D3D3

**CSS Variables:**
- `var(--op-neutral-black)`
- `var(--op-neutral-black-alt)`
- `var(--op-neutral-dark-gray)`
- `var(--op-neutral-dark-gray-alt)`
- `var(--op-neutral-silver)`
- `var(--op-neutral-silver-alt)`

## Usage Examples

### React/JSX with Tailwind Classes
```jsx
// Standard card background
<div className="bg-op-blue-deep-navy text-op-white-pure p-4 rounded-lg">
  <h2 className="text-op-gold-primary font-bold">Card Title</h2>
  <p className="text-op-blue-light">Card description</p>
</div>

// Leader card styling
<div className="bg-op-red-deep-crimson text-op-white-cream p-4 rounded-lg border-2 border-op-gold-primary">
  <h2 className="text-op-gold-primary font-bold">Leader Card</h2>
</div>

// Button styling
<button className="bg-op-blue-medium hover:bg-op-blue-medium-alt text-op-white-pure px-4 py-2 rounded">
  Click Me
</button>
```

### CSS with Custom Properties
```css
.card-standard {
  background-color: var(--op-blue-deep-navy);
  color: var(--op-white-pure);
  border: 2px solid var(--op-gold-primary);
}

.card-leader {
  background-color: var(--op-red-deep-crimson);
  color: var(--op-white-cream);
  box-shadow: 0 4px 8px var(--op-neutral-dark-gray);
}

.button-primary {
  background-color: var(--op-blue-medium);
  color: var(--op-white-pure);
}

.button-primary:hover {
  background-color: var(--op-blue-medium-alt);
}
```

## Design Guidelines

1. **Standard Cards**: Use the blue palette for regular cards and UI elements
2. **Leader Cards**: Use the red palette for special/leader cards
3. **Accents**: Use gold colors for highlights, borders, and important elements
4. **Text**: Use white/cream colors for text on dark backgrounds
5. **Shadows/Outlines**: Use the neutral colors for subtle depth and definition

## Accessibility Notes

- The color combinations have been chosen to maintain good contrast ratios
- Always test color combinations for accessibility compliance
- Consider using additional visual indicators (icons, patterns) alongside colors 