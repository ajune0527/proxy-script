/**
 * 致富APP「个股24小时新闻」过滤脚本
 *
 * 目标接口：
 *   POST /chief-news/news/individualStockDetailsPage24H5
 *   https://api2.zft2000.com/chief-news/news/individualStockDetailsPage24H5
 *   请求体 {"pageNo":0,"startSeq":0,"symbolKeys":"NVDA.US"}
 *
 * 响应结构：
 *   {
 *     "msg": null,
 *     "code": 0,
 *     "data": [
 *       {
 *         "newsId": "6d53766a-4445-44cd-a36a-48570b3460c1",
 *         "vendorName": "阿思达克财经",
 *         "title": "智谱(02513.HK)披露首个RSI成果 10万国产卡用GLM造GLM",
 *         "createdTime": 1789707600,
 *         "aiPerspective": { "aiPerspective": "...", "rise": 0 },
 *         "readType": 1,
 *         "newsType": 1
 *       },
 *       {
 *         "newsId": "5fbe2cc8-c100-43b9-8dff-a6846f07d0d7",
 *         "vendorName": "7×24",
 *         "title": null,
 *         "content": "A股算力概念走强……",
 *         "newsType": 0
 *       }
 *     ],
 *     "traceId": "..."
 *   }
 *
 * 过滤规则：清空 data 数组（服务端无新闻时返回的同样是 "data":[]），其余字段原样保留
 *
 * Loon 参数传递：argument=[{个股24小时新闻}]
 */

var MASTER_SWITCH = "个股24小时新闻";

try {
    // 直接引用脚本（未走插件 [Argument]）时 $argument 可能为 undefined
    var args = $argument || {};

    console.log("[致富个股新闻过滤] 脚本开始执行");
    console.log("[致富个股新闻过滤] 参数: " + JSON.stringify(args));

    // 总开关（未显式传 false 即视为开启，与插件 switch 默认值一致）
    if (String(args[MASTER_SWITCH]) === "false") {
        console.log("[致富个股新闻过滤] 总开关已关闭，跳过过滤");
        $done({});
        return;
    }

    var obj = JSON.parse($response.body);
    if (!obj || !Array.isArray(obj.data)) {
        console.log("[致富个股新闻过滤] 响应无 data 数组，跳过");
        $done({});
        return;
    }

    var count = obj.data.length;
    if (count === 0) {
        console.log("[致富个股新闻过滤] data 已为空，响应保持不变");
        $done({});
        return;
    }

    obj.data = [];
    console.log("[致富个股新闻过滤] 已移除 " + count + " 条新闻");
    $done({ body: JSON.stringify(obj) });

} catch (e) {
    console.log("[致富个股新闻过滤] 脚本异常: " + e.message);
    $done({});
}