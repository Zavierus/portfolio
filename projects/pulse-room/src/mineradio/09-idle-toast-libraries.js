/* Derived from Mineradio 2.0.2 (4abaa19), GPL-3.0-only. */
/* Upstream: https://github.com/XxHuberrr/Mineradio/blob/4abaa190de42c632365ae4244e041bad16443224/public/js/modules/09-idle-toast-libraries.js */
/* Modified for PULSE ROOM on 2026-07-30. */
var toastTimer = null;
var pulseIdleTimer = null;
var pulseRuntimeStatusUnsubscribe = null;
var PULSE_IDLE_DELAY = 2500;

function idleGuidePointerDown() {}
function idleGuidePointerMove() {}
function idleGuidePointerUp() {}
function idleGuidePointerLeave() {}

function pulseStatusToast() {
  return document.getElementById('status-toast');
}

function scheduleToastHide(delay) {
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    var toast = pulseStatusToast();
    if (toast && !toast.querySelector('[data-runtime-action]')) toast.classList.remove('show');
  }, delay || 2600);
}

function showToast(message) {
  var toast = pulseStatusToast();
  if (!toast) return;
  toast.replaceChildren(document.createTextNode(String(message || '')));
  toast.setAttribute('role', 'status');
  toast.removeAttribute('data-level');
  toast.classList.remove('has-actions');
  toast.classList.toggle('show', !!message);
  if (message) scheduleToastHide(2600);
}

function pulseRuntimeActionLabel(action) {
  return {
    retry: 'RETRY',
    'choose-track': 'CHOOSE TRACK',
    'import-local': 'IMPORT AUDIO'
  }[action] || action;
}

function renderPulseRuntimeStatus(state) {
  var toast = pulseStatusToast();
  if (!toast) return;
  if (!state || state.kind === 'ready' || !state.message) {
    toast.classList.remove('show');
    toast.replaceChildren();
    return;
  }
  if (toastTimer) clearTimeout(toastTimer);
  toast.replaceChildren();
  toast.setAttribute('role', state.level === 'error' ? 'alert' : 'status');
  toast.dataset.level = state.level || 'info';
  var message = document.createElement('span');
  message.className = 'status-toast__message';
  message.textContent = state.message;
  toast.appendChild(message);
  if (Array.isArray(state.actions) && state.actions.length) {
    toast.classList.add('has-actions');
    var actions = document.createElement('span');
    actions.className = 'status-toast__actions';
    state.actions.forEach(function (action) {
      var button = document.createElement('button');
      button.type = 'button';
      button.dataset.runtimeAction = action;
      button.textContent = pulseRuntimeActionLabel(action);
      actions.appendChild(button);
    });
    toast.appendChild(actions);
  } else {
    toast.classList.remove('has-actions');
    scheduleToastHide(state.level === 'warning' ? 4400 : 2800);
  }
  toast.classList.add('show');
}

function retryPulseRuntimeStatus() {
  var runtime = window.PulseRuntime;
  if (!runtime) return Promise.resolve(false);
  if (runtime.status.current.kind === 'context-lost') {
    var canvas = document.querySelector('#canvas-container canvas');
    var gl = canvas && (canvas.getContext('webgl2') || canvas.getContext('webgl'));
    var restore = gl && gl.getExtension('WEBGL_lose_context');
    if (restore && typeof restore.restoreContext === 'function') {
      restore.restoreContext();
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }
  if (currentTrack && pulseCurrentTrackIsLocal()) {
    return Promise.resolve(playQueueAt(currentIdx, { manual: true }));
  }
  var trackId = runtime.status.current.trackId || runtime.selection.selectedId;
  return selectPulseTrack(trackId, { origin: 'recovery', userInitiated: true });
}

function handlePulseRuntimeAction(action) {
  if (action === 'retry') {
    retryPulseRuntimeStatus().then(function (recovered) {
      if (recovered && PulseRuntime.status) PulseRuntime.status.clear();
    });
    return;
  }
  if (action === 'choose-track') {
    if (typeof setMiniQueueOpen === 'function') {
      setMiniQueueOpen(true);
      requestAnimationFrame(function () {
        var selected = document.querySelector('#mini-queue-list [aria-current="true"],#mini-queue-list [data-queue-index]');
        if (selected) selected.focus();
      });
    }
    return;
  }
  if (action === 'import-local') {
    var input = document.getElementById('file-input');
    if (input) input.click();
  }
}

function bindPulseRuntimeStatus() {
  var toast = pulseStatusToast();
  if (!toast || !window.PulseRuntime || !PulseRuntime.status) return false;
  if (toast.dataset.runtimeBound !== 'true') {
    toast.dataset.runtimeBound = 'true';
    toast.addEventListener('click', function (event) {
      var button = event.target.closest('[data-runtime-action]');
      if (button) handlePulseRuntimeAction(button.dataset.runtimeAction);
    });
  }
  if (!pulseRuntimeStatusUnsubscribe) {
    pulseRuntimeStatusUnsubscribe = PulseRuntime.status.subscribe(renderPulseRuntimeStatus);
  }
  return true;
}

function pulseChromeHasActiveFocus() {
  var active = document.activeElement;
  return !!(active && active.closest && active.closest('.stage-chrome, #transport, #source-license-dialog'));
}

function revealPulseChrome() {
  document.body.classList.remove('controls-idle');
  if (pulseIdleTimer) clearTimeout(pulseIdleTimer);
  pulseIdleTimer = setTimeout(function () {
    if (document.body.dataset.playing !== 'true') return;
    if (pulseChromeHasActiveFocus()) {
      revealPulseChrome();
      return;
    }
    document.body.classList.add('controls-idle');
  }, PULSE_IDLE_DELAY);
}

function initPulseIdleChrome() {
  ['pointermove', 'pointerdown', 'touchstart', 'focusin', 'keydown'].forEach(function (type) {
    document.addEventListener(type, revealPulseChrome, { passive: type !== 'keydown' });
  });
  revealPulseChrome();
}

bindPulseRuntimeStatus();
