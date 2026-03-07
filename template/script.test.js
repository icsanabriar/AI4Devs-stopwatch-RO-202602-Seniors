/**
 * Unit tests for script.js timer logic.
 * Co-located next to script.js per .cursor/rules/30-testing.mdc.
 * Run: node --test template/script.test.js (from repo root)
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');

// Load script.js (runs IIFE, no document so init not run; exports API)
const api = require('./script.js');

describe('formatTimeMain', function () {
  it('should format zero as 00:00:00', function () {
    assert.strictEqual(api.formatTimeMain(0), '00:00:00');
  });
  it('should format milliseconds into HH:MM:SS', function () {
    assert.strictEqual(api.formatTimeMain(1000), '00:00:01');
    assert.strictEqual(api.formatTimeMain(61000), '00:01:01');
    assert.strictEqual(api.formatTimeMain(3661000), '01:01:01');
  });
  it('should floor fractional seconds', function () {
    assert.strictEqual(api.formatTimeMain(5999), '00:00:05');
  });
});

describe('formatTimeMs', function () {
  it('should return three-digit milliseconds', function () {
    assert.strictEqual(api.formatTimeMs(0), '000');
    assert.strictEqual(api.formatTimeMs(1), '001');
    assert.strictEqual(api.formatTimeMs(999), '999');
    assert.strictEqual(api.formatTimeMs(1234), '234');
  });
});

describe('pad', function () {
  it('should pad numbers to given length', function () {
    assert.strictEqual(api.pad(0, 2), '00');
    assert.strictEqual(api.pad(5, 2), '05');
    assert.strictEqual(api.pad(123, 2), '123');
  });
});

describe('parseDurationMs', function () {
  it('should convert HH MM SS to milliseconds', function () {
    assert.strictEqual(api.parseDurationMs(0, 0, 0), 0);
    assert.strictEqual(api.parseDurationMs(0, 0, 1), 1000);
    assert.strictEqual(api.parseDurationMs(0, 1, 0), 60000);
    assert.strictEqual(api.parseDurationMs(1, 0, 0), 3600000);
    assert.strictEqual(api.parseDurationMs(1, 1, 1), 3661000);
  });
  it('should reject invalid values and return 0', function () {
    assert.strictEqual(api.parseDurationMs(NaN, 0, 0), 0);
    assert.strictEqual(api.parseDurationMs(0, -1, 0), 0);
    assert.strictEqual(api.parseDurationMs(0, 60, 0), 0);
    assert.strictEqual(api.parseDurationMs(0, 0, 60), 0);
  });
});

describe('isValidCountdownDuration', function () {
  it('should accept positive numbers', function () {
    assert.strictEqual(api.isValidCountdownDuration(1), true);
    assert.strictEqual(api.isValidCountdownDuration(1000), true);
  });
  it('should reject zero negative NaN', function () {
    assert.strictEqual(api.isValidCountdownDuration(0), false);
    assert.strictEqual(api.isValidCountdownDuration(-1), false);
    assert.strictEqual(api.isValidCountdownDuration(NaN), false);
  });
});

describe('Stopwatch', function () {
  it('should_start_stopwatch_when_start_is_called', function () {
    api.setStateForTests({
      stopwatchElapsedMs: 0,
      stopwatchStartedAt: null,
      stopwatchPausedAt: null
    });
    api.setCurrentModeForTests('stopwatch');
    api.startStopwatch();
    const state = api.getState();
    assert.ok(state.stopwatchStartedAt !== null);
    assert.strictEqual(api.getCurrentMode(), 'stopwatch');
    api.stopTick();
  });

  it('should_pause_stopwatch_when_pause_is_called', function () {
    api.setStateForTests({
      stopwatchElapsedMs: 0,
      stopwatchStartedAt: 1000,
      stopwatchPausedAt: null
    });
    api.setCurrentModeForTests('stopwatch');
    api.pauseStopwatch();
    const state = api.getState();
    assert.strictEqual(state.stopwatchStartedAt, null);
    assert.ok(state.stopwatchPausedAt !== null);
  });

  it('should_continue_stopwatch_when_continue_is_called_after_pause', function () {
    api.setStateForTests({
      stopwatchElapsedMs: 5000,
      stopwatchStartedAt: null,
      stopwatchPausedAt: 5000
    });
    api.setCurrentModeForTests('stopwatch');
    api.continueStopwatch();
    const state = api.getState();
    assert.ok(state.stopwatchStartedAt !== null);
    assert.strictEqual(state.stopwatchPausedAt, null);
    api.stopTick();
  });

  it('should_clear_reset_stopwatch_to_zero', function () {
    api.setStateForTests({
      stopwatchElapsedMs: 10000,
      stopwatchStartedAt: null,
      stopwatchPausedAt: 10000
    });
    api.setCurrentModeForTests('stopwatch');
    api.clearStopwatch();
    const state = api.getState();
    assert.strictEqual(state.stopwatchElapsedMs, 0);
    assert.strictEqual(state.stopwatchStartedAt, null);
    assert.strictEqual(state.stopwatchPausedAt, null);
  });

  it('should_report_elapsed_time_based_on_started_at_when_running', function () {
    const base = 100000; // 100s
    api.setStateForTests({
      stopwatchElapsedMs: base,
      stopwatchStartedAt: performance.now() - 2000,
      stopwatchPausedAt: null
    });
    api.setCurrentModeForTests('stopwatch');
    const elapsed = api.getStopwatchElapsedMs();
    assert.ok(elapsed >= base && elapsed <= base + 2100);
  });
});

describe('Countdown', function () {
  it('should_not_start_countdown_without_valid_duration', function () {
    api.setStateForTests({
      countdownDurationMs: 0,
      countdownRemainingMs: 0,
      countdownStartedAt: null,
      countdownPausedRemainingMs: null
    });
    api.setCountdownStateForTests('idle');
    api.setCurrentModeForTests('countdown');
    api.startCountdown();
    assert.strictEqual(api.getCountdownState(), 'idle');
    assert.strictEqual(api.getState().countdownStartedAt, null);
  });

  it('should_start_countdown_from_configured_duration', function () {
    const duration = 60000;
    api.setStateForTests({
      countdownDurationMs: duration,
      countdownRemainingMs: duration,
      countdownStartedAt: null,
      countdownPausedRemainingMs: null
    });
    api.setCountdownStateForTests('idle');
    api.setCurrentModeForTests('countdown');
    api.startCountdown();
    assert.strictEqual(api.getCountdownState(), 'running');
    assert.ok(api.getState().countdownStartedAt !== null);
    assert.strictEqual(api.getState().countdownRemainingMs, duration);
    api.stopTick();
  });

  it('should_pause_preserve_remaining_time', function () {
    const duration = 60000;
    api.setStateForTests({
      countdownDurationMs: duration,
      countdownRemainingMs: 30000,
      countdownStartedAt: performance.now() - 30000,
      countdownPausedRemainingMs: null
    });
    api.setCountdownStateForTests('running');
    api.setCurrentModeForTests('countdown');
    api.pauseCountdown();
    assert.strictEqual(api.getCountdownState(), 'paused');
    const remaining = api.getState().countdownPausedRemainingMs;
    assert.ok(remaining >= 0 && remaining <= 30100);
  });

  it('should_continue_resume_from_paused_remaining', function () {
    const remaining = 20000;
    api.setStateForTests({
      countdownDurationMs: 60000,
      countdownRemainingMs: remaining,
      countdownStartedAt: null,
      countdownPausedRemainingMs: remaining
    });
    api.setCountdownStateForTests('paused');
    api.setCurrentModeForTests('countdown');
    api.continueCountdown();
    assert.strictEqual(api.getCountdownState(), 'running');
    assert.ok(api.getState().countdownStartedAt !== null);
    api.stopTick();
  });

  it('should_clear_restore_configured_duration_not_zero', function () {
    const duration = 45000;
    api.setStateForTests({
      countdownDurationMs: duration,
      countdownRemainingMs: 10000,
      countdownStartedAt: null,
      countdownPausedRemainingMs: 10000
    });
    api.setCountdownStateForTests('paused');
    api.setCurrentModeForTests('countdown');
    api.clearCountdown();
    const state = api.getState();
    assert.strictEqual(api.getCountdownState(), 'idle');
    assert.strictEqual(state.countdownRemainingMs, duration);
    assert.strictEqual(state.countdownDurationMs, duration);
  });

  it('should_stop_exactly_at_zero_when_remaining_reaches_zero', function () {
    api.setStateForTests({
      countdownDurationMs: 5000,
      countdownRemainingMs: 0,
      countdownStartedAt: null,
      countdownPausedRemainingMs: null
    });
    api.setCountdownStateForTests('completed');
    assert.strictEqual(api.getCountdownRemainingMs(), 0);
    assert.strictEqual(api.formatTimeMain(api.getCountdownRemainingMs()), '00:00:00');
  });

  it('repeated_start_pause_continue_cycles_should_behave_correctly', function () {
    const duration = 10000;
    api.setStateForTests({
      countdownDurationMs: duration,
      countdownRemainingMs: duration,
      countdownStartedAt: null,
      countdownPausedRemainingMs: null
    });
    api.setCountdownStateForTests('idle');
    api.setCurrentModeForTests('countdown');
    api.startCountdown();
    assert.strictEqual(api.getCountdownState(), 'running');
    api.pauseCountdown();
    assert.strictEqual(api.getCountdownState(), 'paused');
    const afterPause = api.getState().countdownPausedRemainingMs;
    api.continueCountdown();
    assert.strictEqual(api.getCountdownState(), 'running');
    api.pauseCountdown();
    assert.strictEqual(api.getCountdownState(), 'paused');
    assert.ok(api.getState().countdownPausedRemainingMs <= afterPause);
    api.stopTick();
  });
});

describe('Mode and Set visibility', function () {
  it('should_switch_to_stopwatch_mode', function () {
    api.setCurrentModeForTests('countdown');
    api.switchMode('stopwatch');
    assert.strictEqual(api.getCurrentMode(), 'stopwatch');
  });

  it('should_switch_to_countdown_mode', function () {
    api.setCurrentModeForTests('stopwatch');
    api.switchMode('countdown');
    assert.strictEqual(api.getCurrentMode(), 'countdown');
  });

  it('should_preserve_stopwatch_value_when_switching_to_countdown_and_back', function () {
    api.setStateForTests({
      stopwatchElapsedMs: 7000,
      stopwatchStartedAt: null,
      stopwatchPausedAt: 7000
    });
    api.setCurrentModeForTests('stopwatch');
    api.switchMode('countdown');
    api.switchMode('stopwatch');
    assert.strictEqual(api.getStopwatchElapsedMs(), 7000);
  });

  it('should_show_Start_not_Continue_when_switching_from_countdown_to_stopwatch', function () {
    api.setStateForTests({
      stopwatchElapsedMs: 5000,
      stopwatchStartedAt: null,
      stopwatchPausedAt: 5000
    });
    api.setCurrentModeForTests('countdown');
    api.switchMode('stopwatch');
    assert.strictEqual(api.getCurrentMode(), 'stopwatch');
    assert.strictEqual(api.getPrimaryButtonLabel(), 'Start', 'Primary button must show Start after switching from Countdown to Stopwatch');
  });
});

describe('Set correctly defines duration', function () {
  it('set_countdown_duration_updates_configured_and_remaining', function () {
    api.setCurrentModeForTests('countdown');
    api.setCountdownDurationMsForTests(125000);
    const state = api.getState();
    assert.strictEqual(state.countdownDurationMs, 125000);
    assert.strictEqual(state.countdownRemainingMs, 125000);
    assert.strictEqual(api.getCountdownState(), 'idle');
  });
});

describe('Set button visibility (logic)', function () {
  it('set_button_visible_only_in_countdown_mode', function () {
    api.setCurrentModeForTests('countdown');
    assert.strictEqual(api.getCurrentMode(), 'countdown');
  });
  it('set_button_hidden_in_stopwatch_mode', function () {
    api.setCurrentModeForTests('stopwatch');
    assert.strictEqual(api.getCurrentMode(), 'stopwatch');
  });
});

describe('Primary button label behavior', function () {
  it('start_then_pause_then_continue_reflects_state', function () {
    api.setStateForTests({
      stopwatchElapsedMs: 0,
      stopwatchStartedAt: null,
      stopwatchPausedAt: null
    });
    api.setCurrentModeForTests('stopwatch');
    api.startStopwatch();
    assert.ok(api.getState().stopwatchStartedAt !== null);
    api.pauseStopwatch();
    assert.strictEqual(api.getState().stopwatchStartedAt, null);
    api.continueStopwatch();
    assert.ok(api.getState().stopwatchStartedAt !== null);
    api.stopTick();
  });
});
