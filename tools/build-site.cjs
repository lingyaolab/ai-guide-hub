/* AI Guide Hub 聚合构建：把五套教程放到同一个域的五个子路径下。
 *
 * 默认从 GitHub 拉取固定 commit；本地调试可用 --local 读取同级目录。
 * 输出 dist/，直接上传到阿里云 OSS / 任意静态服务器。
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const CACHE = path.join(ROOT, ".cache", "guides");
const LOCAL = process.argv.includes("--local");
const KEEP = process.argv.includes("--keep");

const GUIDES = [
  {
    id: "spring-ai",
    dataId: "springai",
    repo: "https://github.com/lingyaolab/springai-guide.git",
    ref: "e60c50ee45b24413a1519fcf999848206b2524bf",
    local: "../springai-guide",
    siteDir: "spring-ai-learn",
  },
  {
    id: "langchain4j",
    dataId: "langchain4j",
    repo: "https://github.com/lingyaolab/langchain4j-guide.git",
    ref: "e5f00b60ede9119500eed59f5e44e50967683e77",
    local: "../langchain4j-guide",
    siteDir: "langchain4j-learn",
  },
  {
    id: "agentscope-py",
    dataId: "agentscope-py",
    repo: "https://github.com/lingyaolab/agentscope-py-guide.git",
    ref: "f878c1867bfd842454269acccbd92da6ca885182",
    local: "../agentscope-py-guide",
    siteDir: "agentscope-py-learn",
  },
  {
    id: "agentscope-java",
    dataId: "agentscope-java",
    repo: "https://github.com/lingyaolab/agentscope-guide.git",
    ref: "4d9951e8e485e7ad36090518632cc91de8a93b9b",
    local: "../agentscope-guide",
    siteDir: "agentscope-java-learn",
  },
  {
    id: "langgraph",
    dataId: "langgraph",
    repo: "https://github.com/lingyaolab/langgraph-guide.git",
    ref: "737b718da705bd40dd82ca488f76c116da977805",
    local: "../langgraph-guide",
    siteDir: "langgraph-learn",
  },
];

const GUIDE_NAMES = {
  "spring-ai": "Spring AI",
  "langchain4j": "LangChain4j",
  "agentscope-py": "AgentScope Python",
  "agentscope-java": "AgentScope Java",
  "langgraph": "LangGraph",
};

function sh(cwd, cmd, args) {
  execFileSync(cmd, args, { cwd, stdio: "inherit" });
}

function fetchGuide(g) {
  if (LOCAL) {
    const dir = path.resolve(ROOT, g.local);
    if (!fs.existsSync(path.join(dir, g.siteDir))) throw new Error("missing local guide: " + dir);
    return dir;
  }

  fs.mkdirSync(CACHE, { recursive: true });
  const dir = path.join(CACHE, g.id);
  if (fs.existsSync(path.join(dir, ".git"))) {
    try {
      const head = execFileSync("git", ["-C", dir, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
      if (head === g.ref) return dir;
    } catch {}
    fs.rmSync(dir, { recursive: true, force: true });
  }

  fs.mkdirSync(dir, { recursive: true });
  sh(dir, "git", ["init", "-q"]);
  sh(dir, "git", ["remote", "add", "origin", g.repo]);
  sh(dir, "git", ["fetch", "--depth", "1", "origin", g.ref]);
  sh(dir, "git", ["checkout", "-q", "FETCH_HEAD"]);
  return dir;
}

function copyDir(from, to) {
  fs.cpSync(from, to, { recursive: true });
}

function buildData(mounts) {
  let s = fs.readFileSync(path.join(ROOT, "hub", "assets", "data.js"), "utf8");
  for (const g of mounts) {
    const re = new RegExp('(id: "' + g.dataId + '"[\\s\\S]*?site: ")[^"]+(")');
    s = s.replace(re, "$1/" + g.id + "/$2");
  }
  fs.writeFileSync(path.join(DIST, "assets", "data.js"), s, "utf8");
}

function buildSearch(mounts) {
  const vm = require("vm");
  const entries = [];
  for (const g of mounts) {
    const navFile = path.join(DIST, g.id, "assets", "nav.js");
    if (!fs.existsSync(navFile)) continue;
    const sandbox = { window: {} };
    vm.runInNewContext(fs.readFileSync(navFile, "utf8"), sandbox);
    const site = sandbox.window.AS_SITE;
    for (const group of site.groups) {
      for (const item of group.items) {
        if (item.status !== "ready") continue;
        const kw = (item.kw || []).join(" ");
        for (const sec of item.sections || []) {
          entries.push({
            g: g.dataId,
            t: item.num + " " + item.title,
            s: sec[1],
            u: "/" + g.id + "/" + item.href + "#" + sec[0],
            k: kw + " " + group.title,
          });
        }
      }
    }
  }
  fs.writeFileSync(
    path.join(DIST, "assets", "search-index.js"),
    "window.HUB_SEARCH=" + JSON.stringify(entries) + ";\n",
    "utf8"
  );
  return entries.length;
}

function swapSupportImages() {
  const file = path.join(DIST, "about.html");
  if (!fs.existsSync(file)) return;
  let s = fs.readFileSync(file, "utf8");
  for (const kind of ["wechat", "alipay"]) {
    const candidates = ["png", "jpg", "jpeg"].map((ext) => "assets/support-" + kind + "." + ext);
    const real = candidates.find((p) => fs.existsSync(path.join(DIST, p)));
    if (real) {
      s = s.split("assets/support-" + kind + "-placeholder.svg").join(real);
    }
  }
  fs.writeFileSync(file, s, "utf8");
}

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

let descriptionCount = 0;

function injectCommon(g) {
  const root = path.join(DIST, g.id);
  const guideName = GUIDE_NAMES[g.id] || g.id;
  let count = 0;
  function walk(dir) {
    for (const name of fs.readdirSync(dir)) {
      const p = path.join(dir, name);
      const st = fs.statSync(p);
      if (st.isDirectory()) walk(p);
      else if (name.endsWith(".html")) {
        let s = fs.readFileSync(p, "utf8");
        let changed = false;
        if (!name.endsWith("404.html") && !/<meta\s+name=["']description["']/i.test(s)) {
          const title = (s.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "";
          if (title) {
            const clean = title.replace(/\s*·\s*[^·]+$/, "").trim() || guideName + " 教程";
            let desc = "《" + clean + "》" + guideName + " 教程，含源码出处、可运行示例和完整项目。";
            if (desc.length > 150) desc = desc.slice(0, 147) + "...";
            s = s.replace(
              "</head>",
              '  <meta name="description" content="' + escapeAttr(desc) + '" />\n  </head>'
            );
            descriptionCount++;
            changed = true;
          }
        }
        if (!s.includes("hub-embed.css")) {
          s = s.replace(
            "</head>",
            '  <link rel="stylesheet" href="/assets/hub-embed.css" />\n  </head>'
          );
          s = s.replace(
            "</body>",
            '  <a class="hub-back" href="/">← 全部教程</a>\n' +
              '  <div class="ad-slot" data-ad-slot="article-bottom"></div>\n' +
              '  <script src="/assets/ads.js" defer></script>\n' +
              "  </body>"
          );
          count++;
          changed = true;
        }
        if (changed) fs.writeFileSync(p, s, "utf8");
      }
    }
  }
  walk(root);
  return count;
}

if (!KEEP && fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

// Hub root
copyDir(path.join(ROOT, "hub"), DIST);

const mounts = [];
for (const g of GUIDES) {
  const src = fetchGuide(g);
  const site = path.join(src, g.siteDir);
  const dest = path.join(DIST, g.id);
  copyDir(site, dest);
  mounts.push(g);
  console.log("mounted", g.id, "from", src);
}

buildData(mounts);
const total = buildSearch(mounts);
swapSupportImages();
let injected = 0;
for (const g of mounts) injected += injectCommon(g);

console.log(
  "built dist/ with",
  mounts.length,
  "guides,",
  total,
  "search entries,",
  injected,
  "pages injected,",
  descriptionCount,
  "descriptions added"
);
