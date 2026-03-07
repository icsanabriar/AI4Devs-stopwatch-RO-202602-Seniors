# Prompts

---

## Prompt - 2026-03-06T00:00:00

**Agent:** cursor-agent

**redacted_flag:** false

**Prompt Content**

```text
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
```

---

## Prompt - 2026-03-07T00:00:00 — btn-primary label fix

**Agent:** cursor-agent

**redacted_flag:** false

**Prompt Content**

```text
There is an scenario that is failing on the UI. When the user switch from Countdown to StopWatch mode the 'btn-primary' label is showing 'Continue' instead of 'Start'. Please fix it and add a unit test to validate it works.
```

---

## Prompt - 2026-03-07T00:00:00 — rename template to stopwatch-ics

**Agent:** cursor-agent

**redacted_flag:** false

**Prompt Content**

```text
The folder template should be rename to stopwatch-ics and the folder template should be restore to the initial state of the git history.
```

---

## Prompt - 2026-03-07T13:00:00

**Agent:** cursor-agent

**redacted_flag:** false

**Prompt Content**

```text
Verify each finding against the current code and only fix it if needed.

In `@template/script.js` around lines 159 - 170, When the timer transitions from
running to completed the code sets state.countdownRemainingMs = 0 but then calls
updateDisplay(state.countdownDurationMs), which redraws the configured duration
instead of the zeroed remaining time; change the call to
updateDisplay(state.countdownRemainingMs) (or otherwise pass the zero remaining
value) after setting countdownState = 'completed' and canceling the RAF (see
countdownState, remaining, state.countdownRemainingMs, updateDisplay, cancelRaf,
state.animationFrameId, updatePrimaryButtonLabel), and add a regression test
that simulates the running → completed path verifying the displayed output is
"00:00:00.000" (or equivalent zero format) and that animationFrameId is null and
countdownState === 'completed'.
```

---

## Prompt - 2026-03-07T14:00:00

**Agent:** cursor-agent

**redacted_flag:** false

**Prompt Content**

```text
Verify each finding against the current code and only fix it if needed.

In `@template/script.js` around lines 200 - 206, getPrimaryButtonLabel currently
treats every non-running stopwatch as 'Start', so add an explicit check for the
stopwatch paused state (e.g., state.stopwatchPausedAt !== null) in
getPrimaryButtonLabel to return 'Continue' when currentMode === 'stopwatch' and
the stopwatch is paused; keep the existing checks for 'Pause' and 'Start'
otherwise. Also update the mode-switch logic that leaves the stopwatch mode to
preserve state.stopwatchElapsedMs and instead clear state.stopwatchPausedAt (do
not collapse paused into a generic stopped state or null out
stopwatchStartedAt), so the UI can follow the Start → Pause → Continue
transitions correctly; apply the same change pattern referenced around lines
237-240.
```

---

## Prompt - 2026-03-07T15:00:00

**Agent:** cursor-agent

**redacted_flag:** false

**Prompt Content**

```text
Verify each finding against the current code and only fix it if needed.

In `@template/script.js` around lines 241 - 252, When switching modes, restore the
paused countdown value instead of always using state.countdownRemainingMs: in
the block after setting currentMode = mode, call updateDisplay with
state.countdownPausedRemainingMs if countdownState === 'paused' and
state.countdownPausedRemainingMs is non-null (fall back to
state.countdownRemainingMs otherwise); ensure the paused value is cleared or
used consistently when the countdown is resumed (references: countdownState,
state.countdownPausedRemainingMs, getCountdownRemainingMs, currentMode, mode,
updateDisplay, state.countdownRemainingMs).
```

---

## Prompt - 2026-03-07T16:00:00

**Agent:** cursor-agent

**redacted_flag:** false

**Prompt Content**

```text
Verify each finding against the current code and only fix it if needed.

In `@template/script.test.js` around lines 7 - 12, Add a beforeEach hook at the
top of the test file to fully reset the singleton test state and cancel any
running ticks: call the exported setStateForTests() with a complete default
state object (not a partial merge) to overwrite all fields, and call stopTick()
to clear pending animation frames; apply this so tests like "switchMode" and the
"set button visibility" cases no longer inherit state from previous tests.
Ensure you reference the module's exported setStateForTests() and stopTick()
functions when implementing the beforeEach.
```

---

## Prompt - 2026-03-07T17:00:00

**Agent:** cursor-agent

**redacted_flag:** false

**Prompt Content**

```text
Verify each finding against the current code and only fix it if needed.

In `@template/script.test.js` around lines 318 - 333, The test
start_then_pause_then_continue_reflects_state currently only verifies stopwatch
timestamps and misses asserting UI text; after calling api.startStopwatch(),
api.pauseStopwatch(), and api.continueStopwatch() add assertions that
api.getPrimaryButtonLabel() returns the expected labels for each state (e.g.,
"Pause" immediately after start, "Continue" after pause, and "Pause" again after
continue) so the test fails if the Start → Pause → Continue wording regresses;
place these asserts near the existing timestamp checks and keep using the same
test name and api.* helper calls.
```

---

## Prompt - 2026-03-07T18:00:00

**Agent:** cursor-agent

**redacted_flag:** false

**Prompt Content**

````text
You are an expert frontend engineer working in a repository governed by Cursor rules located in `.cursor/rules/`.

Before making any changes:

1. Read and follow all rules defined in `.cursor/rules/`.
2. If any instruction in this prompt conflicts with the rules, the rules take precedence.

The current CI check reported the following issue:

Docstring coverage is **53.33%**, but the required minimum is **80%**.

Your task is to **increase docstring coverage to at least 80%** without changing the behavior of the code.

---

# Objective

Add missing **JSDoc docstrings** to the JavaScript codebase to satisfy the required documentation coverage threshold.

Focus on documenting functions and exported logic while preserving the existing implementation.

Do NOT refactor the code unless absolutely necessary to attach proper documentation.

---

# Files to Inspect

Review all JavaScript files in the repository, especially:

- `script.js`
- any utility files
- any timer-related modules
- test utilities if applicable

---

# Required Documentation Standard

All functions must include a **JSDoc docstring** placed immediately above the function definition.

Each docstring must include:

- A concise description of the function
- `@param` tags for all parameters
- `@returns` tag when applicable

Example:

```js
/**
 * Starts the stopwatch timer and records the start timestamp.
 *
 * @param {number} startTimestamp - The timestamp used as the reference point for elapsed time.
 * @returns {void}
 */
```
````

---

## Prompt - 2026-03-07T19:00:00

**Agent:** cursor-agent

**redacted_flag:** false

**Prompt Content**

```text
Verify each finding against the current code and only fix it if needed.

In `@stopwatch-ics/script.js` around lines 244 - 245, Add an explicit guard in the
exported switchMode function to validate the incoming mode before mutating
currentMode: check that mode is one of the supported values (e.g., "countdown",
"stopwatch" or whatever validMode set you use), and if not either throw a
descriptive TypeError or return without changing state; update switchMode (and
any helper like currentMode) to reject invalid strings so currentMode cannot be
set to an unsupported value and downstream logic won't assume countdown
behavior.
```

---

## Prompt - 2026-03-07T20:00:00

**Agent:** cursor-agent

**redacted_flag:** false

**Prompt Content**

```text
Verify each finding against the current code and only fix it if needed.

In `@stopwatch-ics/script.js` around lines 401 - 405, The applySetCountdown
function reads DOM inputs unguarded
(elements.inputHours/inputMinutes/inputSeconds), causing throws when run in
Node/tests before cacheElements() populates them; add a defensive guard at the
top of applySetCountdown that checks cacheElements() has run or that elements
and the three input elements exist (e.g., return early if elements is falsy or
elements.inputHours/inputMinutes/inputSeconds are undefined), so callers in
non-DOM environments fail gracefully instead of throwing; reference
applySetCountdown and the cacheElements/elements symbols when making the change.
```

---

## Prompt - 2026-03-07T21:00:00

**Agent:** cursor-agent

**redacted_flag:** false

**Prompt Content**

```text
Verify each finding against the current code and only fix it if needed.

In @.cursor/rules/40-prompt-tracking.mdc around lines 48 - 68, Update the
"Prompt Content" entry format so the prompt body is stored as a fenced literal
block instead of raw Markdown: modify the section under the "## Prompt -
YYYY-MM-DDTHH:MM:SS" / "**Prompt Content**" headings to wrap the original prompt
text inside a triple-backtick fenced block (e.g., ```text ... ``` ) so embedded
headings, code fences, or horizontal rules never get parsed as document
structure; ensure the rule text and the example in
.cursor/rules/40-prompt-tracking.mdc explicitly show the fenced block usage and
include a note that redactions (if any) remain inside that literal block.
```

---

## Prompt - 2026-03-07T22:00:00

**Agent:** cursor-agent

**redacted_flag:** false

**Prompt Content**

```text
Verify each finding against the current code and only fix it if needed.

In `@stopwatch-ics/script.js` around lines 291 - 297, The exported lifecycle
helpers (e.g., startStopwatch) must be guarded by the active mode like
handlePrimaryClick does: check the current mode (the same mode variable
handlePrimaryClick enforces) at the top of each helper and return immediately if
the helper's mode isn't the active one, so callers cannot start or resume an
inactive timer; apply the same guard to the corresponding pause/resume/reset
helpers (those manipulating state.stopwatchStartedAt, state.stopwatchPausedAt,
calling startTick(), updatePrimaryButtonLabel(), etc.) and mirror the same check
for the timer-side helpers so only the active mode can drive its RAF loop.
```

---

## Prompt - 2026-03-08T00:00:00

**Agent:** cursor-agent

**redacted_flag:** false

**Prompt Content**

```text
Verify each finding against the current code and only fix it if needed.

In `@stopwatch-ics/script.test.js` around lines 349 - 357, The tests currently
only assert mode changes via api.setCurrentModeForTests and api.getCurrentMode;
update each test to also assert the Set button's actual visibility
source-of-truth after changing mode — e.g., call the module's visibility
accessor (like an api.isSetButtonVisible or api.getSetButtonVisibility if
available) or query the DOM node (e.g., document.querySelector('#set-button')
and check hidden/aria-hidden/classList) and assert true/false accordingly so the
tests fail if the Set button does not show in countdown mode or hide in
stopwatch mode.
```

---

## Prompt - 2026-03-08T12:00:00

**Agent:** cursor-agent

**redacted_flag:** false

**Prompt Content**

```text
The project is currently at 76.67% docstring coverage, failing the 80% requirement for CodeRabbitAI. Scan the codebase and identify public functions, classes, and exported modules that are missing JSDoc comments. Generate clear, concise JSDoc documentation for them, including @param, @returns, and a brief description of the logic. Ensure you maintain the existing coding style and prioritize files with the least coverage to push the total percentage above 95%. Last step please make a summary and report the docstring coverage.
```

---

## Prompt - 2026-03-08T21:00:00

**Agent:** cursor-agent

**redacted_flag:** false

**Prompt Content**

```text
Verify each finding against the current code and only fix it if needed.

Inline comments:
In @.cursor/rules/40-prompt-tracking.mdc:
- Around line 79-103: The example in Prompt Content hardcodes a triple-backtick
fence (```text) which breaks when prompts include fenced code (e.g.,
stopwatch-ics/prompts.md); update the example in
.cursor/rules/40-prompt-tracking.mdc to show a longer outer fence (e.g.,
````text) and change the wording to instruct contributors to use an outer fence
at least one backtick longer than any fence inside the prompt (or choose a
specific quadruple fence in the example) so embedded fenced examples are
preserved; reference the "Prompt Content" block and the canonical fence in the
rule text and replace the hardcoded ```text with the safer longer-fence example.

In `@stopwatch-ics/script.test.js`:
- Around line 298-318: The test currently only asserts state and formatted
values via api.formatTimeMain/api.formatTimeMs after calling api.tick(), which
doesn't verify what was actually rendered; update the test
"running_to_completed_displays_zero_and_clears_animationFrameId" to assert the
rendered UI instead: after api.tick() query the DOM fixture or use the existing
display accessor (e.g. a helper like getDisplayMain/getDisplayMs or
document.querySelector for the timer main and ms elements) and assert their
textContent equals '00:00:00' and '000' respectively, while keeping the existing
state assertions (api.getCountdownState(), api.getState().animationFrameId,
api.getState().countdownRemainingMs) to ensure both state and UI are verified.
- Around line 361-369: The test currently uses the test-only helper
setCountdownDurationMsForTests(), which bypasses parsing/validation and
applySetCountdown; change the test to drive the real Set path by keeping
api.setCurrentModeForTests('countdown'), then mock the user input value (the
DOM/input value used by the Set flow) and invoke the real setter path (call the
exported applySetCountdown() or trigger the same handler the Set button uses)
instead of setCountdownDurationMsForTests(); finally assert via api.getState()
and api.getCountdownState() that countdownDurationMs and countdownRemainingMs
equal 125000 and state is 'idle' so parsing/validation and applySetCountdown()
are exercised.

---

Nitpick comments:
In @.cursor/rules/10-project-scope.mdc:
- Around line 18-23: Update the "Allowed Files" rule (the Allowed Files section
in the project-scope rule) so it matches the real surface area: it should still
restrict core logic to the existing index.html and script.js entries but
explicitly allow the feature's stylesheet and its colocated test files; change
the prose and list items to include a CSS stylesheet (the feature's stylesheet)
and the test files so future UI/style or test fixes are permitted alongside
index.html and script.js.

In @.cursor/rules/20-code-quality.mdc:
- Around line 68-76: Update the JSDoc rule so it only applies to the real public
API surface: change the configuration that currently has globs: ["**/*.js"] and
alwaysApply: true to either restrict globs to source files (e.g. exclude test
patterns) or add an allowlist for exported/public functions; specifically,
exclude "*.test.js" (and other test/mocks) or implement logic that enforces
JSDoc only for exported symbols (public functions/classes) instead of every
function/callback so the rule in 20-code-quality.mdc only complains for public
API surfaces.

In `@stopwatch-ics/script.js`:
- Around line 613-614: The test helper setCountdownStateForTests currently
assigns any value to countdownState; add validation like setCurrentModeForTests
does by checking the input s is one of the allowed strings
('idle','running','paused','completed') and if not either throw an Error or log
and no-op; update setCountdownStateForTests to perform this check before
assigning countdownState to prevent invalid test states.

In `@stopwatch-ics/script.test.js`:
- Around line 373-383: The tests use the test-only setter
setCurrentModeForTests() which bypasses production logic, so replace those calls
with the public switchMode('countdown') and switchMode('stopwatch') to exercise
real mode-change behavior and ensure set visibility is updated; update the two
tests in describe('Set button visibility (logic)') to call switchMode(...)
instead of setCurrentModeForTests(), then assert api.getCurrentMode() and
api.getSetButtonVisibility() as before to catch regressions in switchMode()
affecting visibility.
```

---
