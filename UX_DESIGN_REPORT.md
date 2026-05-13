# 🎨 UX Design & Dark Mode Audit Report

> **Generated:** Wednesday, 13 May 2026 at 14:36 UTC
> **Method:** GPT-4o visual design expert reviewing actual page source code
> **Pages audited:** 13
> **Scope:** Visual design quality, dark mode consistency, colour palette, spacing, typography

---

## Executive Design Brief

## 🔴 Critical Design Failures (Fix This Week)
1. **Navbar Dark Mode Variant**: Ensure `.navbar-clay` has a dark mode variant to avoid disappearing or unreadable text.
2. **Button Hover States**: Add dark mode hover states for `.btn-primary` to maintain visual feedback consistency.
3. **Contrast Issues**: Resolve `text-blue-300` on `bg-blue-500/10` to meet contrast standards, especially in dark mode.
4. **Interactive Element Visibility**: Ensure all dropdowns and buttons have `dark:` variants to avoid disappearing elements in dark mode.
5. **Loading Spinner Contrast**: Ensure the loading spinner is visible in both light and dark modes by adjusting border colors.

## 🟠 Dark Mode Fix List
1. **Landing Page — Button Hover State** — Add class: `dark:hover:bg-blue-700`
2. **Landing Page — Navbar Border** — Add class: `dark:border-slate-700`
3. **Landing Page — Card Background** — Add class: `dark:shadow-lg`
4. **Login Page — Main Container** — Add class: `dark:bg-[#0a0f1e]`
5. **Register Page — Card Component** — Add class: `dark:bg-gray-900`
6. **Dashboard Layout — Notification Bell Button** — Add class: `dark:bg-gray-800`
7. **Employee Dashboard — Card Background** — Add class: `dark:bg-gray-800`
8. **Create Ticket — Button Components** — Add class: `dark:hover:bg-gray-700`
9. **Ticket Detail — Button Secondary** — Add class: `dark:bg-gray-700`
10. **Staff Queue — Status Tabs** — Add class: `dark:border-white/10`
11. **Knowledge Base — Search Input** — Add class: `dark:placeholder:text-slate-400`
12. **Admin Portal Home — Loading Spinner** — Add class: `dark:border-white`
13. **Admin Analytics — ROLE_COLOR** — Add class: `dark:bg-red-600/20`
14. **Global CSS — Navbar Clay** — Add class: `dark:bg-gray-800`

## 🟡 Design System Inconsistencies
- **Colour Palette**: Inconsistent use of `#0a0f1e` vs. `#000000` across backgrounds.
- **Button Styles**: Inconsistent hover states in different pages.
- **Typography**: Varied use of `font-weight` and `letter-spacing` across headings.
- **Spacing**: Inconsistent padding and grid gap sizes across pages.

## 🎨 Colour Palette Verdict
The overall palette is mostly coherent but suffers from overuse of certain dark tones (`#0f172a`) that lack vibrancy, especially in dark mode. Light text colors like `#e2e8f0` can be too faint against dark backgrounds. There's a need to unify the palette and ensure all colors meet accessibility standards.

## 📱 Responsive Design Issues
- **Landing Page**: The `.clay-massive-heading` overwhelms smaller screens; consider using `clamp()` for better responsiveness.
- **Login Page**: The `max-w-[860px]` for the card container feels too wide on larger screens.
- **Register Page**: Disproportionate padding between form and branding sections affects balance on smaller screens.

## 💎 Top 10 Design Improvements (Ranked)
1. **Add Dark Mode Variants**: Ensure all components have `dark:` variants for seamless dark mode support.
2. **Improve Text Contrast**: Adjust text colors to improve readability across different backgrounds and modes.
3. **Unify Colour Palette**: Establish a cohesive color palette and ensure all elements adhere to it.
4. **Enhance Button Feedback**: Make hover states more pronounced to improve user interaction feedback.
5. **Standardize Typography**: Use consistent font sizes and weights to maintain a clear hierarchy.
6. **Optimize Spacing**: Regularize padding and grid gaps to avoid visual tension.
7. **Responsive Typography**: Use `clamp()` for font sizes to ensure text scales well across devices.
8. **Refine Card Shadows**: Enhance card shadows for better depth perception, especially in dark mode.
9. **Improve Loading Spinner Visibility**: Ensure spinners are visible in both light and dark modes.
10. **Enhance Interactive Feedback**: Increase the visual prominence of interactive state changes like hover effects.

## ⭐ Overall Design Score
7/10 - The design is visually appealing with modern typography and responsive elements, but it is held back by dark mode inconsistencies, lack of contrast, and spacing issues. Addressing these areas will significantly enhance the user experience and overall polish.

---

# Individual Page Audits

---

## 📄 Landing Page
`src/app/page.tsx`

### 🌑 Dark Mode Issues
1. **Button Hover State**: The `.btn-primary:hover` has no `dark:` variant, causing potential inconsistency in dark mode.
2. **Navbar Border**: The `border-b` class for the navbar in dark mode uses `dark:border-slate-800`, which is inconsistent with the light mode border style and might not provide enough contrast.
3. **Card Background**: The card component's hover state does not have a `dark:` variant for the box-shadow, which could lead to a lack of depth perception in dark mode.

### 🎨 Colour & Visual Issues
1. **Palette Consistency**: The use of `bg-[#0a0f1e]` in the hero section is inconsistent with the global `--color-bg-dark` of `#000000`. 
2. **Contrast Issues**: The `text-blue-300` on `bg-blue-500/10` might not provide sufficient contrast, especially in dark mode.
3. **Text Colour Consistency**: The default body text uses `#000000` in light mode but switches to `#e2e8f0` in dark mode, which may be too light against `#0a0f1e`.

### 📐 Spacing & Layout Issues
1. **Grid Gap**: The hero section grid has `gap-12` which might be too large, creating excessive whitespace on larger screens.
2. **Padding**: The navbar's `px-6 md:px-12 py-6` padding is inconsistent with the hero section's `px-6 md:px-12`, leading to a cramped appearance on smaller screens.
3. **Card Padding**: The `.card` class has `padding: 24px`, which may not align well with surrounding elements, especially if they use different spacing scales.

### ✍️ Typography Issues
1. **Heading Size**: The `.clay-massive-heading` font size is extremely large (`clamp(60px, 10vw, 160px)`), which can overwhelm smaller screens.
2. **Line Height**: The global line height of `1` for headings might be too tight, affecting readability.
3. **Font Weight**: The use of `font-weight: 800` for large headings and `font-weight: 600` for buttons may not provide enough visual distinction.

### 🖱️ Interaction Design Issues
1. **Button Hover Feedback**: The hover transition for `.btn-primary` is subtle and might not be noticeable, especially in dark mode.
2. **Link Interaction**: The `Sign In` link uses a background transition but lacks a `dark:` variant for hover, potentially leading to a mismatch.
3. **Interactive States**: The toggle theme button uses a border transition but does not provide a clear visual indication of interaction.

### ✅ What Works Well
1. **Responsive Design**: The use of `clamp()` for font sizes ensures adaptability across different screen sizes.
2. **Animation Integration**: The use of GSAP for animations provides a smooth and engaging user experience.
3. **Consistent Branding**: The use of consistent colour and typography in the navbar maintains brand identity.

### 🔧 Top 3 Fixes (Priority Order)
1. **Dark Mode Consistency**: Ensure all elements, especially interactive ones like buttons and cards, have `dark:` variants for hover states and background changes.
2. **Palette Unification**: Align all colour usage with defined design tokens, ensuring contrast and consistency in both light and dark modes.
3. **Typography and Spacing Adjustment**: Adjust heading sizes and line heights for better readability and ensure a consistent spacing rhythm across sections.

### ⭐ Design Score
7/10 - The overall design is visually appealing and responsive, but there are notable inconsistencies in dark mode, colour usage, and typography that detract from its usability and coherence.

---

## 📄 Login Page
`src/app/login/page.tsx`

### 🌑 Dark Mode Issues
1. The main container `bg-[#0c1222]` should have a `dark:bg-[#0a0f1e]` variant to ensure consistency across all dark mode backgrounds.
2. The card component uses `bg-[#131c2e]` which should have a `dark:bg` variant to ensure it fits seamlessly with other dark mode components.
3. The ambient glow elements `bg-orange-600/8` and `bg-blue-600/8` need `dark:bg-orange-600/20` and `dark:bg-blue-600/20` to ensure they are visible in dark mode.

### 🎨 Colour & Visual Issues
1. The colour palette uses various shades of blue and orange, but the contrast between text and background is low in some areas, such as `text-white/50` on `bg-[#131c2e]`.
2. The login and register forms have a consistent background colour, but lack distinction from the surrounding elements, which can be improved by using slightly different shades or adding a subtle gradient.
3. The button `hover:bg-white hover:text-slate-900` may not provide enough contrast in dark mode; consider a darker hover state for better visibility.

### 📐 Spacing & Layout Issues
1. The card's `px-10 py-8` padding creates a comfortable space, but the surrounding ambient glow elements might feel too large, potentially overwhelming the content.
2. The `max-w-[860px]` for the card container might feel too wide on larger screens, leading to a less focused layout.
3. The `gap-2` between form fields could be increased to `gap-4` for better visual separation and readability.

### ✍️ Typography Issues
1. The use of `text-3xl` for headings is appropriate, but the `font-black` weight might be too heavy, making the text appear dense. Consider using `font-bold` instead.
2. The `text-sm` for body text in the branding panel might be too small, especially on high-resolution screens. Increasing to `text-base` could improve readability.
3. Letter-spacing could be standardized across headings for consistency, as some elements use `tracking-tight` and others do not.

### 🖱️ Interaction Design Issues
1. The button `hover` states are present but could be more pronounced, especially in dark mode where `hover:bg-white` may not be ideal.
2. The card `hover` effect with `transform: translateY(-2px)` is subtle and effective, but could be complemented with a slight colour change for better feedback.
3. The `transition` on slide animations (`0.7s cubic-bezier(0.77,0,0.175,1)`) is smooth, but the duration might feel long for some users; consider reducing to `0.5s`.

### ✅ What Works Well
1. The use of `Plus Jakarta Sans` provides a modern and clean look that aligns well with current design trends.
2. The sliding animation between login and register forms is visually engaging and provides a clear indication of context change.
3. The ambient glow effects add a dynamic visual element that enhances the overall aesthetic of the page.

### 🔧 Top 3 Fixes (Priority Order)
1. **Dark Mode Consistency:** Ensure all background and text elements have appropriate `dark:` variants for seamless dark mode integration.
2. **Improve Button Contrast:** Adjust hover states for buttons to ensure they are visually distinct and accessible in both light and dark modes.
3. **Enhance Typography Readability:** Adjust font sizes and weights to improve readability, especially in body text and smaller elements.

### ⭐ Design Score
7/10 - The page has a strong foundation with modern typography and engaging animations, but requires improvements in dark mode consistency, contrast, and typography readability to reach a higher level of polish.

---

## 📄 Register Page
`src/app/register/page.tsx`

### 🌑 Dark Mode Issues
- The `bg-slate-950` class used for the main container in the light mode might not translate well in dark mode; consider using `dark:bg-gray-900` for better contrast.
- The `text-white` class on text elements when in dark mode should be complemented with a `dark:text-gray-200` for slightly less harsh contrast.
- The `bg-white/10` and `border-white/10` used for input fields and the form background should have dark mode variants like `dark:bg-gray-800/90` and `dark:border-gray-700`.

### 🎨 Colour & Visual Issues
- The background colours (`bg-blue-600/30`, `bg-purple-600/30`, `bg-emerald-500/20`) for the animated mesh do not have dark mode variants, which could lead to a lack of visual harmony in dark mode.
- The gradient text (`bg-gradient-to-r from-blue-300 to-purple-300`) might not be distinctly visible in dark mode. Consider a darker gradient like `from-blue-500 to-purple-500`.
- The `text-white/60` used for subtitles and placeholder text could be too light and lack contrast in certain lighting conditions.

### 📐 Spacing & Layout Issues
- The `p-6` padding on the right-side form container is inconsistent with the left-side branding's `p-12`, creating an unbalanced layout.
- The `gap-2` in the form elements could be increased to improve readability and reduce visual tension.
- The form container has a `max-w-md` constraint but could benefit from a `max-w-lg` for better use of space on larger screens.

### ✍️ Typography Issues
- The `text-6xl` for the main heading on the branding side is very large and could be overwhelming on smaller screens; consider using a `clamp` function for responsiveness.
- The uppercase `tracking-wide` on labels can be hard to read; reducing tracking slightly could improve readability.
- The `text-3xl` for the "Create Account" heading might be too close in size to the branding heading, reducing visual hierarchy.

### 🖱️ Interaction Design Issues
- The `btn-primary` class lacks a `dark:` variant for its hover state, which could lead to inconsistent feedback in dark mode.
- The `hover:text-white` for the back link could be complemented with `dark:hover:text-gray-300` for a softer effect in dark mode.
- The form input fields have a consistent focus state, which is good, but the transition timing could be slightly longer (e.g., `transition-all duration-300`) for smoother feedback.

### ✅ What Works Well
- The use of glassmorphism (`backdrop-blur-2xl`) on the form container creates a modern and visually appealing effect.
- The global background animation adds a dynamic and engaging element to the page.
- The typography used for the branding section is bold and creates a strong visual impact.

### 🔧 Top 3 Fixes (Priority Order)
1. **Dark Mode Colour Adjustments**: Ensure all elements, especially backgrounds and borders, have suitable `dark:` variants to maintain visual harmony and readability.
2. **Improve Form Layout and Spacing**: Increase the padding and gap around form elements to enhance readability and balance the layout.
3. **Typography Hierarchy Refinement**: Adjust heading sizes and letter spacing to ensure clear visual hierarchy and improve readability across devices.

### ⭐ Design Score
7/10 - The design is modern and visually appealing, but dark mode inconsistencies and minor spacing and typography issues prevent it from achieving a higher score.

---

## 📄 Dashboard Layout / Sidebar
`src/app/dashboard/layout.tsx`

### 🌑 Dark Mode Issues
1. **Notification Bell Button**: The button uses `bg-white` and `text-slate-600` without a `dark:` variant, leading to poor contrast in dark mode.
2. **Notification Dropdown**: The dropdown uses `bg-white` and `border-slate-100` without `dark:` variants, making the dropdown hard to distinguish in dark mode.
3. **Unread Badge**: The badge uses `bg-red-500` and `text-white`, which might be too harsh in dark mode without adjustment.
4. **Background Image**: The background image is hardcoded and lacks a dark mode variant, resulting in potential visual clash.

### 🎨 Colour & Visual Issues
1. **Inconsistent Palette**: The use of `bg-white`, `bg-red-500`, and `bg-blue-50/60` lacks cohesion, especially in dark mode.
2. **Contrast Issues**: The `text-slate-400` and `bg-blue-50/60` have low contrast, making text hard to read on light backgrounds.
3. **Notification Bell**: The use of emojis as icons might not be visually consistent with the rest of the design.

### 📐 Spacing & Layout Issues
1. **Notification Bell**: The button is `w-10 h-10` which might feel cramped given the icon and badge.
2. **Dropdown Padding**: The dropdown `px-4 py-3` might not provide enough padding, leading to cramped text appearance.
3. **Sidebar Spacing**: The sidebar uses `p-8` which is quite generous and may lead to unnecessary whitespace, especially on smaller screens.

### ✍️ Typography Issues
1. **Font Size Hierarchy**: The `text-sm` and `text-[11px]` sizes in notifications could be too small for comfortable reading.
2. **Font Weight**: Overuse of `font-black` and `font-bold` can reduce readability and diminish visual hierarchy.
3. **Letter Spacing**: Default letter-spacing could be adjusted for improved readability, especially in body text.

### 🖱️ Interaction Design Issues
1. **Hover States**: The hover effect on the notification button and dropdown items (`hover:bg-slate-50`) lacks a `dark:` variant.
2. **Transition Effects**: The transition on the card hover is subtle and might not be noticeable enough.
3. **Click Targets**: Small clickable areas, like the notification badge, may be difficult to interact with.

### ✅ What Works Well
1. **Responsive Design**: The use of `clamp()` for font sizes ensures good scalability across devices.
2. **Consistent Typography**: The use of 'Plus Jakarta Sans' provides a modern and clean look across the application.
3. **Theme Toggle**: The integration of theme toggling demonstrates good consideration for user preferences.

### 🔧 Top 3 Fixes (Priority Order)
1. **Add Dark Mode Variants**: Implement `dark:` variants for all components lacking them, especially the notification bell and dropdown to improve contrast.
   - Example: Change `bg-white` to `dark:bg-gray-800` for the dropdown.
2. **Improve Colour Consistency**: Establish a more cohesive colour palette that works well in both light and dark modes, ensuring all colours meet accessibility contrast guidelines.
3. **Enhance Typography Legibility**: Increase base font sizes for better readability and adjust letter-spacing for body text, especially in notifications.

### ⭐ Design Score
6/10 - The design has a solid foundation, but significant enhancements are needed in dark mode support, colour consistency, and typography to ensure a professional and accessible user experience.

---

## 📄 Employee Dashboard
`src/app/dashboard/page.tsx`

### 🌑 Dark Mode Issues
1. **Card Background**: The `.card` class in dark mode uses `rgba(17, 24, 39, 0.8)`, which might lack sufficient contrast with text. Consider a darker background or a lighter text.
2. **Stats Icons**: The icons' background colors such as `bg-white/10` and `bg-emerald-900/20` have low contrast in dark mode.
3. **Divider**: The divider uses `dark:bg-slate-700` which is very similar to the surrounding elements, making it hard to distinguish.
4. **Banner Button**: The close button in the banner uses `dark:hover:text-slate-200`, which does not provide enough contrast against the dark background.

### 🎨 Colour & Visual Issues
1. **Primary Colour Usage**: The primary button uses `#0f172a`, which is consistent, but the secondary button lacks a defined background in dark mode, leading to inconsistencies.
2. **Text Colour**: The `text-slate-400` on the date in the cinematic header is too light against the dark mode background.
3. **Icon Backgrounds**: The use of `bg-white/10` for icons in stats cards lacks contrast and feels visually inconsistent.

### 📐 Spacing & Layout Issues
1. **Card Padding vs Grid Gap**: The `.card` class has `p-8` padding, while the grid uses `gap-6`, creating a slightly off-balance visual tension.
2. **Banner Padding**: The banner's `p-5` padding feels slightly cramped, especially with the text size used.
3. **Header Layout**: The header's `gap-6` between elements might be too wide, causing unnecessary spacing in smaller viewports.

### ✍️ Typography Issues
1. **Font Weights**: The use of multiple font weights (400, 500, 600, 700, 800) can create visual clutter. Consider simplifying.
2. **Header Letter-Spacing**: The letter-spacing of `-0.04em` on headers might be too tight for smaller screens.
3. **Text Size Consistency**: The use of `text-sm` for some elements and `text-base` for others lacks a clear hierarchy.

### 🖱️ Interaction Design Issues
1. **Button Hover States**: The hover effect on `btn-primary` and `btn-secondary` could be more distinct (e.g., a color shift or shadow).
2. **Card Hover**: The card hover transform (`translateY(-2px)`) is subtle and might not be noticeable enough.
3. **Dismiss Button**: The close button for the banner could have a clearer hover state for better feedback.

### ✅ What Works Well
1. **Responsive Design**: The use of `clamp()` for font sizes ensures good responsiveness across different screen sizes.
2. **Consistent Font Family**: The use of 'Plus Jakarta Sans' across the application provides a cohesive typographic style.
3. **Interactive Feedback**: The transition effects on buttons and cards provide a level of polish in interactions.

### 🔧 Top 3 Fixes (Priority Order)
1. **Improve Dark Mode Contrast**: Adjust the card background and icon background colors in dark mode to ensure better contrast and readability.
2. **Simplify Typography**: Streamline the font weights used to create a clearer typographic hierarchy and improve readability.
3. **Refine Spacing**: Adjust the padding within cards and the gap between grid elements to achieve a more balanced layout.

### ⭐ Design Score
7/10 - The dashboard has a solid foundation with responsive typography and cohesive font usage but needs improvements in dark mode contrast and spacing consistency to enhance overall user experience.

---

## 📄 Create Ticket
`src/app/dashboard/create/page.tsx`

### 🌑 Dark Mode Issues
1. **Card Component**: The card component uses `.dark .card` for dark mode, but the text color inside the card (`color: #ffffff;`) may not be sufficient for all text elements, especially if they inherit from other components without explicit dark mode settings.
2. **Button Components**: The primary button has a hover state defined for light mode (`.btn-primary:hover { background: #1e293b; }`), but there's no `dark:` variant for the hover state, potentially causing poor contrast in dark mode.
3. **Body Text**: The base `color` for body text in dark mode is set to `#e2e8f0`, which might not contrast well against the card background color `rgba(17, 24, 39, 0.8)`. A darker text color might be needed for better readability.
4. **Dropdowns and Input Fields**: Ensure that any dropdowns or input fields have `dark:` variants for their background and border colors to maintain consistency in dark mode.

### 🎨 Colour & Visual Issues
1. **Primary Colour**: The primary color `#0f172a` is used for buttons, but it doesn't appear elsewhere, potentially making it feel disconnected from the rest of the palette.
2. **Text Colour**: The color `#666666` for body text in light mode may not provide enough contrast against the background `#ffffff`, which can affect readability.
3. **Border Colours**: The card border uses `rgba(0,0,0,0.05)` in light mode but changes to `rgba(255, 255, 255, 0.1)` in dark mode, which might be too subtle and not effectively delineate card boundaries.

### 📐 Spacing & Layout Issues
1. **Card Padding**: The card uses `padding: 24px`, which may be too much when combined with the overall layout, potentially leading to excessive whitespace.
2. **Grid and Gaps**: If a grid is used to lay out cards or form elements, ensure that the `gap` property is consistent, e.g., `gap-4` instead of `gap-2`, to prevent visual tension with surrounding elements.
3. **Form Elements**: Ensure consistent spacing between form elements to avoid cramped areas, particularly around input fields and buttons.

### ✍️ Typography Issues
1. **Heading Sizes**: The `clay-massive-heading` and `clay-sub-heading` classes use large sizes (up to 160px and 64px respectively), which might be too overpowering for a form page and disrupt the visual hierarchy.
2. **Font Weight**: Consistent use of font weights (400, 500, 600, 700, 800) is good, but ensure weights are applied to enhance readability and hierarchy, not just for emphasis.
3. **Letter-Spacing**: The negative letter-spacing on headings (`-0.04em`) might reduce readability, especially at smaller viewport sizes.

### 🖱️ Interaction Design Issues
1. **Button Hover States**: The primary button lacks a `dark:` hover state, which might cause it to blend with the background in dark mode.
2. **Card Hover Effect**: The card's hover effect (`transform: translateY(-2px)`) is subtle and might be missed; consider a more pronounced effect or additional visual feedback.
3. **File Drag-and-Drop**: Ensure the drag-and-drop area provides clear visual feedback when active, especially in dark mode.

### ✅ What Works Well
1. **Typography**: The use of Plus Jakarta Sans with a range of font weights contributes to a modern and clean aesthetic.
2. **Card Design**: The card's border-radius and shadow create a sense of depth, enhancing the visual appeal.
3. **Interactive Elements**: The transition effects on buttons and cards add polish and enhance user experience.

### 🔧 Top 3 Fixes (Priority Order)
1. **Dark Mode Hover States**: Add `dark:` variants for button hover states to ensure adequate contrast and feedback in dark mode.
2. **Text Contrast**: Increase text contrast for body text in both light and dark modes to improve readability, e.g., use a darker gray for light mode and a lighter gray for dark mode.
3. **Spacing Consistency**: Review and adjust spacing around cards and form elements to ensure a coherent and comfortable layout, using consistent `gap` and `padding` values.

### ⭐ Design Score
7/10 - The page has a solid foundation with good typography and interactive elements, but it needs better dark mode support and improved text contrast for enhanced readability and user experience.

---

## 📄 Ticket Detail
`src/app/dashboard/ticket/[id]/page.tsx`

### 🌑 Dark Mode Issues
1. **Missing dark variants:** 
   - The `btn-secondary` button does not have a `dark:` variant, potentially causing it to be less visible in dark mode.
   - The `card` component is correctly defined for dark mode, but ensure that all child elements (like text and badges) within the card also have appropriate `dark:` variants.
   - Any text or icons within the `AiCopilotPanel` and `SlaBadge` components should be checked for proper dark mode compatibility.

### 🎨 Colour & Visual Issues
1. **Inconsistent Palette:**
   - The primary button uses `#0f172a` and `#1e293b` for hover, which contrasts well in light mode but may be too subtle in dark mode. Dark mode variants should be more distinct.
   - The `card` component has a background of `rgba(17, 24, 39, 0.8)` in dark mode, which might blend with the body background of `#0a0f1e`. Consider increasing contrast for better differentiation.
2. **Contrast Issues:**
   - The text color `#666666` for body text may not provide sufficient contrast against the `#f4f4f4` background in light mode, potentially affecting readability.

### 📐 Spacing & Layout Issues
1. **Visual Tension:**
   - The `card` component uses `p-24`, which might feel cramped if the surrounding grid or container uses a smaller gap like `gap-4`. Ensure consistent spacing rhythm across the layout.
2. **Empty Space:**
   - Ensure that empty states within comments or attachment sections provide informative placeholders or actions, rather than leaving large blank spaces.

### ✍️ Typography Issues
1. **Hierarchy Consistency:**
   - The use of the `clay-massive-heading` and `clay-sub-heading` classes provides a strong hierarchy, but ensure these are used consistently across all headings to maintain visual order.
2. **Readability:**
   - Body text (`font-weight: 400`) might be too light against the backdrop of the UI, especially with the use of `#666666`. Consider a slightly darker or bolder text color for body copy.

### 🖱️ Interaction Design Issues
1. **Hover States:**
   - The `btn-primary` has a subtle hover effect. Ensure all interactive elements, including links and secondary buttons, have consistent and noticeable hover states.
2. **Feedback:**
   - Transitions and animations, like the `card:hover` effect, are well-defined. However, ensure that these are applied uniformly across all interactive components to provide consistent feedback.

### ✅ What Works Well
1. **Typography Styles:** The use of `Plus Jakarta Sans` with various weights provides a modern and clean typographic style.
2. **Card Design:** The card component’s hover effect and shadow create a sense of depth, enhancing the UI's interactivity.
3. **Dark Mode Implementation:** The global dark mode setup is comprehensive, ensuring a good baseline for dark mode styling.

### 🔧 Top 3 Fixes (Priority Order)
1. **Add Dark Mode Variants:** Ensure all interactive elements, particularly buttons and any text within components like `AiCopilotPanel`, have `dark:` variants.
2. **Improve Contrast:** Adjust text colors to ensure they have sufficient contrast against their backgrounds in both light and dark modes.
3. **Enhance Spacing Consistency:** Review and adjust padding and margin across components to ensure a harmonious layout, avoiding visual tension.

### ⭐ Design Score
7/10 - The foundation is strong with a good typographic base and initial dark mode setup, but needs improvements in contrast, consistency in spacing, and interaction feedback to enhance usability and aesthetic appeal.

---

## 📄 Staff Queue
`src/app/dashboard/staff/page.tsx`

### 🌑 Dark Mode Issues
1. **Status Tabs:** The `border-b` on the status tabs uses `border-black/10` which does have a dark variant (`dark:border-white/10`), but the text color for selected tabs uses `bg-black` which should have a corresponding dark variant for better contrast.
2. **Bulk Close Button:** The buttons inside the bulk close notification bar use `bg-white/10` and `hover:bg-white/20`, which may not provide sufficient contrast against the dark `bg-slate-900` background.
3. **Checkbox Border:** The checkbox uses `border-slate-200` which is not adjusted in dark mode, causing potential contrast issues.

### 🎨 Colour & Visual Issues
1. **Palette Consistency:** The page uses a mix of colors like `#6e6e73`, `slate-400`, `slate-500`, and `#0f172a`. While these are individually fine, they do not form a cohesive palette throughout the UI.
2. **Button Contrast:** The primary button's hover state (`bg-1e293b`) is very close to its default state (`bg-0f172a`), resulting in minimal visual feedback.
3. **Badge Shadow:** The shadow `shadow-[0_0_15px_rgba(239,68,68,0.5)]` on the active tickets badge can be too subtle in lighter backgrounds and almost invisible in dark mode.

### 📐 Spacing & Layout Issues
1. **Cramped Status Tabs:** The `gap-2` between status tabs feels cramped, especially when there are many tabs. Consider increasing the gap for better readability.
2. **Bulk Close Notification:** The `mb-6` margin below the bulk close notification can be increased slightly to provide better separation from the tabs below.
3. **Global Padding:** The use of `p-4` for cards can feel inconsistent when surrounding elements like grids have `gap-2`, creating visual tension.

### ✍️ Typography Issues
1. **Heading Sizes:** The heading sizes (`text-4xl md:text-5xl`) are quite large and can overshadow other elements, reducing overall hierarchy clarity.
2. **Text Contrast:** The use of `text-[#6e6e73]` and similar muted colors can affect readability, especially in smaller text like labels and descriptions.
3. **Font Weight:** The use of `font-extrabold` for headings and `font-bold` for smaller text elements can make the page feel heavy. Consider using lighter weights for less important text.

### 🖱️ Interaction Design Issues
1. **Button Feedback:** The buttons lack clear hover states, especially in dark mode where the color change is subtle.
2. **Checkbox Size:** The checkbox (`w-4 h-4`) might be too small for comfortable interaction, especially on touch devices.
3. **Card Hover State:** While the card has a hover transform and shadow, the changes are subtle and might not be noticeable enough to convey interactivity.

### ✅ What Works Well
1. **Dark Mode Implementation:** The use of `backdrop-filter: blur(12px)` in dark mode cards adds a nice visual effect.
2. **Responsive Layout:** The grid layout adapts well across different screen sizes, maintaining a coherent structure.
3. **Loading State:** The loading spinner and message (`animate-spin` with `text-sm text-slate-500`) are clean and informative.

### 🔧 Top 3 Fixes (Priority Order)
1. **Improve Dark Mode Contrast:** Ensure all interactive elements have clear dark mode variants, especially buttons and text inside components like the bulk close notification.
2. **Enhance Typography Hierarchy:** Adjust font sizes and weights for better readability and to create a clearer hierarchy. Consider using `font-medium` for body text and reducing heading sizes slightly.
3. **Increase Spacing in Tabs and Notifications:** Increase `gap` in status tabs and `mb` in notification areas to enhance readability and visual separation.

### ⭐ Design Score
7/10 - The page has a solid foundation with a good dark mode base and responsive design but suffers from inconsistent color usage, cramped spacing, and unclear typography hierarchy which impacts usability and visual appeal.

---

## 📄 Knowledge Base
`src/app/dashboard/kb/page.tsx`

### 🌑 Dark Mode Issues
1. **Search Input**: The input field for searching articles lacks a `dark:` variant for its placeholder text which is currently using `placeholder:text-white/60`. It should have a variant like `dark:placeholder:text-slate-400` to ensure better contrast and readability.
2. **Hero Header**: The `bg-gradient-to-r from-orange-500 to-amber-500` on the hero header does not have a dark mode variant. Consider using a darker gradient for dark mode to maintain the theme consistency.
3. **Button Hover States**: The back button hover state `dark:hover:text-white` could benefit from clearer contrast, possibly using a more distinct color like `dark:hover:text-blue-300`.

### 🎨 Colour & Visual Issues
1. **Primary Button**: The `btn-primary` uses a background of `#0f172a` which is quite dark and may not stand out enough against the dark background. Consider lightening it slightly or adding a bright accent color.
2. **Badge Colors**: The `TYPE_COLOR_DARK` classes use colors that are quite muted in dark mode (`text-blue-400`, `text-amber-400`), which can be hard to distinguish. Use more saturated colors for better visibility.
3. **Background Colors**: The card backgrounds in dark mode use `rgba(17, 24, 39, 0.8)` which may look too transparent. A more opaque color would improve readability.

### 📐 Spacing & Layout Issues
1. **Grid Gap & Padding**: The main container uses `p-6 -m-4 md:-m-6`, which can create inconsistent spacing especially on smaller screens. Consider standardizing the padding/margin across breakpoints.
2. **Article Card Spacing**: Inside the article card, the `p-8` padding may be excessive when paired with the `mb-4` and `pb-4` on other elements. Review to ensure content isn't too spaced out.
3. **Tag Spacing**: The tags have `gap-1` which can make them appear cramped. Increasing this to `gap-2` could improve readability and visual appeal.

### ✍️ Typography Issues
1. **Font Size Consistency**: The `text-3xl` for article titles in both modes might be too large compared to other text elements, creating a jarring hierarchy. Consider reducing to `text-2xl`.
2. **Body Text Contrast**: The use of `dark:text-white/80` for body text in dark mode might require a slight adjustment to ensure adequate contrast against the background.
3. **Heading Letter Spacing**: The `letter-spacing: -0.04em` on headings might be too tight for readability, especially in smaller sizes. Consider relaxing this to `-0.02em`.

### 🖱️ Interaction Design Issues
1. **Button Hover Feedback**: The back button's hover state could be more distinct. Consider using an underline or a slight background color change for clearer feedback.
2. **Card Hover Effect**: The card hover effect `transform: translateY(-2px)` is subtle. Enhancing this with a more noticeable shadow or color change could improve interaction feedback.

### ✅ What Works Well
1. **Typography Choice**: The use of 'Plus Jakarta Sans' provides a modern and clean look that enhances readability.
2. **Prose Styling**: The `prose dark:prose-invert` classes ensure that content is consistently styled and readable in both light and dark modes.
3. **Hover Transitions**: The smooth transitions on buttons and cards (`transition: all 0.2s ease`) provide a polished interaction experience.

### 🔧 Top 3 Fixes (Priority Order)
1. **Dark Mode Color Adjustments**: Ensure all elements have appropriate `dark:` variants, especially interactive elements like input placeholders and button hover states.
2. **Spacing Standardization**: Review and standardize padding and margin across the page to ensure consistent spacing rhythm and avoid visual tension.
3. **Typography Hierarchy**: Adjust font sizes and weights to create a clear and logical hierarchy, ensuring headings aren't disproportionately large compared to body text.

### ⭐ Design Score
7/10 - The design has a strong foundation with modern typography and good use of transitions, but it falls short in dark mode consistency and spacing coherence, impacting overall usability and aesthetics.

---

## 📄 Manager Dashboard
`src/app/dashboard/manager/page.tsx`

### 🌑 Dark Mode Issues
1. **Card Component**: The `.card` class has a `dark:` variant, but ensure all text elements inside the card also adapt to dark mode, or they may not be visible against the dark background.
2. **Loader Spinner**: The loading spinner uses `border-black` which does not adapt to dark mode. Consider adding a `dark:border-white` or similar variant.

### 🎨 Colour & Visual Issues
1. **Inconsistent Badge Colours**: The badge uses a `badge-slate` class, but it's not clear if this has a proper dark variant. Ensure that badge colours are consistent and have sufficient contrast in both modes.
2. **Text Colour Consistency**: The page uses various text colours like `#6e6e73` for dates, which may not contrast well in dark mode. Ensure all text colours adapt properly.
3. **Alert Banners**: The red and amber alert banners have proper dark variants, but ensure text colours inside these banners have enough contrast against the background.

### 📐 Spacing & Layout Issues
1. **Grid Gap and Card Padding**: The main grid uses `space-y-12`, which creates large gaps between sections, but cards inside use `p-6` which might feel cramped in comparison. Re-evaluate the spacing for balance.
2. **Header Alignment**: The header uses `gap-6` between items, which might create visual imbalance when viewed on smaller screens. Consider using responsive utilities to adjust gaps based on screen size.

### ✍️ Typography Issues
1. **Heading Hierarchy**: The `h1` uses `text-4xl md:text-5xl` which is good, but ensure subheadings have a clear size difference to maintain hierarchy.
2. **Body Text Readability**: The body text uses `text-[#6e6e73]`, which may not be optimal for readability, especially in dark mode. Consider using a darker shade for better contrast.

### 🖱️ Interaction Design Issues
1. **Button Hover States**: The `.btn-primary` hover state changes the background to `#1e293b`, which provides a subtle contrast. Ensure all buttons have distinct hover states.
2. **Card Hover Animation**: The card's hover animation (`transform: translateY(-2px)`) is subtle but effective. Verify it's not too subtle in dark mode.

### ✅ What Works Well
1. **Dark Mode Implementation**: The use of `dark:` variants for key components like cards and banners is well-implemented.
2. **Visual Hierarchy**: The use of large, bold headings for section titles helps establish a clear visual hierarchy.
3. **Responsive Design**: The layout adapts well to different screen sizes, with appropriate use of flexbox and grid utilities.

### 🔧 Top 3 Fixes (Priority Order)
1. **Ensure Dark Mode Consistency**: Add dark mode variants for all text elements within components like cards and badges to ensure readability.
2. **Improve Text Colour Contrast**: Adjust text colours to ensure they are easily readable in both light and dark modes, particularly for body text and date labels.
3. **Refine Spacing**: Re-evaluate the use of space between sections and within components to avoid visual tension and improve overall balance.

### ⭐ Design Score
7/10 - The design shows a solid foundation with good use of dark mode and responsive techniques, but it needs improvements in text contrast and spacing to enhance readability and visual balance.

---

## 📄 Admin Portal Home
`src/app/admin/page.tsx`

### 🌑 Dark Mode Issues
1. **Loading Spinner**: The loading spinner uses `border-white/10` and `border-t-red-500` which need dark mode variants for proper visibility against a dark background.
2. **Empty State Message**: The text "Failed to load stats." uses `text-white/40`, which should have a dark mode variant to ensure legibility.
3. **Link Button**: The "Manage Users" button uses `bg-white/5` and `border-white/10`, which require dark mode adjustments to maintain contrast.
4. **Primary KPIs and Other Cards**: While the cards have a `bg-white/5` background, a proper dark mode variant should be `bg-dark/5` or similar for consistent visuals.
5. **Status Breakdown**: The background colors like `bg-blue-500`, `bg-amber-400`, etc., need dark mode adjustments to ensure they don't blend into the dark background.

### 🎨 Colour & Visual Issues
1. **Inconsistent Text Colours**: The use of `text-white/40`, `text-white/30`, and `text-white/50` can create readability issues due to low contrast, especially in dark mode.
2. **Role Colours**: The role text colours like `text-red-400`, `text-purple-400`, etc., need to be revisited for contrast and readability against both light and dark backgrounds.
3. **KPI Borders**: Borders like `border-orange-500/30` and `border-emerald-500/30` can become indistinct in dark mode and require more contrast.

### 📐 Spacing & Layout Issues
1. **Header Section**: The gap-4 class between flex items in the header section is adequate, but the alignment of text and link buttons could be tighter for a more cohesive look.
2. **Primary KPIs Grid**: The `gap-4` in the grid is consistent, but the padding `p-6` within each card could be increased slightly to `p-8` for better breathing room.
3. **Status Breakdown**: The `space-y-4` class within the status breakdown section is good but can be reduced to `space-y-3` to tighten the visual clustering.

### ✍️ Typography Issues
1. **Header Text**: The text-4xl class for the main heading is effective, but the `tracking-tight` combined with `font-extrabold` might make it less legible than desired.
2. **Body Text**: The `text-sm` size for body text is generally good, but the `font-medium` weight should be reconsidered for better readability.
3. **Subheadings**: The uppercase tracking-widest style on subheadings, such as "Admin Portal", can reduce readability due to excessive spacing.

### 🖱️ Interaction Design Issues
1. **Button Hover States**: The `hover:bg-white/10` for buttons like "Manage Users" provides subtle feedback, but a more pronounced change in color or scale would enhance interactivity.
2. **Card Hover Effects**: Cards use `hover:bg-white/8`, but this is too subtle in dark mode and should be adjusted for better visual feedback.
3. **Loading Spinner Animation**: The `animate-spin` class is effective, but the color contrast needs to be improved in dark mode for visibility.

### ✅ What Works Well
1. **Consistent Typography**: The use of 'Plus Jakarta Sans' throughout gives the interface a clean, modern look.
2. **Responsive Design**: The use of `grid-cols` and `flex` utilities ensures the layout adapts well to different screen sizes.
3. **Hover Feedback on Cards**: The transform and box-shadow on hover provide a sense of depth and interaction, enhancing the user experience.

### 🔧 Top 3 Fixes (Priority Order)
1. **Dark Mode Adjustments**: Implement dark: variants for all elements that lack them, ensuring proper contrast and readability.
2. **Text Colour Consistency**: Standardize text colors for better contrast, especially in dark mode, using more distinct shades.
3. **Interactive Feedback**: Enhance hover states for buttons and cards with more significant color changes or scale effects to improve user interaction.

### ⭐ Design Score
7/10 - The design is modern and responsive, but dark mode issues and inconsistent color contrast hinder full usability and polish.

---

## 📄 Admin Analytics
`src/app/admin/analytics/page.tsx`

### 🌑 Dark Mode Issues
1. The `ROLE_COLOR` definitions for badges (e.g., `bg-red-500/20`, `text-red-300`) lack `dark:` variants, which can lead to poor contrast on dark backgrounds.
2. The spinner in the loading state uses `border-t-red-500` without a `dark:` variant which may not contrast well against dark backgrounds.
3. The text color in the "Failed to load analytics data" message uses `text-white/40`, which doesn't have a `dark:` variant and might not contrast well in dark mode.

### 🎨 Colour & Visual Issues
1. The use of `text-white/30` and `text-white/40` for secondary text may not provide sufficient contrast against light backgrounds and can appear washed out.
2. The color palette in light mode is somewhat monochromatic with heavy reliance on shades of white and gray, which can make the interface appear flat.
3. The `bg-white/5` background on cards in dark mode can be too subtle against the `body` background of `#0a0f1e`, reducing visual distinction.

### 📐 Spacing & Layout Issues
1. The grid gap of `gap-6` in the KPI Cards section is consistent, but the padding inside cards (`p-6`) combined with `gap-6` can make the section feel overly spacious, leading to a dispersed layout.
2. The `min-h-[400px]` for the loading spinner container may cause unnecessary vertical space, especially on smaller screens.
3. The `p-6` padding on all cards could be excessive, especially in content-dense areas, leading to too much whitespace.

### ✍️ Typography Issues
1. The use of `text-4xl` for the main heading and `text-3xl` for KPI numbers might not provide a strong enough hierarchy; consider increasing the difference to emphasize importance.
2. The `text-xs` for labels and subtexts could be too small on high-resolution displays, impacting readability.
3. The `font-extrabold` weight is used frequently, which can reduce its impact when used for emphasizing specific elements.

### 🖱️ Interaction Design Issues
1. Hover states on cards (`hover:bg-white/8`) are subtle in dark mode and might not provide strong enough feedback.
2. The `btn-primary` hover state changes background color but lacks a `dark:` variant, potentially leading to inconsistent feedback in dark mode.
3. The transform and shadow change on card hover might be too subtle, especially on larger screens where the effect can be less noticeable.

### ✅ What Works Well
1. The typography is generally consistent, with a clear typeface choice that supports a professional look.
2. The use of `transition-all` on interactive elements provides smooth animations, enhancing user experience.
3. The visual hierarchy of the page is generally logical, with headers and key metrics prominently displayed.

### 🔧 Top 3 Fixes (Priority Order)
1. **Dark Mode Enhancements**: Add `dark:` variants to `ROLE_COLOR` definitions and adjust spinner and text contrasts for better legibility.
2. **Contrast and Palette Adjustments**: Revisit color choices for text and backgrounds to ensure sufficient contrast and visual interest, especially in light mode.
3. **Typography and Hierarchy**: Adjust font sizes and weights to improve readability and establish a clearer hierarchy, particularly for headings and key metrics.

### ⭐ Design Score
7/10 - The design is functional and largely consistent but lacks strong contrast and visual interest, particularly in light mode. The dark mode implementation needs refinement to ensure all elements are legible and engaging.

---

## 📄 Global CSS / Design Tokens
`src/app/globals.css`

### 🌑 Dark Mode Issues
- **`.navbar-clay`**: Missing dark mode variant; currently no background or text color specified for dark mode.
- **`.skeleton`**: No dark mode adaptation; the light gradient will not be visible on a dark background.
- **`.reveal-wrapper` & `.reveal-image`**: No dark mode changes, though they might not need specific adaptations if they don't rely on color.
- **`.glow-orb`**: The glow effect should be checked for visibility in dark mode.

### 🎨 Colour & Visual Issues
- **Inconsistent Palette**: The primary color `#000000` conflicts with the dark mode background `#0a0f1e`. A more cohesive palette should be established.
- **Contrast Issues**: The light mode body text color `#666666` on `#ffffff` background may not meet WCAG contrast requirements for accessibility.
- **Button Colors**: The `.btn-primary` background transitions to `#1e293b` which may not stand out well against dark backgrounds. Consider a more vibrant hover color.

### 📐 Spacing & Layout Issues
- **`.card` Padding**: The `padding: 24px` is generous, but if used in a tight grid, it might cause cramped layouts due to excessive internal padding.
- **`.navbar-clay` Padding**: The `padding: 32px 48px` is substantial and may lead to layout issues on smaller viewports or when nested within other components.

### ✍️ Typography Issues
- **Letter-spacing**: The negative letter-spacing on headings (`-0.04em` and `-0.05em`) may impact readability, especially on smaller screens.
- **Font Size Hierarchy**: The `.clay-massive-heading` and `.clay-sub-heading` use a wide range of sizes (`clamp` function), which might cause inconsistency across different screen sizes.

### 🖱️ Interaction Design Issues
- **Hover States**: The `.btn-secondary:hover` background color `#f8fafc` is too light and may not provide enough feedback on light mode.
- **Card Hover**: The hover effect on `.card` is subtle; consider increasing the shadow intensity for better feedback.

### ✅ What Works Well
1. **Typography Choice**: The use of 'Plus Jakarta Sans' provides a modern, clean aesthetic.
2. **Responsive Typography**: The use of `clamp` for font sizes is excellent for adaptive typography across devices.
3. **Animation Effects**: The animations like `animate-pulse-glow` and `animate-gradient-shift` add visual interest and dynamic feedback.

### 🔧 Top 3 Fixes (Priority Order)
1. **Enhance Dark Mode Support**: Add dark mode variants for `.navbar-clay` and ensure all interactive elements and skeleton loaders are visible in dark mode.
   - **Code Fix**: Add `.dark .navbar-clay { background: #1e293b; color: #e2e8f0; }`
2. **Improve Contrast and Palette Consistency**: Revise color selections to ensure all text meets WCAG AA contrast standards and establish a cohesive color palette for both modes.
   - **Code Fix**: Adjust `.btn-primary:hover { background: #2563eb; }` for better contrast.
3. **Refine Spacing and Layout**: Ensure consistent spacing in grid layouts to avoid visual tension and adapt padding based on viewport size.
   - **Code Fix**: Consider using Tailwind's responsive padding utilities like `p-4 md:p-6` for `.navbar-clay`.

### ⭐ Design Score
7/10: The design system has a strong foundation with modern typography and responsive practices but requires improvements in dark mode support, color contrast, and spacing consistency to elevate the overall user experience.


---
*Design audit generated by UX Design Tester — run `npm run ux-design-test` to refresh.*
