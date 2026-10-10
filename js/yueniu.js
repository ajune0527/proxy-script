/**
 * 脚本名称：获取 投顾API centraltoken 并同步到远程
 * 匹配域名：touguapi.zx093.com
 * 功能：
 *   1. 提取请求头中的 centraltoken，持久化到 persistentStore（Key 为 yueniu）
 *   2. 将 key（读自 wf_key）+ central_token POST 到远程接口 /user/sync-central-token
 *      host 读自 persistentStore 的 api_host
 */

const keyName = "yueniu";
const apiHostKey = "api_host";
const paramKeyName = "wf_key";
const syncPath = "/user/sync-central-token";

// 获取到的 token 或本地已存在且一致的 token 都会尝试同步
let token = "";

if ($request && $request.headers) {
    // 兼容请求头大小写问题
    token = $request.headers['centraltoken'] || $request.headers['Centraltoken'] || $request.headers['CentralToken'] || $request.headers['centralToken'] || "";
}

if (!token) {
    console.log(`[约牛] 未能在 Headers 中找到 centraltoken，跳过`);
    $done({});
} else {
    let oldToken = $persistentStore.read(keyName);
    let needWrite = token !== oldToken;

    if (needWrite) {
        let success = $persistentStore.write(token, keyName);
        if (success) {
            console.log(`[约牛] 成功获取并更新 centraltoken: ${token}`);
        } else {
            console.log(`[约牛] 持久化保存 centraltoken 失败`);
        }
    } else {
        console.log(`[约牛] 检测到 centraltoken，与本地一致，跳过写入`);
    }

    let apiHost = $persistentStore.read(apiHostKey);
    let paramKey = $persistentStore.read(paramKeyName);

    if (!apiHost) {
        console.log(`[约牛] 未读取到 ${apiHostKey}，无法同步 Token 到远程`);
        $notification.post("【阅牛】Token 同步失败", "", `未配置 ${apiHostKey}`);
        $done({});
    } else if (!paramKey) {
        console.log(`[约牛] 未读取到 ${paramKeyName}，无法同步 Token 到远程`);
        $notification.post("【阅牛】Token 同步失败", "", `未配置 ${paramKeyName}`);
        $done({});
    } else {
        let url = apiHost.replace(/\/+$/, "") + syncPath;

        $httpClient.post({
            url: url,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                key: paramKey,
                central_token: token
            })
        }, function (error, response, data) {
            if (error) {
                console.log(`[约牛] Token 同步失败: ${error}`);
                $notification.post("【阅牛】Token 同步失败", "", `${error}`);
                $done({});
                return;
            }

            let status = response && response.status ? response.status : 0;
            console.log(`[约牛] Token 同步响应 ${status}: ${data}`);

            if (status >= 200 && status < 300) {
                $notification.post("【阅牛】Token 同步成功", "", needWrite ? `新 Token 已保存并同步至远程` : `Token 已同步至远程`);
            } else {
                $notification.post("【阅牛】Token 同步失败", "", `HTTP ${status}`);
            }
            $done({});
        });
    }
}
