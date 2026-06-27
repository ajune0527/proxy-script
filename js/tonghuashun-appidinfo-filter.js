/**
 * 同花顺首页九宫格(appIdInfo)过滤脚本
 *
 * 功能：根据 title 过滤首页九宫格响应中的 appIdInfo 元素
 * 同步清理 recent/recommend/default/defaultTab/app[].data 等关联 ID 列表
 * 推广类默认过滤，行情功能类默认不过滤
 */

// 默认过滤的九宫格标题（推广/营销类，switch 默认 true）
var ALL_GRID_TITLES = [
    "股票开户",
    "基金开户",
    "期货开户",
    "港股通开通",
    "创业板开通",
    "科创开通",
    "两融开通",
    "决策",
    "金牛会员",
    "智富会员",
    "沪深Level2",
    "神奇电波",
    "短线宝",
    "机构探测器",
    "壹号研报",
    "投顾服务",
    "万和服务",
    "太平洋服务",
    "华创服务",
    "平安服务",
    "长江服务",
    "长城服务",
    "国金服务",
    "华西服务",
    "东北服务",
    "东海服务",
    "国投服务",
    "中信建投服务",
    "国融服务",
    "国联民生服务",
    "财信服务",
    "国海服务",
    "第一创业服务",
    "兴业服务",
    "兴业ETF宝典",
    "国元VIP宝典",
    "新用户礼包",
    "斗地主",
    "拜财神",
    "积财运",
    "选股转转乐",
    "AI写诗",
    "银证转账",
    "股票开户记录",
    "出国服务",
    "人才招聘",
    "涉企举报",
    "友情链接",
    "上证e投票",
    "服务号",
    "保险"
];

try {
    console.log("[九宫格过滤] 脚本开始执行");

    // 检查总开关
    if ($argument['九宫格过滤'] === 'false') {
        console.log("[九宫格过滤] 总开关已关闭，跳过过滤");
        $done({});
        return;
    }

    // 收集需要过滤的标题
    var filterTitles = [];
    ALL_GRID_TITLES.forEach(function (title) {
        if ($argument[title]) {
            filterTitles.push(title);
        }
    });
    console.log("[九宫格过滤] 过滤标题: " + JSON.stringify(filterTitles));

    // 自定义过滤
    if ($argument['九宫格自定义过滤']) {
        var customFilter = $argument['九宫格自定义过滤'].split(',');
        filterTitles = filterTitles.concat(customFilter);
        console.log("[九宫格过滤] 自定义过滤: " + $argument['九宫格自定义过滤']);
    }

    if (filterTitles.length === 0) {
        console.log("[九宫格过滤] 未开启任何过滤，跳过");
        $done({});
        return;
    }

    // 解析响应体
    var body = $response.body;
    var obj = JSON.parse(body);
    var removedIds = [];

    // 过滤 appIdInfo 数组
    if (Array.isArray(obj.appIdInfo)) {
        var beforeCount = obj.appIdInfo.length;

        obj.appIdInfo = obj.appIdInfo.filter(function (item) {
            if (!item || !item.title) return true;

            for (var i = 0; i < filterTitles.length; i++) {
                if (item.title.indexOf(filterTitles[i]) !== -1) {
                    if (item.id) removedIds.push(String(item.id));
                    return false;
                }
            }
            return true;
        });

        console.log("[九宫格过滤] appIdInfo 移除 " + (beforeCount - obj.appIdInfo.length) + " 项");
    }

    // 收集需要清理的 ID 集合（包括被移除项的同 id 重复项）
    if (removedIds.length === 0) {
        console.log("[九宫格过滤] 无需清理关联 ID");
        $done({ body: JSON.stringify(obj) });
        return;
    }

    var idSet = {};
    removedIds.forEach(function (id) { idSet[id] = true; });
    console.log("[九宫格过滤] 需清理 ID: " + JSON.stringify(removedIds));

    // 清理 recent 数组
    cleanIdArray(obj, 'recent', idSet);

    // 清理 recommend 数组
    cleanIdArray(obj, 'recommend', idSet);

    // 清理 default 数组
    cleanIdArray(obj, 'default', idSet);

    // 清理 defaultTab 数组
    cleanIdArray(obj, 'defaultTab', idSet);

    // 清理 app 数组中各分组的 data 字段
    if (Array.isArray(obj.app)) {
        obj.app.forEach(function (group) {
            if (group && Array.isArray(group.data)) {
                var before = group.data.length;
                group.data = group.data.filter(function (id) { return !idSet[String(id)]; });
                if (before !== group.data.length) {
                    console.log("[九宫格过滤] app[" + (group.title || group.id) + "] 清理 " + (before - group.data.length) + " 个 ID");
                }
            }
        });
    }

    console.log("[九宫格过滤] 过滤完成");
    $done({ body: JSON.stringify(obj) });

} catch (e) {
    console.log("[九宫格过滤] 脚本异常: " + e.message);
    $done({});
}

function cleanIdArray(obj, key, idSet) {
    if (Array.isArray(obj[key])) {
        var before = obj[key].length;
        obj[key] = obj[key].filter(function (id) { return !idSet[String(id)]; });
        if (before !== obj[key].length) {
            console.log("[九宫格过滤] " + key + " 清理 " + (before - obj[key].length) + " 个 ID");
        }
    }
}
