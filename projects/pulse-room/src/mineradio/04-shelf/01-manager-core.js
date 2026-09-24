/* Derived from Mineradio 2.0.2 (4abaa19), GPL-3.0-only. */
/* Upstream: https://github.com/XxHuberrr/Mineradio/blob/4abaa190de42c632365ae4244e041bad16443224/public/js/modules/04-shelf/01-manager-core.js */
/* Modified for PULSE ROOM on 2026-07-30. */

// Kept local to the retained 3D shelf: the upstream desktop-power module is
// not part of this runtime, but card activation still needs a short visual
// pulse when a track is chosen.
function pulseObjectValue(target, key, amount, duration) {
  if (!target) return;
  target[key] = Math.max(target[key] || 0, amount || 1);
  if (window.gsap) {
    window.gsap.killTweensOf(target, key);
    var vars = { duration: duration || 0.42, ease: 'power3.out' };
    vars[key] = 0;
    window.gsap.to(target, vars);
  } else {
    setTimeout(function () { if (target) target[key] = 0; }, (duration || 0.42) * 1000);
  }
}
function makeShelfManager() {
  var group = null;
  var cards = [];          // [{canvas, ctx, texture, mesh, item, index, slot}]
  var allItems = [];
  var renderedStart = -1;
  var SHELF_VISIBLE_RADIUS = 5;
  var SHELF_MAX_RENDER = SHELF_VISIBLE_RADIUS * 2 + 1;
  var mode = 'side';
  var lastSig = '';
  var lastUpdate = 0;
  var lastCardRedrawAt = -10;
  var lastCardPulseBucket = -1;
  var cardBuildQueue = null;
  var selectedIdx = -1;
  var selectedTrackId = window.PulseRuntime && PulseRuntime.selection
    ? PulseRuntime.selection.selectedId
    : '';
  var coverBindResumeUntil = -10;
  var lastBuildError = '';
  var fileShelfOverlay = null;

  function fileShelfIsActive() {
    return false;
  }

  function renderFileShelfOverlay() {
    if (!fileShelfIsActive() || typeof document === 'undefined' || !document.body) return;
    if (!fileShelfOverlay) {
      fileShelfOverlay = document.createElement('aside');
      fileShelfOverlay.id = 'pulse-file-shelf-fallback';
      fileShelfOverlay.setAttribute('aria-label', '本地专辑货架');
      fileShelfOverlay.style.cssText = 'position:fixed;top:14vh;right:2.4vw;width:min(330px,30vw);display:flex;flex-direction:column;gap:10px;padding:12px;border:1px solid rgba(255,255,255,.16);border-radius:22px;background:rgba(5,7,9,.78);box-shadow:0 22px 70px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.08);backdrop-filter:blur(18px);z-index:80;pointer-events:auto;transition:opacity .28s ease,transform .28s ease;';
      document.body.appendChild(fileShelfOverlay);
    }
    var hidden = document.body.classList.contains('splash-active');
    fileShelfOverlay.style.opacity = hidden ? '0' : '1';
    fileShelfOverlay.style.transform = hidden ? 'translate3d(24px,0,0)' : 'translate3d(0,0,0)';
    fileShelfOverlay.innerHTML = '';
    allItems.forEach(function (item, index) {
      var selected = item.trackId === selectedTrackId;
      var button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', '播放 ' + item.title);
      button.style.cssText = 'display:flex;align-items:center;gap:12px;width:100%;padding:9px;border:1px solid ' + (selected ? 'rgba(220,255,57,.74)' : 'rgba(255,255,255,.13)') + ';border-radius:16px;background:' + (selected ? 'rgba(220,255,57,.12)' : 'rgba(255,255,255,.045)') + ';color:#f4f7f1;text-align:left;cursor:pointer;font:600 13px/1.25 Inter,Arial,sans-serif;';
      var coverPalette = shelfCoverPalette(item.trackId);
      var coverWrap = document.createElement('span');
      coverWrap.style.cssText = 'position:relative;width:58px;height:58px;flex:none;overflow:hidden;border-radius:12px;background:linear-gradient(135deg,' + coverPalette.primary + ' 0%,' + coverPalette.secondary + ' 58%,' + coverPalette.contrast + ' 100%);box-shadow:0 0 0 1px rgba(255,255,255,.18),0 8px 18px rgba(0,0,0,.28);';
      var image = document.createElement('img');
      image.alt = '';
      image.src = item.cover || '';
      image.style.cssText = 'width:100%;height:100%;display:block;object-fit:cover;filter:brightness(1.42) saturate(1.35) contrast(1.14);mix-blend-mode:screen;opacity:.84;';
      coverWrap.appendChild(image);
      var copy = document.createElement('span');
      copy.style.cssText = 'min-width:0;display:flex;flex-direction:column;gap:4px;';
      var title = document.createElement('strong');
      title.textContent = item.title || 'UNTITLED';
      title.style.cssText = 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px;';
      var sub = document.createElement('small');
      sub.textContent = item.sub || ('ARCHIVE ' + String(index + 1).padStart(2, '0'));
      sub.style.cssText = 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:rgba(244,247,241,.55);font-size:11px;font-weight:500;';
      copy.appendChild(title); copy.appendChild(sub);
      button.appendChild(coverWrap); button.appendChild(copy);
      button.addEventListener('click', function () {
        if (typeof selectPulseTrack === 'function') selectPulseTrack(item.trackId, { origin: 'file-shelf', userInitiated: true });
      });
      fileShelfOverlay.appendChild(button);
    });
  }

  // v7.2 PSP 风格状态
  var centerIdx = 0;          // 当前居中卡片 index (在 items 数组中的位置)
  var centerTarget = 0;       // 目标 centerIdx (插值)
  var centerSmooth = 0;       // 当前实际 centerIdx 平滑值
  var connectorParticles = null;

  // v7.2 PSP shelf layout state (kept explicit so the manager never leaks
  // implicit globals when the source is bundled in strict mode).
  var centerIdx = 0;
  var centerTarget = 0;
  var centerSmooth = 0;
  var connectorParticles = null;

  function currentItems() {
    var tracks = playQueue && playQueue.length ? playQueue : pulseCatalogTracks();
    return tracks.map(function (track, idx) {
      var local = track && (track.local === true || track.type === 'local' || track.file);
      var artist = track.artist || track.composer || (local ? 'LOCAL FILE' : 'PULSE ROOM');
      var album = track.album && track.album !== artist ? track.album : '';
      return {
        type: 'pulseTrack',
        trackId: track.id,
        title: track.title || track.name || 'UNTITLED',
        sub: album ? artist + ' / ' + album : artist,
        cover: typeof songCoverSrc === 'function' ? songCoverSrc(track, 512) : (track.cover || ''),
        tag: String(track.id) === selectedTrackId
          ? 'NOW PLAYING'
          : ((local ? 'LOCAL ' : 'ARCHIVE ') + String(idx + 1).padStart(2, '0')),
        catalogIndex: pulseCatalogIndex(track.id),
        queueIndex: idx,
        local: !!local
      };
    });
  }

  function makeRoundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
    var chars = String(text || '').split('');
    var line = '', lines = [];
    for (var i = 0; i < chars.length; i++) {
      var test = line + chars[i];
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line); line = chars[i];
        if (lines.length >= maxLines - 1) break;
      } else line = test;
    }
    if (line && lines.length < maxLines) lines.push(line);
    for (var j = 0; j < lines.length; j++) ctx.fillText(lines[j], x, y + j * lineHeight);
  }
  function shelfHexRgba(hex, alpha) {
    var value = String(hex || '').replace('#', '');
    if (value.length === 3) value = value.split('').map(function (part) { return part + part; }).join('');
    if (!/^[0-9a-f]{6}$/i.test(value)) value = '159b80';
    var red = parseInt(value.slice(0, 2), 16);
    var green = parseInt(value.slice(2, 4), 16);
    var blue = parseInt(value.slice(4, 6), 16);
    return 'rgba(' + red + ',' + green + ',' + blue + ',' + Math.max(0, Math.min(1, Number(alpha) || 0)) + ')';
  }
  function shelfCoverPalette(trackId) {
    var fallback = { primary: '#159b80', secondary: '#4d55c7', contrast: '#b8f36c' };
    if (typeof musicSpacePaletteFallback === 'function') {
      try {
        var palette = musicSpacePaletteFallback(trackId);
        if (palette && palette.primary && palette.secondary && palette.contrast) return palette;
      } catch (error) { /* keep the deterministic shelf fallback */ }
    }
    return fallback;
  }
  function cardDrawSignature(card, item) {
    item = item || {};
    var rec = item.cover ? pulseShelfCoverCache[item.cover] : null;
    var coverState = item.cover ? (rec && rec.loaded ? 'ready' : (rec && rec.failed ? 'fail' : 'wait')) : 'none';
    var pulseBucket = card && card.isCenter ? Math.round((bass + beatPulse * 0.85) * 6) : 0;
    return [
      item.type || '', item.title || '', item.sub || '', item.tag || '',
      item.trackId || '', item.catalogIndex == null ? '' : item.catalogIndex, item.queueIndex == null ? '' : item.queueIndex,
      item.cover || '', coverState, card && card.isCenter ? 1 : 0, card && card.selected ? 1 : 0,
      card && card.dofBucket == null ? -1 : card.dofBucket, pulseBucket, shelfAccentHex(), shelfSettings().bgOpacity
    ].join('|');
  }

  function drawCard(card, item) {
    item = item || card.item || {};
    var nextDrawKey = cardDrawSignature(card, item);
    if (card.drawKey === nextDrawKey) return;
    card.drawKey = nextDrawKey;
    var cv = card.canvas, ctx = card.ctx;
    var W = cv.width, H = cv.height;
    ctx.clearRect(0, 0, W, H);
    var pad = 18;
    var isNow = item.type === 'pulseTrack' && item.trackId === selectedTrackId;
    var shelfLook = shelfSettings();

    // 卡片底
    makeRoundRect(ctx, pad, pad, W - pad * 2, H - pad * 2, 32);
    ctx.fillStyle = 'rgba(0,0,0,' + shelfLook.bgOpacity.toFixed(3) + ')'; ctx.fill();
    var grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, 'rgba(255,255,255,0.10)');
    grad.addColorStop(1, 'rgba(255,255,255,0.018)');
    ctx.fillStyle = grad; ctx.fill();

    if (isNow) {
      ctx.strokeStyle = shelfAccentRgba(0.72);
      ctx.lineWidth = 1.8 + Math.sin(uniforms.uTime.value * 3) * 0.28 + bass * 1.2;
    } else {
      ctx.strokeStyle = 'rgba(255,255,255,0.14)';
      ctx.lineWidth = 1.1;
    }
    ctx.stroke();

    if (card.selected) {
      ctx.save();
      makeRoundRect(ctx, pad + 2, pad + 2, W - pad * 2 - 4, H - pad * 2 - 4, 30);
      ctx.shadowColor = shelfAccentRgba(0.58);
      ctx.shadowBlur = 18;
      ctx.strokeStyle = shelfAccentRgba(0.72);
      ctx.lineWidth = 2.2;
      ctx.stroke();
      ctx.restore();
    }

    // 大封面方块
    var coverSize = H - pad * 2 - 8;
    var cx = pad + 6, cy = pad + 4;
    var coverPalette = shelfCoverPalette(item.trackId);
    makeRoundRect(ctx, cx, cy, coverSize, coverSize, 26);
    var coverBase = ctx.createLinearGradient(cx, cy, cx + coverSize, cy + coverSize);
    coverBase.addColorStop(0, shelfHexRgba(coverPalette.primary, 0.64));
    coverBase.addColorStop(0.56, shelfHexRgba(coverPalette.secondary, 0.46));
    coverBase.addColorStop(1, shelfHexRgba(coverPalette.contrast, 0.28));
    ctx.fillStyle = coverBase; ctx.fill();
    var isFileProtocol = typeof location !== 'undefined' && location.protocol === 'file:';
    if (item.cover) {
      var rec = pulseShelfCoverCache[item.cover];
      if (!isFileProtocol && rec && rec.loaded && rec.image) {
        ctx.save(); makeRoundRect(ctx, cx, cy, coverSize, coverSize, 26); ctx.clip();
        ctx.filter = 'brightness(1.55) saturate(1.35) contrast(1.18)';
        ctx.drawImage(rec.image, cx, cy, coverSize, coverSize); ctx.restore();
        ctx.filter = 'none';
      } else if (!rec || (!rec.loading && !rec.failed)) {
        requestPulseShelfCover(item.cover, function () { drawCard(card, item); });
      }
    }
    ctx.save();
    makeRoundRect(ctx, cx, cy, coverSize, coverSize, 26); ctx.clip();
    var coverTint = ctx.createLinearGradient(cx, cy, cx + coverSize, cy + coverSize);
    coverTint.addColorStop(0, shelfHexRgba(coverPalette.primary, 0.58));
    coverTint.addColorStop(0.52, shelfHexRgba(coverPalette.secondary, 0.32));
    coverTint.addColorStop(1, shelfHexRgba(coverPalette.contrast, 0.24));
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = coverTint;
    ctx.fillRect(cx, cy, coverSize, coverSize);
    ctx.globalCompositeOperation = 'source-over';
    var coverGlow = ctx.createRadialGradient(cx + coverSize * 0.26, cy + coverSize * 0.20, 0, cx + coverSize * 0.26, cy + coverSize * 0.20, coverSize * 0.82);
    coverGlow.addColorStop(0, shelfHexRgba(coverPalette.contrast, 0.28));
    coverGlow.addColorStop(1, shelfHexRgba(coverPalette.primary, 0));
    ctx.fillStyle = coverGlow;
    ctx.fillRect(cx, cy, coverSize, coverSize);
    ctx.globalCompositeOperation = 'screen';
    ctx.strokeStyle = shelfHexRgba(coverPalette.contrast, 0.46);
    ctx.lineWidth = Math.max(1.4, coverSize * 0.012);
    for (var coverWave = 0; coverWave < 4; coverWave += 1) {
      var waveY = cy + coverSize * (0.26 + coverWave * 0.16);
      ctx.beginPath();
      ctx.moveTo(cx - coverSize * 0.08, waveY);
      ctx.quadraticCurveTo(cx + coverSize * 0.28, waveY - coverSize * 0.12, cx + coverSize * 0.56, waveY + coverSize * 0.035);
      ctx.quadraticCurveTo(cx + coverSize * 0.80, waveY + coverSize * 0.12, cx + coverSize * 1.08, waveY - coverSize * 0.035);
      ctx.stroke();
    }
    ctx.fillStyle = shelfHexRgba(coverPalette.contrast, 0.80);
    ctx.font = '800 ' + Math.max(20, Math.round(coverSize * 0.16)) + 'px Inter, Arial';
    ctx.fillText(String(Number(item.queueIndex) + 1).padStart(2, '0'), cx + coverSize * 0.08, cy + coverSize * 0.88);
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
    makeRoundRect(ctx, cx, cy, coverSize, coverSize, 26);
    ctx.strokeStyle = shelfHexRgba(coverPalette.contrast, isNow ? 0.74 : 0.42);
    ctx.lineWidth = isNow ? 2.2 : 1.2;
    ctx.stroke();

    // 文本区
    var tx = pad + coverSize + 32;
    ctx.font = '700 17px Inter, Arial';
    ctx.fillStyle = isNow ? shelfAccentRgba(0.92) : 'rgba(255,255,255,0.92)';
    ctx.fillText(item.tag || '', tx, pad + 36);

    ctx.font = '700 30px Inter, Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.96)';
    wrapText(ctx, item.title || '', tx, pad + 78, W - tx - pad - 14, 36, 2);

    ctx.font = '400 17px Inter, Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.52)';
    wrapText(ctx, item.sub || '', tx, pad + 156, W - tx - pad - 14, 24, 2);

    // 律动进度条
    ctx.strokeStyle = isNow ? shelfAccentRgba(0.90) : 'rgba(255,255,255,0.30)';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(tx, H - pad - 22);
    ctx.lineTo(tx + Math.min(260, 80 + bass * 320), H - pad - 22);
    ctx.stroke();

    if (card.isCenter) {
      var actionY = H - pad - 78;
      if (item.type === 'pulseTrack') {
        makeRoundRect(ctx, tx, actionY, 184, 38, 18);
        var playGrad = ctx.createLinearGradient(tx, actionY, tx + 184, actionY + 38);
        playGrad.addColorStop(0, 'rgba(255,255,255,0.88)');
        playGrad.addColorStop(0.55, shelfAccentRgba(0.94));
        playGrad.addColorStop(1, shelfAccentRgba(0.58));
        ctx.fillStyle = playGrad; ctx.fill();
        ctx.strokeStyle = shelfAccentRgba(0.44);
        ctx.lineWidth = 1.1; ctx.stroke();
        ctx.font = '800 14px Inter, "Microsoft YaHei", Arial';
        ctx.fillStyle = readableInkForHex(shelfAccentHex());
        ctx.fillText(isNow ? '● NOW PLAYING' : '▶ PLAY RECORD', tx + 22, actionY + 24);
      }
    }

    var dof = card.dofBlur || 0;
    if (dof > 0.12) {
      makeRoundRect(ctx, pad, pad, W - pad * 2, H - pad * 2, 32);
      ctx.fillStyle = 'rgba(0,0,0,' + Math.min(0.28, dof * 0.18).toFixed(3) + ')';
      ctx.fill();
    }

    card.texture.needsUpdate = true;
  }

  function buildOneCard(item, i) {
    var cv = document.createElement('canvas');
    cv.width = 720; cv.height = 360;
    var ctx = cv.getContext('2d');
    var tx = new THREE.CanvasTexture(cv);
    tx.minFilter = THREE.LinearFilter; tx.magFilter = THREE.LinearFilter;
    tx.generateMipmaps = false;
    var mat = new THREE.MeshBasicMaterial({ map: tx, transparent: true, opacity: 0.96, depthWrite: false, depthTest: false, side: THREE.DoubleSide });
    var geo = new THREE.PlaneGeometry(2.05, 1.025, 1, 1);
    var mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = 50 + i;
    mesh.userData.action = item.type === 'pulseTrack' || item.trackId
      ? { kind: 'selectPulseTrack', trackId: item.trackId }
      : { kind: 'empty' };
    group.add(mesh);
    var card = { canvas: cv, ctx: ctx, texture: tx, mesh: mesh, item: item, index: i, isCenter: false, selected: i === selectedIdx, floatMix: 0, fxPulse: 0, dofBlur: 0, dofBucket: -1, drawKey: '' };
    return card;
  }

  function shelfCardAction(item) {
    return item.type === 'pulseTrack' || item.trackId
      ? { kind: 'selectPulseTrack', trackId: item.trackId }
      : { kind: 'empty' };
  }

  function rebindShelfCard(card, item, index) {
    card.item = item;
    card.index = index;
    card.selected = index === selectedIdx;
    card.isCenter = Math.abs(index - centerSmooth) < 0.5;
    card.drawKey = '';
    card.mesh.userData.action = shelfCardAction(item);
    card.mesh.renderOrder = 50 + index;
    drawCard(card, item);
    return card;
  }

  function disposeShelfCard(card) {
    if (!card) return;
    if (card.mesh && card.mesh.parent) card.mesh.parent.remove(card.mesh);
    if (card.mesh && card.mesh.material) {
      if (card.mesh.material.map) card.mesh.material.map.dispose();
      card.mesh.material.dispose();
    }
    if (card.mesh && card.mesh.geometry) card.mesh.geometry.dispose();
  }

  function warmTextureUpload(tex) {
    if (!tex || !renderer || typeof renderer.initTexture !== 'function') return;
    try { renderer.initTexture(tex); } catch (e) {
      lastBuildError = 'texture: ' + String(e && (e.message || e.name) || e);
    }
  }

  function cancelCardBuildQueue() {
    if (!cardBuildQueue) return;
    cardBuildQueue.cancelled = true;
    if (cardBuildQueue.raf) cancelAnimationFrame(cardBuildQueue.raf);
    cardBuildQueue = null;
  }

  function disposeRenderedCards() {
    cancelCardBuildQueue();
    cards.forEach(disposeShelfCard);
    cards = [];
    renderedStart = -1;
  }

  function scheduleQueuedCardBuild(job) {
    function step(deadline) {
      if (!job || job.cancelled || cardBuildQueue !== job || !group) return;
      var started = performance.now();
      var built = 0;
      while (job.next <= job.end && built < 2 && performance.now() - started < 7) {
        var card = buildOneCard(allItems[job.next], job.next);
        try {
          drawCard(card, card.item);
        } catch (error) {
          lastBuildError = String(error && (error.stack || error.message) || error);
          disposeShelfCard(card);
          cardBuildQueue = null;
          return;
        }
        cards.push(card);
        warmTextureUpload(card.texture);
        job.next += 1;
        built += 1;
      }
      if (job.next <= job.end) {
        if (window.requestIdleCallback) {
          requestIdleCallback(step, { timeout: 180 });
        } else {
          job.raf = requestAnimationFrame(step);
        }
      } else {
        cardBuildQueue = null;
      }
    }
    if (window.requestIdleCallback) requestIdleCallback(step, { timeout: 180 });
    else job.raf = requestAnimationFrame(step);
  }

  function syncRenderedWindow(force, asyncBuild) {
    if (!group) return;
    var total = allItems.length;
    if (!total) { disposeRenderedCards(); return; }
    var center = Math.round(centerTarget);
    var start = Math.max(0, center - SHELF_VISIBLE_RADIUS);
    var end = Math.min(total - 1, start + SHELF_MAX_RENDER - 1);
    start = Math.max(0, end - SHELF_MAX_RENDER + 1);
    if (!force && start === renderedStart && cards.length === (end - start + 1)) {
      cards.forEach(function (c) {
        var nextItem = allItems[c.index] || c.item;
        if (c.item !== nextItem) {
          c.item = nextItem;
          c.drawKey = '';
          drawCard(c, c.item);
        }
      });
      return;
    }
    cancelCardBuildQueue();
    renderedStart = start;
    if (asyncBuild && !cards.length) {
      cardBuildQueue = { start: start, end: end, next: start, cancelled: false, raf: 0 };
      scheduleQueuedCardBuild(cardBuildQueue);
      return;
    }
    var existingByIndex = Object.create(null);
    cards.forEach(function (card) { existingByIndex[card.index] = card; });
    var reusable = cards.filter(function (card) { return card.index < start || card.index > end; });
    var nextCards = [];
    for (var itemIdx = start; itemIdx <= end; itemIdx++) {
      var card = existingByIndex[itemIdx] || reusable.shift();
      var cardWasCreated = !card;
      if (cardWasCreated) card = buildOneCard(allItems[itemIdx], itemIdx);
      try {
        if (!cardWasCreated) rebindShelfCard(card, allItems[itemIdx], itemIdx);
        if (!card.drawKey) drawCard(card, card.item);
      } catch (error) {
        lastBuildError = String(error && (error.stack || error.message) || error);
        if (cardWasCreated) disposeShelfCard(card);
        break;
      }
      nextCards.push(card);
    }
    reusable.forEach(disposeShelfCard);
    cards = nextCards;
  }

  function rebuild(asyncCards) {
    if (!group) return;
    cancelCardBuildQueue();
    if (connectorParticles) {
      if (connectorParticles.parent) connectorParticles.parent.remove(connectorParticles);
      if (connectorParticles.geometry) connectorParticles.geometry.dispose();
      if (connectorParticles.material) connectorParticles.material.dispose();
      connectorParticles = null;
    }
    allItems = currentItems();
    lastSig = sig(allItems);
    lastCardRedrawAt = -10;
    lastCardPulseBucket = -1;
    var catalogIndex = allItems.findIndex(function (item) { return item.trackId === selectedTrackId; });
    if (catalogIndex >= 0) {
      centerTarget = catalogIndex;
      centerSmooth = centerTarget;
      centerIdx = centerTarget;
    } else if (centerTarget >= allItems.length) {
      centerTarget = Math.max(0, allItems.length - 1);
      centerSmooth = centerTarget;
    }
    if (selectedIdx >= allItems.length) selectedIdx = -1;
    syncRenderedWindow(true, !!asyncCards);
    if (mode === 'stage') {
      createStageExtras();
    }
  }

  // ====================================================
  //  PSP 弧形布局: 以 centerSmooth 为基准, 卡片绕弧排列
  //  i 距离 center 越远 → 越靠后, 越小, 越淡
  // ====================================================
  function placeCard(card, i, totalCards, modeIs) {
    var delta = card.index - centerSmooth;     // 正=下方, 负=上方
    var absD = Math.abs(delta);
    // 隐藏太远的卡 (>4 全隐藏)
    if (absD > SHELF_VISIBLE_RADIUS + 0.5) { card.mesh.visible = false; return; }
    card.mesh.visible = true;
    card.mesh.renderOrder = 60 + Math.round((SHELF_VISIBLE_RADIUS + 1 - Math.min(absD, SHELF_VISIBLE_RADIUS + 1)) * 10);
    var parX = pointerParallax.x || 0;
    var parY = pointerParallax.y || 0;
    var parWeight = Math.max(0, 1 - absD * 0.16);
    var pulse = card.fxPulse || 0;
    var layout = shelfLayoutProfile();
    var shelfLook = shelfSettings();
    var summon = shelfSummonSettings();
    var nextDof = Math.max(0, Math.min(1, (absD - 0.45) / 3.2));
    var nextDofBucket = Math.round(nextDof * 5);
    if (card.dofBucket !== nextDofBucket) {
      card.dofBucket = nextDofBucket;
      card.dofBlur = nextDof;
      drawCard(card, card.item);
    }

    if (modeIs === 'side') {
      // 右侧 3D 架: 恢复更靠近、更斜切的打开姿态，让卡片有真正的前后层次。
      var detailOpenSide = false;
      var nowT = uniforms.uTime.value;
      var hoverBreath = (!shelfPinnedOpen && !detailOpenSide) ? shelfVisibility : 0;
      var passiveAlways = shelfAlwaysVisible() && !shelfPinnedOpen && !detailOpenSide;
      var liftTarget = card.selected && !detailOpenSide ? 1 : 0;
      var liftRate = liftTarget > (card.floatMix || 0) ? 0.20 : 0.13;
      card.floatMix = (card.floatMix || 0) + (liftTarget - (card.floatMix || 0)) * liftRate;
      if (!liftTarget && card.floatMix < 0.004) card.floatMix = 0;
      var lift = card.floatMix || 0;
      var sideLayer = Math.max(0, SHELF_VISIBLE_RADIUS + 1 - Math.min(absD, SHELF_VISIBLE_RADIUS + 1));
      card.mesh.renderOrder = passiveAlways
        ? (30 + Math.round(sideLayer * 1.1) + Math.round(lift * 96))
        : (60 + Math.round(sideLayer * 10) + Math.round(lift * 70));
      var breathPulse = hoverBreath * (0.5 + 0.5 * Math.sin(nowT * 1.22 + card.index * 0.74));
      var revealRaw = Math.max(0, Math.min(1, (nowT - shelfOpenAnimAt - absD * 0.035 * summon.stagger) / summon.openDuration));
      var reveal = revealRaw * revealRaw * (3 - 2 * revealRaw);
      var entry = (1 - reveal) * (0.82 + absD * 0.075 * summon.stagger) * summon.slide;
      var paneEase = 0;
      var wallpaperShelfPose = shouldUseWallpaperSafeShelfCamera();
      var compactShelfPose = shouldUseCompactShelfCamera();
      var safeShelfPose = wallpaperShelfPose || compactShelfPose;
      var px = layout.sideX + absD * layout.sideXStep - (detailOpenSide ? layout.sideDetailShift : 0) + entry * layout.sideEntryX;
      var py = (layout.sideY || 0) - delta * layout.sideYStep + (1 - reveal) * (delta < 0 ? -0.18 : 0.18) * summon.slide;
      var pz = layout.sideZ - absD * layout.sideZStep - (1 - reveal) * 0.20 * summon.slide;
      px += parX * 0.060 * parWeight * summon.parallax;
      py += parY * 0.046 * parWeight * summon.parallax;
      pz += (parY * 0.026 - parX * 0.028) * parWeight * summon.parallax;
      py += Math.sin(nowT * 0.92 + card.index * 0.64) * 0.052 * hoverBreath * Math.max(0.20, parWeight);
      pz += Math.cos(nowT * 0.78 + card.index * 0.52) * 0.030 * hoverBreath * parWeight;
      if (lift > 0.001) {
        px -= lift * (compactShelfPose ? 0.035 : (layout.portrait ? 0.065 : 0.145));
        py += lift * (compactShelfPose ? 0.045 : (layout.portrait ? 0.075 : 0.105));
        pz += lift * (compactShelfPose ? 0.080 : 0.220);
      }
      var revealScale = 1 - (1 - reveal) * 0.12 * summon.scale;
      var scale = (absD < 0.5 ? 1.12 : Math.max(0.55, 1.04 - absD * 0.14)) * revealScale * (1 + pulse * 0.056 + breathPulse * 0.026 + lift * (compactShelfPose ? 0.045 : 0.075)) * layout.sideScale;
      if (wallpaperShelfPose) scale *= 1.22;
      else if (compactShelfPose) scale *= 1.04;
      card.mesh.position.set(px, py, pz);
      if (compactShelfPose && camera) {
        card.mesh.quaternion.copy(camera.quaternion);
        card.mesh.rotateX(layout.sideRotX - delta * 0.008 - parY * 0.004 * parWeight * summon.parallax);
        card.mesh.rotateY(layout.sideRotY + (1 - reveal) * 0.012 * summon.slide + parX * 0.006 * parWeight * summon.parallax);
      } else {
        var safeRotY = wallpaperShelfPose ? 0.12 : layout.sideRotY;
        var safeEntryRotY = wallpaperShelfPose ? 0.05 : 0.16;
        card.mesh.rotation.y = (safeShelfPose ? safeRotY : layout.sideRotY) + (1 - reveal) * safeEntryRotY * summon.slide + parX * (safeShelfPose ? 0.014 : 0.038) * parWeight * summon.parallax;
        var safeRotX = wallpaperShelfPose ? 0.020 : layout.sideRotX;
        card.mesh.rotation.x = -delta * (safeShelfPose ? safeRotX : layout.sideRotX) - parY * (safeShelfPose ? 0.010 : 0.024) * parWeight * summon.parallax;
      }
      card.mesh.scale.setScalar(scale);
      var opacity = absD < 0.5 ? 1.0 : Math.max(0.22, 1.0 - absD * 0.30);
      if (passiveAlways) opacity *= 0.92 + lift * 0.08;
      card.mesh.material.color.setScalar(passiveAlways ? (0.96 + lift * 0.04) : 1);
      // v8: 自动隐藏 — shelf 不在 focus 区时整体淡化
      card.mesh.material.opacity = Math.min(1, opacity * (shelfVisibility != null ? shelfVisibility : 1) * reveal * (1 - paneEase * 0.24) + pulse * 0.10 * reveal + breathPulse * 0.035) * shelfLook.opacity;
      setCardCenter(card, absD < 0.5);
    } else {
      // 舞台 PSP: 水平展开 + center 突出, dock 在底部
      var pxStage = (layout.stageX || 0) + delta * layout.stageXStep;
      var pyStage = layout.stageY;
      var pzStage = absD < 0.5 ? layout.stageZ : (layout.stageZ - Math.min(2.0, absD) * 0.55);
      var paneEaseS = 0;
      pxStage += parX * 0.110 * parWeight;
      pyStage += parY * 0.060 * parWeight;
      pzStage += (parY * 0.040 - parX * 0.035) * parWeight;
      var scaleS = (absD < 0.5 ? 1.20 : Math.max(0.45, 1.0 - absD * 0.22)) * (1 + pulse * 0.060) * layout.stageScale;
      card.mesh.position.set(pxStage, pyStage, pzStage);
      card.mesh.rotation.y = -delta * 0.22 + parX * 0.050 * parWeight;
      card.mesh.rotation.x = 0.10 - absD * 0.04 - parY * 0.028 * parWeight;
      card.mesh.scale.setScalar(scaleS);
      var opS = absD < 0.5 ? 1.0 : Math.max(0.18, 1.0 - absD * 0.32);
      card.mesh.material.color.setScalar(1);
      card.mesh.material.opacity = Math.min(1, opS * (shelfVisibility != null ? shelfVisibility : 1) * (1 - paneEaseS * 0.24) + pulse * 0.10) * shelfLook.opacity;
      setCardCenter(card, absD < 0.5);
    }
  }

  function setCardCenter(card, isCenter) {
    if (card.isCenter !== isCenter) {
      card.isCenter = isCenter;
      drawCard(card, card.item);
    } else {
      card.isCenter = isCenter;
    }
  }

  function pulseCard(card, amount) {
    if (!card) return;
    pulseObjectValue(card, 'fxPulse', amount || 1, 0.46);
  }

  function createStageExtras() {
    if (!group) return;
    var pcount = 80;
    var pgeo = new THREE.BufferGeometry();
    var ppos = new Float32Array(pcount * 3);
    var pcol = new Float32Array(pcount * 3);
    var prnd = new Float32Array(pcount);
    for (var i = 0; i < pcount; i++) {
      ppos[i * 3] = (Math.random() - 0.5) * 6;
      ppos[i * 3 + 1] = (Math.random() - 0.5) * 1.2 + 0.3;
      ppos[i * 3 + 2] = 1.0 + Math.random() * 1.5;
      pcol[i * 3] = 0.56; pcol[i * 3 + 1] = 0.91; pcol[i * 3 + 2] = 1.0;
      prnd[i] = Math.random();
    }
    pgeo.setAttribute('position', new THREE.BufferAttribute(ppos, 3));
    pgeo.setAttribute('aColor', new THREE.BufferAttribute(pcol, 3));
    pgeo.setAttribute('aRand', new THREE.BufferAttribute(prnd, 1));
    var pmat = new THREE.ShaderMaterial({
      uniforms: { uTime: uniforms.uTime, uPixel: uniforms.uPixel, uDotTex: uniforms.uDotTex },
      vertexShader: `precision highp float; uniform float uTime, uPixel; attribute vec3 aColor; attribute float aRand;
varying vec3 vC; varying float vA;
void main(){
  vec3 p = position;
  p.x += sin(uTime * 0.4 + aRand * 6.0) * 1.5;
  p.y += sin(uTime * 0.6 + aRand * 4.0) * 0.2;
  p.z += cos(uTime * 0.5 + aRand * 5.0) * 0.4;
  vC = aColor; vA = 0.4 + 0.4 * sin(uTime * 1.5 + aRand * 7.0);
  vec4 m = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = 4.0 * uPixel;
  gl_Position = projectionMatrix * m;
}`,
      fragmentShader: `precision highp float; uniform sampler2D uDotTex;
varying vec3 vC; varying float vA;
void main(){ vec4 t = texture2D(uDotTex, gl_PointCoord); if (t.a < 0.02) discard; gl_FragColor = vec4(vC, t.a * vA); }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    connectorParticles = new THREE.Points(pgeo, pmat);
    connectorParticles.frustumCulled = false;
    connectorParticles.renderOrder = 49;
    connectorParticles.position.set(0, -2.2, 0);
    if (group.parent) group.parent.add(connectorParticles); else scene.add(connectorParticles);
  }

  function sig(items) {
    items = items || currentItems();
    return [
      'pulse-catalog',
      selectedTrackId,
      items.map(function (item) {
        return [item.trackId, item.title].join('|');
      }).join('||')
    ].join('::');
  }

  function applySelectedIndex(idx) {
    idx = idx == null || idx < 0 ? -1 : Math.round(idx);
    selectedIdx = idx;
    cards.forEach(function (c) {
      var next = c.index === selectedIdx;
      if (c.selected !== next) {
        c.selected = next;
        drawCard(c, c.item);
      }
    });
  }
  function step(direction) {
    if (!allItems.length) return;
    var prevTarget = Math.round(centerTarget);
    centerTarget = Math.max(0, Math.min(allItems.length - 1, centerTarget + direction));
    var nextTarget = Math.round(centerTarget);
    syncRenderedWindow(false);
    applySelectedIndex(nextTarget);
    if (nextTarget !== prevTarget) playShelfSelectTick(direction, 'card');
    pulseCard(cards.find(function (c) { return c.index === nextTarget; }), 0.55);
  }

  function screenHitCard(card, sx, sy, pad) {
    if (!card || !card.mesh || !card.mesh.visible || !group || !group.visible) return null;
    var params = card.mesh.geometry && card.mesh.geometry.parameters || {};
    var hw = (params.width || 1.7) / 2;
    var hh = (params.height || 0.85) / 2;
    var pts = [
      new THREE.Vector3(-hw, -hh, 0),
      new THREE.Vector3(hw, -hh, 0),
      new THREE.Vector3(hw, hh, 0),
      new THREE.Vector3(-hw, hh, 0),
    ];
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    card.mesh.updateMatrixWorld(true);
    for (var i = 0; i < pts.length; i++) {
      pts[i].applyMatrix4(card.mesh.matrixWorld).project(camera);
      var x = (pts[i].x + 1) * innerWidth / 2;
      var y = (1 - pts[i].y) * innerHeight / 2;
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    }
    pad = pad == null ? 28 : pad;
    if (sx < minX - pad || sx > maxX + pad || sy < minY - pad || sy > maxY + pad) return null;
    var u = clampRange((sx - minX) / Math.max(1, maxX - minX), 0, 1);
    var v = 1 - clampRange((sy - minY) / Math.max(1, maxY - minY), 0, 1);
    return { x: u, y: v };
  }

  function pickCardAtScreen(sx, sy, pad) {
    if (!cards.length || !group || !group.visible) return null;
    // Explicit clicks need a stable screen-space answer. Side cards are
    // intentionally staggered in depth, so a raycast can hit the front card
    // even when the pointer is over a neighbouring card. Prefer the exact
    // projected rectangle whose centre is closest to the pointer before using
    // the forgiving padded hit used by hover/focus.
    if (pad === 0) {
      var exactHits = [];
      cards.forEach(function (card) {
        var exactUv = screenHitCard(card, sx, sy, 0);
        if (!exactUv) return;
        var rect = cardScreenRect(card);
        if (!rect) return;
        var cx = (rect.left + rect.right) * 0.5;
        var cy = (rect.top + rect.bottom) * 0.5;
        exactHits.push({ card: card, uv: exactUv, distance: Math.hypot(sx - cx, sy - cy) });
      });
      if (exactHits.length) {
        exactHits.sort(function (a, b) { return a.distance - b.distance; });
        return { card: exactHits[0].card, uv: exactHits[0].uv, screenPick: true };
      }
    }
    var ordered = cards.slice().sort(function (a, b) { return (b.mesh.renderOrder || 0) - (a.mesh.renderOrder || 0); });
    for (var i = 0; i < ordered.length; i++) {
      var uv = screenHitCard(ordered[i], sx, sy, pad == null ? 72 : pad);
      if (uv) return { card: ordered[i], uv: uv, screenPick: true };
    }
    return null;
  }

  function cardScreenRect(card) {
    if (!card || !card.mesh || !card.mesh.visible || !camera) return null;
    var params = card.mesh.geometry && card.mesh.geometry.parameters || {};
    var halfW = (params.width || 1.7) / 2;
    var halfH = (params.height || 0.85) / 2;
    var points = [
      new THREE.Vector3(-halfW, -halfH, 0), new THREE.Vector3(halfW, -halfH, 0),
      new THREE.Vector3(halfW, halfH, 0), new THREE.Vector3(-halfW, halfH, 0)
    ];
    var rect = { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity };
    card.mesh.updateMatrixWorld(true);
    points.forEach(function (point) {
      point.applyMatrix4(card.mesh.matrixWorld).project(camera);
      var x = (point.x + 1) * innerWidth / 2;
      var y = (1 - point.y) * innerHeight / 2;
      rect.left = Math.min(rect.left, x); rect.right = Math.max(rect.right, x);
      rect.top = Math.min(rect.top, y); rect.bottom = Math.max(rect.bottom, y);
    });
    return rect;
  }

  return {
    setMode: function (m) {
      if (m === mode && group) return;
      mode = m;
      if (m === 'off') {
        if (group) { scene.remove(group); cards.forEach(function (c) { c.texture.dispose(); c.mesh.material.dispose(); c.mesh.geometry.dispose(); }); }
        if (connectorParticles) { scene.remove(connectorParticles); connectorParticles.geometry.dispose(); connectorParticles.material.dispose(); connectorParticles = null; }
        group = null; cards = [];
        return;
      }
      if (!group) {
        group = new THREE.Group();
        group.renderOrder = 50;
        scene.add(group);
      }
      var asyncCards = mode === 'side' && document.body.classList.contains('splash-active');
      rebuild(asyncCards);
    },
    getMode: function () { return mode; },
    update: function (dt) {
      if (!group) return;
      // PSP 滚动平滑
      centerSmooth += (centerTarget - centerSmooth) * 0.16;
      if (Math.abs(centerSmooth - centerTarget) < 0.001) centerSmooth = centerTarget;
      var px = pointerParallax.x, py = pointerParallax.y;
      var appRevealed = !document.body.classList.contains('splash-active');
      var cueVis = tickShelfHoverCue(dt);
      // v8: shelf 自动可见度 — 启动页期间不显示；侧栏只在右侧停留时淡入。
      var targetVis;
      if (!appRevealed) {
        targetVis = 0;
      } else if (mode === 'side') {
        var switchGuard = typeof shelfPlaybackSwitchGuardActive === 'function' && shelfPlaybackSwitchGuardActive();
        if (!allItems.length) targetVis = 0;
        else if (switchGuard && !shelfPinnedOpen) targetVis = 0;
        else targetVis = (shelfPinnedOpen || shelfAlwaysVisible()) ? 1.0 : (cueVis > 0.01 ? Math.max(0.16, cueVis * 0.88) : 0);
      } else {
        targetVis = allItems.length ? 1.0 : 0;
      }
      var summonVis = shelfSummonSettings();
      var visDuration = targetVis > shelfVisibility
        ? Math.max(0.05, summonVis.openDuration * 0.45)
        : Math.max(0.05, summonVis.closeDuration * 0.65);
      shelfVisibility += (targetVis - shelfVisibility) * durationEaseFactor(visDuration, dt);
      if (shelfVisibility < 0.01 && targetVis === 0) shelfVisibility = 0;
      group.visible = appRevealed && (mode !== 'side' || shelfVisibility > 0) && allItems.length > 0;
      if (connectorParticles) connectorParticles.visible = group.visible && mode === 'stage';
      if (mode === 'side') {
        var passiveAlwaysGroup = shelfAlwaysVisible() && !shelfPinnedOpen;
        var liftedCardActive = passiveAlwaysGroup && cards.some(function (c) { return c.selected || (c.floatMix || 0) > 0.025; });
        group.renderOrder = (shelfPinnedOpen || liftedCardActive) ? 300 : 30;
        group.position.set(0, 0, 0);
        var bindToCover = (shelfAlwaysVisible() || shelfPinnedOpen || shelfVisibility > 0.06) && musicSpace && musicSpace.rotation;
        if (bindToCover) {
          var bindEase = uniforms.uTime.value < coverBindResumeUntil ? 0.18 : 0.075;
          group.rotation.x += ((musicSpace.rotation.x - py * 0.010) - group.rotation.x) * bindEase;
          group.rotation.y += ((musicSpace.rotation.y + px * 0.018) - group.rotation.y) * bindEase;
          group.rotation.z += (musicSpace.rotation.z - group.rotation.z) * bindEase;
        } else {
          group.rotation.y += ((px * 0.018) - group.rotation.y) * 0.045;
          group.rotation.x += ((-py * 0.010) - group.rotation.x) * 0.045;
          group.rotation.z += (0 - group.rotation.z) * 0.045;
        }
      } else {
        group.renderOrder = selectedIdx >= 0 ? 300 : 30;
        var t = uniforms.uTime.value;
        group.position.y = Math.sin(t * 0.3) * 0.04;
        group.position.x = px * 0.10;
        group.rotation.y = px * 0.025;
        group.rotation.x = -py * 0.012;
      }
      for (var i = 0; i < cards.length; i++) {
        placeCard(cards[i], i, cards.length, mode);
      }
      // Catalog-card updates are throttled while the soundstage is idle.
      if (uniforms.uTime.value - lastUpdate > 0.8) {
        lastUpdate = uniforms.uTime.value;
        var nextSig = sig();
        if (nextSig !== lastSig) rebuild();
        else {
          var pulseBucket = Math.round((bass + beatPulse * 0.85) * 10);
          var redrawInterval = playing ? 1.35 : 4.0;
          if (pulseBucket !== lastCardPulseBucket || uniforms.uTime.value - lastCardRedrawAt > redrawInterval) {
            lastCardPulseBucket = pulseBucket;
            lastCardRedrawAt = uniforms.uTime.value;
            cards.forEach(function (c) {
              c.item = allItems[c.index] || c.item;
              c.isCenter = Math.abs(c.index - centerSmooth) < 0.5;
              if (c.isCenter || c.dofBucket <= 1 || c.index === currentIdx) drawCard(c, c.item);
            });
          }
        }
      }
    },
    onCoverChange: function () {
      coverBindResumeUntil = uniforms && uniforms.uTime ? uniforms.uTime.value + 1.2 : coverBindResumeUntil;
      if (group && mode === 'side' && (shelfAlwaysVisible() || shelfPinnedOpen || shelfVisibility > 0.06) && musicSpace && musicSpace.rotation) {
        group.rotation.x += (musicSpace.rotation.x - group.rotation.x) * 0.28;
        group.rotation.y += (musicSpace.rotation.y - group.rotation.y) * 0.28;
        group.rotation.z += (musicSpace.rotation.z - group.rotation.z) * 0.28;
      }
      if (group && mode !== 'off' && uniforms.uTime.value - lastUpdate > 0.2) {
        lastUpdate = uniforms.uTime.value;
        rebuild();
      }
    },
    rebuild: rebuild,
    refreshTheme: function () {
      cards.forEach(function (c) {
        c.drawKey = '';
        drawCard(c, c.item);
      });
    },
    raycastCards: function (raycaster) {
      if (!group || !group.visible || !cards.length) return null;
      var visibleMeshes = cards.filter(function (c) { return c.mesh.visible; }).map(function (c) { return c.mesh; });
      var hits = raycaster.intersectObjects(visibleMeshes, false);
      if (!hits.length) return null;
      var card = cards.find(function (c) { return c.mesh === hits[0].object; });
      return { card: card, point: hits[0].point, uv: hits[0].uv };
    },
    pickCardAtScreen: pickCardAtScreen,
    // PSP 步进
    next: function () { step(1); },
    prev: function () { step(-1); },
    scrollBy: function (d) { step(d); },
    getCenterIdx: function () { return Math.round(centerSmooth); },
    getCardAt: function (idx) { return cards.find(function (c) { return c.index === idx; }); },
    getCards: function () { return cards; },
    clearSelected: function () {
      applySelectedIndex(-1);
    },
    setSelected: function (idx) {
      applySelectedIndex(idx);
    },
    triggerAction: function (action) {
      if (!action) return;
      var card = cards.find(function (c) { return c.mesh.userData.action === action; });
      pulseCard(card, action.kind === 'selectPulseTrack' ? 1.0 : 0.70);
      if (action.kind === 'selectPulseTrack') {
        selectPulseShelfTrack(action.trackId, { origin: 'shelf', userInitiated: true });
      }
    },
    // The retained centered-card gesture now selects one of four local tracks.
    openContent: function (cardIdx) {
      var card = cards.find(function (c) { return c.index === cardIdx; });
      if (!card) return;
      var action = card.mesh.userData.action;
      if (!action || action.kind !== 'selectPulseTrack') {
        var trackId = card.item && (card.item.trackId || card.item.id);
        if (!trackId) return;
        action = { kind: 'selectPulseTrack', trackId: trackId };
      }
      pulseCard(card, 1.0);
      if (action.kind === 'selectPulseTrack') {
        selectPulseShelfTrack(action.trackId, { origin: 'shelf', userInitiated: true });
      }
    },
    closeContent: function () {
      var hint = document.getElementById('hint');
      if (hint) hint.classList.toggle('shelf-hidden', shelfPinnedOpen);
      if (typeof setFocusZone === 'function') setFocusZone(shelfPinnedOpen ? 'shelf-side' : null, true);
      if (typeof updateEmptyHomeVisibility === 'function') updateEmptyHomeVisibility({ forceLoad: false });
    },
    hasOpenContent: function () { return false; },
    getContentList: function () { return null; },
    getOpenContentIndex: function () { return -1; },
    canInteract: function () { return mode !== 'off' && allItems.length > 0; },
    snapshot: function () {
      return Object.freeze({
        mode: mode,
        count: allItems.length,
        rendered: cards.length,
        selectedTrackId: selectedTrackId,
        pinned: !!shelfPinnedOpen,
        visibility: shelfVisibility,
        groupVisible: !!(group && group.visible),
        groupChildren: group && group.children ? group.children.length : 0,
        renderedStart: renderedStart,
        buildQueued: !!cardBuildQueue,
        buildError: lastBuildError,
        hover: Object.freeze({
          target: shelfHoverCue.target,
          value: shelfHoverCue.value,
          zoneActive: shelfHoverCue.zoneActive,
          guide: shelfHoverCue.guide,
          x: shelfHoverCue.x,
          y: shelfHoverCue.y,
          splash: document.body.classList.contains('splash-active'),
          visualGuide: typeof visualGuideActive !== 'undefined' && !!visualGuideActive,
          emptyHome: !!emptyHomeActive,
          homeForced: !!homeForcedOpen,
          switchGuard: shelfPlaybackSwitchGuardActive()
        }),
        cards: Object.freeze(cards.map(function (card) {
          var cover = card.item && card.item.cover || '';
          var cached = cover && pulseShelfCoverCache[cover];
          return Object.freeze({
            index: card.index,
            trackId: card.item && card.item.trackId || '',
            cover: /^data:image\//i.test(cover) ? 'inline' : cover,
            coverReady: !!(cached && cached.loaded && cached.image),
            visible: !!(card.mesh && card.mesh.visible),
            opacity: card.mesh && card.mesh.material ? Number(card.mesh.material.opacity) || 0 : 0,
            screenRect: cardScreenRect(card)
          });
        }))
      });
    },
    getSelectedTrackId: function () { return selectedTrackId; },
    setSelectedTrackId: function (trackId) {
      selectedTrackId = String(trackId || '');
      var idx = allItems.findIndex(function (item) { return item.trackId === selectedTrackId; });
      if (idx < 0) return false;
      centerTarget = idx;
      centerIdx = idx;
      applySelectedIndex(idx);
      allItems[idx].tag = 'NOW PLAYING';
      cards.forEach(function (card) {
        card.item = allItems[card.index] || card.item;
        card.drawKey = '';
        drawCard(card, card.item);
      });
      return true;
    }
  };
}
shelfManager = makeShelfManager();
window.__PULSE_ROOM_QA__ = window.__PULSE_ROOM_QA__ || {};
window.__PULSE_ROOM_QA__.selectShelfTrack = function (trackId) {
  var track = playQueue.find(function (candidate) {
    return candidate && String(candidate.id) === String(trackId);
  });
  if (!track) return false;
  shelfManager.triggerAction({ kind: 'selectPulseTrack', trackId: track.id });
  return true;
};
window.__PULSE_ROOM_QA__.shelf = function () {
  return shelfManager && shelfManager.snapshot
    ? shelfManager.snapshot()
    : Object.freeze({ mode: 'off', count: 0, rendered: 0, groupVisible: false, cards: Object.freeze([]) });
};
