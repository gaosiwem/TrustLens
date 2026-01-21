# TrustLens Design System

_Version 1.0 - Complete design token reference for consistent UI development_

---

## Color Palette

### Primary Brand Colors

```css
primary: #13b6ec (Vibrant Cyan);
```

**Usage**: CTAs, links, focus states, brand elements, active states

### Background Colors

**Light Mode:**

```css
Background: #f6f8f8 (Light Gray)
Surface: #ffffff (White)
```

**Dark Mode:**

```css
Background: #101d22 (Deep Dark Blue)
Surface: #1a2c34 (Dark Slate)
Elevated Surface: #2c3e46 (Medium Slate)
```

### Text Colors

**Light Mode:**

```css
Primary Text: #111618 (Near Black)
Secondary Text: #637588 (Muted Gray)
Placeholder: #93a2b7 (Light Muted Gray)
```

**Dark Mode:**

```css
Primary Text: #ffffff (White)
Secondary Text: #93a2b7 (Muted Gray)
Placeholder: #93a2b7 (Muted Gray)
```

### Border Colors

**Light Mode:**

```css
Default Border: #dce0e5 (Light Border Gray)
```

**Dark Mode:**

```css
Default Border: #2c3e46 (Dark Border Slate)
```

### Semantic Colors

```css
Success: #34A853 (Green)
Warning: #FBBC05 (Amber)
Error: #EA4335 (Red)
Info: #4285F4 (Blue)
```

---

## Typography

### Font Families

**Primary Font:**

```css
font-family: "Manrope", sans-serif;
```

**Weights**: 200, 300, 400, 500, 600, 700, 800

**Icon Font:**

```css
font-family: "Material Symbols Outlined";
```

**Weights**: 100-700, Fill: 0-1

### Font Sizes

| Size Name       | Value | Tailwind Class | Usage                      |
| --------------- | ----- | -------------- | -------------------------- |
| **Heading 1**   | 32px  | `text-[32px]`  | Page titles, hero headings |
| **Heading 2**   | 24px  | `text-2xl`     | Section headings           |
| **Heading 3**   | 20px  | `text-xl`      | Card titles, subheadings   |
| **Base**        | 16px  | `text-base`    | Body text, inputs, buttons |
| **Small**       | 14px  | `text-sm`      | Labels, secondary text     |
| **Extra Small** | 12px  | `text-xs`      | Captions, helper text      |
| **Tiny**        | 10px  | `text-[10px]`  | Badges, micro text         |

### Font Weights

| Weight       | CSS Value | Tailwind Class    | Usage                   |
| ------------ | --------- | ----------------- | ----------------------- |
| **Light**    | 200       | `font-extralight` | Subtle text             |
| **Normal**   | 400       | `font-normal`     | Body text               |
| **Medium**   | 500       | `font-medium`     | Labels, emphasized text |
| **Semibold** | 600       | `font-semibold`   | Subheadings             |
| **Bold**     | 700       | `font-bold`       | Headings, CTAs          |
| **Black**    | 800       | `font-black`      | Hero text, emphasis     |

---

## Spacing Scale

Based on 4px base unit:

| Size    | Value | Tailwind | Usage   |
| ------- | ----- | -------- | ------- |
| **1**   | 4px   | `1`      | Minimal |
| **1.5** | 6px   | `1.5`    | Compact |
| **2**   | 8px   | `2`      | Small   |
| **3**   | 12px  | `3`      | Medium  |
| **4**   | 16px  | `4`      | Default |
| **6**   | 24px  | `6`      | Large   |
| **8**   | 32px  | `8`      | XL      |
| **12**  | 48px  | `12`     | Section |

---

## Border Radius

| Size        | Value  | Tailwind       | Usage           |
| ----------- | ------ | -------------- | --------------- |
| **Default** | 4px    | `rounded`      | Small elements  |
| **Medium**  | 8px    | `rounded-lg`   | Buttons, inputs |
| **Large**   | 12px   | `rounded-xl`   | Cards           |
| **2XL**     | 16px   | `rounded-2xl`  | Large cards     |
| **3XL**     | 24px   | `rounded-3xl`  | Features        |
| **Full**    | 9999px | `rounded-full` | Pills           |

---

## Component Patterns

### Input Fields

**Specs:**

- Height: `48px (h-12)`
- Padding: `16px (px-4)`
- Border radius: `12px (rounded-xl)`
- Font: `16px (text-base)`
- Focus: `1px primary ring`

```html
<input
  class="w-full h-12 px-4 rounded-xl bg-white dark:bg-[#1a2c34] 
  border border-[#dce0e5] dark:border-[#2c3e46] 
  focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
/>
```

### Buttons

**Primary:**

```html
<button
  class="h-12 bg-primary hover:bg-opacity-90 text-white font-bold 
  rounded-xl shadow-lg shadow-primary/25 px-6"
>
  Button
</button>
```

**Specs:**

- Height: `48px (h-12)`
- Padding: `24px (px-6)`
- Font: `Bold 16px`
- Shadow: `lg primary/25`

### Cards

```html
<div
  class="rounded-2xl bg-card border border-border p-6 
  shadow-sm hover:shadow-xl transition-all"
>
  Content
</div>
```

### Badges

```html
<span
  class="px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider 
  bg-primary/10 text-primary"
>
  Badge
</span>
```

---

## Dark Mode

```css
/* Always provide dark alternatives */
class="bg-white dark:bg-[#1a2c34]"
class="text-[#111618] dark:text-white"
class="border-[#dce0e5] dark:border-[#2c3e46]"
```

---

## Accessibility

1. **Touch targets**: Minimum 48×48px
2. **Contrast**: AA 4.5:1, AAA 7:1
3. **Focus**: Visible primary ring
4. **Min font**: 12px

---

_Last updated: 2026-01-18_
