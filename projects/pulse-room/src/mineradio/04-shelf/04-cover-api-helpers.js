/* Derived from Mineradio 2.0.2 (4abaa19), GPL-3.0-only. */
/* Upstream: https://github.com/XxHuberrr/Mineradio/blob/4abaa190de42c632365ae4244e041bad16443224/public/js/modules/04-shelf/04-cover-api-helpers.js */
/* Modified for PULSE ROOM on 2026-07-30. */
var pulseShelfCoverCache = Object.create(null);

function validPulseShelfCoverSource(source) {
  if (typeof source !== 'string' || !source) return '';
  if (/^(data:image\/|blob:)/i.test(source)) return source;
  try {
    var resolved = new URL(source, window.location.href);
    return resolved.origin === window.location.origin ? source : '';
  } catch (error) {
    return '';
  }
}

function requestPulseShelfCover(source, callback) {
  source = validPulseShelfCoverSource(source);
  if (!source) {
    if (callback) callback(null);
    return;
  }
  var record = pulseShelfCoverCache[source];
  if (record && record.loaded) {
    if (callback) callback(record.image);
    return;
  }
  if (record && record.loading) {
    if (callback) record.waiters.push(callback);
    return;
  }
  record = pulseShelfCoverCache[source] = {
    loaded: false,
    loading: true,
    failed: false,
    image: null,
    waiters: callback ? [callback] : []
  };
  var image = new Image();
  image.decoding = 'async';
  image.onload = function () {
    record.loaded = true;
    record.loading = false;
    record.image = image;
    record.waiters.splice(0).forEach(function (listener) { listener(image); });
  };
  image.onerror = function () {
    record.loading = false;
    record.failed = true;
    record.waiters.splice(0).forEach(function (listener) { listener(null); });
  };
  image.src = source;
}
