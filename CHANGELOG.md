# 更新记录

## v1.2.0 — 2026-11-07

默认白天模式，并补上关于页的感谢支持区。

- Hub 新访客默认使用 light 主题；已有偏好仍可切换并保存。
- 关于页新增「感谢支持」：GitHub 地址、微信 / 支付宝赞赏码位置。
- 赞赏码图片放到 `hub/assets/support-wechat.png` / `support-alipay.png` 后，
  构建会自动替换占位图。
- 聚合构建与站内路径保持一致。

## v1.1.0 — 2026-11-07

聚合构建：一个域名、一份部署。

- 新增 `tools/build-site.cjs`：从 GitHub 拉取五套教程的固定 commit，组装为 `dist/`。
- 子路径：`/spring-ai/`、`/langchain4j/`、`/agentscope-py/`、`/agentscope-java/`、`/langgraph/`。
- 构建时自动改写 `data.js` 和搜索索引为站内路径。
- 给每个教程页注入「← 教程库」、广告位与公共样式。
- 新增 `hub/assets/hub-embed.css`、`hub/assets/ads.js`。
- 部署文档改为阿里云 OSS + CDN 为主，GitHub Pages 仅预览。

## v1.0.0 — 2026-11-07

首个版本：教程库的统一入口。

- 首页：教程库卡片、三条学习路径、速查表、主题预览、项目预览。
- 框架对照：这些框架的定位、状态、工具、RAG、HITL、服务化与选型问题。
- 主题地图：第一次对话、工具、RAG、记忆、HITL、多 Agent、服务化、生产与评测。
- 项目页：收口项目与 samples 运行方式。
- 关于页：版本矩阵、来源与维护边界。
- 跨站搜索：从教程库的 `nav.js` 生成 2150 条章节索引。
- 主题：charcoal + lime，与教程库各自的颜色区分。
