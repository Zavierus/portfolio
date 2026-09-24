export const TOPIC_COPY = Object.freeze({
  performance: Object.freeze({ primary: "性能与帧率", secondary: "Performance" }),
  stability: Object.freeze({ primary: "崩溃与稳定性", secondary: "Crashes and stability" }),
  controls: Object.freeze({ primary: "操作与输入", secondary: "Controls and input" }),
  multiplayer: Object.freeze({ primary: "多人联机", secondary: "Multiplayer and matchmaking" }),
  balance: Object.freeze({ primary: "战斗与平衡", secondary: "Combat and balance" }),
  content: Object.freeze({ primary: "内容与进度", secondary: "Content and progression" }),
  onboarding: Object.freeze({ primary: "新手引导与理解", secondary: "Onboarding and clarity" }),
  monetization: Object.freeze({ primary: "价格与付费", secondary: "Price and monetization" }),
  "base-building": Object.freeze({ primary: "基地建造", secondary: "Base building" }),
  interface: Object.freeze({ primary: "界面与无障碍", secondary: "Interface and accessibility" }),
});

export function getTopicCopy(id, label) {
  const known = TOPIC_COPY[id];
  if (!known) return { primary: String(label ?? id), secondary: "自定义主题" };
  const normalized = String(label ?? "").trim();
  return { primary: known.primary, secondary: normalized && normalized !== known.secondary ? normalized : known.secondary };
}
