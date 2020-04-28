// Copyright (c) 2020 Curvegrid Inc.
const httpProxy = require('http-proxy');
const http = require('http');
// config variables
const config = require('./config/config.json');

const ansiRed = '\x1b[41m';
const ansiDefault = '\x1b[0m';

if (config.host == null || config.apiKey == null || config.host === "" || config.apiKey === "") {
  console.error(ansiRed, "Please enter your MultiBaas deployment host URL and API key in config/config.json", ansiDefault);
  return;
}

const hostname = '127.0.0.1';
const port = 3000;

const proxy = httpProxy.createProxyServer({ changeOrigin: true });

// Set up proxy rules to only allow access to blockchain functionality of MultiBaas
// everything else gets blocked 😸
// the proxy still allows access to configuration change endpoints under /chains and /contracts
// that could be undesirable. For example: uploading new contracts, moving the decimal point in
// type conversions, etc.
const proxyWhitelist = [
  '/api/v0/contracts',
  '/api/v0/chains',
  '/api/v0/queries'];

proxy.on('proxyReq', (proxyReq, req, res) => {
  for (let i = 0; i < proxyWhitelist.length; i += 1) {
    if (req.url.startsWith(proxyWhitelist[i])) {
      proxyReq.setHeader('Authorization', `Bearer ${config.apiKey}`);
      return;
    }
  }
  // Block!!!
  res.writeHead(401, { 'Content-Type': 'text/plain' });
  res.write('Access to UI and non-blockchain functionality is not allowed via the proxy server.');
  res.end();
});

const server = http.createServer((req, res) => {
  proxy.web(req, res, { target: config.host });
});

server.listen(port, hostname, () => {
  console.log(`MultiBaas Proxy Server running at http://${hostname}:${port}/`);
});
