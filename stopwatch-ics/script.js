/**
 * Stopwatch and Countdown Timer - vanilla JS, single state object, timestamp-based timing.
 * Manual test checklist at end of file.
 */

(function () {
  'use strict';

  var hasDocument = typeof document !== 'undefined';
  var hasRequestAnimationFrame = typeof requestAnimationFrame !== 'undefined';
  var raf = hasRequestAnimationFrame ? requestAnimationFrame : function (cb) { return setTimeout(cb, 16); };
  var cancelRaf = typeof cancelAnimationFrame !== 'undefined' ? cancelAnimationFrame : clearTimeout;

  /** @type {'stopwatch'|'countdown'} */
  var currentMode = 'stopwatch';

  /** @type {'idle'|'running'|'paused'|'completed'} */
  var countdownState = 'idle';

  /**
   * Single state object for all timer state.
   * @type {{
   *   stopwatchElapsedMs: number,
   *   stopwatchStartedAt: number|null,
   *   stopwatchPausedAt: number|null,
   *   countdownDurationMs: number,
   *   countdownRemainingMs: number,
   *   countdownStartedAt: number|null,
   *   countdownPausedRemainingMs: number|null,
   *   animationFrameId: number|null
   * }}
   */
  var state = {
    stopwatchElapsedMs: 0,
    stopwatchStartedAt: null,
    stopwatchPausedAt: null,
    countdownDurationMs: 0,
    countdownRemainingMs: 0,
    countdownStartedAt: null,
    countdownPausedRemainingMs: null,
    animationFrameId: null
  };

  var elements = {};

  /**
   * Formats milliseconds into HH:MM:SS (main display).
   * @param {number} ms - Duration in milliseconds (non-negative).
   * @returns {string} Formatted string HH:MM:SS.
   */
  function formatTimeMain(ms) {
    var totalSeconds = Math.floor(ms / 1000);
    var hours = Math.floor(totalSeconds / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;
    return (
      pad(hours, 2) + ':' + pad(minutes, 2) + ':' + pad(seconds, 2)
    );
  }

  /**
   * Formats milliseconds fraction for .mmm display (0–999).
   * @param {number} ms - Duration in milliseconds.
   * @returns {string} Three-digit milliseconds.
   */
  function formatTimeMs(ms) {
    var frac = Math.floor(ms % 1000);
    return pad(frac, 3);
  }

  /**
   * Pads a number with leading zeros.
   * @param {number} n - Number to pad.
   * @param {number} length - Desired length.
   * @returns {string}
   */
  function pad(n, length) {
    var s = String(Math.max(0, Math.floor(n)));
    while (s.length < length) s = '0' + s;
    return s;
  }

  /**
   * Parses HH, MM, SS inputs into total milliseconds. Clamps to valid ranges.
   * @param {number} hours - Hours (0–99).
   * @param {number} minutes - Minutes (0–59).
   * @param {number} seconds - Seconds (0–59).
   * @returns {number} Total milliseconds, or 0 if invalid.
   */
  function parseDurationMs(hours, minutes, seconds) {
    var h = Number(hours);
    var m = Number(minutes);
    var s = Number(seconds);
    if (isNaN(h) || isNaN(m) || isNaN(s)) return 0;
    if (h < 0 || m < 0 || s < 0) return 0;
    if (m > 59 || s > 59) return 0;
    return (h * 3600 + m * 60 + s) * 1000;
  }

  /**
   * Returns whether a countdown duration is valid (positive).
   * @param {number} ms - Duration in milliseconds.
   * @returns {boolean}
   */
  function isValidCountdownDuration(ms) {
    return typeof ms === 'number' && !isNaN(ms) && ms > 0;
  }

  /**
   * Updates the on-screen time display (main + ms).
   * @param {number} ms - Time to show in milliseconds (non-negative for display).
   * @returns {void}
   */
  function updateDisplay(ms) {
    var displayMs = Math.max(0, ms);
    if (elements.timeMain) elements.timeMain.textContent = formatTimeMain(displayMs);
    if (elements.timeMs) elements.timeMs.textContent = formatTimeMs(displayMs);
  }

  /**
   * Gets current stopwatch elapsed time in ms (timestamp-based).
   * @returns {number}
   */
  function getStopwatchElapsedMs() {
    if (state.stopwatchStartedAt === null) {
      return state.stopwatchPausedAt !== null
        ? state.stopwatchPausedAt - 0
        : state.stopwatchElapsedMs;
    }
    return state.stopwatchElapsedMs + (performance.now() - state.stopwatchStartedAt);
  }

  /**
   * Gets current countdown remaining time in ms (timestamp-based).
   * @returns {number}
   */
  function getCountdownRemainingMs() {
    if (countdownState === 'idle' || countdownState === 'completed') {
      return state.countdownRemainingMs;
    }
    if (countdownState === 'paused') {
      return state.countdownPausedRemainingMs !== null
        ? state.countdownPausedRemainingMs
        : state.countdownRemainingMs;
    }
    var elapsed = performance.now() - (state.countdownStartedAt || 0);
    var remaining = state.countdownRemainingMs - elapsed;
    return Math.max(0, remaining);
  }

  /**
   * Tick: update display and schedule next frame. Stops at countdown zero.
   * @returns {void}
   */
  function tick() {
    if (currentMode === 'stopwatch') {
      updateDisplay(getStopwatchElapsedMs());
    } else {
      var remaining = getCountdownRemainingMs();
      updateDisplay(remaining);
      if (countdownState === 'running' && remaining <= 0) {
        countdownState = 'completed';
        state.countdownRemainingMs = 0;
        state.countdownStartedAt = null;
        state.countdownPausedRemainingMs = null;
        if (state.animationFrameId !== null) {
          cancelRaf(state.animationFrameId);
          state.animationFrameId = null;
        }
        updatePrimaryButtonLabel();
        updateDisplay(state.countdownRemainingMs);
        return;
      }
    }
    state.animationFrameId = raf(tick);
  }

  /**
   * Starts the tick loop (one active loop only).
   * @returns {void}
   */
  function startTick() {
    if (state.animationFrameId !== null) return;
    state.animationFrameId = raf(tick);
  }

  /**
   * Stops the tick loop.
   * @returns {void}
   */
  function stopTick() {
    if (state.animationFrameId !== null) {
      cancelRaf(state.animationFrameId);
      state.animationFrameId = null;
    }
  }

  /**
   * Returns the primary button label for current mode and state (for testing).
   * Stopwatch: running -> 'Pause'; paused or preserved elapsed -> 'Continue'; fresh (zero elapsed) -> 'Start'.
   * Countdown: running -> 'Pause'; paused -> 'Continue'; idle or completed -> 'Start'.
   * @returns {string} 'Start' | 'Pause' | 'Continue'
   */
  function getPrimaryButtonLabel() {
    if (currentMode === 'stopwatch') {
      if (state.stopwatchStartedAt !== null) return 'Pause';
      if (state.stopwatchPausedAt !== null || state.stopwatchElapsedMs > 0) return 'Continue';
      return 'Start';
    }
    if (countdownState === 'running') return 'Pause';
    if (countdownState === 'paused') return 'Continue';
    return 'Start';
  }

  /**
   * Updates primary button label based on mode and state.
   * @returns {void}
   */
  function updatePrimaryButtonLabel() {
    var btn = elements.btnPrimary;
    if (!btn) return;
    var label = getPrimaryButtonLabel();
    var action = (currentMode === 'stopwatch') ? 'stopwatch' : 'countdown';
    btn.textContent = label;
    btn.setAttribute('aria-label', label + ' ' + action);
  }

  /**
   * Shows or hides the Set section and Set button based on mode.
   * @returns {void}
   */
  function updateSetVisibility() {
    var section = elements.countdownSetSection;
    if (section) {
      section.classList.toggle('hidden', currentMode !== 'countdown');
    }
  }

  /**
   * Switches mode; pauses any running timer and preserves per-mode values.
   * @param {'stopwatch'|'countdown'} mode - The mode to switch to.
   * @returns {void}
   */
  function switchMode(mode) {
    if (mode !== 'stopwatch' && mode !== 'countdown') return;
    if (mode === currentMode) return;
    stopTick();
    if (currentMode === 'stopwatch') {
      state.stopwatchElapsedMs = getStopwatchElapsedMs();
      state.stopwatchPausedAt = null;
      if (state.stopwatchStartedAt !== null) state.stopwatchStartedAt = null;
    } else {
      if (countdownState === 'running' || countdownState === 'paused') {
        state.countdownPausedRemainingMs = getCountdownRemainingMs();
        state.countdownStartedAt = null;
        countdownState = 'paused';
      }
    }
    currentMode = mode;
    if (mode === 'stopwatch') {
      updateDisplay(getStopwatchElapsedMs());
    } else {
      var countdownDisplayMs = (countdownState === 'paused' && state.countdownPausedRemainingMs != null)
        ? state.countdownPausedRemainingMs
        : state.countdownRemainingMs;
      updateDisplay(countdownDisplayMs);
    }
    updatePrimaryButtonLabel();
    updateSetVisibility();
    updateModeTabs();
  }

  /**
   * Updates mode tab active state and ARIA.
   * @returns {void}
   */
  function updateModeTabs() {
    if (!hasDocument) return;
    var tabs = document.querySelectorAll('.mode-tab');
    tabs.forEach(function (tab) {
      var isActive = (tab.getAttribute('data-mode') === currentMode);
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  /**
   * Starts the stopwatch from zero or from the current paused elapsed time.
   * No-op when current mode is not stopwatch.
   * @returns {void}
   */
  function startStopwatch() {
    if (currentMode !== 'stopwatch') return;
    if (state.stopwatchStartedAt !== null) return;
    state.stopwatchElapsedMs = state.stopwatchPausedAt !== null ? state.stopwatchPausedAt : state.stopwatchElapsedMs;
    state.stopwatchPausedAt = null;
    state.stopwatchStartedAt = performance.now();
    updatePrimaryButtonLabel();
    startTick();
  }

  /**
   * Pauses the stopwatch and stores the current elapsed time.
   * No-op when current mode is not stopwatch.
   * @returns {void}
   */
  function pauseStopwatch() {
    if (currentMode !== 'stopwatch') return;
    if (state.stopwatchStartedAt === null) return;
    state.stopwatchElapsedMs = getStopwatchElapsedMs();
    state.stopwatchStartedAt = null;
    state.stopwatchPausedAt = state.stopwatchElapsedMs;
    stopTick();
    updateDisplay(state.stopwatchElapsedMs);
    updatePrimaryButtonLabel();
  }

  /**
   * Resumes the stopwatch from the paused elapsed time.
   * No-op when current mode is not stopwatch.
   * @returns {void}
   */
  function continueStopwatch() {
    if (currentMode !== 'stopwatch') return;
    if (state.stopwatchStartedAt !== null) return;
    state.stopwatchElapsedMs = state.stopwatchPausedAt !== null ? state.stopwatchPausedAt : state.stopwatchElapsedMs;
    state.stopwatchPausedAt = null;
    state.stopwatchStartedAt = performance.now();
    updatePrimaryButtonLabel();
    startTick();
  }

  /**
   * Clears the stopwatch to zero and stops the tick loop.
   * No-op when current mode is not stopwatch.
   * @returns {void}
   */
  function clearStopwatch() {
    if (currentMode !== 'stopwatch') return;
    stopTick();
    state.stopwatchElapsedMs = 0;
    state.stopwatchStartedAt = null;
    state.stopwatchPausedAt = null;
    updateDisplay(0);
    updatePrimaryButtonLabel();
  }

  /**
   * Starts the countdown from the configured or remaining duration.
   * No-op when current mode is not countdown.
   * @returns {void}
   */
  function startCountdown() {
    if (currentMode !== 'countdown') return;
    if (countdownState === 'running') return;
    if (!isValidCountdownDuration(state.countdownDurationMs)) return;
    if (countdownState === 'idle' || countdownState === 'completed') {
      state.countdownRemainingMs = state.countdownDurationMs;
    }
    state.countdownStartedAt = performance.now();
    countdownState = 'running';
    updatePrimaryButtonLabel();
    startTick();
  }

  /**
   * Pauses the countdown and stores the remaining time.
   * No-op when current mode is not countdown.
   * @returns {void}
   */
  function pauseCountdown() {
    if (currentMode !== 'countdown') return;
    if (countdownState !== 'running') return;
    state.countdownPausedRemainingMs = getCountdownRemainingMs();
    state.countdownRemainingMs = state.countdownPausedRemainingMs;
    state.countdownStartedAt = null;
    countdownState = 'paused';
    stopTick();
    updateDisplay(state.countdownRemainingMs);
    updatePrimaryButtonLabel();
  }

  /**
   * Resumes the countdown from the paused remaining time.
   * No-op when current mode is not countdown.
   * @returns {void}
   */
  function continueCountdown() {
    if (currentMode !== 'countdown') return;
    if (countdownState !== 'paused') return;
    state.countdownRemainingMs = state.countdownPausedRemainingMs !== null ? state.countdownPausedRemainingMs : state.countdownRemainingMs;
    state.countdownStartedAt = performance.now();
    countdownState = 'running';
    updatePrimaryButtonLabel();
    startTick();
  }

  /**
   * Clears the countdown to the configured duration and stops the tick loop.
   * No-op when current mode is not countdown.
   * @returns {void}
   */
  function clearCountdown() {
    if (currentMode !== 'countdown') return;
    stopTick();
    state.countdownRemainingMs = state.countdownDurationMs;
    state.countdownStartedAt = null;
    state.countdownPausedRemainingMs = null;
    countdownState = 'idle';
    updateDisplay(state.countdownDurationMs);
    updatePrimaryButtonLabel();
  }

  /**
   * Applies the countdown duration from the HH/MM/SS inputs and resets countdown to idle.
   * No-op in non-DOM environments when cacheElements has not run (e.g. Node tests).
   * @returns {void}
   */
  function applySetCountdown() {
    if (!elements.inputHours || !elements.inputMinutes || !elements.inputSeconds) return;
    var h = parseInt(elements.inputHours.value, 10) || 0;
    var m = parseInt(elements.inputMinutes.value, 10) || 0;
    var s = parseInt(elements.inputSeconds.value, 10) || 0;
    var ms = parseDurationMs(h, m, s);
    if (!isValidCountdownDuration(ms)) return;
    stopTick();
    state.countdownDurationMs = ms;
    state.countdownRemainingMs = ms;
    state.countdownStartedAt = null;
    state.countdownPausedRemainingMs = null;
    countdownState = 'idle';
    updateDisplay(ms);
    updatePrimaryButtonLabel();
  }

  /**
   * Handles click on the primary button (Start / Pause / Continue).
   * @returns {void}
   */
  function handlePrimaryClick() {
    if (currentMode === 'stopwatch') {
      if (state.stopwatchStartedAt !== null) {
        pauseStopwatch();
      } else if (state.stopwatchPausedAt !== null || state.stopwatchElapsedMs > 0) {
        continueStopwatch();
      } else {
        startStopwatch();
      }
    } else {
      if (countdownState === 'running') {
        pauseCountdown();
      } else if (countdownState === 'paused') {
        continueCountdown();
      } else {
        startCountdown();
      }
    }
  }

  /**
   * Handles click on the Clear button; clears stopwatch or countdown depending on mode.
   * @returns {void}
   */
  function handleClearClick() {
    if (currentMode === 'stopwatch') {
      clearStopwatch();
    } else {
      clearCountdown();
    }
  }

  /**
   * Caches DOM element references used by the timer UI.
   * @returns {void}
   */
  function cacheElements() {
    elements.timeMain = document.getElementById('time-main');
    elements.timeMs = document.getElementById('time-ms');
    elements.btnPrimary = document.getElementById('btn-primary');
    elements.btnClear = document.getElementById('btn-clear');
    elements.countdownSetSection = document.getElementById('countdown-set-section');
    elements.inputHours = document.getElementById('input-hours');
    elements.inputMinutes = document.getElementById('input-minutes');
    elements.inputSeconds = document.getElementById('input-seconds');
    elements.btnSet = document.getElementById('btn-set');
  }

  /**
   * Binds click and other event listeners to timer controls.
   * @returns {void}
   */
  function bindEvents() {
    if (elements.btnPrimary) elements.btnPrimary.addEventListener('click', handlePrimaryClick);
    if (elements.btnClear) elements.btnClear.addEventListener('click', handleClearClick);
    if (elements.btnSet) elements.btnSet.addEventListener('click', applySetCountdown);
    document.querySelectorAll('.mode-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        var mode = tab.getAttribute('data-mode');
        if (mode === 'stopwatch' || mode === 'countdown') switchMode(mode);
      });
    });
  }

  /**
   * Initializes the timer app: caches elements, binds events, and updates display and UI state.
   * @returns {void}
   */
  function init() {
    cacheElements();
    bindEvents();
    updateDisplay(0);
    updateSetVisibility();
    updateModeTabs();
    updatePrimaryButtonLabel();
  }

  if (hasDocument) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  // Export for tests (when run in Node with module)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      formatTimeMain: formatTimeMain,
      formatTimeMs: formatTimeMs,
      pad: pad,
      parseDurationMs: parseDurationMs,
      isValidCountdownDuration: isValidCountdownDuration,
      /** Returns the current timer state object (for tests). @returns {Object} State object. */
      getState: function () { return state; },
      /** Returns the current mode. @returns {'stopwatch'|'countdown'} */
      getCurrentMode: function () { return currentMode; },
      /** Returns the current countdown state. @returns {'idle'|'running'|'paused'|'completed'} */
      getCountdownState: function () { return countdownState; },
      getStopwatchElapsedMs: getStopwatchElapsedMs,
      getCountdownRemainingMs: getCountdownRemainingMs,
      startStopwatch: startStopwatch,
      pauseStopwatch: pauseStopwatch,
      continueStopwatch: continueStopwatch,
      clearStopwatch: clearStopwatch,
      startCountdown: startCountdown,
      pauseCountdown: pauseCountdown,
      continueCountdown: continueCountdown,
      clearCountdown: clearCountdown,
      applySetCountdown: applySetCountdown,
      switchMode: switchMode,
      stopTick: stopTick,
      getPrimaryButtonLabel: getPrimaryButtonLabel,
      /** @param {Object} s - Partial or full state to merge; overwrites provided fields. @returns {void} */
      setStateForTests: function (s) {
        state.stopwatchElapsedMs = s.stopwatchElapsedMs != null ? s.stopwatchElapsedMs : state.stopwatchElapsedMs;
        state.stopwatchStartedAt = s.stopwatchStartedAt !== undefined ? s.stopwatchStartedAt : state.stopwatchStartedAt;
        state.stopwatchPausedAt = s.stopwatchPausedAt !== undefined ? s.stopwatchPausedAt : state.stopwatchPausedAt;
        state.countdownDurationMs = s.countdownDurationMs != null ? s.countdownDurationMs : state.countdownDurationMs;
        state.countdownRemainingMs = s.countdownRemainingMs != null ? s.countdownRemainingMs : state.countdownRemainingMs;
        state.countdownStartedAt = s.countdownStartedAt !== undefined ? s.countdownStartedAt : state.countdownStartedAt;
        state.countdownPausedRemainingMs = s.countdownPausedRemainingMs !== undefined ? s.countdownPausedRemainingMs : state.countdownPausedRemainingMs;
        if (s.animationFrameId !== undefined) state.animationFrameId = s.animationFrameId;
      },
      /** Tick callback for display updates; exported for tests. @returns {void} */
      tick: tick,
      /** @param {'idle'|'running'|'paused'|'completed'} s - Countdown state. @returns {void} */
      setCountdownStateForTests: function (s) { countdownState = s; },
      /** @param {'stopwatch'|'countdown'} m - Current mode. @returns {void} */
      setCurrentModeForTests: function (m) { currentMode = m; },
      /** @param {number} ms - Valid countdown duration in ms. @returns {void} */
      setCountdownDurationMsForTests: function (ms) {
        if (!isValidCountdownDuration(ms)) return;
        state.countdownDurationMs = ms;
        state.countdownRemainingMs = ms;
        state.countdownStartedAt = null;
        state.countdownPausedRemainingMs = null;
        countdownState = 'idle';
      }
    };
  }
})();

/*
 * Manual test checklist (keep in script.js per deliverables)
 * ---------------------------------
 * Stopwatch:
 *   [ ] Start: display counts up from 00:00:00.000
 *   [ ] Pause: time freezes
 *   [ ] Continue: time resumes from paused value
 *   [ ] Clear: resets to 00:00:00.000 and primary shows Start
 *   [ ] Switch to Countdown and back: stopwatch value preserved
 * Countdown:
 *   [ ] Set visible only in Countdown mode; hidden in Stopwatch
 *   [ ] Set: enter HH/MM/SS, click Set → display shows duration, state idle
 *   [ ] Start: countdown decreases from configured duration
 *   [ ] Pause: remaining time frozen
 *   [ ] Continue: resumes from remaining time
 *   [ ] Clear: display and state restore to configured duration (not zero)
 *   [ ] At zero: stops at 00:00:00.000, completed, primary shows Start
 *   [ ] Invalid/zero duration: Start does nothing until valid Set
 * UI:
 *   [ ] Primary label: Idle→Start, Running→Pause, Paused→Continue
 *   [ ] Mode tab active state and ARIA correct
 *   [ ] No console errors
 */
