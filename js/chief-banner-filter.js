/**
 * 致富Banner过滤脚本
 *
 * 功能：根据 bannerConfig.nameSc 过滤 Banner 响应中的 data 元素
 * 每个 nameSc 独立 switch 开关，通过 Loon [Argument] 段配置
 */

// 所有可能的 banner nameSc 列表（与插件 [Argument] 中的 switch 变量名对应）
var ALL_BANNER_NAMES = [
    "首页Banner-新版",
    "首页公告"
];

try {
    console.log("[致富Banner过滤] 脚本开始执行");

    // 检查总开关
    if ($argument['Banner过滤'] === 'false') {
        console.log("[致富Banner过滤] 总开关已关闭，跳过过滤");
        $done({});
        return;
    }

    // 收集需要过滤的 nameSc
    var filterNames = [];
    ALL_BANNER_NAMES.forEach(function (name) {
        if ($argument[name]) {
            filterNames.push(name);
        }
    });
    console.log("[致富Banner过滤] 过滤nameSc: " + JSON.stringify(filterNames));

    // 自定义过滤
    if ($argument['Banner自定义过滤']) {
        var customFilter = $argument['Banner自定义过滤'].split(',');
        filterNames = filterNames.concat(customFilter);
        console.log("[致富Banner过滤] 自定义过滤: " + $argument['Banner自定义过滤']);
    }

    if (filterNames.length === 0) {
        console.log("[致富Banner过滤] 未开启任何过滤，跳过");
        $done({});
        return;
    }

    // 解析响应体
    var body = $response.body;
    var obj = JSON.parse(body);

    // 过滤 data 数组
    if (Array.isArray(obj.data)) {
        var beforeCount = obj.data.length;

        obj.data = obj.data.filter(function (item) {
            if (!item || !item.bannerConfig || !item.bannerConfig.nameSc) return true;

            for (var i = 0; i < filterNames.length; i++) {
                if (item.bannerConfig.nameSc.indexOf(filterNames[i]) !== -1) {
                    return false;
                }
            }
            return true;
        });

        console.log("[致富Banner过滤] data 移除 " + (beforeCount - obj.data.length) + " 项");
    }

    console.log("[致富Banner过滤] 过滤完成");
    $done({ body: JSON.stringify(obj) });

} catch (e) {
    console.log("[致富Banner过滤] 脚本异常: " + e.message);
    $done({});
}
