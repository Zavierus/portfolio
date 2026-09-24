/* Derived from Mineradio 2.0.2 (4abaa19), GPL-3.0-only. */
/* Upstream: https://github.com/XxHuberrr/Mineradio/blob/4abaa190de42c632365ae4244e041bad16443224/public/js/modules/05-playback/15-control-glass-animations.js */
/* Modified for PULSE ROOM on 2026-07-30. */
function pulseControlsPreferReducedMotion() {
  return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
}

function bindPlayerControlAnimations() {
  document.querySelectorAll('#controls button').forEach(function (button) {
    if (button.dataset.controlAnimBound === 'true') return;
    button.dataset.controlAnimBound = 'true';
    function press() {
      if (!button.disabled && !pulseControlsPreferReducedMotion()) button.classList.add('is-pressed');
    }
    function release() {
      button.classList.remove('is-pressed');
    }
    button.addEventListener('pointerdown', press);
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('pointerleave', release);
    button.addEventListener('blur', release);
  });
  return true;
}

function clearPlayerControlFocusState() {
  document.querySelectorAll('#controls button.is-pressed').forEach(function (button) {
    button.classList.remove('is-pressed');
  });
}

function initControlGlassSurface() {
  return bindPlayerControlAnimations();
}

bindPlayerControlAnimations();
