/* Derived from Mineradio 2.0.2 (4abaa19), GPL-3.0-only. */
/* Upstream: https://github.com/XxHuberrr/Mineradio/blob/4abaa190de42c632365ae4244e041bad16443224/public/js/modules/06-lyrics/05-upload-dragdrop.js */
/* Modified for PULSE ROOM on 2026-07-30. */
function pulseLocalMediaRuntime() {
  return window.PulseRuntime && PulseRuntime.localMedia
    ? PulseRuntime.localMedia
    : null;
}

function reportPulseImportFailure(kind, detail) {
  if (window.PulseRuntime && PulseRuntime.status) {
    PulseRuntime.status.report(kind, detail || {});
  }
}

function appendPulseLocalQueue(tracks) {
  if (!Array.isArray(tracks) || !tracks.length) return -1;
  var targetIndex = -1;
  tracks.forEach(function (track) {
    var index = queueSong(track);
    if (targetIndex < 0) targetIndex = index;
  });
  currentIdx = targetIndex;
  currentTrack = playQueue[targetIndex];
  currentLocalSong = currentTrack;
  activeRadioContext = null;
  document.body.dataset.trackId = String(currentTrack.id || 'local-file');
  if (typeof refreshPulseClassicHome === 'function') refreshPulseClassicHome();
  return targetIndex;
}

function importPulseLocalFiles(files) {
  var runtime = pulseLocalMediaRuntime();
  if (!runtime) return false;
  var result = runtime.classify(files);
  if (!result.accepted.length) {
    reportPulseImportFailure('import-invalid');
    return false;
  }
  var tracks = result.accepted.map(function (file) {
    return PulseRuntime.localMedia.createTrack(file);
  });
  var targetIndex = appendPulseLocalQueue(tracks);
  if (targetIndex < 0) return false;
  if (PulseRuntime.status) PulseRuntime.status.clear();
  showToast(tracks.length === 1 ? 'Playing local audio' : 'Imported ' + tracks.length + ' local tracks');
  Promise.resolve(playQueueAt(targetIndex, { manual: true })).then(function (started) {
    if (!started) {
      reportPulseImportFailure('audio', {
        trackId: tracks[0].id,
        message: 'The local audio file could not be decoded.'
      });
    }
  }).catch(function (error) {
    reportPulseImportFailure('audio', { trackId: tracks[0].id, error: error });
  });
  return true;
}

function bindPulseLocalInput(id) {
  var input = document.getElementById(id);
  if (!input || input.dataset.bound === 'true') return;
  input.dataset.bound = 'true';
  input.addEventListener('change', function (event) {
    importPulseLocalFiles(event.target.files);
    event.target.value = '';
  });
}

bindPulseLocalInput('file-input');
bindPulseLocalInput('folder-input');

var dropOverlay = document.getElementById('drop-overlay');
var pulseDragDepth = 0;
document.addEventListener('dragenter', function (event) {
  event.preventDefault();
  pulseDragDepth += 1;
  if (dropOverlay) dropOverlay.classList.add('show');
});
document.addEventListener('dragleave', function (event) {
  event.preventDefault();
  pulseDragDepth = Math.max(0, pulseDragDepth - 1);
  if (!pulseDragDepth && dropOverlay) dropOverlay.classList.remove('show');
});
document.addEventListener('dragover', function (event) {
  event.preventDefault();
});
document.addEventListener('drop', function (event) {
  event.preventDefault();
  pulseDragDepth = 0;
  if (dropOverlay) dropOverlay.classList.remove('show');
  if (event.dataTransfer && event.dataTransfer.files) {
    importPulseLocalFiles(event.dataTransfer.files);
  }
});
