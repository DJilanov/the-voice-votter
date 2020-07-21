const ProxyList = require('free-proxy');
const proxyList = new ProxyList();
const http = require('http');
const url = require('url');
const tls = require("tls");
tls.DEFAULT_ECDH_CURVE = "auto"
var HttpsProxyAgent = require('https-proxy-agent');

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

    console.log(`connected to: http://${data.ip}:${data.port}`)
    let agent = null;
    try {
        agent = new HttpsProxyAgent({
            host: data.ip,
            port: data.port
        });
    } catch(err) {
        console.log('Proxy Err: ', err);
    }
    
    try {
        http.request({
            host: 'thevoice.bg',
            port: 443,
            method: 'POST',
            path: '/charts/vote/',
            agent: agent
        }, (res) => {
            res.on('data', function (data) {
                console.log(data.toString());
            });
        });
    } catch(err) {
        console.log('Err: ', err);
    }

    console.log('data: ', data);
}