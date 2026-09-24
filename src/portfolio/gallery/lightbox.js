import { createGalleryState, galleryReducer } from "./gallery-state.js";
import { createSwipeTracker } from "./swipe.js";

function defaultPrefetch(src) {
  if (typeof Image === "undefined") return;
  const image = new Image();
  image.decoding = "async";
  image.src = src;
}

function adjacentSources(state) {
  if (state.items.length < 2 || state.selectedIndex < 0) return [];
  const previous = (state.selectedIndex - 1 + state.items.length) % state.items.length;
  const next = (state.selectedIndex + 1) % state.items.length;
  return [...new Set([previous, next])]
    .filter((index) => index !== state.selectedIndex)
    .map((index) => state.items[index].src);
}

export function createLightboxController({ items = [], view = {}, prefetch = defaultPrefetch } = {}) {
  let state = createGalleryState(items);
  const prefetched = new Set();

  function render() {
    if (!state.viewerOpen || state.selectedIndex < 0) return;
    const item = state.items[state.selectedIndex];
    view.render?.({
      item,
      src: item.src,
      index: state.selectedIndex,
      total: state.items.length,
    });

    for (const src of adjacentSources(state)) {
      if (prefetched.has(src)) continue;
      prefetched.add(src);
      prefetch(src);
    }
  }

  function navigate(type) {
    if (!state.viewerOpen) return false;
    state = galleryReducer(state, { type });
    render();
    return true;
  }

  const controller = {
    open(id) {
      const next = galleryReducer(state, { type: "OPEN", id });
      if (next === state) return false;
      state = next;
      view.open?.();
      render();
      return true;
    },

    close() {
      if (!state.viewerOpen) return false;
      state = galleryReducer(state, { type: "CLOSE" });
      view.close?.();
      view.restoreFocus?.(state.returnFocusId);
      return true;
    },

    previous() {
      return navigate("PREVIOUS");
    },

    next() {
      return navigate("NEXT");
    },

    handleKey(key) {
      if (!state.viewerOpen) return false;
      if (key === "Escape") return controller.close();
      if (key === "ArrowLeft") return controller.previous();
      if (key === "ArrowRight") return controller.next();
      return false;
    },

    getState() {
      return state;
    },
  };

  return controller;
}

function getFocusableElements(container) {
  return [...container.querySelectorAll(
    'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )].filter((element) => !element.hidden);
}

export function mountLightbox({ dialog, items, thumbnails, documentRef = document, windowRef = window }) {
  const image = dialog.querySelector("[data-lightbox-image]");
  const title = dialog.querySelector("[data-lightbox-title]");
  const detail = dialog.querySelector("[data-lightbox-detail]");
  const counter = dialog.querySelector("[data-lightbox-counter]");
  const closeButton = dialog.querySelector("[data-lightbox-close]");
  const previousButton = dialog.querySelector("[data-lightbox-previous]");
  const nextButton = dialog.querySelector("[data-lightbox-next]");
  const supportsDialog = typeof dialog.showModal === "function";

  const view = {
    open() {
      documentRef.body.classList.add("gallery-modal-open");
      dialog.hidden = false;
      if (supportsDialog && !dialog.open) dialog.showModal();
      else {
        dialog.setAttribute("open", "");
        dialog.setAttribute("aria-modal", "true");
      }
      closeButton?.focus();
    },
    close() {
      documentRef.body.classList.remove("gallery-modal-open");
      if (supportsDialog && dialog.open) dialog.close();
      else {
        dialog.removeAttribute("open");
        dialog.hidden = true;
      }
      image.removeAttribute("src");
    },
    render({ item, src, index, total }) {
      image.src = src;
      image.alt = `${item.title}：${item.description}`;
      title.textContent = item.title;
      detail.textContent = [item.year, item.category, item.equipment].filter(Boolean).join(" / ");
      counter.textContent = `${String(index + 1).padStart(3, "0")} / ${String(total).padStart(3, "0")}`;
    },
    restoreFocus(id) {
      thumbnails.get(id)?.focus();
    },
  };

  const controller = createLightboxController({
    items,
    view,
    prefetch(src) {
      const preload = new windowRef.Image();
      preload.decoding = "async";
      preload.src = src;
    },
  });
  const swipe = createSwipeTracker({
    onPrevious: () => controller.previous(),
    onNext: () => controller.next(),
  });

  closeButton?.addEventListener("click", () => controller.close());
  previousButton?.addEventListener("click", () => controller.previous());
  nextButton?.addEventListener("click", () => controller.next());
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    controller.close();
  });
  dialog.addEventListener("pointerdown", (event) => swipe.start(event));
  dialog.addEventListener("pointerup", (event) => swipe.end(event));
  dialog.addEventListener("pointercancel", () => swipe.cancel());

  documentRef.addEventListener("keydown", (event) => {
    if (!controller.getState().viewerOpen) return;
    if (controller.handleKey(event.key)) {
      event.preventDefault();
      return;
    }

    if (!supportsDialog && event.key === "Tab") {
      const focusable = getFocusableElements(dialog);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && documentRef.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && documentRef.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  return controller;
}
