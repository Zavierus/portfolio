function createAltText(item) {
  return [item.title, item.description].filter(Boolean).join(" - ");
}

function createMetadata(item) {
  return {
    year: String(item.year),
    category: item.category,
    equipment: item.equipment || "未记录",
  };
}

export function getGalleryVisibility(items = []) {
  const visible = items.length > 0;
  return {
    sectionVisible: visible,
    navigationVisible: visible,
  };
}

export function createContactSheetModel(items = []) {
  return items.map((item, index) => ({
    ...item,
    number: String(index + 1).padStart(3, "0"),
    alt: createAltText(item),
    aspectRatio: `${item.width} / ${item.height}`,
    metadata: createMetadata(item),
    thumbnail: {
      src: null,
      pendingSrc: item.thumbnail,
    },
  }));
}

export function activateIntersectingThumbnails(entries, observer) {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    const image = entry.target;
    if (!image.src && image.dataset.thumbnailSrc) image.src = image.dataset.thumbnailSrc;
    observer.unobserve(image);
  }
}

export function createContactSheetController({ items = [], viewer = {}, view = {} } = {}) {
  const models = createContactSheetModel(items);
  let selectedId = models[0]?.id ?? null;

  view.setVisibility?.(getGalleryVisibility(models));
  view.render?.(models);
  if (selectedId) view.select?.(models[0]);

  function select(id) {
    const model = models.find((item) => item.id === id);
    if (!model) return false;
    selectedId = id;
    view.select?.(model);
    return true;
  }

  return {
    activate(id) {
      if (!select(id)) return false;
      viewer.open?.(id);
      return true;
    },

    select,

    handleItemKey(id, key) {
      if (key !== "Enter") return false;
      return this.activate(id);
    },

    getSelectedId() {
      return selectedId;
    },
  };
}

function setDetail(detail, model) {
  detail.querySelector("[data-contact-number]").textContent = model.number;
  detail.querySelector("[data-contact-title]").textContent = model.title;
  detail.querySelector("[data-contact-description]").textContent = model.description;
  detail.querySelector("[data-contact-year]").textContent = model.metadata.year;
  detail.querySelector("[data-contact-category]").textContent = model.metadata.category;
  detail.querySelector("[data-contact-equipment]").textContent = model.metadata.equipment;
}

function createSheetItem(documentRef, model) {
  const item = documentRef.createElement("li");
  item.className = "contact-sheet__item";
  item.dataset.galleryItem = model.id;

  const button = documentRef.createElement("button");
  button.className = "contact-sheet__button";
  button.type = "button";
  button.dataset.galleryTrigger = model.id;
  button.setAttribute("aria-label", `查看 ${model.title}`);

  const frame = documentRef.createElement("span");
  frame.className = "contact-sheet__frame";
  frame.style.aspectRatio = model.aspectRatio;

  const image = documentRef.createElement("img");
  image.alt = model.alt;
  image.width = model.width;
  image.height = model.height;
  image.loading = "lazy";
  image.decoding = "async";
  image.dataset.thumbnailSrc = model.thumbnail.pendingSrc;

  const number = documentRef.createElement("span");
  number.className = "contact-sheet__number";
  number.textContent = model.number;
  number.setAttribute("aria-hidden", "true");

  const title = documentRef.createElement("span");
  title.className = "contact-sheet__label";
  title.textContent = model.title;
  title.setAttribute("aria-hidden", "true");

  frame.append(image);
  button.append(frame, number, title);
  item.append(button);
  return { item, button, image };
}

function createNavigationLink(documentRef) {
  const link = documentRef.createElement("a");
  link.href = "#photography";
  link.dataset.galleryNavigation = "";
  link.textContent = "摄影";
  return link;
}

export function mountContactSheet({
  section,
  navigation,
  detail,
  list,
  items = [],
  viewer,
  thumbnails = new Map(),
  documentRef = document,
  windowRef = window,
} = {}) {
  if (!section || !list || !detail) return null;

  let controller;
  let observer = null;
  const view = {
    setVisibility({ sectionVisible, navigationVisible }) {
      section.hidden = !sectionVisible;
      const oldLink = navigation?.querySelector("[data-gallery-navigation]");
      if (!navigationVisible) oldLink?.remove();
      else if (navigation && !oldLink) navigation.append(createNavigationLink(documentRef));
    },

    render(models) {
      list.replaceChildren();
      const images = [];
      for (const model of models) {
        const elements = createSheetItem(documentRef, model);
        elements.button.addEventListener("click", () => controller.activate(model.id));
        elements.button.addEventListener("focus", () => controller.select(model.id));
        elements.button.addEventListener("pointerenter", () => controller.select(model.id));
        elements.button.addEventListener("keydown", (event) => {
          if (controller.handleItemKey(model.id, event.key)) event.preventDefault();
        });
        thumbnails.set(model.id, elements.button);
        images.push(elements.image);
        list.append(elements.item);
      }

      if ("IntersectionObserver" in windowRef) {
        observer = new windowRef.IntersectionObserver(activateIntersectingThumbnails, {
          root: list,
          rootMargin: "0px 35%",
          threshold: 0.01,
        });
        images.forEach((image) => observer.observe(image));
      } else {
        images.forEach((image) => {
          image.src = image.dataset.thumbnailSrc;
        });
      }
    },

    select(model) {
      for (const item of list.querySelectorAll("[data-gallery-item]")) {
        const selected = item.dataset.galleryItem === model.id;
        item.classList.toggle("is-selected", selected);
        item.querySelector("button")?.setAttribute("aria-pressed", String(selected));
      }
      setDetail(detail, model);
    },
  };

  controller = createContactSheetController({ items, viewer, view });

  return {
    controller,
    destroy() {
      observer?.disconnect();
    },
  };
}
