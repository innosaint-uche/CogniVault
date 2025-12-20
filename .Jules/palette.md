## 2024-05-22 - Accessibility of Dynamic States
**Learning:** Loading screens and toggle buttons often rely solely on visual cues (animations, colors), leaving screen reader users unaware of the application state or selected options.
**Action:** Always use `role="status"`/`aria-live` for loading states and `aria-pressed` for toggle buttons to ensure state changes are communicated programmatically.
