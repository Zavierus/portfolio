/* Derived from Mineradio 2.0.2 (4abaa19), GPL-3.0-only. */
/* Upstream: https://github.com/XxHuberrr/Mineradio/blob/4abaa190de42c632365ae4244e041bad16443224/public/js/modules/10-shell/03-splash.js */
/* Modified for PULSE ROOM on 2026-07-30. */
var splashReadyToEnter = true;
var splashAnimating = false;

function markSplashReadyToEnter() {
  splashReadyToEnter = true;
  var button = document.getElementById('enter-soundstage');
  if (button) button.disabled = false;
}

function finishSplashReveal() {
  document.body.classList.remove('soundstage-locked');
}

function dismissSplash() {
  return enterPulseSoundstage();
}

markSplashReadyToEnter();
