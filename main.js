let CryptoJS = require('crypto-js')
let request = require('request-promise')

function encrypt(text, originKey) {
    let originKey = originKey.slice(0, 16),
        key = CryptoJS.enc.Utf8.parse(originKey),
        iv = CryptoJS.enc.Utf8.parse(originKey),
        msg = JSON.stringify(text);
    let ciphertext = CryptoJS.AES.encrypt(msg, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return ciphertext.toString()
}

function decrypt(text, originKey) {
    let originKey = originKey.slice(0, 16),
        key = CryptoJS.enc.Utf8.parse(originKey),
        iv = CryptoJS.enc.Utf8.parse(originKey);
    let bytes = CryptoJS.AES.decrypt(text, key, {
        iv: iv
    });
    let plaintext = CryptoJS.enc.Utf8.stringify(bytes);
    return plaintext
}

function extend(target) {
    let sources = [].slice.call(arguments, 1);
    sources.forEach(function (source) {
        for (let prop in source) {
            target[prop] = source[prop]
        }
    });
    return target
}


let version = 7,
    // score = Math.round(10000+Math.random()*2000),
    score = 456,
    // replace with your session_id here
    session_id = 'QXnyJVj+tKVEs8rtJjqZh4ArO3cri6Rujx1g0hl8Lb0Wm3h/73Eq907ZQIaxLG1NuIHbpb4zulGWr5KQ7r+NbFc3rbm/BoDxTo7G/oyhWESf/Qx7d8G0mwIdh7QNE4TSEEO/wWakYJV+53vACycbpA\u003d\u003d'

let headers = {
    'charset': 'utf-8',
    // 'Accept-Encoding':'gzip',
    'Referer': 'https://servicewechat.com/wx7c8d593b2c3a7703/' + version + '/page-frame.html',
    'Content-Type': 'application/json',
    // 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_2_1 like Mac OS X) AppleWebKit/604.4.7 (KHTML, like Gecko) Mobile/15C153 MicroMessenger/6.6.1 NetType/WIFI Language/zh_CN',
    'User-Agent': 'MicroMessenger/6.6.1.1220(0x26060133) NetType/4G Language/zh_CN',
    'Host':'mp.weixin.qq.com',
    'Connection':'Keep-Alive',
    'Accept': '*/*'
};




let base_req = {
    'base_req': {
        'session_id': session_id,
        'fast': 1
    }
};
let base_site = 'https://mp.weixin.qq.com/wxagame/';

let path = 'wxagame_getuserinfo';
request({
    method: 'POST',
    url: base_site + path,
    headers: headers,
    json: true,
    body: base_req
}).then(function (response) {
    // console.log(path, response)
})

path = 'wxagame_getfriendsscore';
request({
    method: 'POST',
    url: base_site + path,
    headers: headers,
    json: true,
    body: base_req
}).then(function (response) {
    console.log(response.my_user_info)
    let times = response.my_user_info.times + 1;
    path = 'wxagame_init';
    request({
        method: 'POST',
        url: base_site + path,
        headers: headers,
        json: true,
        body: extend({}, {version: 9}, base_req)
    }).then(function (response) {
        // console.log(path, response)
        let action = [],
            musicList = [],
            touchList = [];
        for (let i = 0; i < score; i++) {
            //     action.push([0.752, 1.32, false])
            //     musicList.push(false)
            //     touchList.push([Math.round(100+Math.random()*200), Math.round(300+Math.random()*200)])
            // }
            action.push([Math.random().toFixed(3), (Math.random() * 2).toFixed(2), i / 5000 === 0]);
            musicList.push(false);
            touchList.push([(250 - Math.random() * 10).toFixed(4), (670 - Math.random() * 20).toFixed(4)]);
        }
        let data = {
            score: score,
            times: times,
            game_data: JSON.stringify({
                seed: Date.now(),
                action: action,
                musicList: musicList,
                touchList: touchList,
                version: 1
            })
        }
        path = 'wxagame_settlement';
        console.log({
            method: 'POST',
            url: base_site + path,
            headers: headers,
            json: true,
            body: extend({}, {action_data: encrypt(data, session_id)}, base_req)
        })
        request({
            method: 'POST',
            url: base_site + path,
            headers: headers,
            json: true,
            body: extend({}, {action_data: encrypt(data, session_id)}, base_req)
        }).then(function (response) {
            console.log(path, response);
            console.log('2018! Happy new year! 🎉')
        }).catch(function (error) {
            console.log(error)
        })
    })
}).catch(function (error) {
    console.log(error)
    console.log('something crash')
});