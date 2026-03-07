---

### Prompt - 2026-03-06T00:00:00

**Agent:** cursor-agent

**Redacted:** false

**Prompt Content**

You are an expert frontend engineer working in a repository governed by Cursor rules located in `.cursor/rules/`.

Before implementing anything:

1. Read and follow all rules defined in `.cursor/rules/`.
2. If any instruction in this prompt conflicts with the rules, the rules take precedence.
3. Ensure the current prompt is recorded according to the rule **40-prompt-tracking.mdc** (prompt traceability).

---

# Goal

Implement a **Stopwatch + Countdown Timer** web application using the provided seed files:

- `index.html`
- `script.js`

References:

UI design source of truth:
`res/stopwatch.png`

Behavior reference:
https://www.online-stopwatch.com/

Do not introduce frameworks or unnecessary dependencies.

---

# Required First Step

Before coding:

1. Inspect `res/stopwatch.png` and `https://www.online-stopwatch.com/` and summarize:
   - overall layout
   - mode switching controls
   - time display format
   - button layout and labels
   - any configuration inputs or controls

2. Inspect `index.html` and `script.js` and summarize:
   - existing DOM structure
   - reusable elements
   - missing elements required for implementation.

---

# Functional Requirements

## Modes

Implement two modes:

1. **Stopwatch**
2. **Countdown**

The active mode must be visually highlighted.

Switching modes must:
- pause any running timer
- preserve the current value of each mode independently.

---

# Stopwatch Requirements

The stopwatch must:

- start from zero
- count upward accurately
- support pause/continue
- support clear/reset to zero

### Stopwatch buttons

Primary button behavior:

Start → Pause → Continue

Secondary button:

Clear → resets stopwatch to **00:00**

If lap functionality appears in the design reference, implement it.

---

# Countdown Requirements

Countdown requires a **user-defined duration**.

The configured duration becomes the **initial countdown value**.

The countdown must:

- start from the configured duration
- decrease to zero
- pause correctly
- resume correctly
- reset back to the configured value when cleared

Countdown must **never go below zero**.

---

# Countdown Configuration (Set Button)

A **Set button must exist only when the active mode is Countdown**.

Behavior:

- The **Set button must be hidden in Stopwatch mode**.
- The **Set button becomes visible when Countdown mode is active**.

### Set Button Purpose

The Set button allows the user to **define or update the countdown duration**.

Clicking **Set** must:

1. allow the user to define the countdown duration (via HH/MM/SS fields or equivalent controls)
2. store the value as the **configured initial duration**
3. update the countdown display with the configured value
4. transition the countdown state to `idle`

The countdown cannot start until a valid duration is defined.

If the user changes the configured duration via **Set**, that value becomes the new reference for Clear operations.

---

# Countdown State Machine

Implement explicit states:

- `idle`
- `running`
- `paused`
- `completed`

Required behavior:

1. user defines duration using **Set**
2. presses **Start**
3. timer begins decreasing
4. presses **Pause**
5. timer freezes and preserves remaining time
6. presses **Continue**
7. timer resumes from the paused remaining time
8. presses **Clear**
9. timer resets to the **configured initial duration**

---

# Button Label Behavior

Primary action button must dynamically change labels:

Idle → **Start**  
Running → **Pause**  
Paused → **Continue**

Clear button behavior:

Clear must:

- stop the timer
- discard paused state
- restore the display to the configured initial duration
- return the primary button to **Start**

Important:

Clear **never resets countdown to zero**.

---

# Countdown Completion

When countdown reaches zero:

- stop exactly at zero
- transition to `completed`
- restore button labels to idle state
- optionally trigger lightweight completion feedback if allowed.

---

# Timing Accuracy

Timers must use timestamp-based calculations.

Use:

`performance.now()` or equivalent elapsed-time calculations.

Countdown logic must:

- compute remaining time based on elapsed active time
- store remaining time on pause
- resume from stored remaining time on continue.

---

# Input Validation

Countdown duration must:

- reject invalid values
- reject negative values
- reject NaN states
- reject zero duration

Countdown must not start if duration is invalid.

---

# Accessibility

Controls must:

- use `<button>` elements
- support keyboard activation
- include accessible labels
- use ARIA semantics if tabs or grouped controls exist.

---

# Implementation Guidelines

- Keep implementation minimal and maintainable.
- Prefer a single state object managing timer states.
- Cache DOM references.
- Ensure button labels reflect state transitions.
- Avoid creating multiple timers.

---

# Unit Tests (Mandatory)

Include unit tests validating:

## Stopwatch

- start behavior
- pause behavior
- continue behavior
- clear resets to zero
- elapsed time accuracy

## Countdown

- Set correctly defines duration
- Start begins countdown from configured duration
- Pause preserves remaining time
- Continue resumes correctly
- Clear restores configured duration
- Countdown stops exactly at zero
- repeated start/pause/continue cycles behave correctly

## UI Behavior

- Set button appears only in Countdown mode
- Set button hidden in Stopwatch mode
- primary button label transitions:
  Start → Pause → Continue

Tests must avoid real-time delays and mock timestamps where possible.

---

# Deliverables

1. Updated `index.html`
2. Updated `script.js`
3. Unit tests for timer logic
4. Manual test checklist inside `script.js`

---

# Final Validation

Before finishing ensure:

- no console errors
- stopwatch timing accuracy
- countdown timing accuracy
- clear restores configured duration
- Set button visibility follows active mode
- button labels change correctly
- UI matches `res/stopwatch.png`

Now begin by analyzing the reference design and seed files, then implement the solution.

---

### Prompt - 2026-03-07T00:00:00

**Agent:** cursor-agent

**Redacted:** false

**Prompt Content**

There is an scenario that is failing on the UI. When the user switch from Countdown to StopWatch mode the 'btn-primary' label is showing 'Continue' instead of 'Start'. Please fix it and add a unit test to validate it works.

---
