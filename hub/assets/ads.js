/* 广告位占位。接入百度联盟后，把 enabled 改为 true，并填入联盟代码。
 * 现在不加载任何第三方脚本，避免开发环境误请求。
 */
(function () {
  "use strict";
  var CONFIG = {
    enabled: false,
    // 百度联盟代码示例位置：把官方给的 <script> 逻辑放到 load() 里。
    load: function () {
      // document.querySelectorAll(".ad-slot").forEach(...)
    },
  };
  if (!CONFIG.enabled) return;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", CONFIG.load);
  } else {
    CONFIG.load();
  }
})();
