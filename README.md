# AI Guide Hub

把多套源码对齐的 AI 应用开发教程收在一张地图上。当前收录：

- Spring AI 2.0.2
- LangChain4j 1.23.0
- AgentScope Python 2.0.11
- AgentScope Java 2.0.4
- LangGraph 1.2.20

后续新增教程只需要改 `hub/assets/data.js` 并重跑搜索索引，不需要改页面结构。

Hub 只做**选型、学习路径、主题索引与跨站搜索**，不复制正文。各教程仍然独立仓库、独立部署、独立版本。

> 站点链接默认假设各教程仓库已开启 GitHub Pages。如果某个链接 404，先到对应仓库的 README 确认 Pages 状态；`hub/assets/data.js` 里的 `site` 字段是唯一需要改的地方。

## 本地看站

```bash
node tools/build-site.cjs --local
python -m http.server 8104 --directory dist
# http://localhost:8104/
```

注意：不要直接打开 `hub/index.html` 当完整站点。`hub/` 只是 Hub 源壳，教程链接按 `/spring-ai/` 等站内路径解析；完整预览必须走 `dist/`。

`--local` 读取同级目录里的五套教程；默认不带参数时会从 GitHub 拉取固定 commit 到 `.cache/`，适合 CI。

把两张赞助收款码保存为 `hub/assets/support-wechat.jpg`（或 `.png`）与 `hub/assets/support-alipay.jpg`（或 `.png`），构建时会自动使用。

## 聚合构建（推荐）

最终发布物不是 `hub/`，而是 `dist/`：

```bash
node tools/build-site.cjs
```

它会：

1. 拉取五套教程的固定 commit；
2. 把 Hub 放到 `/`，教程分别放到 `/spring-ai/`、`/langchain4j/`、`/agentscope-py/`、`/agentscope-java/`、`/langgraph/`；
3. 把 `data.js` 与搜索索引改写成站内路径；
4. 给每个教程页注入「← 教程库」、广告位和公共样式。

把 `dist/` 上传到阿里云 OSS / 任意静态服务器即可。详见 `DEPLOY.md`。

## 更新搜索索引

Hub 的搜索索引从教程库各自的 `nav.js` 生成。默认假设各教程仓库是同级目录：

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
├── index.html          首页：教程库、路径、速查
├── compare.html        框架对照与选型
├── topics.html         主题地图
├── projects.html       完整项目与 samples
├── about.html          版本、来源与阅读方式
├── 404.html
└── assets/
    ├── data.js         教程库、路径、主题、项目数据
    ├── search-index.js 跨站搜索索引（生成）
    ├── hub.css         深色 charcoal + lime 主题
    ├── hub-embed.css   注入教程页的返回链接/广告位样式
    ├── ads.js          广告位占位（默认关闭）
    └── hub.js          渲染、搜索、主题切换

tools/
├── build-site.cjs      聚合构建：拉源码 → dist/ + 注入公共层
├── build-search-index.cjs  单独更新 Hub 源站搜索索引
└── check-site.cjs      源站静态检查

dist/                   最终发布物（不入库）
```

## 设计原则

1. **不复制正文**：Hub 只放入口与索引，教程正文仍以各自仓库为准。
2. **构建时聚合**：CI 拉取固定 commit，组装成 `dist/`，不在源码里留五份副本。
3. **子路径部署**：一个域名、一份备案、一套广告脚本。
4. **保留教程主题**：不重写五套教程的视觉；只在构建时注入公共返回链接与广告位。
