import { Buffer } from 'buffer';

// Polyfill Buffer globally
global.Buffer = Buffer;
global.process = require('process');
global.process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Additional required polyfills
if (typeof global.btoa === 'undefined') {
  global.btoa = function (str) {
    return Buffer.from(str, 'binary').toString('base64');
  };
}

if (typeof global.atob === 'undefined') {
  global.atob = function (b64Encoded) {
    return Buffer.from(b64Encoded, 'base64').toString('binary');
  };
} 