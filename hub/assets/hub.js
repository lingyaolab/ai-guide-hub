(function () {
  "use strict";
  var GUIDES = window.HUB_GUIDES || [];
  var PATHS = window.HUB_PATHS || [];
  var TOPICS = window.HUB_TOPICS || [];
  var PROJECTS = window.HUB_PROJECTS || [];
  var INDEX = window.HUB_SEARCH || [];
  var byId = {};
  GUIDES.forEach(function (g) { byId[g.id] = g; });

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function guideLink(id) { return byId[id] ? byId[id].site : "#"; }

  // theme
  var root = document.documentElement;
  try {
    var saved = localStorage.getItem("hub-theme-v2");
    if (saved) root.setAttribute("data-theme", saved);
    else root.setAttribute("data-theme", "light");
  } catch (e) {}
  var themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("hub-theme-v2", next); } catch (e) {}
      themeBtn.setAttribute("aria-pressed", next === "dark" ? "true" : "false");
    });
  }

  // mobile nav
  var menuBtn = document.getElementById("menu-toggle");
  var nav = document.getElementById("site-nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  // current nav
  var page = document.body.getAttribute("data-page");
  document.querySelectorAll("#site-nav a").forEach(function (a) {
    if (a.getAttribute("data-nav") === page) a.setAttribute("aria-current", "page");
  });

  // guide cards
  var grid = document.getElementById("guide-grid");
  if (grid) {
    GUIDES.forEach(function (g) {
      var card = el("article", "guide-card");
      card.style.setProperty("--accent-guide", g.accent);
      card.appendChild(el("div", "guide-top"));
      var top = card.querySelector(".guide-top");
      top.appendChild(el("span", "badge", g.lang));
      top.appendChild(el("span", "guide-version", "v" + g.version));
      var h3 = el("h3");
      var a = el("a", null, g.name);
      a.href = g.site;
      h3.appendChild(a);
      card.appendChild(h3);
      card.appendChild(el("p", "guide-tagline", g.tagline));
      var best = el("div", "guide-best");
      best.innerHTML = "<b>适合：</b>" + g.bestFor;
      card.appendChild(best);
      var links = el("div", "guide-links");
      var read = el("a", null, "开始阅读 →"); read.href = g.site;
      var repo = el("a", "muted", "查看源码"); repo.href = g.repo;
      links.appendChild(read); links.appendChild(repo);
      card.appendChild(links);
      grid.appendChild(card);
    });
  }

  // matrix rows
  var matrix = document.getElementById("matrix-rows");
  if (matrix) {
    GUIDES.forEach(function (g) {
      var row = el("a", "matrix-row");
      row.href = g.site;
      var dot = el("span", "matrix-dot"); dot.style.background = g.accent;
      row.appendChild(dot);
      row.appendChild(el("span", "matrix-name", g.name + " · " + g.lang));
      row.appendChild(el("span", "matrix-meta", g.version));
      matrix.appendChild(row);
    });
  }

  // paths
  var paths = document.getElementById("path-grid");
  if (paths) {
    PATHS.forEach(function (p) {
      var card = el("article", "path-card");
      card.appendChild(el("h3", null, p.title));
      card.appendChild(el("div", "path-note", p.note));
      var ol = el("ol", "path-steps");
      p.steps.forEach(function (id) {
        var g = byId[id];
        if (!g) return;
        var li = el("li");
        var a = el("a", null, g.name + " " + g.version);
        a.href = g.site;
        li.appendChild(a);
        ol.appendChild(li);
      });
      card.appendChild(ol);
      paths.appendChild(card);
    });
  }

  // topics
  var topics = document.getElementById("topic-grid");
  if (topics) {
    TOPICS.forEach(function (t) {
      var card = el("article", "topic");
      card.appendChild(el("h3", null, t.title));
      card.appendChild(el("p", null, t.desc));
      var links = el("div", "topic-links");
      t.links.forEach(function (pair) {
        var g = byId[pair[0]];
        if (!g) return;
        var a = el("a", null, g.name + " " + pair[1]);
        a.href = g.site + "chapters/" + pair[1] + "-";
        // The exact file name is unknown here; use the search index to resolve.
        var hit = INDEX.filter(function (e) {
          return e.g === pair[0] && (e.t.indexOf(pair[1] + " ") === 0 || e.t.indexOf(pair[1] + "·") === 0);
        })[0];
        if (hit) a.href = hit.u;
        links.appendChild(a);
      });
      card.appendChild(links);
      topics.appendChild(card);
    });
  }

  // projects
  var projects = document.getElementById("project-list");
  if (projects) {
    PROJECTS.forEach(function (p) {
      var g = byId[p.guide];
      if (!g) return;
      var row = el("article", "project");
      var left = el("div");
      left.appendChild(el("h3", null, p.title));
      left.appendChild(el("div", "project-guide", g.name + " · 第 " + p.chapter + " 章"));
      row.appendChild(left);
      row.appendChild(el("p", null, p.desc));
      var a = el("a", "btn", "打开项目");
      a.href = g.site + "chapters/" + p.chapter + "-";
      var hit = INDEX.filter(function (e) {
        return e.g === p.guide && e.t.indexOf(p.chapter + " ") === 0;
      })[0];
      if (hit) a.href = hit.u;
      row.appendChild(a);
      projects.appendChild(row);
    });
  }

  // site stats
  var statNodes = document.querySelectorAll("[data-stat]");
  if (statNodes.length) {
    var pageSet = {};
    INDEX.forEach(function (e) {
      pageSet[e.u.split("#")[0]] = true;
    });
    var statValues = {
      guides: GUIDES.length,
      pages: Object.keys(pageSet).length,
      sections: INDEX.length,
      projects: PROJECTS.length,
    };
    statNodes.forEach(function (node) {
      var value = statValues[node.getAttribute("data-stat")];
      if (value != null) node.textContent = value.toLocaleString("zh-CN");
    });
  }

  // search
  var wrap = document.getElementById("search-wrap");
  var input = document.getElementById("search-input");
  var results = document.getElementById("search-results");
  var openBtn = document.getElementById("search-open");
  var closeBtn = document.getElementById("search-close");

  function renderResults(q) {
    if (!results) return;
    results.innerHTML = "";
    q = (q || "").trim().toLowerCase();
    if (!q) {
      results.appendChild(el("div", "search-empty", "输入章节、概念或框架名，例如 checkpoint、HITL、RAG。"));
      return;
    }
    var hits = INDEX.filter(function (e) {
      return (e.t + " " + e.s + " " + e.k).toLowerCase().indexOf(q) >= 0;
    }).slice(0, 24);
    if (!hits.length) {
      results.appendChild(el("div", "search-empty", "没有匹配结果。试试更短的关键词。"));
      return;
    }
    hits.forEach(function (e) {
      var a = el("a", "search-item");
      a.href = e.u;
      a.appendChild(el("b", null, e.t + " · " + e.s));
      var g = byId[e.g];
      a.appendChild(el("span", null, g ? g.name : e.g));
      results.appendChild(a);
    });
  }
  function openSearch() {
    if (!wrap) return;
    wrap.classList.add("open");
    wrap.setAttribute("aria-hidden", "false");
    if (input) { input.value = ""; input.focus(); renderResults(""); }
  }
  function closeSearch() {
    if (!wrap) return;
    wrap.classList.remove("open");
    wrap.setAttribute("aria-hidden", "true");
  }
  if (openBtn) openBtn.addEventListener("click", openSearch);
  if (closeBtn) closeBtn.addEventListener("click", closeSearch);
  if (wrap) {
    wrap.addEventListener("click", function (e) { if (e.target === wrap) closeSearch(); });
  }
  if (input) {
    input.addEventListener("input", function () { renderResults(input.value); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeSearch();
      if (e.key === "Enter") {
        var first = results.querySelector("a");
        if (first) location.href = first.href;
      }
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "/" && !/input|textarea/i.test(document.activeElement.tagName)) {
      e.preventDefault(); openSearch();
    }
    if (e.key === "Escape") closeSearch();
  });
})();
