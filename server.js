const ProxyList = require('free-proxy');
const proxyList = new ProxyList();
const express = require('express');
const http = require('http');
const https = require('https');
const bodyParser = require('body-parser');
const qs = require('querystring');

var app = express();

let amount = 0;
let value = '';

var app = express();
app.use(express.static('public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// listen to port
app.listen(process.env.PORT || 3000);
console.log(`You are listening to port ${process.env.PORT || 3000}`);

app.post('/vote', (req, res) => {
    amount = +req.body.amount;
    value = req.body.value;
    requestController();
    console.log('Sending spam for: ', req.body.value);
    res.end('Accepted');
});

const requestController = async () => {
    for(let counter = 0; counter < amount; counter++) {
        let response = await sendRequest();
        console.log('Send: ', counter);
    }
}

const sendRequest = async () => {
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

    console.log('Creating request');

    let proxyRequest = http.request({
        host: data.ip, // IP address of proxy server
        port: data.port, // port of proxy server
        method: 'CONNECT',
        timeout: 5000,
        path: 'thevoice.bg:443', // some destination, add 443 port for https!
      }).on('connect', (res, socket) => {
        if (res.statusCode === 200) { // connected to proxy server
            console.log('VALUE2: ', value);
            let dataEncoded = qs.stringify({
                value: value
            });
            let request = https.request({
                host: 'www.thevoice.bg',
                agent: false,      // cannot use a default agent
                path: '/charts/vote',  // specify path to get from server
                method: 'POST',
                timeout: 5000,
                socket: socket,
                port: 443,
                headers: {
                    'Content-Disposition': 'form-data; boundary=boundary',
                    'Content-Length': Buffer.byteLength(dataEncoded),
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Host': 'thevoice.bg',
                    'Origin': 'https://thevoice.bg',
                    'Referer': 'https://thevoice.bg/charts/bg-voice-top10-c500.html',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            }, (res) => {
                console.log('------------Connected'); 
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    console.log('BODY: ' + chunk);
                    if(chunk !== 'ok') {
                        sendRequest();
                    }
                });
            });
        
            request.write(dataEncoded);
            request.on('error', (err) => {
                console.error('Inner error: ', err);
                sendRequest();
            }).end();
        }
      }).end();

    proxyRequest.on('socket', (s) => { s.setTimeout(5000, () => { s.destroy(); })});
    proxyRequest.on('error', (err) => {
        console.error('Outer error: ', err)
        sendRequest();
    });
    proxyRequest.end();

    console.log('data: ', data);
}