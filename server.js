const ProxyList = require('free-proxy');
const proxyList = new ProxyList();
const express = require('express');
const http = require('http');
const https = require('https');
const bodyParser = require('body-parser');
const qs = require('querystring');
const puppeteer = require('puppeteer');

var app = express();

let amount = 0;
let value = '';

var app = express();
app.use(express.static('public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// listen to port
app.listen(process.env.PORT || 13000);
console.log(`You are listening to port ${process.env.PORT || 13000}`);

app.post('/watch', (req, res) => {
    amount = +req.body.amount;
    value = req.body.value;
    requestController();
    console.log('Sending spam for: ', req.body.value);
    res.end('Accepted');
});

const startProcess = async () => {
    let data = {};
    let active = false;
    const timer = setTimeout(() => {
        if(active) {
            startProcess();
        }
    }, 10000);
    repeat = true;
    while(repeat) {
        console.log('Entering repeat');
        try {
            data = await proxyList.random();
            console.log('sec');
            repeat = false;
            active = true;
        } catch (error) {
            throw new Error(error);
        }
    }
    if(!data) {
        startProcess();
        clearTimeout(timer);
        return;
    }

    let proxyRequest = http.request({
        host: data.ip, // IP address of proxy server
        port: data.port, // port of proxy server
        method: 'CONNECT',
        timeout: 5000,
        path: 'thevoice.bg:443', // some destination, add 443 port for https!
      }).on('connect', (res, socket) => {
        if (res.statusCode === 200) { // connected to proxy server
            console.log('SOCKET: ', socket)
            clearTimeout(timer);
            runChrome('https://www.youtube.com/watch?v=E0M_sUe1Ri8', data.ip, data.port);
            startProcess();
        }
      }).end();

    proxyRequest.on('socket', (s) => { s.setTimeout(5000, () => { s.destroy(); })});
    proxyRequest.on('error', (err) => {
        console.log('Outer error: ', err)
        startProcess();
        clearTimeout(timer);
    });
    proxyRequest.end();
}


const runChrome = async (url, ip, port) => {
    const browser = await puppeteer.launch({ 
        headless: false,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        args: [
            '--mute-audio',
            "--autoplay-policy=no-user-gesture-required",
            `--proxy-server=${ip}:${port}`,
            `--ignore-certificate-errors`
        ]
    });
    const page = await browser.newPage();
    // try {
        
    // } catch (e) {

    // }
    await loadDirPage(page);
    await  new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('foo');
        }, 5000);
    });
    await loadUrlPage(page, url);
    await  new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('foo');
        }, 220000);
    });
    await browser.close();
};

const loadDirPage = (page) => {
    return page.goto('http://www.jilanov.com', {timeout: 0});
};

const loadUrlPage = (page, url) => {
    return page.goto(url, {timeout: 0});
};

startProcess();
// runChrome('https://www.youtube.com/watch?v=E0M_sUe1Ri8', null, null)