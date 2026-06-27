/**
 * NightEye Pro 解锁
 * 匹配域名：billing.nighteye.app
 * 功能：修改订阅状态为 Pro 已激活，过期时间设为 2099 年
 */

let obj = JSON.parse($response.body);

if (obj && obj.data) {
  obj.data.isProVersion = "t";
  obj.data.isActive = true;

  if (obj.data.expiredDate) {
    obj.data.expiredDate = obj.data.expiredDate.replace(/\d{4}$/, "2099");
  }
}

$done({ body: JSON.stringify(obj) });
