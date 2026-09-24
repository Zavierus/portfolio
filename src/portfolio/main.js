import { photography, sortPhotography, validatePhotography } from "./data/photography.js";
import { mountContactSheet } from "./gallery/contact-sheet.js";
import { mountLightbox } from "./gallery/lightbox.js";
import { getMotionPolicy } from "./motion-policy.js";
import { mountHero } from "./hero/hero-controller.js";
import { mountProjectMediaPreviews } from "./previews/project-media-previews.js";
import { mountAmbientField } from "./atmosphere/ambient-field.js";
import { mountPortalGallery } from "./portal-gallery/portal-gallery-controller.js";

// Edge can restore the homepage from back-forward cache after returning from a project.
// Reload persisted pages so the local preview always reflects the current build.
window.addEventListener("pageshow", (event) => {
  if (event.persisted) window.location.reload();
});

const motionPolicy = getMotionPolicy();
document.documentElement.dataset.motion = motionPolicy.enabled ? "enhanced" : "static";
document.documentElement.dataset.motionReason = motionPolicy.reason ?? "capable";

function applyEnglishPortfolioCopy() {
  const setText = (selector, value) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
  };
  const setHtml = (selector, value) => {
    const element = document.querySelector(selector);
    if (element) element.innerHTML = value;
  };
  const setAll = (selector, values) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      if (values[index] !== undefined) element.textContent = values[index];
    });
  };

  setText(".skip-link", "SKIP TO WORK");
  setAll(".site-nav a", ["WORK", "OUTCOMES", "EXPERIENCE", "VISUAL", "CONTACT"]);
  setText("#identity-title small", "WANG ZEYUAN");
  setText(".identity-role", "CONTENT PRODUCT / CREATIVE TECHNOLOGY");
  setText(".identity-intro", "I build content systems, visual work and runnable prototypes in one workflow.");
  setAll(".identity-actions a", ["VIEW WORK", "DOWNLOAD RESUME", "CONTACT"]);
  setAllHtml(".portal-door__meta em", [
    "Cold architecture · a playable realtime field",
    "Local library · realtime analysis · fluid 3D sound field",
    "Plan the room · see the frame",
    "Evidence before interpretation",
  ]);
  setAllHtml(".portal-door__action", [
    "ENTER PROJECT <i aria-hidden=\"true\"></i>",
    "ENTER PROJECT <i aria-hidden=\"true\"></i>",
    "OPEN WORKSPACE <i aria-hidden=\"true\"></i>",
    "ENTER PROJECT <i aria-hidden=\"true\"></i>",
  ]);
  setText(".outcomes .utility-label", "SELECTED OUTCOMES / SIGNALS");
  setHtml("#outcomes-title", "RESULTS FIRST,<br>THEN THE METHOD.");
  setText(".outcomes .section-heading > p:nth-of-type(2)", "Numbers from the work record. They show the judgement, delivery rhythm and review habits behind each build.");
  setAll(".outcome-ledger strong", ["25.81B", "4.7%", "2,000+", "560K"]);
  setAll(".outcome-ledger h3", ["618 DAILY GMV", "CORE ACCOUNT CTR", "PHOTO COVERAGE", "CAMPUS ACCOUNT FOLLOWERS"]);
  setAll(".outcome-ledger p", ["Full-cycle Douyin commerce operations with a 100.6% target completion rate.", "Stable content production and iteration kept the core account above its historical benchmark.", "From product design and materials to the final shoot, an independent graduation portrait business.", "Topic selection, shooting and publishing across multiple platform formats."]);

  setText(".experience .utility-label", "EXPERIENCE / CAPABILITY INDEX");
  setHtml("#experience-title", "CONTENT IS NOT A BACKDROP,<br>IT IS THE START OF PRODUCT JUDGEMENT.");
  setText(".experience .section-heading > p:nth-of-type(2)", "Three real work records: e-commerce campaign operations, creator distribution, and new-media visual systems.");
  setAll(".experience-index article h3", ["DOUYIN CHINA COMMERCE / BYTEDANCE", "YIYANZHIJIA CULTURE / GUAZI", "GANLAN CULTURE TECHNOLOGY"]);
  setAll(".experience-index article time", ["2025.03 — 2025.09", "2024.07", "2022.04 — 2022.09"]);
  setAll(".experience-index .company-role", ["Commerce content & creator operations", "Creator distribution & performance media", "Creator operations · visual design"]);
  setAll(".experience-signals small", ["618 daily GMV", "Core account CTR", "Creator distribution", "Scoring & reinvestment SOP", "Net follower growth", "Visual assets"]);
  setAll(".capability-index > div > span", ["EDUCATION", "CAPABILITIES", "TOOLS"]);
  setAll(".capability-index > div > p", ["Shenzhen University · 2019—2024", "Content growth · Creator operations · Commercial photography · Realtime 3D · AIGC", "Three.js · Blender · TouchDesigner · Adobe CC · DaVinci"]);

  setText(".visual-archive__heading .utility-label", "VISUAL ARCHIVE / SELECTED LANES");
  setText(".visual-archive__heading > p", "Twenty-four featured original photographs lead into an archive of 51 commercial videos & motion pieces, 205 uncropped original photographs, graphic systems and live editorial work.");
  const dynamicLane = document.querySelector(".visual-archive__lane--dynamic");
  setText("#visual-photo-title", "LIVE CONTACT SHEET");
  setText(".visual-archive__lane--video .visual-archive__meta strong", "VIDEO & MOTION");
  setText(".visual-archive__lane--design .visual-archive__meta strong", "IMAGE + GRAPHIC");
  if (dynamicLane) {
    const image = dynamicLane.querySelector("img");
    if (image) {
      image.src = "./projects/visual-archive/assets/dynamic/recruitment-wechat-cover.jpg";
      image.alt = "BANCS 2022 editorial motion cover";
    }
    const meta = dynamicLane.querySelector(".visual-archive__meta");
    if (meta) meta.innerHTML = "<small>03 / WECHAT EDITORIAL</small><strong>WECHAT LIVE</strong><em>Recruitment / sound space / original post</em><b>OPEN ORIGINAL ↗</b>";
  }
  setText(".visual-archive__lane--design .visual-archive__meta b", "OPEN INDEX ↗");
  setText(".visual-archive__all", "VIEW THE FULL ARCHIVE ↗");

  setHtml("#contact-title", "MAKE SOMETHING<br>WORTH EXPERIENCING.");
  setText(".contact > p:not(.utility-label):not(:last-child)", "I am looking for content product, game, audio-visual and creative technology opportunities.");
  setText(".site-footer span:first-child", "ZENO / WANG ZEYUAN");
  setText(".site-footer span:nth-child(2)", "CONTENT PRODUCT / CREATIVE TECHNOLOGY");
  setText(".site-footer a", "BACK TO TOP ↑");
}

function applyChinesePortfolioCopy() {
  const setText = (selector, value) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
  };
  const setHtml = (selector, value) => {
    const element = document.querySelector(selector);
    if (element) element.innerHTML = value;
  };
  const setAll = (selector, values) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      if (values[index] !== undefined) element.textContent = values[index];
    });
  };

  setText(".skip-link", "跳到作品");
  setAll(".site-nav a", ["作品", "成果", "经历", "视觉", "联系"]);
  setText("#identity-title small", "王泽源");
  setText(".identity-role", "内容产品 / 创意技术");
  setText(".identity-intro", "我把内容系统、视觉创作与可运行原型放进同一条工作流。");
  setAll(".identity-actions a", ["查看作品", "下载简历", "联系我"]);
  setAllHtml(".portal-door__meta em", [
    "冷峻建筑 · 可玩的实时场域",
    "本地音乐库 · 实时分析 · 三维液态声场",
    "规划空间 · 预览画面",
    "先看证据，再做判断",
  ]);
  setAllHtml(".portal-door__action", [
    "进入项目 <i aria-hidden=\"true\"></i>",
    "进入项目 <i aria-hidden=\"true\"></i>",
    "打开工作台 <i aria-hidden=\"true\"></i>",
    "进入项目 <i aria-hidden=\"true\"></i>",
  ]);

  setText(".outcomes .utility-label", "SELECTED OUTCOMES / 结果信号");
  setHtml("#outcomes-title", "先看结果，<br>再谈方法。");
  setText(".outcomes .section-heading > p:nth-of-type(2)", "这些数字来自真实工作记录，体现内容判断、交付节奏和复盘习惯共同留下的结果。");
  setAll(".outcome-ledger strong", ["25.81 亿", "4.7%", "2,000+", "56 万"]);
  setAll(".outcome-ledger h3", ["618 日均 GMV", "核心账号 CTR", "摄影覆盖人次", "校园账号粉丝"]);
  setAll(".outcome-ledger p", ["作为核心成员负责 618 全周期内容与达人运营，统筹素材迭代与大场落地，目标达成率 100.6%。", "沉淀日更 3–5 套素材生产节奏，主导实景直播间改造，核心账号 CTR 达 4.7%（行业均值 2.3%）。", "从产品设计、物料到拍摄交付，独立搭建毕业照摄影业务。", "参与选题、拍摄与内容制作，形成跨平台传播。"]);

  setText(".experience .utility-label", "EXPERIENCE / 能力索引");
  setHtml("#experience-title", "内容不是背景，<br>是产品判断的起点。");
  setText(".experience .section-heading > p:nth-of-type(2)", "三段真实工作经历：电商大促操盘、达人投放矩阵与新媒体视觉。");
  setAll(".experience-index article h3", ["字节跳动（抖音中国电商）", "一言之嘉文化传播（瓜子二手车）", "敢览文化科技"]);
  setAll(".experience-index article time", ["2025.03 — 2025.09", "2024.07", "2022.04 — 2022.09"]);
  setAll(".experience-index .company-role", ["电商内容与创作者运营", "达人分发与投放运营", "达人运营 · 视觉设计"]);
  setAll(".experience-signals small", ["618 日均 GMV", "核心账号 CTR", "达人分发投放", "评分卡与复投 SOP", "矩阵账号净增粉", "视觉标准化物料"]);
  setAll(".capability-index > div > span", ["教育", "能力", "工具"]);
  setAll(".capability-index > div > p", ["深圳大学 · 2019.09—2024.09", "内容增长 · 达人运营 · 商业摄影 · 实时 3D · AIGC", "Three.js · Blender · TouchDesigner · Adobe CC · DaVinci"]);

  setText(".visual-archive__heading .utility-label", "VISUAL INDEX / 视觉档案与接触表");
  setText(".visual-archive__heading > p", "首页精选 24 张完整摄影原图，并可继续进入包含 51 项商业视频与动态作品、205 幅独家纪实摄影、平面海报与微信推文的完整视觉档案。");
  setText("#visual-photo-title", "LIVE CONTACT SHEET");
  setText(".visual-archive__lane--video .visual-archive__meta strong", "商业视频与动态设计");
  setText(".visual-archive__lane--design .visual-archive__meta strong", "图像与平面系统");
  setText(".visual-archive__lane--design .visual-archive__meta b", "进入分类 ↗");
  const dynamicLane = document.querySelector(".visual-archive__lane--dynamic");
  if (dynamicLane) {
    const image = dynamicLane.querySelector("img");
    if (image) {
      image.src = "./projects/visual-archive/assets/dynamic/recruitment-wechat-cover.jpg";
      image.alt = "BANCS 2022 官方招新推文动态封面";
    }
    const meta = dynamicLane.querySelector(".visual-archive__meta");
    if (meta) meta.innerHTML = "<small>03 / WECHAT EDITORIAL</small><strong>微信官方推文动态</strong><em>Recruitment / editorial / live post</em><b>直达原文 ↗</b>";
  }
  setText(".visual-archive__all", "查看完整全屏视觉档案 VIEW FULL ARCHIVE ↗");

  setHtml("#contact-title", "一起做出<br>值得体验的内容。");
  setText(".contact > p:not(.utility-label):not(:last-child)", "正在寻找内容产品、游戏、音画体验与创意技术方向的合作机会。");
  setText(".site-footer span:first-child", "ZENO / 王泽源");
  setText(".site-footer span:nth-child(2)", "内容产品 / 创意技术");
  setText(".site-footer a", "回到顶部 ↑");
}

function setAllHtml(selector, values) {
  document.querySelectorAll(selector).forEach((element, index) => {
    if (values[index] !== undefined) element.innerHTML = values[index];
  });
}

const languageToggle = document.querySelector("[data-language-toggle]");
const languageStorageKey = "zeno-language";
let activeLanguage = "zh";
try {
  activeLanguage = (window.localStorage.getItem("zeno-language") || window.localStorage.getItem("ziaver-language")) === "en" ? "en" : "zh";
} catch {
  activeLanguage = "zh";
}

function updateLanguageToggle(language) {
  if (!languageToggle) return;
  languageToggle.dataset.language = language;
  languageToggle.setAttribute("aria-pressed", String(language === "zh"));
  languageToggle.setAttribute("aria-label", language === "zh" ? "切换到英文" : "切换到中文");
  const active = languageToggle.querySelector("[data-language-active]");
  const other = languageToggle.querySelector("[data-language-other]");
  if (active) active.textContent = language === "zh" ? "中" : "EN";
  if (other) other.textContent = language === "zh" ? "EN" : "中";
}

function applyLanguage(language) {
  activeLanguage = language === "zh" ? "zh" : "en";
  document.documentElement.lang = activeLanguage === "zh" ? "zh-CN" : "en";
  document.documentElement.dataset.language = activeLanguage;
  document.documentElement.dataset.languageSwitching = "true";
  if (activeLanguage === "zh") applyChinesePortfolioCopy();
  else applyEnglishPortfolioCopy();
  updateLanguageToggle(activeLanguage);
  window.setTimeout(() => document.documentElement.removeAttribute("data-language-switching"), 420);
  try {
    window.localStorage.setItem(languageStorageKey, activeLanguage);
  } catch {
    // Keep the toggle usable when storage is unavailable.
  }
}

languageToggle?.addEventListener("click", () => applyLanguage(activeLanguage === "zh" ? "en" : "zh"));
applyLanguage(activeLanguage);

let scrollFrame = 0;
const updateScrollProgress = () => {
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  document.documentElement.style.setProperty("--scroll-progress", String(Math.min(1, Math.max(0, window.scrollY / maxScroll))));
  scrollFrame = 0;
};
window.addEventListener("scroll", () => {
  if (scrollFrame) return;
  scrollFrame = window.requestAnimationFrame(updateScrollProgress);
}, { passive: true });
window.addEventListener("resize", updateScrollProgress, { passive: true });
updateScrollProgress();

if (motionPolicy.effects.hero) {
  document.querySelector("#identity")?.classList.add("is-hero-entry");
}

const disposeHero = mountHero({
  root: document.querySelector("#identity"),
  motionPolicy,
});
window.addEventListener("beforeunload", disposeHero, { once: true });

const disposeProjectMediaPreviews = mountProjectMediaPreviews({
  elements: document.querySelectorAll("[data-project-preview]"),
  enabled: motionPolicy.effects.projectMedia,
});
window.addEventListener("beforeunload", disposeProjectMediaPreviews, { once: true });

const disposeAmbientField = mountAmbientField({
  canvas: document.querySelector("[data-atmosphere-canvas]"),
  enabled: motionPolicy.enabled,
});
window.addEventListener("beforeunload", disposeAmbientField, { once: true });

const disposePortalGallery = mountPortalGallery({
  root: document.querySelector("[data-portal-gallery]"),
});
window.addEventListener("beforeunload", disposePortalGallery, { once: true });

const gallerySection = document.querySelector("#archive, #photography");
const galleryList = gallerySection?.querySelector("[data-contact-sheet]");
const galleryDetail = gallerySection?.querySelector("[data-contact-detail]");
const galleryDialog = document.querySelector("[data-lightbox]");
const validatedPhotography = validatePhotography(photography);
const galleryItems = sortPhotography(validatedPhotography.items);

if (gallerySection && galleryList && galleryDetail && galleryDialog) {
  const thumbnails = new Map();
  const viewer = mountLightbox({ dialog: galleryDialog, items: galleryItems, thumbnails });

  mountContactSheet({
    section: gallerySection,
    navigation: document.querySelector(".site-nav"),
    detail: galleryDetail,
    list: galleryList,
    items: galleryItems,
    viewer,
    thumbnails,
  });
}

const navigationLinks = [...document.querySelectorAll(".site-nav a[href^='#']")];
const navigationTargets = navigationLinks
  .map((link) => ({ link, section: document.querySelector(link.hash) }))
  .filter(({ section }) => section);

if ("IntersectionObserver" in window) {
  const navigationObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;
    for (const { link, section } of navigationTargets) {
      if (section === visible.target) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    }
  }, { rootMargin: "-28% 0px -60%", threshold: [0, 0.1, 0.4] });

  navigationTargets.forEach(({ section }) => navigationObserver.observe(section));
}

let revealObserver = null;
if (motionPolicy.enabled && "IntersectionObserver" in window) {
  const revealIndexes = new Map();
  document.querySelectorAll(".reveal").forEach((element) => {
    const parent = element.parentElement;
    const index = revealIndexes.get(parent) || 0;
    element.style.setProperty("--reveal-delay", `${Math.min(index, 4) * 70}ms`);
    revealIndexes.set(parent, index + 1);
  });
  revealObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("is-visible");
      revealObserver?.unobserve(entry.target);
    }
  }, { rootMargin: "-4% 0px -12%", threshold: 0.08 });
  document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
}
window.addEventListener("beforeunload", () => revealObserver?.disconnect(), { once: true });
