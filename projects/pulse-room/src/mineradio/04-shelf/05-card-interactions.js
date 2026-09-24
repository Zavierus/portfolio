/* Derived from Mineradio 2.0.2 (4abaa19), GPL-3.0-only. */
/* Upstream: https://github.com/XxHuberrr/Mineradio/blob/4abaa190de42c632365ae4244e041bad16443224/public/js/modules/04-shelf/05-card-interactions.js */
/* Modified for PULSE ROOM on 2026-07-30. */
function raycasterFromPointerEvent(event) {
  var mouseX = event.clientX / innerWidth * 2 - 1;
  var mouseY = -(event.clientY / innerHeight) * 2 + 1;
  var raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);
  return raycaster;
}

function pointerCardHit(raycaster, event, screenPad) {
  if (!shelfManager) return null;
  return shelfManager.raycastCards(raycaster)
    || (shelfManager.pickCardAtScreen && shelfManager.pickCardAtScreen(event.clientX, event.clientY, screenPad));
}

function clickCardHit(raycaster, event) {
  if (!shelfManager || !event) return null;
  // Side cards overlap in depth. An exact projected rectangle is more
  // trustworthy for an explicit click than the raycaster's nearest plane,
  // which can otherwise keep selecting the front card.
  if (shelfManager.getMode() === 'side' && shelfManager.pickCardAtScreen) {
    var exact = shelfManager.pickCardAtScreen(event.clientX, event.clientY, 0);
    if (exact) return exact;
  }
  return pointerCardHit(raycaster, event, 0);
}

function isSideShelfFocusHit(event) {
  if (!event || !shelfManager || shelfManager.getMode() !== 'side') return false;
  if (typeof shelfPlaybackSwitchGuardActive === 'function' && shelfPlaybackSwitchGuardActive()) return false;
  if (shelfPinnedOpen) return true;
  if (!shelfAutoHiddenInputReady() && !shelfAlwaysVisible()) return false;
  return !!pointerCardHit(raycasterFromPointerEvent(event), event, 24);
}

function updateShelfCardHoverSelection(event) {
  if (!shelfManager || !shelfManager.clearSelected || !shelfManager.setSelected) return;
  if (!event || document.body.classList.contains('splash-active') || isPointerOverUi(event)) {
    shelfManager.clearSelected();
    return;
  }
  if (!shelfManager.canInteract || !shelfManager.canInteract()) {
    shelfManager.clearSelected();
    return;
  }
  var hit = pointerCardHit(raycasterFromPointerEvent(event), event, 24);
  if (hit && hit.card) shelfManager.setSelected(hit.card.index);
  else shelfManager.clearSelected();
}

function activatePulseShelfCard(card) {
  if (!card || !shelfManager || typeof shelfManager.openContent !== 'function') return false;
  // A click is an explicit track choice. Wheel gestures remain the only
  // interaction that scrolls the carousel without changing playback.
  shelfManager.openContent(card.index);
  return true;
}

renderer.domElement.addEventListener('click', function (event) {
  if (!shelfManager || shelfManager.getMode() === 'off') return;
  if (typeof shelfPlaybackSwitchGuardActive === 'function' && shelfPlaybackSwitchGuardActive()) return;
  if (document.body.classList.contains('splash-active') || isPointerOverUi(event)) return;
  if (mouseDownAt.hadDrag) {
    mouseDownAt.hadDrag = false;
    return;
  }
  var hit = clickCardHit(raycasterFromPointerEvent(event), event);
  if (!hit || !hit.card) {
    if (shelfManager.getMode() === 'side' && shelfPinnedOpen) setShelfPinnedOpen(false, true);
    return;
  }
  if (shelfManager.getMode() === 'side') setShelfPinnedOpen(true, true);
  activatePulseShelfCard(hit.card);
});

renderer.domElement.addEventListener('wheel', function (event) {
  if (isPointerOverUi(event) || !shelfManager || shelfManager.getMode() === 'off') return;
  if (typeof shelfPlaybackSwitchGuardActive === 'function' && shelfPlaybackSwitchGuardActive()) return;
  var hit = pointerCardHit(raycasterFromPointerEvent(event), event, 32);
  if (!hit && !event.shiftKey) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  shelfManager.scrollBy(event.deltaY > 0 ? 1 : -1);
}, { passive: false, capture: true });
