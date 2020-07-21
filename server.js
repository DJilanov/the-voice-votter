const ProxyList = require('free-proxy');
const proxyList = new ProxyList();
const http = require('http');
const HttpsProxyAgent = require('https-proxy-agent');
var https = require('https');
const url = require('url');
const tls = require("tls");
tls.DEFAULT_ECDH_CURVE = "auto"

http.createServer(function (req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/plain; charset=UTF-8'
    });
    var purl = url.parse(req.url,true);
    if(purl.pathname=='/vote') {
        sendRequest(res);
    } else {

    }
  
}).listen(1337);

console.log('Started at port 1337');

const sendRequest = async (res) => {
    let data = {};
    repeat = true;
    while(repeat) {
        console.log('Entering repeat');
        try {
            data = await proxyList.random();
            repeat = false;
        } catch (error) {
            throw new Error(error);
        }
    }
    if(!data) {
        sendRequest();
        return;
    }
    console.log(`connected to: http://${data.ip}:${data.port}`)
    let options = {
        url: 'https://thevoice.bg/charts/vote/',
        method: 'POST',
        proxy: new HttpsProxyAgent(data.url),
        // headers: {
        //     'Content-Type': 'application/x-www-form-urlencoded',
        //     'Content-Length': Buffer.byteLength(post_data)
        // }
    };
    
    let request = http.request(options, (res) => {
        console.log('"response" event!', res.headers);
        res.pipe(process.stdout);
    });
    request.on('error', function(err) {
        console.log('Err: ', err);
        sendRequest();
    });

    console.log('data: ', data);
}