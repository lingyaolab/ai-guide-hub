/* Build a cross-guide search index from each guide's nav.js. */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const HUB = path.join(__dirname, "..");
const OUT = path.join(HUB, "hub", "assets", "search-index.js");

const GUIDES = [
  {
    id: "springai",
    site: "https://lingyaolab.github.io/springai-guide/",
    nav: "../../springai-guide/spring-ai-learn/assets/nav.js",
  },
  {
    id: "langchain4j",
    site: "https://lingyaolab.github.io/langchain4j-guide/",
    nav: "../../langchain4j-guide/langchain4j-learn/assets/nav.js",
  },
  {
    id: "agentscope-py",
    site: "https://lingyaolab.github.io/agentscope-py-guide/",
    nav: "../../agentscope-py-guide/agentscope-py-learn/assets/nav.js",
  },
  {
    id: "agentscope-java",
    site: "https://lingyaolab.github.io/agentscope-guide/",
    nav: "../../agentscope-guide/agentscope-java-learn/assets/nav.js",
  },
  {
    id: "langgraph",
    site: "https://lingyaolab.github.io/langgraph-guide/",
    nav: "../../langgraph-guide/langgraph-learn/assets/nav.js",
  },
];

const entries = [];
for (const g of GUIDES) {
  const file = path.join(__dirname, g.nav);
  if (!fs.existsSync(file)) {
    console.warn("skip missing nav:", file);
    continue;
  }
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(file, "utf8"), sandbox);
  const site = sandbox.window.AS_SITE;
  for (const group of site.groups) {
    for (const item of group.items) {
      if (item.status !== "ready") continue;
      const kw = (item.kw || []).join(" ");
      for (const sec of item.sections || []) {
        entries.push({
          g: g.id,
          t: item.num + " " + item.title,
          s: sec[1],
          u: g.site + item.href + "#" + sec[0],
          k: kw + " " + group.title,
        });
      }
    }
  }
}

const js = "window.HUB_SEARCH=" + JSON.stringify(entries) + ";\n";
fs.writeFileSync(OUT, js, "utf8");
console.log("wrote", entries.length, "entries to", path.relative(HUB, OUT));
