import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const bannedCopy = /AI WORKFLOW|AI ASSISTED|赋能|极致|未来已来|无限可能/i;

test("profile uses the verified Shenzhen company experience order", async () => {
  const { profile } = await import("../src/portfolio/data/profile.js");
  assert.equal(profile.identity, "王泽源 / ZIAVER");
  assert.equal(profile.role, "AIGC项目设计 · 内容产品 · 创意技术");
  assert.deepEqual(profile.experience.slice(0, 3).map(({ organization }) => organization), [
    "字节跳动 / 抖音中国电商",
    "深圳一言之嘉文化传播（瓜子二手车）",
    "深圳敢览文化科技有限公司",
  ]);
  assert.deepEqual(profile.experience.slice(0, 3).map(({ period }) => period), [
    "2025.03 — 2025.09", "2024.07", "2022.04 — 2022.09",
  ]);
});

test("every published business outcome is traceable to the resume source", async () => {
  const { profile } = await import("../src/portfolio/data/profile.js");
  const resume = new URL("../resume_out.txt", root);
  for (const outcome of profile.outcomes) {
    assert.equal(outcome.evidence?.source, "../resume_out.txt");
    assert.ok(outcome.evidence?.quote?.trim());
  }
  await access(resume);
});

test("homepage exposes recruiter essentials and avoids hype language", async () => {
  const [{ profile }, html, readme] = await Promise.all([
    import("../src/portfolio/data/profile.js"),
    readFile(new URL("index.html", root), "utf8"),
    readFile(new URL("README.md", root), "utf8"),
  ]);
  assert.match(html, /下载简历/);
  assert.match(html, /深圳大学/);
  assert.match(html, /RELIC<span>\/\/<\/span>01/);
  assert.match(html, /property="og:title"/);
  assert.match(html, /application\/ld\+json/);
  assert.doesNotMatch(JSON.stringify(profile), bannedCopy);
  assert.doesNotMatch(html, bannedCopy);
  assert.doesNotMatch(readme, bannedCopy);
});
