(() => {
  const storageKey = "ziaver:project-transition";
  let payload;

  try {
    payload = JSON.parse(window.sessionStorage.getItem(storageKey) || "null");
    window.sessionStorage.removeItem(storageKey);
  } catch {
    payload = null;
  }

  if (!payload || !payload.image || Date.now() - Number(payload.timestamp || 0) > 6000) return;

  const style = document.createElement("style");
  style.textContent = `
    .project-entry-cover {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      overflow: hidden;
      background: #060708;
      opacity: 1;
      pointer-events: auto;
      transition: opacity 560ms cubic-bezier(.22, 1, .36, 1);
    }
    .project-entry-cover::after {
      position: absolute;
      inset: 0;
      content: "";
      background: linear-gradient(145deg, rgba(5, 8, 9, .08), rgba(5, 8, 9, .72));
    }
    .project-entry-cover__image {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: cover;
      filter: saturate(.85) brightness(.82) contrast(1.06);
      transform: scale(1.02);
      animation: project-entry-breathe 1500ms cubic-bezier(.22, 1, .36, 1) both;
    }
    .project-entry-cover__label {
      position: absolute;
      right: 5vw;
      bottom: 52px;
      left: 5vw;
      z-index: 1;
      color: #f1f1eb;
      font: 800 clamp(30px, 5vw, 76px)/.9 "Aptos Display", "Segoe UI", "Microsoft YaHei", sans-serif;
      letter-spacing: -.065em;
      opacity: 0;
      transform: translateY(14px);
      animation: project-entry-label-in 720ms 180ms cubic-bezier(.22, 1, .36, 1) both;
    }
    .project-entry-cover.is-hidden { opacity: 0; pointer-events: none; }
    @keyframes project-entry-breathe {
      from { transform: scale(1.1); filter: saturate(.72) brightness(.64) contrast(1.04) blur(1.5px); }
      to { transform: scale(1.02); filter: saturate(.85) brightness(.82) contrast(1.06) blur(0); }
    }
    @keyframes project-entry-label-in {
      from { opacity: 0; transform: translateY(14px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.documentElement.append(style);

  const cover = document.createElement("div");
  cover.className = "project-entry-cover";
  cover.setAttribute("aria-hidden", "true");
  cover.innerHTML = `<img class="project-entry-cover__image" alt=""><span class="project-entry-cover__label"></span>`;
  cover.querySelector("img").src = payload.image;
  cover.querySelector(".project-entry-cover__label").textContent = payload.label || "";
  document.documentElement.append(cover);

  const startedAt = performance.now();
  let hidden = false;
  const hide = () => {
    if (hidden) return;
    hidden = true;
    window.setTimeout(() => cover.classList.add("is-hidden"), 140);
    window.setTimeout(() => {
      cover.remove();
      style.remove();
    }, 780);
  };

  const releaseAfterBoot = () => {
    const elapsed = performance.now() - startedAt;
    window.setTimeout(hide, Math.max(0, 720 - elapsed));
  };
  window.addEventListener("load", releaseAfterBoot, { once: true });
  window.setTimeout(hide, 2400);
})();
