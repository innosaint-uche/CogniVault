## 2024-05-22 - Accessibility of Dynamic States
**Learning:** Loading screens and toggle buttons often rely solely on visual cues (animations, colors), leaving screen reader users unaware of the application state or selected options.
**Action:** Always use `role="status"`/`aria-live` for loading states and `aria-pressed` for toggle buttons to ensure state changes are communicated programmatically.

## 2024-05-22 - Error Handling UX
**Learning:** Swallowing errors with generic "Failed" messages prevents users from diagnosing critical issues like missing API keys.
**Action:** Always inspect error codes (e.g., 403, 401) and provide actionable recovery steps (e.g., "Open Settings") instead of just alerting the raw error or a generic apology.
