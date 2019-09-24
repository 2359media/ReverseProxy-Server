const http = require('http');
const httpProxy = require('http-proxy');
const config = require('./config');
 
const proxy = httpProxy.createProxyServer({});

const addHeaders = function (headers, target, items = []) {
    const merged = (headers[target] || '').split(',');
    merged.push(...items);
    headers[target] = merged.filter(item => item).join(',');
}

const server = http.createServer(function(req, res) {
    const writeHead = res.writeHead;
    res.writeHead = function (statusCode, headers = {}) {
        headers['Access-Control-Allow-Origin'] = '*';
        addHeaders(headers, 'Access-Control-Allow-Methods', config.allowedMethods);
        addHeaders(headers, 'Access-Control-Allow-Headers', config.allowedHeaders);
        return writeHead.bind(res)(statusCode, headers);
    }

    if (req.method === 'OPTIONS') {
        res.writeHead(204, { 'Content-Type': 'text/plain' } );
        res.end();
    } else {
        proxy.web(req, res, { target: config.targetUrl, changeOrigin: true });
    }
});
 
console.log(`listening on port ${config.port}`);
server.listen(config.port);
