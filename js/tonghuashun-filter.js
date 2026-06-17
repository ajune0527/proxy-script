/**
 * 同花顺首页卡片过滤脚本
 * 
 * 功能：根据 card_title 过滤 homepage_v2/v3/old_user 响应中的卡片
 * 每个卡片标题独立开关，设 true=过滤该卡片，false=保留
 * 
 * Loon 参数 (argument) 格式:
 *   enable=true/false  — 总开关
 *   <卡片标题>=true/false  — 各卡片独立控制
 * 
 * 示例 argument:
 *   enable=true&炒股大赛=true&k线训练营=true&全球机会=true&热点复盘=false
 */

// ========== 所有可能的卡片标题（与 argument 参数对应） ==========
const ALL_CARD_TITLES = [
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
    "k线训练营",
    "资金流入",
    "热门板块",
    "炒股大赛",
    "全球机会"
];

// ========== 主逻辑 ==========
try {
    // 读取 argument 参数
    let arg = typeof $argument !== "undefined" ? ($argument || "") : "";

    // 解析 enable 总开关
    let enabled = true;
    let enableMatch = arg.match(/(?:^|&)enable=([^&]*)/);
    if (enableMatch) {
        enabled = enableMatch[1] !== "false" && enableMatch[1] !== "0";
    }

    if (!enabled) {
        console.log("[同花顺过滤] 总开关已禁用，跳过过滤");
        $done({});
        return;
    }

    // 从 argument 中解析每个卡片标题的独立开关
    // 格式: key=true 表示要过滤掉这个标题的卡片
    let filterTitles = [];
    ALL_CARD_TITLES.forEach(function (title) {
        // 构建正则：匹配 &标题名= 或 开头标题名=，捕获值直到 & 或结尾
        let re = new RegExp("(?:^|&)" + escapeRegExp(title) + "=([^&]*)", "i");
        let m = arg.match(re);
        if (m) {
            let val = m[1];
            if (val === "true" || val === "1") {
                filterTitles.push(title);
            }
        }
    });

    if (filterTitles.length > 0) {
        console.log("[同花顺过滤] 已启用，过滤标题: " + JSON.stringify(filterTitles));
    } else {
        console.log("[同花顺过滤] 已启用，但未配置任何过滤标题，跳过过滤");
        $done({});
        return;
    }

    // 辅助函数：转义正则特殊字符
    function escapeRegExp(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // 解析响应体
    let body = $response.body;
    let obj = JSON.parse(body);

    let removedCount = 0;

    // 遍历 floor_list → card_show_list，过滤匹配的卡片
    if (obj && obj.data && Array.isArray(obj.data.floor_list)) {
        obj.data.floor_list.forEach(function (floor) {
            if (!Array.isArray(floor.card_show_list)) return;

            let beforeCount = floor.card_show_list.length;

            floor.card_show_list = floor.card_show_list.filter(function (card) {
                // card_title 可能为 null 或有 value 属性
                if (!card || !card.card_title) return true;

                let titleValue = card.card_title.value;
                if (!titleValue || typeof titleValue !== "string") return true;

                // 检查是否命中过滤标题
                let shouldRemove = filterTitles.some(function (ft) {
                    return titleValue.includes(ft);
                });

                if (shouldRemove) {
                    removedCount++;
                }
                return !shouldRemove;
            });

            let afterCount = floor.card_show_list.length;
            if (beforeCount !== afterCount) {
                console.log("[同花顺过滤] floor(" + (floor.floor_name || floor.floor_key) + ") 过滤了 " + (beforeCount - afterCount) + " 张卡片");
            }
        });
    }

    console.log("[同花顺过滤] 共移除 " + removedCount + " 张卡片");

    // 返回修改后的响应
    $done({ body: JSON.stringify(obj) });

} catch (e) {
    console.log("[同花顺过滤] 脚本异常: " + e.message);
    // 异常时放通原始响应
    $done({});
}
