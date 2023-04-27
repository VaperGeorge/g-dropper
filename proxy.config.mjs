export const onProxyReq = (proxyReq, req, res) => {
  Object.keys(req.headers).map((key, i) => {
    if (key.includes('ok-access')) {
      proxyReq.setHeader(key.toUpperCase(), ` ${req.headers[key]}`);
    }
    if (key.includes('x-mbx')) {
      proxyReq.setHeader(key.toUpperCase(), ` ${req.headers[key]}`);
    }
  });

  proxyReq.setHeader('Content-Type', 'application/json');
  return proxyReq;
};

export const onProxyRes = (proxyReq, req, res) => {
  return res;
};

export default {
  '/api/*': {
    target: 'https://www.okx.com',
    secure: false,
    changeOrigin: true,
    onProxyReq,
    onProxyRes,
    logLevel: 'debug',
    port: 443,
  },
  '/sapi/*': {
    target: 'https://api.binance.com',
    secure: false,
    changeOrigin: true,
    onProxyReq,
    onProxyRes,
    logLevel: 'debug',
  },
};
