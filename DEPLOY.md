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
2. 阿里云 OSS Bucket 开启静态网站托管
3. CDN 回源到 OSS，配置 HTTPS 证书
4. 把 `dist/` 全量上传到 Bucket 根目录
5. CDN 缓存：HTML 短缓存，`assets/` 长缓存

上传示例：

```bash
ossutil cp -r dist/ oss://your-bucket/ --update
```

## GitHub Pages（仅预览）

仓库自带 `.github/workflows/deploy-pages.yml`：

1. 推送 `main`
2. Settings → Pages → Source 选择 **GitHub Actions**
3. 工作流会构建 `dist/` 并发布

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

Hub 源站的 `hub/assets/data.js` 仍然保留外部 URL，方便单独预览。
聚合构建时会自动改写成：

```text
/spring-ai/
/langchain4j/
/agentscope-py/
/agentscope-java/
/langgraph/
```

所以正式部署不需要手工改链接。
