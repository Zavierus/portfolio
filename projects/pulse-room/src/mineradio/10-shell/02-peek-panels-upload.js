/* Derived from Mineradio 2.0.2 (4abaa19), GPL-3.0-only. */
/* Upstream: https://github.com/XxHuberrr/Mineradio/blob/4abaa190de42c632365ae4244e041bad16443224/public/js/modules/10-shell/02-peek-panels-upload.js */
/* Modified for PULSE ROOM on 2026-07-30. */
var pulsePanelReturnTargets = new WeakMap();

function pulsePanelTrigger(key) {
  if (key === 'fx') return document.getElementById('fx-fab');
  return null;
}

function setPulsePanelVisibility(element, open, key, className) {
  if (!element) return false;
  open = !!open;
  className = className || 'peek';
  var active = document.activeElement;
  var focusWasInside = !!(active && element.contains(active));
  if (open && active && active !== document.body && !focusWasInside) {
    pulsePanelReturnTargets.set(element, active);
  }
  element.classList.toggle(className, open);
  element.setAttribute('aria-hidden', open ? 'false' : 'true');
  element.inert = !open;
  var trigger = pulsePanelTrigger(key);
  if (trigger) {
    trigger.classList.toggle('active', open);
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if (!open && focusWasInside) {
    var returnTarget = pulsePanelReturnTargets.get(element) || trigger;
    if (returnTarget && returnTarget.isConnected && typeof returnTarget.focus === 'function') {
      try { returnTarget.focus({ preventScroll: true }); } catch (error) { returnTarget.focus(); }
    }
  }
  return open;
}

function setPeek(element, on, key) {
  return setPulsePanelVisibility(element, on, key, 'peek');
}

function closeUploadTip() {
  var overlay = document.getElementById('drop-overlay');
  if (overlay) overlay.classList.remove('show');
}

function maybeShowUploadTipOnce() {
  return false;
}

function updatePulseShelfPointer(event) {
  if (typeof updateShelfHoverCueFromPointer !== 'function' || typeof updateShelfCardHoverSelection !== 'function') return;
  if (!event || document.body.classList.contains('splash-active')) {
    updateShelfHoverCueFromPointer(null);
    updateShelfCardHoverSelection(null);
    return;
  }
  updateShelfHoverCueFromPointer(event);
  updateShelfCardHoverSelection(event);
}

window.addEventListener('pointermove', function (event) {
  updatePulseShelfPointer(event);
}, { passive: true });

function bindSourceLicenseDialog() {
  var button = document.getElementById('source-license');
  var dialog = document.getElementById('source-license-dialog');
  if (!button || !dialog || button.dataset.bound === 'true') return;
  button.dataset.bound = 'true';
  button.addEventListener('click', function () {
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  });
  dialog.addEventListener('click', function (event) {
    if (event.target === dialog) dialog.close();
  });
}

bindSourceLicenseDialog();
