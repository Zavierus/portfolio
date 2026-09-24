import { categories, visibleItems } from "./data.js";

const grid = document.querySelector("[data-gallery-grid]");
const filterBar = document.querySelector("[data-filters]");
const dialog = document.querySelector("[data-lightbox]");
const image = dialog?.querySelector("[data-lightbox-image]");
const title = dialog?.querySelector("[data-lightbox-title]");
const meta = dialog?.querySelector("[data-lightbox-meta]");
const note = dialog?.querySelector("[data-lightbox-note]");
const linkContainer = dialog?.querySelector("[data-lightbox-link-container]");
const languageToggle = document.querySelector("[data-language-toggle]");
let activeCategory = new URLSearchParams(window.location.search).get("category") || "all";
let activeItems = visibleItems(activeCategory);
let activeIndex = 0;
let activeLanguage = "zh";

try {
  activeLanguage = (window.localStorage.getItem("zeno-language") || window.localStorage.getItem("ziaver-language")) === "en" ? "en" : "zh";
} catch {
  activeLanguage = "zh";
}

const languageText = {
  en: {
    all: "ALL",
    video: "VIDEO & MOTION",
    photography: "PHOTOGRAPHY",
    design: "IMAGE + GRAPHIC",
    dynamic: "WECHAT EDITORIAL",
    image: "OPEN PREVIEW",
    watchVideo: "WATCH VIDEO",
    original: "OPEN WECHAT ARTICLE",
    index: "VIEW FULL INDEX →",
    close: "Close",
    previous: "Previous",
    next: "Next",
  },
  zh: {
    all: "全部作品",
    video: "商业视频与动态",
    photography: "纪实摄影",
    design: "图像与平面",
    dynamic: "公众号推文",
    image: "查看高清大图",
    watchVideo: "观看视频",
    original: "直达微信推文原文",
    index: "返回作品集首页 ←",
    close: "关闭",
    previous: "上一张",
    next: "下一张",
  },
};

const categoryFor = (id) => categories.find((category) => category.id === id) || categories[0];

function renderVideoRow(item, index) {
  const metricsHtml = item.metrics
    ? `<div class="video-row__meta"><span class="video-row__metrics-tag">${item.metrics}</span></div>`
    : "";
  const actionHtml = item.href
    ? `<div class="video-row__action">
        <a class="video-row__link" href="${item.href}" target="_blank" rel="noopener noreferrer">
          <span class="video-row__arrow">▶</span>
          <span>${item.actionLabel || languageText[activeLanguage].watchVideo + " ↗"}</span>
        </a>
      </div>`
    : "";

  return `
    <article class="video-row" data-category="video">
      <div class="video-row__body">
        <div class="video-row__header">
          <span class="video-row__num">${item.num || String(index + 1).padStart(2, "0")}</span>
          <h3 class="video-row__title">${item.title}</h3>
        </div>
        ${metricsHtml}
        ${actionHtml}
      </div>
      <button class="video-row__preview-btn" type="button" data-open="${index}" aria-label="查看 ${item.title}">
        <img class="video-row__thumb" loading="lazy" src="${item.file}" alt="${item.title}" />
      </button>
    </article>`;
}

function render() {
  activeItems = visibleItems(activeCategory);
  grid.dataset.mode = activeCategory;

  if (activeCategory === "video") {
    // Group by series in PDF order
    const seriesOrder = [
      "BANCS音乐社",
      "NS工作室",
      "大舞宣传片",
      "VISION造型协会",
      "同学你好",
      "什么PHONE把您吹来了",
      "无聊科技",
      "无聊的开箱",
      "短的发布会",
      "独立创作与实验影像",
    ];

    const seriesMap = new Map();
    seriesOrder.forEach((name) => seriesMap.set(name, []));

    activeItems.forEach((item, index) => {
      const list = seriesMap.get(item.series);
      if (list) {
        list.push({ item, index });
      } else {
        if (!seriesMap.has(item.series)) seriesMap.set(item.series, []);
        seriesMap.get(item.series).push({ item, index });
      }
    });

    let html = "";
    seriesMap.forEach((itemList, seriesName) => {
      if (itemList.length === 0) return;
      html += `
        <div class="video-series-block">
          <div class="video-series-header">
            <div class="video-series-title">
              <span class="video-series-slash">//</span>
              <span class="video-series-name">${seriesName}</span>
            </div>
            <span class="video-series-count">${itemList.length} PROJECTS</span>
          </div>
          <div class="video-series-list">
            ${itemList.map(({ item, index }) => renderVideoRow(item, index)).join("")}
          </div>
        </div>`;
    });

    grid.innerHTML = html;
  } else {
    // Other categories or "all"
    grid.innerHTML = activeItems.map((item, index) => {
      const category = categoryFor(item.category);
      const isDynamic = item.category === "dynamic";
      const isVideo = item.category === "video";

      if (isVideo) {
        return renderVideoRow(item, index);
      }

      if (isDynamic) {
        const signal = `
          <div class="archive-card__signal"><span><i></i> 微信公众号动效</span><span>${item.status}</span></div>
          <div class="archive-card__byline"><strong>${item.author}</strong><span>${item.channel}</span></div>
        `;
        const copyBlock = `
          <div>
            <span class="archive-card__category">${activeLanguage === "zh" ? category.zh : category.label}</span>
            <span class="archive-card__year">${item.year}</span>
          </div>
          ${signal}
          <h2>${item.title}</h2>
          <p>${item.en} · ${item.medium}</p>
        `;
        const action = item.href
          ? `<a class="archive-card__action" href="${item.href}" target="_blank" rel="noopener noreferrer">${languageText[activeLanguage].original} <span style="font-weight:bold;margin-left:4px;">↗</span></a>`
          : "";
        return `
          <article class="archive-card archive-card--${category.accent} archive-card--dynamic" data-category="dynamic">
            <button class="archive-card__image" type="button" data-open="${index}" aria-label="打开 ${item.title}">
              <img loading="lazy" src="${item.file}" alt="${item.title} / ${item.en}" />
              <span class="archive-card__number">${String(index + 1).padStart(2, "0")}</span>
            </button>
            <div class="archive-card__copy">
              ${copyBlock}
              ${action}
            </div>
          </article>`;
      }

      // Default: photography and design
      const cardNum = item.tag || String(index + 1).padStart(2, "0");
      return `
        <article class="archive-card archive-card--${category.accent} archive-card--${item.category}" data-category="${item.category}">
          <button class="archive-card__image" type="button" data-open="${index}" aria-label="打开 ${item.title}">
            <img loading="lazy" src="${item.file}" alt="${item.title} / ${item.en}" />
            <span class="archive-card__number">${cardNum}</span>
          </button>
          <div class="archive-card__copy"></div>
        </article>`;
    }).join("");
  }

  filterBar.querySelectorAll("[data-filter]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === activeCategory);
    const label = button.querySelector("[data-filter-label]");
    if (label && languageText[activeLanguage][button.dataset.filter]) {
      label.textContent = languageText[activeLanguage][button.dataset.filter];
    }
  });
  grid.querySelectorAll("[data-open]").forEach((button) => button.addEventListener("click", () => open(Number(button.dataset.open))));
}

function open(index) {
  activeIndex = Math.max(0, Math.min(index, activeItems.length - 1));
  const item = activeItems[activeIndex];
  const category = categoryFor(item.category);
  const isDynamic = item.category === "dynamic";
  const isVideo = item.category === "video";

  image.src = item.gif || item.file;
  image.alt = item.title;
  title.textContent = isVideo || isDynamic
    ? item.title
    : (item.tag ? `${item.tag} · ${activeLanguage === "zh" ? (item.series || item.title) : (item.en || item.title)}` : item.title);

  if (isVideo) {
    meta.textContent = `${item.num ? "[" + item.num + "] " : ""}${item.series} · ${item.actionLabel || item.platform} · ${item.year || ""}`;
    meta.hidden = false;
    note.textContent = `${item.metrics ? item.metrics + " · " : ""}${item.note || ""}`;
    note.hidden = !item.note && !item.metrics;
    if (linkContainer) {
      linkContainer.innerHTML = item.href
        ? `<a class="archive-lightbox__watch-btn" href="${item.href}" target="_blank" rel="noopener noreferrer">${item.actionLabel || "前往观看 ↗"}</a>`
        : "";
    }
  } else if (isDynamic) {
    meta.textContent = `${item.author} · ${item.channel} · ${item.year}`;
    meta.hidden = false;
    note.textContent = item.note || "";
    note.hidden = !item.note;
    if (linkContainer) {
      linkContainer.innerHTML = item.href
        ? `<a class="archive-lightbox__watch-btn" href="${item.href}" target="_blank" rel="noopener noreferrer">直达微信推文原文 ↗</a>`
        : "";
    }
  } else if (item.category === "photography") {
    meta.textContent = `${item.tag || ""} · ${item.series || ""} · ${item.year || "2021-2024"} · ${item.medium || "独家纪实摄影"}`;
    meta.hidden = false;
    note.textContent = item.note || "";
    note.hidden = !item.note;
    if (linkContainer) linkContainer.innerHTML = "";
  } else {
    meta.textContent = item.note ? "" : `${activeLanguage === "zh" ? category.zh : category.label} · ${item.year} · ${item.medium}`;
    meta.hidden = Boolean(item.note);
    note.textContent = item.note || "";
    note.hidden = !item.note;
    if (linkContainer) linkContainer.innerHTML = "";
  }
  dialog.showModal();
}

function move(delta) {
  open((activeIndex + delta + activeItems.length) % activeItems.length);
}

filterBar.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;
  activeCategory = button.dataset.filter;
  const url = new URL(window.location.href);
  activeCategory === "all" ? url.searchParams.delete("category") : url.searchParams.set("category", activeCategory);
  window.history.replaceState({}, "", url);
  render();
});

dialog?.querySelector("[data-close]")?.addEventListener("click", () => dialog.close());
dialog?.querySelector("[data-prev]")?.addEventListener("click", () => move(-1));
dialog?.querySelector("[data-next]")?.addEventListener("click", () => move(1));
dialog?.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
window.addEventListener("keydown", (event) => {
  if (!dialog?.open) return;
  if (event.key === "ArrowLeft") move(-1);
  if (event.key === "ArrowRight") move(1);
});

function applyArchiveLanguage(language) {
  activeLanguage = language === "zh" ? "zh" : "en";
  document.documentElement.lang = activeLanguage === "zh" ? "zh-CN" : "en";
  document.documentElement.dataset.language = activeLanguage;
  document.documentElement.dataset.languageSwitching = "true";
  const text = languageText[activeLanguage];
  document.querySelector(".archive-lede").textContent = activeLanguage === "zh"
    ? "51项商业视频与动态设计、205幅独家纪实摄影、图像版式设计系统与公众号动态，全景呈现创作全编。"
    : "51 commercial videos & motion pieces, 205 uncropped original photographs, graphic systems and live editorial work.";
  document.querySelectorAll("[data-filter-label]").forEach((label) => {
    const f = label.closest("[data-filter]").dataset.filter;
    if (text[f]) label.textContent = text[f];
  });
  const fullIndex = document.querySelector(".archive-full-index");
  if (fullIndex) fullIndex.textContent = text.index;
  if (dialog) {
    dialog.querySelector("[data-close]")?.setAttribute("aria-label", text.close);
    dialog.querySelector("[data-prev]")?.setAttribute("aria-label", text.previous);
    dialog.querySelector("[data-next]")?.setAttribute("aria-label", text.next);
  }
  if (languageToggle) {
    languageToggle.dataset.language = activeLanguage;
    languageToggle.setAttribute("aria-pressed", String(activeLanguage === "zh"));
    languageToggle.setAttribute("aria-label", activeLanguage === "zh" ? "切换到英文" : "切换到中文");
    languageToggle.querySelector("[data-language-active]").textContent = activeLanguage === "zh" ? "中文" : "EN";
    languageToggle.querySelector("[data-language-other]").textContent = activeLanguage === "zh" ? "EN" : "中文";
  }
  render();
  window.setTimeout(() => document.documentElement.removeAttribute("data-language-switching"), 420);
  try {
    window.localStorage.setItem("zeno-language", activeLanguage);
    window.localStorage.setItem("ziaver-language", activeLanguage);
  } catch {}
}

languageToggle?.addEventListener("click", () => applyArchiveLanguage(activeLanguage === "zh" ? "en" : "zh"));

document.querySelectorAll("[data-filter]").forEach((button) => {
  if (!button.querySelector("[data-filter-label]")) {
    const textNode = [...button.childNodes].find((node) => node.nodeType === Node.TEXT_NODE);
    if (textNode) {
      const label = document.createElement("span");
      label.dataset.filterLabel = "";
      label.textContent = textNode.textContent.trim();
      textNode.replaceWith(label);
    }
  }
});
applyArchiveLanguage(activeLanguage);
