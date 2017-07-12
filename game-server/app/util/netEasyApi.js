/**
 * Created by xingyongkang on 2016/12/18.
 */
//querystring = require('querystring');
var http = require('http'),
    URL = require('url'),
    crypto = require('crypto');





/**
 *
 * @param message
 * @returns {*}
 * @constructor
 */
var signByHashSha1 = function (message) {

    var hash = crypto.createHash("sha1");
    var result= hash.update(message).digest('hex');
    //result=result.toUpperCase();
    result=result.toLowerCase();
    return result;
}

/**
 *
 * @param url
 * @param data
 * @param callback
 */
var callNetEasyApi = function(url,data,callback){
    var appKey = "7ed7c63e9ecd462692c5ddaa1a4cd07f";
    var appSecret ="f5235981fa9a451eb42c56908e37a5ed";

    var nonce = (new Number(Math.random() * 100000000).toFixed(0)).toString();
    var curTime =  Math.round((new Date().getTime())/1000).toString();
    var checkSump = signByHashSha1(appSecret+nonce+curTime);
    var result = "";
    //var post_data = querystring.stringify(data);
    var post_data = JSON.stringify(data);

    var u = URL.parse(url);
    var options = {
        hostname:u.hostname,
        port:u.port || 80,
        path:u.pathname || "/",
        method:'POST',
        headers:{
            'appKey':appKey,
            'Nonce': nonce,
            'CurTime': curTime,
            'CheckSum': checkSump,
            'Content-Type':"application/json;charset=utf-8"

        }
    };
    var req = http.request(options, function (res) {
        // console.log('STATUS: ' + res.statusCode);
        // console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            result+=chunk;
        });
        res.on('end', function (chunk) {

           // console.log("over:"+result);
            callback(result);

        });
    });

    req.on('error', function (e) {
        console.log('problem with request: ' + e.message);
    });

// write data to request body
    req.write(post_data + '\n');
    req.end();
}

exports.callNetEasyApi =callNetEasyApi;