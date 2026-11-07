# 部署

发布物是 `hub/` 目录，纯静态。

## GitHub Pages

1. 推送 `main`。
2. 仓库 Settings → Pages → Source 选择 **GitHub Actions**。
3. 工作流会跑 `node tools/check-site.cjs`，然后发布 `hub/`。

仓库已包含 `.github/workflows/deploy-pages.yml`。

## Vercel / Netlify

- Build command：留空
- Publish directory：`hub`

## 自建服务器

把 `hub/` 作为站点根目录：

```nginx
server {
  listen 80;
  root /var/www/ai-guide-hub;
  index index.html;
  location / { try_files $uri $uri/ /404.html; }
}
```

## 链接配置

五套教程的站点地址在 `hub/assets/data.js` 的 `site` 字段；如果某个站换了域名，只改这一处。
