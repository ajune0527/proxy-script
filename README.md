# proxy-script

Loon 插件 / 脚本集合。新增插件：往 `modules/` 放一个 `.plugin` 文件，然后运行 `python3 tools/sync-plugins.py`
刷新下表的安装链接与 `auto.conf` 的插件清单，无需在 Loon 里手输 URL。

## 一键安装

在手机上点「安装」即会唤起 Loon 导入插件；已安装的插件在 Loon 的插件列表里更新即可。

<!-- plugins:start -->
| 插件 | 说明 | 一键安装 |
| --- | --- | --- |
| Baby Tracker 开屏广告拦截 | 屏蔽 Baby Tracker（com.bluemobile.babylife）的优量汇、穿山甲和 Google 广告请求。 | [安装](https://www.nsloon.com/openloon/import?plugin=https%3A%2F%2Fraw.githubusercontent.com%2Fajune0527%2Fproxy-script%2Frefs%2Fheads%2Fmain%2Fmodules%2Fbaby-tracker-no-ads.plugin) |
| 致富运营位净化 | 过滤致富APP运营位（Banner）响应中的推广/营销项目。按 slotConfig.nameSc 过滤，每个运营位独立开关，支持自定义关键字。 | [安装](https://www.nsloon.com/openloon/import?plugin=https%3A%2F%2Fraw.githubusercontent.com%2Fajune0527%2Fproxy-script%2Frefs%2Fheads%2Fmain%2Fmodules%2Fchief-banner-filter.plugin) |
| 致富个股新闻净化 | 过滤致富APP「个股24小时新闻」响应，移除个股详情页的24小时新闻列表。 | [安装](https://www.nsloon.com/openloon/import?plugin=https%3A%2F%2Fraw.githubusercontent.com%2Fajune0527%2Fproxy-script%2Frefs%2Fheads%2Fmain%2Fmodules%2Fchief-news-filter.plugin) |
| 自定义脚本合集 | 电信抽奖 + 沉浸式翻译订阅修改 | [安装](https://www.nsloon.com/openloon/import?plugin=https%3A%2F%2Fraw.githubusercontent.com%2Fajune0527%2Fproxy-script%2Frefs%2Fheads%2Fmain%2Fmodules%2Fcustom-scripts.plugin) |
| NightEye Pro | 解锁 NightEye 深色模式 Pro 功能，修改订阅状态为已激活，过期时间设为 2099 年。 | [安装](https://www.nsloon.com/openloon/import?plugin=https%3A%2F%2Fraw.githubusercontent.com%2Fajune0527%2Fproxy-script%2Frefs%2Fheads%2Fmain%2Fmodules%2Fnighteye.plugin) |
| 同花顺九宫格净化 | 过滤首页九宫格(appIdInfo)中的推广/营销项目。每个项目标题独立开关控制。 | [安装](https://www.nsloon.com/openloon/import?plugin=https%3A%2F%2Fraw.githubusercontent.com%2Fajune0527%2Fproxy-script%2Frefs%2Fheads%2Fmain%2Fmodules%2Ftonghuashun-grid-filter.plugin) |
| 同花顺净化 | 拦截同花顺广告请求，过滤首页多余卡片。每个卡片标题独立开关控制。 | [安装](https://www.nsloon.com/openloon/import?plugin=https%3A%2F%2Fraw.githubusercontent.com%2Fajune0527%2Fproxy-script%2Frefs%2Fheads%2Fmain%2Fmodules%2Ftonghuashun-no-ads.plugin) |
| 约牛 Token 自动获取 | 自动抓取 touguapi.zx093.com 请求头中的 centraltoken 并持久化到本地本地变量 yueniu 中。 | [安装](https://www.nsloon.com/openloon/import?plugin=https%3A%2F%2Fraw.githubusercontent.com%2Fajune0527%2Fproxy-script%2Frefs%2Fheads%2Fmain%2Fmodules%2Fyueniu.plugin) |
<!-- plugins:end -->