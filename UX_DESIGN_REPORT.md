# 🎨 UX Design & Dark Mode Audit Report

> **Generated:** Thursday, 14 May 2026 at 20:14 UTC
> **Method:** GPT-4o visual design expert reviewing actual page source code
> **Pages audited:** 13
> **Scope:** Visual design quality, dark mode consistency, colour palette, spacing, typography

---

## Executive Design Brief

## 🔴 Critical Design Failures (Fix This Week)
1. **Dark Mode Variants Missing**: Ensure all components, especially badges and text fields, have `dark:` variants to prevent contrast issues across multiple pages.
2. **Inconsistent Button Feedback**: Enhance button hover states in dark mode across all pages to provide consistent user feedback.
3. **Typography Readability**: Adjust font sizes and weights for better readability, particularly in smaller text and headings on mobile views.
4. **Spacing Consistency**: Standardize spacing values across components to eliminate visual tension and ensure a harmonious layout.
5. **Contrast Issues in Dark Mode**: Improve text and border contrasts, particularly in dark mode, to meet accessibility standards.

## 🟠 Dark Mode Fix List
1. Landing Page — Hero Section — Add class: `dark:bg-[#0a0f1e]`
2. Login Page — Ambient Glows — Add class: `dark:bg-orange-600/8`
3. Register Page — Form Container — Add class: `dark:bg-white/10`
4. Dashboard Layout — Notification Bell Badge — Add class: `dark:bg-red-500`
5. Employee Dashboard — Admin Badge — Add class: `dark:text-slate-500`
6. Create Ticket — Text Fields — Add class: `dark:text-white`
7. Ticket Detail — Card Border — Add class: `dark:border-slate-800`
8. Staff Queue — Close All Button — Add class: `dark:bg-slate-900/20`
9. Knowledge Base — Badge Colours — Add class: `dark:bg-blue-800`
10. Admin Portal Home — Button Primary — Add class: `dark:bg-[#3b82f6]`
11. Admin Analytics — Card Components — Add class: `dark:text-white`
12. Global CSS — Navbar — Add class: `dark:bg-slate-800`

## 🟡 Design System Inconsistencies
- **Colour Palette**: Primary blue (`#0f172a`) is not consistently applied; secondary and accent colors lack definition.
- **Typography**: Font sizes and weights vary without clear hierarchy, especially between headings and body text.
- **Spacing**: Padding and gap values differ across grids and cards, leading to inconsistent layouts.

## 🎨 Colour Palette Verdict
The overall colour palette is coherent but lacks balance. The primary blue is overused, while secondary and accent colours are underutilized. There are contrast issues, especially in dark mode, due to insufficient differentiation between background and text colours.

## 📱 Responsive Design Issues
- **Navbar Padding**: Excessive padding on smaller screens, causing layout issues.
- **Card Hover Effects**: Spacing issues due to transformations not accounted for in mobile layout.
- **Typography Scaling**: Large headings overwhelm smaller screens; needs responsive adjustments.

## 💎 Top 10 Design Improvements (Ranked)
1. **Implement Dark Mode Variants**: Ensure all elements have `dark:` classes for consistent dark mode support.
2. **Enhance Button Hover Feedback**: Add distinct hover states for buttons in dark mode across all pages.
3. **Adjust Typography Hierarchy**: Standardize font sizes and weights to establish clear visual hierarchy.
4. **Unify Colour Palette**: Define and apply consistent secondary and accent colours across all components.
5. **Improve Contrast in Dark Mode**: Adjust text and border colours for better readability and accessibility.
6. **Standardize Spacing Values**: Align padding and gap values across components for consistent layouts.
7. **Refine Card Hover Effects**: Ensure hover transformations are accounted for in layout design.
8. **Enhance Text Readability**: Increase body text size and adjust letter-spacing for better readability.
9. **Responsive Typography Scaling**: Use `clamp()` for responsive font sizes to maintain hierarchy on all devices.
10. **Define Interactive States**: Ensure all interactive elements have clear hover, focus, and active states.

## ⭐ Overall Design Score
7/10 - The design framework is solid, with strong typography and dark mode support. However, it needs refinement in contrast, spacing, and interactive feedback to enhance usability and aesthetic appeal. Addressing these inconsistencies will significantly improve the overall user experience and visual coherence.

---

# Individual Page Audits

---

## 📄 Landing Page
`src/app/page.tsx`

### 🌑 Dark Mode Issues
1. The `bg-[#0a0f1e]` class used in the Hero Section lacks a `dark:` variant, which could cause issues when switching themes.
2. The `bg-blue-500/10` class for the hero element background lacks a `dark:` variant, which might not contrast well in dark mode.
3. The `bg-slate-100` and `border-slate-100` in the navbar when scrolled need `dark:` variants to ensure proper styling in dark mode.

### 🎨 Colour & Visual Issues
1. The primary blue (`#0f172a`) and dark mode blue (`#3b82f6`) are not consistently applied across all elements, leading to an inconsistent visual identity.
2. The text colours in dark mode (`#f1f5f9`) against the dark background (`#0f172a`) are well chosen, but the hover states may have insufficient contrast.
3. The `bg-white` and `text-white` classes used in components like the button might not provide enough contrast on certain backgrounds, especially in bright sections.

### 📐 Spacing & Layout Issues
1. The `px-6 md:px-12` padding in the Hero Section might feel too narrow on larger screens, leading to a cramped feeling.
2. There is a visual tension between the `p-24` padding on cards and the surrounding grid's lack of defined spacing, making the cards feel disconnected.
3. The `gap-12` in the grid layout could be reduced to `gap-8` to create a tighter, more cohesive layout.

### ✍️ Typography Issues
1. The font size for the `.clay-massive-heading` is quite large and might not be legible or appear balanced at smaller screen sizes.
2. The letter-spacing of `-0.04em` for headings might cause readability issues, especially in smaller font sizes.
3. The use of `font-weight: 800` for massive headings and `700` for sub-headings is good for hierarchy but might be too heavy for body text, requiring a lighter weight for better readability.

### 🖱️ Interaction Design Issues
1. The `btn-primary` hover state lacks a noticeable change in dark mode, which could be resolved with a slightly lighter shade or a border change.
2. The `card:hover` state with a translateY effect is good but could use a more pronounced shadow to emphasize interaction.
3. The navbar lacks sufficient feedback when hovered over, especially for the theme toggle button and sign-in link.

### ✅ What Works Well
1. The use of `ScrollTrigger` animations adds a dynamic and engaging user experience.
2. The typography choices for headings and sub-headings create a strong visual hierarchy.
3. The fixed navbar with a backdrop filter effect provides a polished, modern look.

### 🔧 Top 3 Fixes (Priority Order)
1. **Add Dark Mode Variants**: Ensure all background and border colours have corresponding `dark:` variants, especially in the Hero Section and navbar.
2. **Improve Colour Consistency**: Standardize the use of primary and secondary colours across all components to maintain a cohesive brand identity.
3. **Adjust Spacing in Layouts**: Refine `gap` and `padding` values across grids and sections to ensure consistent and visually pleasing spacing, particularly in the Hero Section.

### ⭐ Design Score
7/10 - The design has strong foundational elements like typography and animations but requires improvements in dark mode consistency, colour coherence, and spacing to achieve a more polished and professional look.

---

## 📄 Login Page
`src/app/login/page.tsx`

### 🌑 Dark Mode Issues
1. The `bg-[#0c1222]` class on the main container does not have a `dark:` variant, which means it won't adapt when the theme changes.
2. The ambient glows using `bg-orange-600/8` and `bg-blue-600/8` need dark mode variants to ensure they contrast appropriately against dark backgrounds.
3. The `bg-[#131c2e]` on both the login and register forms lacks a `dark:` variant, potentially causing poor contrast in dark mode.
4. The branding panel's gradient `bg-gradient-to-br from-[#1a2540] to-[#0c1222]` needs a dark mode variant to ensure it contrasts well in dark mode.

### 🎨 Colour & Visual Issues
1. The palette predominantly uses dark blues and oranges, which is coherent but lacks contrast in dark mode due to missing `dark:` variants.
2. The text `text-white/50` in the branding panel might not have enough contrast against the background in certain dark mode scenarios, reducing readability.
3. The border color `border-white/5` on the branding panel is too subtle and may not provide enough visual separation.

### 📐 Spacing & Layout Issues
1. The `p-4` on the main container conflicts with the `px-10 py-8` on the forms, causing inconsistent padding that feels cramped.
2. The `h-[540px]` on the card container might not be flexible enough for different screen sizes, causing layout issues.
3. The `absolute` positioning of ambient glows may result in overlap or misalignment in smaller viewports.

### ✍️ Typography Issues
1. The `text-2xl font-black` heading in the branding panel does not follow a clear hierarchy, potentially clashing with other headings.
2. The `text-sm` used for body text is consistent, but the weight and letter-spacing could be adjusted for better readability.
3. The `font-medium` for body text in the branding panel is appropriate, but the contrast and size could be improved for better clarity.

### 🖱️ Interaction Design Issues
1. The `hover:bg-white hover:text-slate-900` on the sign-in/sign-up buttons provides good feedback, but could use a `dark:` variant to ensure consistency in dark mode.
2. The `transform: translateY(-2px)` hover effect on cards is good, but might need more pronounced feedback with a `dark:` variant.
3. The animation `transform 0.7s cubic-bezier(0.77,0,0.175,1)` for panel sliding is smooth, but could be faster for a snappier feel.

### ✅ What Works Well
1. The use of Tailwind CSS provides a strong foundation for responsive design and utility-first styling.
2. The sliding animations for the login and register forms are visually appealing and provide a clear transition between states.
3. The use of the `KarmaStaffLogo` component ensures brand consistency across the application.

### 🔧 Top 3 Fixes (Priority Order)
1. **Add Dark Mode Variants**: Implement `dark:` variants for all background, text, and border colors to ensure proper contrast and readability in dark mode.
2. **Improve Typography Hierarchy**: Adjust font sizes and weights to establish a clearer hierarchy, especially in headings and body text, to enhance readability.
3. **Refine Spacing and Layout**: Adjust padding and margins to ensure consistent spacing, especially around form elements, to avoid cramped layouts.

### ⭐ Design Score
6/10 - The page has a solid structural foundation and appealing animations, but lacks in dark mode adaptability and typography clarity, which affects overall usability and aesthetics.

---

## 📄 Register Page
`src/app/register/page.tsx`

### 🌑 Dark Mode Issues
1. The main background of the container `bg-slate-950` does not have a corresponding `dark:` variant, potentially creating inconsistency if the background colour changes in dark mode.
2. The `bg-white/10` for the form container lacks a `dark:` variant, which could lead to poor contrast against dark backgrounds.
3. The `border-white/20` for borders should have a `dark:` variant to adjust appropriately in dark mode.
4. The text elements inside the form (`text-white`, `text-white/60`, `text-white/80`) do not have `dark:` variants, which might be unnecessary but should be noted for consistency.

### 🎨 Colour & Visual Issues
1. The background colours and text in dark mode are primarily shades of white with transparency, which might lead to poor readability against the dark backdrop.
2. The hover colour change for the `.btn-primary` is not explicitly defined, which could lead to inconsistent feedback.
3. The gradient text in the heading could be hard to read depending on the background due to its light colour palette.

### 📐 Spacing & Layout Issues
1. The `p-6` padding on the right-side form container is inconsistent with the `p-12` on the left-side branding, leading to a misaligned visual balance.
2. The `gap` between input fields (`space-y-5`) might be too large, creating an unnecessary spread in the form layout.
3. The `w-full` width for the form fields might not be optimal for smaller screens, potentially causing layout issues.

### ✍️ Typography Issues
1. The heading sizes (`text-5xl`, `text-3xl`) are quite large and may overpower the rest of the content, especially in mobile views.
2. The uppercase text for labels (`uppercase tracking-wide`) might be harder to read and should be reconsidered for legibility.
3. The font weights are generally heavy (e.g., `font-extrabold`, `font-bold`), making the text appear dense and potentially overwhelming.

### 🖱️ Interaction Design Issues
1. The hover state for the `Link` component is subtle (`hover:text-white`), which may not provide enough feedback to users.
2. The form inputs have a focus state (`focus:outline-none focus:border-blue-400`), but the transition is not very noticeable due to the subtle colour shift.
3. The hover effect on the card component (`transform: translateY(-2px)`) is good, but consistency across all interactive elements is necessary.

### ✅ What Works Well
1. The use of a `backdrop-blur-2xl` on the form container creates an appealing glassmorphism effect.
2. The animated background elements (`animate-pulse-glow`) provide a dynamic visual interest.
3. The `KarmaStaffLogo` and gradient text in the heading create a strong brand presence.

### 🔧 Top 3 Fixes (Priority Order)
1. **Dark Mode Variants**: Add `dark:` variants to the form container background (`bg-white/10`) and borders (`border-white/20`) to ensure proper contrast and consistency in dark mode.
2. **Typography Adjustments**: Reduce the heading sizes and reconsider the use of uppercase text for better readability and visual hierarchy.
3. **Spacing Consistency**: Adjust the padding on the form container to `p-12` to match the branding section and reduce `space-y-5` to `space-y-4` for a more compact form layout.

### ⭐ Design Score
7/10 - The page has a strong foundation with dynamic elements and brand identity, but it needs improvements in dark mode handling, typography, and spacing to enhance usability and visual appeal.

---

## 📄 Dashboard Layout / Sidebar
`src/app/dashboard/layout.tsx`

### 🌑 Dark Mode Issues
1. **Theme Toggle Button:** The button background has `dark:bg-slate-800`, which works, but the hover state `dark:hover:bg-slate-700` is too subtle.
2. **Notification Bell:** The badge background color `bg-red-500` doesn't have a dark mode equivalent and might be too bright against the dark background.
3. **Notification Dropdown:** The divider uses `dark:border-slate-800`, which blends too much with the background `dark:bg-slate-800`. Consider lighter contrast.
4. **Unread Notification Highlight:** The background `bg-blue-50/60` on unread notifications lacks a `dark:` variant, causing inconsistency in dark mode.

### 🎨 Colour & Visual Issues
1. **Primary Palette:** The primary color `#0f172a` is used consistently, but in dark mode, the `dark:bg-slate-800` is overly dominant, leading to a gloomy feel.
2. **Text Contrast:** The text `dark:text-slate-300` against `dark:bg-slate-800` may not meet accessibility standards for contrast, especially in low-light environments.
3. **Accent Colors:** The use of `bg-blue-500` and `text-blue-600` needs a more cohesive dark mode equivalent to maintain visual consistency.

### 📐 Spacing & Layout Issues
1. **Sidebar and Content Gap:** The sidebar and main content don't have a defined gap, which can cause elements to feel cramped. Consider adding `gap-4` or similar.
2. **Notification Items:** The padding `px-4 py-3` in notifications feels a bit cramped, especially when items are densely populated. Increase padding for better readability.
3. **Mobile Menu:** When open, ensure there's sufficient padding around menu items to prevent touch target issues.

### ✍️ Typography Issues
1. **Font Sizing:** The use of `text-sm` for notification messages is good, but the timestamp `text-[11px]` is quite small and could be increased for readability.
2. **Weight Hierarchy:** The use of `font-black` for notification header text can be overpowering. Consider using `font-bold` for better balance.
3. **Letter Spacing:** While `-0.04em` works for headers, ensure smaller text sizes don't use excessive negative letter spacing which can hurt readability.

### 🖱️ Interaction Design Issues
1. **Hover Feedback:** The `hover:bg-slate-50` and `dark:hover:bg-slate-800` are too subtle. More pronounced feedback, like `hover:bg-slate-100` and `dark:hover:bg-slate-700`, would improve interaction clarity.
2. **Click Targets:** Ensure all buttons and links have a minimum touch target size of 44x44px, especially in mobile views.
3. **Animations:** The card hover effect uses `transform: translateY(-2px);` — consider a slightly stronger movement for more noticeable feedback.

### ✅ What Works Well
1. **Typography Choice:** The use of 'Plus Jakarta Sans' provides a modern and clean aesthetic that aligns well with a tech-focused application.
2. **Notification Bell Badge:** The dynamic notification count with a `9+` cap is a user-friendly way to handle high notification volumes.
3. **Consistent Button Styles:** The primary button styles are consistent, providing a unified visual language across different components.

### 🔧 Top 3 Fixes (Priority Order)
1. **Improve Contrast in Dark Mode:** Adjust `dark:text-slate-300` to a lighter variant for better readability against dark backgrounds.
2. **Enhance Hover States:** Make hover states more pronounced with `hover:bg-slate-100` and `dark:hover:bg-slate-700` for better visual feedback.
3. **Add Dark Mode Variants:** Ensure all elements, especially notification highlights and badges, have appropriate `dark:` variants for color consistency.

### ⭐ Design Score
7/10 - The application has a strong foundational design, but improvements in dark mode contrast, hover feedback, and spacing will significantly enhance user experience and accessibility.

---

## 📄 Employee Dashboard
`src/app/dashboard/page.tsx`

### 🌑 Dark Mode Issues
- **Admin Badge**: The badge `badge-slate` in the header doesn't have a clear dark mode variant. It uses `text-slate-500`, which is too similar to the dark background, making it hard to read.
- **Priority Colors**: The `PRIORITY_COLOR` for "low" priority uses `bg-slate-300` which doesn't have a dark mode variant, causing it to blend with dark backgrounds.
- **Status Badges**: The `STATUS_BADGE` for "closed" uses `bg-slate-100` without a `dark:bg-slate-800` variant for dark mode, reducing contrast.

### 🎨 Colour & Visual Issues
- **Palette Cohesion**: The primary color `#0f172a` is consistent, but the use of `bg-slate` and `text-slate` colors across various components lacks cohesion, especially in dark mode.
- **Contrast Issues**: Some text elements, like `text-slate-500` on dark backgrounds, suffer from low contrast, making them hard to read.

### 📐 Spacing & Layout Issues
- **Gap Consistency**: The `grid gap-3` for the admin quick nav is smaller compared to the `gap-4` used in other grids, causing visual inconsistency.
- **Card Padding**: The `card p-4` for quick nav items is less than the `card p-6` used elsewhere, creating a cramped feel.

### ✍️ Typography Issues
- **Font Weight Consistency**: The `font-extrabold` for the welcome message is well-contrasted but lacks a clear distinction from `font-bold` used elsewhere.
- **Line Height**: The `line-height: 1.1` for headings is quite tight, leading to potential readability issues for longer texts.

### 🖱️ Interaction Design Issues
- **Card Hover States**: The `hover:bg-slate-50` and `dark:hover:bg-slate-800` transitions are subtle and might not be noticeable enough to indicate interactivity clearly.
- **Button Feedback**: The `btn-primary` lacks distinct hover feedback in dark mode, as the color change isn't drastic enough.

### ✅ What Works Well
- **Responsive Design**: The use of responsive classes like `md:flex-row` and `grid-cols-2 sm:grid-cols-4` ensures good adaptability across devices.
- **Typography Scale**: The `clay-massive-heading` and `clay-sub-heading` utilities provide a strong visual hierarchy for key headings.
- **Loading Feedback**: The animated spinner provides clear feedback during data loading.

### 🔧 Top 3 Fixes (Priority Order)
1. **Improve Dark Mode Contrast**: Ensure all text and badge colors have adequate contrast in dark mode by adding `dark:` variants where necessary, especially for `badge-slate` and `STATUS_BADGE`.
2. **Unify Spacing**: Standardize grid gaps and card padding to `gap-4` and `p-6` across all components for consistent spacing and to reduce visual tension.
3. **Enhance Hover Feedback**: Intensify hover state feedback for interactive elements with more noticeable color changes and possibly scale transformations.

### ⭐ Design Score
6/10 - The dashboard has a solid foundation with a strong responsive design and typography scale, but it suffers from dark mode contrast issues and inconsistent spacing that detract from usability and visual coherence.

---

## 📄 Create Ticket
`src/app/dashboard/create/page.tsx`

### 🌑 Dark Mode Issues
1. **Form Background**: The form background uses `.card` which has a `dark:` variant, but the text fields within the form do not have their own `dark:` variants specified, potentially causing contrast issues.
2. **Text Fields and Labels**: Ensure all text fields and labels have `dark:` variants for text color to maintain readability in dark mode.
3. **Button Hover States**: `.btn-primary` lacks a `dark:` hover state, which could lead to inconsistent feedback in dark mode.

### 🎨 Colour & Visual Issues
1. **Button Colour Consistency**: The `.btn-primary` in light mode is `#0f172a`, but in dark mode, it changes to `#3b82f6`. This inconsistency can be jarring; consider using a consistent color scheme.
2. **Text Contrast**: The body text uses `#374151`, which may not provide sufficient contrast against the dark background `#0f172a` for optimal readability.

### 📐 Spacing & Layout Issues
1. **Form Padding**: The form uses the `.card` class with `padding: 24px`, but there is no specific spacing defined between form elements, leading to a cramped appearance.
2. **Grid Gap**: If multiple cards or elements are used within a grid, ensure a consistent `gap-x-4` or similar is applied to avoid elements appearing too close.

### ✍️ Typography Issues
1. **Header Hierarchy**: Headers within the form should use distinct classes like `.clay-massive-heading` or `.clay-sub-heading` for clear visual hierarchy.
2. **Body Text Size**: The default body text size seems small relative to the heading styles, potentially affecting readability.
3. **Letter Spacing**: Consistent application of `letter-spacing` across all text elements is needed to maintain visual cohesion.

### 🖱️ Interaction Design Issues
1. **Button Hover Feedback**: The `.btn-primary` class has a transition but lacks a defined hover state in dark mode, which can affect user feedback.
2. **Drag-and-Drop Zone**: The drag-and-drop zone should have a visual cue (e.g., border color change) to indicate active dragging.

### ✅ What Works Well
1. **Typography Styles**: The use of `Plus Jakarta Sans` is modern and provides good readability in headings.
2. **Dark Mode Transition**: The transition effects for `.card` elements in dark mode are smooth and visually appealing.
3. **Hover Effects**: The card hover effect is subtle yet effective, providing a nice interactive feedback.

### 🔧 Top 3 Fixes (Priority Order)
1. **Define Dark Mode Variants for Form Elements**: Ensure all text fields and labels have appropriate `dark:` variants for text and background colors.
2. **Consistent Colour Palette**: Align button colors in both light and dark modes to maintain a cohesive color scheme.
3. **Improve Form Spacing**: Add consistent padding or margin to form elements to enhance readability and reduce visual clutter.

### ⭐ Design Score
7/10 - The design is clean and modern but suffers from inconsistencies in dark mode and a lack of cohesive color and spacing strategy. Addressing these issues will significantly enhance usability and aesthetic appeal.

---

## 📄 Ticket Detail
`src/app/dashboard/ticket/[id]/page.tsx`

### 🌑 Dark Mode Issues
1. **Missing Dark Variants:**
   - The `body` element does not have a `dark:` variant for setting the background color. It currently relies on the `.dark body` CSS rule, which is correct, but ensure all components within are checked.
   - The `btn-primary` class lacks a hover state variant in dark mode.
   - The `card` component's border color in dark mode (`#334155`) may be too close to the background color, reducing contrast.

### 🎨 Colour & Visual Issues
1. **Colour Palette:**
   - The primary color `#0f172a` is used in both light and dark modes, which may not provide sufficient contrast in dark mode.
   - The background color in light mode (`#f8fafc`) and the text color (`#374151`) offer good contrast, but the muted text color (`#6b7280`) could be hard to read against the dark card background (`#1e293b`).
   - Ensure all text elements have sufficient contrast against their backgrounds, especially in dark mode.

### 📐 Spacing & Layout Issues
1. **Card Component:**
   - The card has `padding: 24px`, but if placed within a grid with a `gap-2`, it might feel awkwardly spaced. Consider matching the grid gap to the card padding for consistency.
2. **Comment Section:**
   - The comment input and list may appear cramped if not properly spaced from the card edges or each other.
3. **Button Spacing:**
   - Buttons generally have `padding: 10px 20px`, but ensure consistent margin around buttons to prevent them from feeling too cramped or too isolated.

### ✍️ Typography Issues
1. **Font Size Hierarchy:**
   - The use of `clamp` for headings is good, but ensure the scaling works well on all screen sizes. Verify that the `clay-massive-heading` does not overpower other elements.
2. **Weight Consistency:**
   - The font weights range from 400 to 800. Ensure consistent use of these weights to maintain a clear visual hierarchy.
3. **Readability:**
   - The letter-spacing of `-0.04em` for headings is generally good, but monitor for readability, especially on smaller screens or lower resolutions.

### 🖱️ Interaction Design Issues
1. **Hover States:**
   - The card has a nice hover state, but ensure that buttons also have a clear and consistent hover effect, especially in dark mode.
2. **Clickable Elements:**
   - Ensure all interactive elements, like links and buttons, have adequate size and spacing for easy tapping on touch devices.

### ✅ What Works Well
1. **Typography:**
   - The use of Plus Jakarta Sans provides a modern and clean look that enhances readability.
2. **Card Design:**
   - The card component has a good shadow effect and transition, creating a sense of depth.
3. **Dark Mode Implementation:**
   - Generally well-implemented with clear differentiation in background and card colors.

### 🔧 Top 3 Fixes (Priority Order)
1. **Improve Contrast in Dark Mode:**
   - Adjust the border color of cards and muted text to increase contrast and readability.
2. **Consistent Spacing:**
   - Ensure that spacing between grid items and within cards is consistent to avoid visual tension.
3. **Enhance Button Hover States:**
   - Add hover states for buttons in dark mode to ensure consistent interactive feedback.

### ⭐ Design Score
7/10 - The design has a strong foundation with good use of typography and dark mode implementation, but needs improvements in contrast and spacing for a more polished and accessible experience.

---

## 📄 Staff Queue
`src/app/dashboard/staff/page.tsx`

### 🌑 Dark Mode Issues
1. The `text-slate-500` class used in multiple places (e.g., loading text, subheading) should have a `dark:text-slate-400` variant to ensure sufficient contrast in dark mode.
2. The `bg-white` class used for the close all button under selected tickets is missing a `dark:bg-slate-900/20` variant for dark mode.
3. The `border-slate-200` class for the status tabs should have a corresponding `dark:border-slate-700` variant, which is already present but should be checked for consistency.

### 🎨 Colour & Visual Issues
1. The palette uses a lot of similar grey tones (`text-slate-500`, `border-slate-200`) which can create low contrast, especially in dark mode where these tones become less distinct.
2. The `bg-red-500` badge for active tickets is highly saturated and may clash with the more muted theme of the rest of the UI. Consider a more cohesive tone like `bg-red-400`.
3. Avatar colours are predefined but lack a dark mode adjustment, which might make the text hard to read against lighter backgrounds.

### 📐 Spacing & Layout Issues
1. The card component uses `p-4` padding but the surrounding grid has `gap-8`, which creates inconsistent spacing and visual tension.
2. The section with the "Select All" checkbox feels cramped due to the small `gap-1` between elements. Increasing this to `gap-2` or `gap-3` would improve readability.
3. The `mb-12` margin-bottom for the header section is larger than necessary, which might lead to excessive whitespace on larger screens.

### ✍️ Typography Issues
1. The hierarchy between `text-4xl` and `text-xl` could be more pronounced. Consider increasing the `text-xl` to `text-2xl` for better balance.
2. The `font-extrabold` for the header text might be too heavy when combined with `tracking-tight`. Consider `font-bold` to reduce visual weight.
3. Letter-spacing is consistently tight (`tracking-tight`), which can affect readability, especially on smaller text like `text-sm`.

### 🖱️ Interaction Design Issues
1. The hover state on cards (`transform: translateY(-2px)`) is subtle and might be missed. Consider increasing the shadow for a more noticeable effect.
2. The hover state for buttons is not consistent. For example, the "Close all" button does not have a clear hover color transition in dark mode.
3. The status tab buttons lack a clear hover state, which could be improved by changing the text color or adding a slight background change.

### ✅ What Works Well
1. The use of `Plus Jakarta Sans` provides a modern and clean look, enhancing readability.
2. The card component design with rounded corners and subtle shadows gives a polished and professional appearance.
3. The loading spinner with `animate-spin` and border color transitions is visually engaging without being distracting.

### 🔧 Top 3 Fixes (Priority Order)
1. **Dark Mode Consistency**: Ensure all text and background elements have appropriate `dark:` variants for better contrast and readability.
2. **Colour Palette Cohesion**: Adjust the color palette to ensure contrast and cohesion, especially with the use of greys and the active badge color.
3. **Spacing Adjustment**: Harmonize padding and margin values across components to reduce visual tension and improve layout balance.

### ⭐ Design Score
7/10 - The page has a solid foundation with a modern typeface and clean card designs, but inconsistencies in dark mode, color contrast, and spacing prevent it from achieving a higher level of polish.

---

## 📄 Knowledge Base
`src/app/dashboard/kb/page.tsx`

### 🌑 Dark Mode Issues
1. **Back Button:** The class `hover:text-slate-900 dark:text-white` has a dark variant for text, but `hover:text-slate-900` lacks a dark variant, which should be something like `hover:dark:text-slate-300`.
2. **Article Detail Container:** The container uses `bg-white dark:bg-slate-900` and `border-slate-200 dark:border-slate-700`. These are correctly handled.
3. **Views Count:** The class `text-slate-400 dark:text-slate-500` ensures visibility, but the contrast is low. A more contrasting dark variant such as `text-slate-300` may work better.

### 🎨 Colour & Visual Issues
1. **Badge Colours:** The badges use light variants like `bg-blue-100` and `text-blue-700` but lack dark mode variants, which could be `dark:bg-blue-800` and `dark:text-blue-100`.
2. **Text Contrast:** The text `text-slate-900 dark:text-white` provides good contrast, but the supporting text like `text-slate-400` is too light in dark mode.
3. **Button Colours:** The `btn-primary` has a dark variant but the `hover` state lacks a distinct dark mode variant.

### 📐 Spacing & Layout Issues
1. **Cramped Badge Area:** The badge and views count are cramped due to insufficient margin. Adding `mb-4` to the badge area would help.
2. **Empty State Handling:** There is no mention of handling empty states; ensure there's a placeholder or message when no articles are available.
3. **Overall Padding:** The container uses `p-8`, which is consistent, but the card's `p-24` feels misaligned with overall spacing rhythm.

### ✍️ Typography Issues
1. **Heading Hierarchy:** The `text-2xl font-extrabold` for the title is appropriate, but subheadings lack differentiation. Consider `text-xl` for subheadings.
2. **Body Text Readability:** `text-slate-400 dark:text-slate-500` for secondary text could be more readable with a slightly larger font size or increased letter-spacing.
3. **Letter-Spacing:** Consistent negative letter-spacing like `-0.04em` for headings is good, but ensure body text has positive letter-spacing for readability.

### 🖱️ Interaction Design Issues
1. **Hover State for Buttons:** The `btn-primary` lacks a distinct hover state in dark mode, which could be `hover:dark:bg-blue-700`.
2. **Card Hover Effect:** The card hover uses `translateY(-2px)`, which is good, but the dark mode shadow could be more subtle to avoid overpowering other elements.
3. **Clickable Area:** Ensure all interactive elements have sufficient padding to increase the clickable area.

### ✅ What Works Well
1. **Consistent Typography:** The use of 'Plus Jakarta Sans' across headings and body text maintains consistency.
2. **Dark Mode Implementation:** Most elements have appropriate dark mode variants, showing attention to detail.
3. **Card Design:** The card component has a cohesive design with appropriate use of shadows and borders.

### 🔧 Top 3 Fixes (Priority Order)
1. **Add Dark Mode Variants for Badges:** Implement dark mode variants for badges to ensure visibility and consistency (`dark:bg-blue-800`, `dark:text-blue-100`).
2. **Improve Text Contrast in Dark Mode:** Enhance the contrast of text elements like views count and secondary text to improve readability.
3. **Ensure Hover States are Distinct in Dark Mode:** Update hover states for buttons and cards in dark mode to provide clear feedback (`hover:dark:bg-blue-700`).

### ⭐ Design Score
7/10 - The design demonstrates a solid foundation with consistent typography and good use of dark mode for most elements, but requires improvements in interactive feedback and dark mode consistency for badges and text contrast.

---

## 📄 Manager Dashboard
`src/app/dashboard/manager/page.tsx`

### 🌑 Dark Mode Issues
1. The error message in `<div className="text-center py-20">` does not have a dark variant for text-red-500, which may cause readability issues.
2. The loading spinner `<div className="w-12 h-12 border-[4px] border-slate-200 dark:border-slate-700 border-t-black rounded-full animate-spin" />` correctly uses dark mode classes.
3. The health banner component (e.g., bg-red-50, border-red-200) does not have dark variants, leading to potential issues with visibility and contrast in dark mode.

### 🎨 Colour & Visual Issues
1. The current palette uses shades of blue, slate, and red, but the contrast between text and background (e.g., text-red-500 on bg-red-50) could be improved for accessibility.
2. The dark mode button background (`.dark .btn-primary`) is #3b82f6, which is bright and can be jarring against the dark background. Consider a more muted shade to maintain harmony.
3. The use of text-slate-500 for the date in the header is consistent, but the dark mode variant is missing or not visible enough.

### 📐 Spacing & Layout Issues
1. The gap-6 in the header's flex container can create visual tension with the mb-8, leading to inconsistent spacing.
2. The card component uses padding-24px, which contrasts with the more cramped space-y-12 in the main container, leading to a lack of visual flow.
3. There is no padding on the main container's sides (`max-w-[1400px] mx-auto`), which may make content feel cramped on smaller screens.

### ✍️ Typography Issues
1. The hierarchy is clear with text-4xl and md:text-5xl for headings, but the body text (e.g., text-sm) may be too small, especially for detailed data.
2. The letter-spacing of -0.04em on headings might be too tight, reducing readability, especially on smaller screens.
3. The use of font-weight 800 for the main heading is effective, but the transition to text-sm for body content is too stark.

### 🖱️ Interaction Design Issues
1. The hover effect on the card (`transform: translateY(-2px)`) is subtle but could be enhanced with a slight color change for better feedback.
2. The buttons lack hover states that change the background or border color, which is crucial for user feedback.
3. The badge component (`badge-slate`) has no hover or active state, missing an opportunity to enhance interactivity.

### ✅ What Works Well
1. The use of `Plus Jakarta Sans` provides a modern, clean aesthetic that aligns well with the application's branding.
2. The card component's hover effect and shadow transitions create a sense of depth and interactivity.
3. The loading spinner with its animation is a visually pleasing element that provides clear feedback during data loading.

### 🔧 Top 3 Fixes (Priority Order)
1. **Add Dark Mode Variants for Banners and Text**: Ensure all components, especially critical notices and text elements, have appropriate dark mode variants to maintain readability and accessibility.
2. **Enhance Button and Badge Hover States**: Introduce clear hover states (e.g., color change, border adjustment) for interactive elements to improve user feedback.
3. **Adjust Typography and Spacing**: Increase body text size to at least 16px for readability and adjust spacing in the main container to create a more harmonious visual rhythm.

### ⭐ Design Score
6/10 – The design has a strong foundation with good use of typography and interactive elements, but it suffers from dark mode inconsistencies and lacks proper spacing and hover state details.

---

## 📄 Admin Portal Home
`src/app/admin/page.tsx`

### 🌑 Dark Mode Issues
- The `body` element has a dark mode variant, but ensure all other elements within the page have proper dark mode support.
- The `.btn-primary` class in dark mode uses a background color `#3b82f6` which contrasts well but is inconsistent with the primary brand color.
- The `card` component has a dark mode variant, but check if all inner elements (e.g., text, icons) within the card also adapt to dark mode.

### 🎨 Colour & Visual Issues
- The primary color `#0f172a` is used consistently, but the secondary and accent colors are not defined, potentially leading to inconsistency.
- The `dark` mode background color for the card `#1e293b` and border color `#334155` are consistent, but ensure text within uses `#f1f5f9` for readability.
- The hover shadow in dark mode is `rgba(0,0,0,0.3)`, which might be too subtle on darker backgrounds.

### 📐 Spacing & Layout Issues
- The `card` component uses `padding: 24px`, which is generous, but check if it aligns well with the surrounding layout (e.g., grid system).
- Ensure consistent use of spacing utilities like `gap`, `margin`, and `padding` across different components to prevent visual tension.
- The `card` hover effect with `translateY(-2px)` might lead to spacing issues if not accounted for in layout design.

### ✍️ Typography Issues
- The typography hierarchy is well-defined with `clay-massive-heading` and `clay-sub-heading`, but ensure these are consistently applied across headings.
- The body text color `#374151` is slightly muted; ensure readability against the background, especially in dark mode.
- Letter-spacing for headings is slightly negative, which can be visually tight at smaller sizes.

### 🖱️ Interaction Design Issues
- The `card` component has a hover transform effect, which is good, but ensure it's smooth and doesn't cause layout shifts.
- The `.btn-primary` class uses `transition: all 0.2s ease`, which is effective, but specify properties for smoother transitions.
- Ensure all interactive elements have clear focus states for accessibility.

### ✅ What Works Well
- The dark mode implementation for the card background and border is consistent and visually appealing.
- The typography system, particularly the use of `Plus Jakarta Sans`, provides a modern and clean look.
- The use of `clamp()` for responsive font sizes is excellent for maintaining typography hierarchy across devices.

### 🔧 Top 3 Fixes (Priority Order)
1. **Dark Mode Consistency**: Ensure all inner elements of components, such as text and icons within `.card`, have proper dark mode color variants.
2. **Colour Palette Definition**: Define and apply a consistent secondary and accent color palette to maintain visual cohesion.
3. **Spacing Alignment**: Adjust the surrounding layout to accommodate hover transformations and ensure consistent use of spacing utilities to prevent visual tension.

### ⭐ Design Score
7/10 - The page has a strong foundation with a modern typography system and dark mode support, but lacks consistent color application and spacing alignment which affects overall polish and cohesion.

---

## 📄 Admin Analytics
`src/app/admin/analytics/page.tsx`

### 🌑 Dark Mode Issues
1. **Card Components:** The `.card` component has a dark variant, but ensure all child elements within the card also adapt to dark mode. If there are text or icons inside, they should have `dark:` variants.
2. **Button Primary:** The `.btn-primary` has a dark mode variant, but verify if any icons or additional text within the button also adapt to dark mode.
3. **Background & Text Colors:** The global styles cover body background and text colors, but ensure all interactive components (e.g., links, secondary buttons) have `dark:` variants applied.

### 🎨 Colour & Visual Issues
1. **Palette Consistency:** The primary color `#0f172a` is consistent, but ensure secondary and accent colors are defined and used consistently across the UI.
2. **Contrast Issues:** The card border in dark mode (`#334155`) may have insufficient contrast against its background (`#1e293b`). Consider lightening the border or darkening the background slightly.
3. **Text Muted Color:** The muted text color `#6b7280` might not provide enough contrast in dark mode. Ensure it is adjusted for readability.

### 📐 Spacing & Layout Issues
1. **Card Spacing:** The card uses `p-6` (24px) for padding, which is good, but ensure surrounding grid or flex containers have consistent `gap` values to maintain visual harmony.
2. **Empty Space:** Review spacing around headings and between sections to avoid overly large gaps, especially in responsive layouts.
3. **Alignment:** Ensure all elements within cards are consistently aligned, particularly if there are multiple lines of text or mixed content types (text, icons).

### ✍️ Typography Issues
1. **Hierarchy Clarity:** The use of `clamp()` for headings provides flexibility, but ensure the scaling is visually appealing across all screen sizes.
2. **Font Weights:** The font weights (400 to 800) are well-distributed, but ensure they are used consistently to establish clear hierarchy (e.g., headings vs. body text).
3. **Readability:** The letter-spacing of `-0.04em` might be too tight for smaller text sizes; consider adjusting for improved readability.

### 🖱️ Interaction Design Issues
1. **Hover Feedback:** The `.card:hover` state is well-defined, but ensure all interactive elements (buttons, links) have clear and consistent hover states.
2. **Button States:** Ensure buttons have active and focus states in addition to hover, particularly for accessibility.

### ✅ What Works Well
1. **Responsive Typography:** The use of `clamp()` for heading sizes ensures fluid scaling across devices.
2. **Dark Mode Support:** The foundational elements like body and cards have dark mode variants, which is a strong starting point.
3. **Consistent Button Styles:** The primary button style is visually distinct and functional in both light and dark modes.

### 🔧 Top 3 Fixes (Priority Order)
1. **Improve Card Contrast in Dark Mode:** Adjust the card border and background colors to ensure sufficient contrast.
2. **Enhance Text Readability:** Adjust letter-spacing and contrast for smaller text elements, especially in dark mode.
3. **Consistent Spacing Across Components:** Review and adjust spacing values (`gap`, `margin`) for consistent visual rhythm.

### ⭐ Design Score
7/10 - The design framework is solid with responsive typography and basic dark mode support, but needs refinement in contrast, spacing, and interactive feedback.

---

## 📄 Global CSS / Design Tokens
`src/app/globals.css`

### 🌑 Dark Mode Issues
1. `.navbar-clay` lacks a `dark:` variant for color and background, leading to potential readability issues in dark mode.
2. The `.reveal-wrapper` and `.reveal-image` classes do not address dark mode, which may affect the visibility of images or content in dark mode.
3. The `.glow-orb` effect might need a `dark:` adjustment for visibility against different backgrounds.

### 🎨 Colour & Visual Issues
1. The primary color `#0f172a` is used extensively, which is appropriate, but the contrast between the dark mode `.card` background `#1e293b` and `.dark .btn-primary` background `#3b82f6` might not be sufficient for all users, especially those with visual impairments.
2. The badge colors are mostly consistent, but the `.badge-slate` in dark mode (`background: #334155; color: #94a3b8;`) has a low contrast ratio and might be hard to read.

### 📐 Spacing & Layout Issues
1. The `.navbar-clay` uses `padding: 32px 48px`, which might be excessive on smaller screens, potentially causing layout issues.
2. The `.card` component's `padding: 24px` might clash with other components if not consistently applied, creating visual tension.
3. The spacing within `.input-field` (`padding: 10px 16px`) is generally good, but the lack of responsive adjustments might lead to cramped interfaces on smaller devices.

### ✍️ Typography Issues
1. The typography hierarchy is generally good, but the large size of `.clay-massive-heading` (up to `160px`) may not be practical for all use cases, especially on smaller screens.
2. The letter-spacing for headings is consistent, but the overall font size for body text (`font-size: 14px`) could be too small for comfortable readability on larger displays.

### 🖱️ Interaction Design Issues
1. The hover states for `.btn-primary` and `.btn-secondary` are well-defined, but the `.input-field` lacks a hover state, which can be an additional interactive cue.
2. The animation delays (`.delay-100`, `.delay-200`, `.delay-300`) are useful but might cause perception issues if not consistently applied across elements.

### ✅ What Works Well
1. The use of Tailwind CSS ensures a consistent design language across components.
2. The dark mode variants for buttons and cards are well-implemented, providing clear visual feedback.
3. The typography uses a modern and legible font, 'Plus Jakarta Sans', which enhances readability and aesthetic appeal.

### 🔧 Top 3 Fixes (Priority Order)
1. **Dark Mode Adjustments**: Add `dark:` variants for `.navbar-clay` and ensure all interactive elements have sufficient contrast in dark mode.
2. **Typography Scaling**: Reassess the font size hierarchy, particularly the `.clay-massive-heading`, to ensure it is usable across different screen sizes.
3. **Badge Contrast**: Improve the contrast of the `.badge-slate` in dark mode to enhance readability.

### ⭐ Design Score
7/10 - The design system is robust with well-defined components and responsive elements, but improvements in dark mode contrast, typography scalability, and some spacing adjustments are needed to enhance usability and accessibility.


---
*Design audit generated by UX Design Tester — run `npm run ux-design-test` to refresh.*
