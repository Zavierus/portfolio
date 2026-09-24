const resumeEvidence = (quote) => ({
  source: "../resume_out.txt",
  quote,
});

export const profile = {
  identity: "王泽源 / ZENO",
  role: "AIGC项目设计 · 内容产品 · 创意技术",
  location: "深圳",
  email: "939431931@qq.com",
  introduction:
    "我做过AIGC项目设计、字节跳动/抖音电商内容与创作者运营、新媒体视觉与商业影像制作，正持续将这些业务沉淀延伸至实时 3D、智能交互与端到端产品交付。对我来说，内容不是装饰品，而是一套从用户洞察、原型构建到数据归因的完整体系。",
  outcomes: [
    {
      value: "25.81 亿",
      label: "618 项目日均 GMV",
      context: "主导/参与抖音电商 618 大促全周期运营，项目目标达成率 100.6%。",
      evidence: resumeEvidence("日均 GMV 25.81 亿、目标达成率 100.6%"),
    },
    {
      value: "4.7%",
      label: "核心账号 CTR",
      context: "通过高转化素材与实景直播间流线改造，使停留时长大幅提升 +92%。",
      evidence: resumeEvidence("核心账号 CTR 稳定至 4.7%，典型实景直播间改造使停留时长提升 92%"),
    },
    {
      value: "AIGC 交付",
      label: "工作流与产品设计",
      context: "将 AIGC 项目设计延伸到多模态内容管线、实时 3D 与可运行交互原型。",
      evidence: resumeEvidence("AIGC 提示词工程、多模态生成、AI 内容管线与交互落地"),
    },
    {
      value: "56 万",
      label: "新媒体矩阵粉丝增长",
      context: "全流程负责选题策划、视觉包装与多平台分发，单条最高播放破 117 万。",
      evidence: resumeEvidence("粉丝数增长至560,000，单条视频最高播放达 117.8 万"),
    },
  ],
  experience: [
    {
      period: "2025.03 — 2025.09",
      organization: "字节跳动 / 抖音中国电商",
      role: "电商内容与创作者运营",
      focus: "618大促运营、达人与商家双侧孵化、直播间实景动线改造、内容供给与数据归因",
    },
    {
      period: "2024.07",
      organization: "深圳一言之嘉文化传播（瓜子二手车）",
      role: "投放运营 / 达人分发",
      focus: "达人矩阵分发、投放 SOP 与复投模型搭建、日均消耗与 ROI 归因分析",
    },
    {
      period: "2022.04 — 2022.09",
      organization: "深圳敢览文化科技有限公司",
      role: "达人运营 / 视觉美工 / 新媒体",
      focus: "账号矩阵冷启动、视觉识别标准、多平台内容分发与全网涨粉 200W+",
    },
  ],
  capabilities: [
    "AIGC 提示工程与多模态设计",
    "电商内容策划与创作者运营",
    "实时 3D (Three.js/WebGL) 与交互原型",
    "数据归因 (CTR/GMV/ROI) 与流程 SOP",
  ],
  tools: [
    "Stable Diffusion / Midjourney / Sora",
    "Three.js / Web Audio / WebGL",
    "Premiere / DaVinci / After Effects",
    "Blender / TouchDesigner / Figma",
    "Python / SQL / JavaScript",
  ],
};
