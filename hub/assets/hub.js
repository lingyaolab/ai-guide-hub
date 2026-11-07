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
  function syncThemeButton() {
    if (!themeBtn) return;
    var dark = root.getAttribute("data-theme") === "dark";
    themeBtn.setAttribute("aria-pressed", dark ? "true" : "false");
    themeBtn.setAttribute("aria-label", "切换主题（当前" + (dark ? "深色" : "浅色") + "）");
  }
  if (themeBtn) {
    syncThemeButton();
    themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("hub-theme-v2", next); } catch (e) {}
      syncThemeButton();
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
      if (g.accentInk) card.style.setProperty("--accent-guide-ink", g.accentInk);
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
  var countEl = null;

  function countNode() {
    if (!countEl && results && results.parentNode) {
      countEl = el("div", "search-count");
      countEl.id = "search-count";
      countEl.setAttribute("role", "status");
      countEl.setAttribute("aria-live", "polite");
      results.parentNode.insertBefore(countEl, results);
    }
    return countEl;
  }

  function renderResults(q) {
    if (!results) return;
    results.innerHTML = "";
    q = (q || "").trim().toLowerCase();
    var cn = countNode();
    if (!q) {
      if (cn) cn.textContent = "";
      results.appendChild(el("div", "search-empty", "输入章节、概念或框架名，例如 checkpoint、HITL、RAG。"));
      return;
    }
    var terms = q.split(/\s+/).filter(Boolean);
    var scored = [];
    for (var i = 0; i < INDEX.length; i++) {
      var e = INDEX[i];
      var t = e.t.toLowerCase();
      var s = e.s.toLowerCase();
      var k = e.k.toLowerCase();
      var hay = t + " " + s + " " + k;
      var ok = true;
      var score = 0;
      for (var j = 0; j < terms.length; j++) {
        var term = terms[j];
        if (hay.indexOf(term) < 0) { ok = false; break; }
        if (t === term) score += 100;
        else if (t.indexOf(term) === 0) score += 45;
        else if (t.indexOf(term) >= 0) score += 22;
        if (s.indexOf(term) >= 0) score += 8;
        if (k.indexOf(term) >= 0) score += 4;
      }
      if (ok) scored.push({ e: e, score: score });
    }
    scored.forEach(function (item) {
      var gn = byId[item.e.g] ? byId[item.e.g].name.toLowerCase() : "";
      if (gn && (gn === q || gn.indexOf(q) >= 0 || q.indexOf(gn) >= 0)) item.score += 40;
    });
    scored.sort(function (a, b) { return b.score - a.score; });
    var total = scored.length;
    if (cn) cn.textContent = total ? total + " 条结果" + (total > 24 ? "，显示前 24 条" : "") : "没有匹配结果";
    if (!total) {
      results.appendChild(el("div", "search-empty", "没有匹配结果。试试更短的关键词。"));
      return;
    }
    scored.slice(0, 24).forEach(function (item) {
      var e = item.e;
      var a = el("a", "search-item");
      a.href = e.u;
      a.appendChild(el("b", null, e.t + " · " + e.s));
      var g = byId[e.g];
      a.appendChild(el("span", null, g ? g.name : e.g));
      results.appendChild(a);
    });
  }
  var lastFocus = null;
  function openSearch() {
    if (!wrap) return;
    lastFocus = openBtn || document.activeElement;
    wrap.classList.add("open");
    wrap.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if (input) { input.value = ""; input.focus(); renderResults(""); }
  }
  function closeSearch() {
    if (!wrap || !wrap.classList.contains("open")) return;
    wrap.classList.remove("open");
    wrap.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    var target = lastFocus && lastFocus !== document.body ? lastFocus : openBtn;
    if (target && target.focus) target.focus();
  }
  if (openBtn) openBtn.addEventListener("click", openSearch);
  if (closeBtn) closeBtn.addEventListener("click", closeSearch);
  if (wrap) {
    wrap.addEventListener("click", function (e) { if (e.target === wrap) closeSearch(); });
    wrap.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var focusable = wrap.querySelectorAll('input, a[href], button');
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
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
