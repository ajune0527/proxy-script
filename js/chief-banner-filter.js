/**
 * 致富APP运营位（Banner）过滤脚本
 *
 * 目标接口（新版）：
 *   POST /chief-operations/api/v1/ops/slot/config   请求体 {"bannerIds":[]}
 *   https://api2.chiefgroup.com.hk/chief-operations/api/v1/ops/slot/config
 * 目标接口（旧版兼容）：
 *   POST /chief-operations/api/v1/banner/get
 *
 * 响应结构：
 *   {
 *     "code": 0,
 *     "data": [
 *       {
 *         "slotConfig": { "id": 10059, "nameSc": "首页Banner-新版", "nameEn": "首页Banner-新版", ... },
 *         "slotItems": [
 *           { "id": 430, "bannerId": 10059, "lable": "感恩回饋", "tcTitle": "", "scTitle": "", ... }
 *         ]
 *       }
 *     ]
 *   }
 *
 * 过滤规则：
 *   1. slot 级：slotConfig.nameSc（旧版为 bannerConfig.nameSc）命中开关或自定义关键字 → 整个 slot 从 data 移除
 *   2. item 级：自定义关键字命中 slotItems[].lable / 标题 → 仅移除该条目
 *
 * 每个运营位独立 switch 开关，通过 Loon [Argument] 段配置：
 *   argument=[{Banner过滤},{首页Banner-新版},...,{Banner自定义过滤}]
 */

// 插件 [Argument] 中注册的开关 → 对应的 slotConfig.nameSc（key 中避免空格）
var SLOT_SWITCH_MAP = {
    "首页Banner-新版": "首页Banner-新版",
    "活动中心": "活动中心",
    "致富证券POPUP弹窗": "致富证券POPUP弹窗",
    "致富通IPO-Banner": "致富通IPO Banner",
    "SEM-IPO页表单": "SEM-IPO页表单",
    "搜索页运营位": "搜索页运营位",
    "个股页跑马灯": "个股页跑马灯",
    "未开户首页": "未开户首页",
    "首页公告": "首页公告"
};

var MASTER_SWITCH = "Banner过滤";
var CUSTOM_SWITCH = "Banner自定义过滤";

// item 级匹配的文本字段（API 中 lable 为服务端拼写）
var ITEM_TEXT_FIELDS = ["lable", "tcTitle", "scTitle", "enTitle", "krTitle"];

function trim(text) {
    return String(text == null ? "" : text).replace(/^\s+|\s+$/g, "");
}

// Loon switch 值可能是 "true"/"false" 或布尔值，未配置视为关闭
function isOn(value) {
    if (value === undefined || value === null) return false;
    return String(value) !== "false";
}

function splitKeywords(value) {
    var list = [];
    if (value === undefined || value === null) return list;
    var parts = String(value).split(",");
    for (var i = 0; i < parts.length; i++) {
        var keyword = trim(parts[i]);
        if (keyword.length > 0) list.push(keyword);
    }
    return list;
}

// 取 slot 的名称，兼容新版 slotConfig 与旧版 bannerConfig
function getSlotName(slot) {
    if (!slot) return "";
    if (slot.slotConfig && slot.slotConfig.nameSc) return String(slot.slotConfig.nameSc);
    if (slot.bannerConfig && slot.bannerConfig.nameSc) return String(slot.bannerConfig.nameSc);
    if (typeof slot.nameSc === "string") return slot.nameSc;
    return "";
}

// 取 slotItem 的可匹配文本（条目名称 + 多语言标题）
function getItemText(item) {
    if (!item) return "";
    var text = "";
    for (var i = 0; i < ITEM_TEXT_FIELDS.length; i++) {
        var value = item[ITEM_TEXT_FIELDS[i]];
        if (value) text += value + "|";
    }
    return text;
}

function hitAny(text, keywords) {
    if (!text || !keywords || keywords.length === 0) return false;
    for (var i = 0; i < keywords.length; i++) {
        if (keywords[i] && text.indexOf(keywords[i]) !== -1) return true;
    }
    return false;
}

try {
    console.log("[致富运营位过滤] 脚本开始执行");
    console.log("[致富运营位过滤] 参数: " + JSON.stringify($argument));

    // 总开关
    if (!isOn($argument[MASTER_SWITCH])) {
        console.log("[致富运营位过滤] 总开关已关闭，跳过过滤");
        $done({});
        return;
    }

    // 收集需要过滤的运营位名称
    var filterNames = [];
    var switchNames = Object.keys(SLOT_SWITCH_MAP);
    for (var s = 0; s < switchNames.length; s++) {
        var switchName = switchNames[s];
        if (isOn($argument[switchName])) {
            filterNames.push(SLOT_SWITCH_MAP[switchName]);
        }
    }

    // 自定义关键字：同时参与 slot 级与 item 级匹配
    var customKeywords = splitKeywords($argument[CUSTOM_SWITCH]);
    for (var c = 0; c < customKeywords.length; c++) {
        if (filterNames.indexOf(customKeywords[c]) === -1) {
            filterNames.push(customKeywords[c]);
        }
    }

    console.log("[致富运营位过滤] 过滤运营位: " + JSON.stringify(filterNames));
    console.log("[致富运营位过滤] 自定义关键字: " + JSON.stringify(customKeywords));

    if (filterNames.length === 0 && customKeywords.length === 0) {
        console.log("[致富运营位过滤] 未开启任何过滤，跳过");
        $done({});
        return;
    }

    // 解析响应体
    var obj = JSON.parse($response.body);
    if (!obj || !Array.isArray(obj.data)) {
        console.log("[致富运营位过滤] 响应无 data 数组，跳过");
        $done({});
        return;
    }

    var removedSlots = 0;
    var removedItems = 0;
    var keptSlots = [];

    for (var i = 0; i < obj.data.length; i++) {
        var slot = obj.data[i];
        if (!slot) continue;

        // 1. slot 级过滤
        var slotName = getSlotName(slot);
        if (hitAny(slotName, filterNames)) {
            removedSlots++;
            console.log("[致富运营位过滤] 移除运营位: " + slotName);
            continue;
        }

        // 2. item 级过滤（自定义关键字）
        if (customKeywords.length > 0 && Array.isArray(slot.slotItems)) {
            var beforeCount = slot.slotItems.length;
            slot.slotItems = slot.slotItems.filter(function (item) {
                return !hitAny(getItemText(item), customKeywords);
            });
            removedItems += beforeCount - slot.slotItems.length;
        }

        keptSlots.push(slot);
    }

    if (removedSlots === 0 && removedItems === 0) {
        console.log("[致富运营位过滤] 无匹配项，响应保持不变");
        $done({});
        return;
    }

    obj.data = keptSlots;
    console.log("[致富运营位过滤] 共移除运营位 " + removedSlots + " 个、条目 " + removedItems + " 条");
    $done({ body: JSON.stringify(obj) });

} catch (e) {
    console.log("[致富运营位过滤] 脚本异常: " + e.message);
    $done({});
}
