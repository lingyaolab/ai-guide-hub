# AI Guide Hub

把五套源码对齐的 AI 开发教程放在一张地图上：

- Spring AI 2.0.2
- LangChain4j 1.23.0
- AgentScope Python 2.0.11
- AgentScope Java 2.0.4
- LangGraph 1.2.20

Hub 只做**选型、学习路径、主题索引与跨站搜索**，不复制正文。五套教程仍然各自独立仓库、独立部署、独立版本。

> 站点链接默认假设五个仓库已开启 GitHub Pages。如果某个链接 404，先到对应仓库的 README 确认 Pages 状态；`hub/assets/data.js` 里的 `site` 字段是唯一需要改的地方。

## 本地看站

```bash
python -m http.server 8080
# http://localhost:8080/hub/
```

也可以直接双击 `hub/index.html`。

## 更新搜索索引

Hub 的搜索索引从五套教程各自的 `nav.js` 生成。默认假设五个仓库是同级目录：

```text
aidemo/
├── ai-guide-hub/
├── springai-guide/
├── langchain4j-guide/
├── agentscope-py-guide/
├── agentscope-guide/
└── langgraph-guide/
```

```bash
node tools/build-search-index.cjs
```

如果目录不同，改 `tools/build-search-index.cjs` 里的 `nav` 路径。

## 自检

```bash
node tools/check-site.cjs
```

## 目录

```text
hub/
├── index.html          首页：五套教程、路径、速查
├── compare.html        框架对照与选型
├── topics.html         主题地图
├── projects.html       五个收口项目与 samples
├── about.html          版本、来源与维护边界
├── 404.html
└── assets/
    ├── data.js         五套教程、路径、主题、项目数据
    ├── search-index.js 跨站搜索索引（生成）
    ├── hub.css         深色 charcoal + lime 主题
    └── hub.js          渲染、搜索、主题切换
```

## 设计原则

1. **不复制正文**：避免五个站内容漂移。
2. **固定外部 URL**：Hub 只链接各站 Pages / GitHub。
3. **横切主题**：同一能力可以横向比较，但每条学习路径仍然纵向阅读。
4. **零构建**：纯静态、无 CDN、无后端；只有生成搜索索引时用 Node。
