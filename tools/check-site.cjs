/* AI Guide Hub 静态检查（零依赖） */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const HUB = path.join(ROOT, "hub");
const pages = ["index.html", "compare.html", "topics.html", "projects.html", "about.html", "404.html"];
const problems = [];
const ok = (name) => console.log("PASS " + name);
const fail = (name, detail) => { problems.push(name + " :: " + detail); console.log("FAIL " + name + " :: " + detail); };

// pages exist
for (const p of pages) {
  if (!fs.existsSync(path.join(HUB, p))) fail("页面存在", p);
}
if (!problems.length) ok("页面文件齐全");

// titles / descriptions
const titles = new Set();
for (const p of pages) {
  if (!fs.existsSync(path.join(HUB, p))) continue;
  const s = fs.readFileSync(path.join(HUB, p), "utf8");
  const title = (s.match(/<title>([\s\S]*?)<\/title>/) || [])[1];
  const desc = (s.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  if (!title) fail("title 齐全", p);
  else if (titles.has(title)) fail("title 唯一", p);
  else titles.add(title);
  if (!desc) fail("description 齐全", p);
}
if (!problems.some((p) => p.includes("title") || p.includes("description"))) ok("head 元信息齐全");

// local href/src
for (const p of pages) {
  if (!fs.existsSync(path.join(HUB, p))) continue;
  const s = fs.readFileSync(path.join(HUB, p), "utf8");
  for (const m of s.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const u = m[1];
    if (/^(https?:|#|mailto:|\/)/.test(u)) continue;
    const target = path.resolve(path.dirname(path.join(HUB, p)), u.split("#")[0].split("?")[0]);
    if (!fs.existsSync(target)) fail("站内链接", p + " -> " + u);
  }
}
if (!problems.some((p) => p.includes("站内链接"))) ok("站内链接可落地");

// data
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(HUB, "assets", "data.js"), "utf8"), sandbox);
const guides = sandbox.window.HUB_GUIDES || [];
const paths = sandbox.window.HUB_PATHS || [];
const topics = sandbox.window.HUB_TOPICS || [];
const byId = Object.fromEntries(guides.map((g) => [g.id, g]));
if (guides.length !== 5) fail("教程数据", String(guides.length));
else ok("教程数据齐全");
for (const [i, g] of guides.entries()) {
  if (!/^(https:\/\/|\/)/.test(g.site)) fail("site URL", i + " " + g.site);
  if (!/^https:\/\/github\.com\//.test(g.repo)) fail("repo URL", i + " " + g.repo);
}
for (const p of paths) for (const id of p.steps) if (!byId[id]) fail("路径引用", p.title + " -> " + id);
for (const t of topics) for (const [id] of t.links) if (!byId[id]) fail("主题引用", t.title + " -> " + id);
if (!problems.some((p) => p.startsWith("site URL") || p.startsWith("repo URL") || p.startsWith("路径引用") || p.startsWith("主题引用"))) {
  ok("路径、主题与链接引用有效");
}

// search index
const idxFile = path.join(HUB, "assets", "search-index.js");
if (!fs.existsSync(idxFile)) fail("搜索索引存在", "missing");
else {
  const idxSandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(idxFile, "utf8"), idxSandbox);
  const idx = idxSandbox.window.HUB_SEARCH || [];
  if (idx.length < 100) fail("搜索索引非空", String(idx.length));
  else ok("搜索索引 " + idx.length + " 条");
  for (const g of guides) {
    if (!idx.some((e) => e.g === g.id)) fail("索引覆盖", g.id);
  }
}

// publish files
for (const f of ["hub/.nojekyll", "index.html", "README.md", "DEPLOY.md"]) {
  if (!fs.existsSync(path.join(ROOT, f))) fail("发布文件", f);
}
if (!problems.some((p) => p.startsWith("发布文件"))) ok("发布入口与元文件齐全");

if (problems.length) {
  console.log("\n共 " + problems.length + " 项失败");
  process.exit(1);
}
console.log("\n结论：Hub 静态检查全部通过");
