/*
 * Recommend run with node v8.9.x or higher version
 *    npm install lodash crypto-js request-promise request
 *    node hack.js
 */

const version = 7 ;// 跳一跳的最新版本
const score = 456 ;// 你想跳的分数
const playTimeSeconds = score * 0.01 ;// 模拟玩游戏的时间（秒

// 在这里填写你的sessionI定
const session_id = "QXnyJVj+tKVEs8rtJjqZh4ArO3cri6Rujx1g0hl8Lb0Wm3h/73Eq907ZQIaxLG1NuIHbpb4zulGWr5KQ7r+NbFc3rbm/BoDxTo7G/oyhWESf/Qx7d8G0mwIdh7QNE4TSEEO/wWakYJV+53vACycbpA\u003d\u003d"

// 引入模块
const CryptoJS = require('crypto-js');
const requestPromise = require('request-promise');
const sleep = (time) => {
    console.log(`sleeping ${time/1000} second(s)....`);
    return new Promise(resolve => setTimeout(resolve, time))
};
const rand = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => ~~rand(min, max);
const sleepRand = (min, max) => sleep(rand(min, max));

const headers = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_2 like Mac OS X) AppleWebKit/603.2.4 (KHTML, like Gecko) Mobile/14F89 MicroMessenger/6.6.1 NetType/WIFI Language/zh_CN',
    'Referer': 'https://servicewechat.com/wx7c8d593b2c3a7703/' + version + '/page-frame.html',
    'Content-Type': 'application/json',
    'Accept-Language': 'zh-cn',
    'Accept': '*/*'
};
const base_req = {
    'base_req': {
        'session_id': session_id,
        'fast': 1
    }
};

const base_site = 'https://mp.weixin.qq.com/wxagame/';

// the main proccess
async function main(){
    let settlementRes, res;

    res = await request("POST", 'wxagame_getuserinfo');

    await sleepRand(100,300);

    res = await request("POST", 'wxagame_getfriendsscore');

    // return

    let times = res.my_user_info.times + 1;

    await sleepRand(100,300)

    res = await request('POST', 'wxagame_init', {version: 9});

    await sleepRand(playTimeSeconds * 0.9 * 1000, playTimeSeconds * 1.1 * 1000);
    await (async function(){
        let action = [],
            musicList = [],
            touchList = [];

        for (let i = 0; i < score; i++) {
            action.push([rand(0.752, 0.852), rand(1.31, 1.36), false]);
            musicList.push(false)
            touchList.push([randInt(180, 190), randInt(441, 456)])
        }

        let data = {
            score: score,
            times: times,
            game_data: JSON.stringify({
                seed: Date.now(),
                action: action,
                musicList: musicList,
                touchList: touchList,
                version: 1,
                steps
            })
        };

        let action_data = encrypt(data, session_id)
        settlementRes = await request('POST', 'wxagame_settlement', {action_data})
    })();

    res = await request("POST", 'wxagame_getfriendsscore');
    console.log("settlement result: ", settlementRes);
    console.log("Well done! Happy new year! 🎉")
}

async function request(method, path, body={}){
    console.log('----------------------------------------')
    console.log(`Sending request: %s %s -- %o`, method, path, body)
    try {
        const res = await requestPromise({
            method: method,
            url: base_site + path,
            headers: headers,
            json: true,
            body: {...base_req, ...body},
    });

        console.log("Response: %o", res)
        return res
    } catch (e) {
        console.error('Failed to get response: ', e)
        throw e
    }
}


function encrypt (text, originKey) {
    const originKey2 = originKey.slice(0, 16)
    const key = CryptoJS.enc.Utf8.parse(originKey2)
    const iv = CryptoJS.enc.Utf8.parse(originKey2)
    const msg = JSON.stringify(text)
    const ciphertext = CryptoJS.AES.encrypt(msg, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return ciphertext.toString()
}

function decrypt (text, originKey) {
    const originKey2 = originKey.slice(0, 16)
    const key = CryptoJS.enc.Utf8.parse(originKey2)
    const iv = CryptoJS.enc.Utf8.parse(originKey2)
    const bytes = CryptoJS.AES.decrypt(text, key, {iv})
    const plaintext = CryptoJS.enc.Utf8.stringify(bytes)
    return plaintext
}

// execute!
main().catch(e => {
    console.error("Opps~ ERROR EXIT: ", e)
});




