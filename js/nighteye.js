/**
 * NightEye Pro 解锁
 * 匹配域名：billing.nighteye.app
 * 功能：修改订阅状态为 Pro 已激活，过期时间设为 2099 年
 */

let obj={
  "status": true,
  "data": {
    "accountEmail": "",
    "id": "VSdUY-QPvJGk03_amc6qQw",
    "isActive": false,
    "paymentType": -2147483647,
    "isProVersion": "f",
    "expiredDate": "28 Aug 2022"
  }
}
//if (url.indexOf(path1) != -1) {
    obj.data["isActive"] = true;
    obj.data["expiredDate"] = "09 Mar 2099";
    obj.data["isProVersion"] = "t";
    body = JSON.stringify(obj);
//}
console.log("🎉解锁高级版🎉")
console.log(body)

$done({ body});
