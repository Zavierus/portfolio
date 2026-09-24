const definitions = [
  ["performance", "Performance", "performance", ["frame rate", "fps", "stutter", "frame pacing", "performance", "optimization", "lag spike"]],
  ["stability", "Crashes and stability", "stability", ["crash", "crashes", "crashed", "freeze", "freezing", "hang", "won't launch", "black screen"]],
  ["controls", "Controls and input", "controls", ["controller", "input delay", "key binding", "keybind", "mouse sensitivity", "controls", "remapping"]],
  ["multiplayer", "Multiplayer and matchmaking", "multiplayer", ["matchmaking", "multiplayer", "cannot join", "can't join", "disconnect", "desync", "find my friends"]],
  ["balance", "Combat and balance", "balance", ["balance", "overpowered", "underpowered", "damage", "difficulty", "combat", "nerf"]],
  ["content", "Content and progression", "content", ["content", "expedition", "mission", "quest", "progression", "endgame", "repetitive"]],
  ["onboarding", "Onboarding and clarity", "onboarding", ["tutorial", "onboarding", "confusing", "unclear", "new player", "learning curve", "instructions"]],
  ["monetization", "Price and monetization", "monetization", ["price", "expensive", "microtransaction", "dlc", "paywall", "monetization", "value for money"]],
  ["base-building", "Base building", "base-building", ["base building", "base parts", "snapping", "build menu", "settlement", "construction"]],
  ["interface", "Interface and accessibility", "interface", ["interface", "inventory", "menu", "accessibility", "text size", "widescreen", "hud"]],
];

export const DEFAULT_TOPIC_DICTIONARY = Object.freeze(
  definitions.map(([id, label, category, terms]) =>
    Object.freeze({ id, label, category, terms: Object.freeze(terms) }),
  ),
);
