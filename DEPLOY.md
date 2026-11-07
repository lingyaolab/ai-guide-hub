# 部署

正式发布物是 `dist/`，由 `node tools/build-site.cjs` 生成。

## 构建

```bash
# 本地：直接读同级目录里的五套教程
node tools/build-site.cjs --local

# CI / 干净环境：从 GitHub 拉取固定 commit
node tools/build-site.cjs
```

产物结构：

```text
dist/
├── index.html           Hub
├── spring-ai/
├── langchain4j/
├── agentscope-py/
├── agentscope-java/
├── langgraph/
└── assets/
```

## 推荐：阿里云 OSS + CDN

适合国内访问和后续放广告：

1. 一个已备案域名，例如 `guide.example.com`
2. 阿里云 OSS Bucket 开启静态网站托管，默认首页 `index.html`，默认 404 页 `404.html`
3. CDN 回源到 OSS，配置 HTTPS 证书，开启 Brotli / gzip
4. 把 `dist/` 全量上传到 Bucket 根目录
5. CDN 缓存：
   - HTML、`search-index.js`：`no-cache` 或 5 分钟
   - `assets/` 与教程静态资源：文件名没有 hash，建议 1 小时到 1 天，不要设一年

上传示例：

```bash
ossutil cp -r dist/ oss://your-bucket/ --update
```

## GitHub Pages（仅预览）

仓库自带 `.github/workflows/deploy-pages.yml`，目前是 `workflow_dispatch` 手动触发，避免 Pages 未启用时每次 push 都失败。

启用预览：

1. Settings → Pages → Source 选择 **GitHub Actions**
2. 在 Actions 里手动运行 **Deploy site**
3. 工作流会构建 `dist/` 并发布

注意：当前聚合构建使用 `/spring-ai/` 这类根绝对路径。如果 Pages 地址是项目子路径（`/ai-guide-hub/`），需要先给构建加 `BASE_PATH` 或改成相对路径，否则教程链接会跳到域名根。

GitHub Pages 只建议做预览。正式站、备案与广告放阿里云。

## 广告接入

`tools/build-site.cjs` 会给每个教程页注入：

```html
<a class="hub-back" href="/">← 全部教程</a>
<div class="ad-slot" data-ad-slot="article-bottom"></div>
<script src="/assets/ads.js" defer></script>
```

广告位默认隐藏；在 `hub/assets/ads.js` 里把 `enabled` 改为 `true`，再填百度联盟代码。
正式上线前补：

- 隐私政策 / Cookie 说明
- 广告标识
- ICP 备案号
- `ads.txt`

## 链接配置

`hub/assets/data.js` 和搜索索引使用 `/spring-ai/` 等站内路径。
聚合构建保持这些路径不变，正式部署到 OSS 根目录即可。

```text
/spring-ai/
/langchain4j/
/agentscope-py/
/agentscope-java/
/langgraph/
```

所以正式部署不需要手工改链接。
