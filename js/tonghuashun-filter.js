/**
 * 同花顺首页卡片过滤脚本
 *
 * 功能：根据 card_title 过滤 homepage_v2/v3/old_user 响应中的卡片
 * 每个卡片标题独立 switch 开关，通过 Loon [Argument] 段配置
 *
 * Loon 参数传递：argument=[{enable},{炒股大赛},{k线训练营},...]
 * 脚本内通过 $argument.变量名 获取值（字符串 "true"/"false"）
 */

// 所有可能的卡片标题列表（与插件 [Argument] 中的 switch 变量名对应）
var ALL_CARD_TITLES = [
    "炒股大赛",
    "k线训练营",
    "全球机会",
    "自选股概览",
    "AI自选诊断",
    "投顾分析",
    "投资必读",
    "主编精选",
    "实时热点",
    "热点复盘",
    "业绩披露",
    "并购重组",
    "自选大事",
    "热门股票",
    "资金流入",
    "热门板块"
];

try {
    // 检查总开关
    if ($argument.enable !== "true") {
        console.log("[同花顺过滤] 总开关已关闭，跳过过滤");
        $done({});
        return;
    }

    // 解析每个卡片标题的开关，收集需要过滤的标题
    var filterTitles = [];
    ALL_CARD_TITLES.forEach(function (title) {
        if ($argument[title] === "true") {
            filterTitles.push(title);
        }
    });

    if (filterTitles.length === 0) {
        console.log("[同花顺过滤] 未开启任何卡片过滤，跳过");
        $done({});
        return;
    }

    console.log("[同花顺过滤] 过滤标题: " + JSON.stringify(filterTitles));

    // 解析响应体
    var body = $response.body;
    var obj = JSON.parse(body);
    var removedCount = 0;

    // 遍历 floor_list → card_show_list，过滤匹配的卡片
    if (obj && obj.data && Array.isArray(obj.data.floor_list)) {
        obj.data.floor_list.forEach(function (floor) {
            if (!Array.isArray(floor.card_show_list)) return;

            var beforeCount = floor.card_show_list.length;

            floor.card_show_list = floor.card_show_list.filter(function (card) {
                if (!card || !card.card_title) return true;

                var titleValue = card.card_title.value;
                if (!titleValue || typeof titleValue !== "string") return true;

                // 检查是否命中过滤标题
                for (var i = 0; i < filterTitles.length; i++) {
                    if (titleValue.indexOf(filterTitles[i]) !== -1) {
                        removedCount++;
                        return false;
                    }
                }
                return true;
            });

            var afterCount = floor.card_show_list.length;
            if (beforeCount !== afterCount) {
                console.log("[同花顺过滤] " + (floor.floor_name || floor.floor_key) + " 移除 " + (beforeCount - afterCount) + " 张卡片");
            }
        });
    }

    console.log("[同花顺过滤] 共移除 " + removedCount + " 张卡片");
    $done({ body: JSON.stringify(obj) });

} catch (e) {
    console.log("[同花顺过滤] 脚本异常: " + e.message);
    $done({});
}
