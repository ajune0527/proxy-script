/**
 * 脚本名称：获取 投顾API centraltoken
 * 匹配域名：touguapi.zx093.com
 * 功能：提取请求头中的 centraltoken 并持久化到本地，Key 为 yueniu
 */

const keyName = "yueniu";

if ($request && $request.headers) {
    // 兼容请求头大小写问题
    let token = $request.headers['centraltoken'] || $request.headers['Centraltoken'] || $request.headers['CentralToken'] || $request.headers['centralToken'];
    
    if (token) {
        // 读取本地旧的 Token，避免重复写入和日志刷屏
        let oldToken = $persistentStore.read(keyName);
        
        if (token !== oldToken) {
            let success = $persistentStore.write(token, keyName);
            if (success) {
                $notification.post("【阅牛】Token 获取成功", "", `新 Token 已成功保存到本地`);
                console.log(`[约牛] 成功获取并更新 centraltoken: ${token}`);
            } else {
                console.log(`[约牛] 持久化保存 centraltoken 失败`);
            }
        } else {
            // Token 没变，仅在控制台低调打印
            console.log(`[约牛] 检测到 centraltoken，与本地一致，跳过写入`);
        }
    } else {
        console.log(`[约牛] 匹配到请求，但未在 Headers 中找到 centraltoken`);
    }
}

$done({});
