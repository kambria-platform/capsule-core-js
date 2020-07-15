var ethTx = require('ethereumjs-tx').Transaction;
var HDKey = require('hdkey');
var ethUtil = require('ethereumjs-util');

let Util = {}

Util.getNetworkId = (net, type) => {
  if (Buffer.isBuffer(net)) net = Number(net.toString('hex'));
  if (net) net = net.toString().toLowerCase();
  switch (net) {
    case '1':
      if (type === 'string') return 'mainnet';
      if (type === 'number') return 1;
      if (type === 'buffer') return Buffer.from('01', 'hex');
      return 1;
    case 'mainnet':
      if (type === 'string') return 'mainnet';
      if (type === 'number') return 1;
      if (type === 'buffer') return Buffer.from('01', 'hex');
      return 1;
    case '3':
      if (type === 'string') return 'ropsten';
      if (type === 'number') return 3;
      if (type === 'buffer') return Buffer.from('03', 'hex');
      return 3;
    case 'ropsten':
      if (type === 'string') return 'ropsten';
      if (type === 'number') return 3;
      if (type === 'buffer') return Buffer.from('03', 'hex');
      return 3;
    case '42':
      if (type === 'string') return 'kovan';
      if (type === 'number') return 42;
      if (type === 'buffer') return Buffer.from('42', 'hex');
      return 42;
    case 'kovan':
      if (type === 'string') return 'kovan';
      if (type === 'number') return 42;
      if (type === 'buffer') return Buffer.from('42', 'hex');
      return 42;
    case '4':
      if (type === 'string') return 'rinkeby';
      if (type === 'number') return 4;
      if (type === 'buffer') return Buffer.from('04', 'hex');
      return 4;
    case 'rinkeby':
      if (type === 'string') return 'rinkeby';
      if (type === 'number') return 4;
      if (type === 'buffer') return Buffer.from('04', 'hex');
      return 4;
    case '5':
      if (type === 'string') return 'goerli';
      if (type === 'number') return 5;
      if (type === 'buffer') return Buffer.from('05', 'hex');
      return 5;
    case 'goerli':
      if (type === 'string') return 'goerli';
      if (type === 'number') return 5;
      if (type === 'buffer') return Buffer.from('05', 'hex');
      return 5;
    default:
      if (type === 'string') return 'mainnet';
      if (type === 'number') return 1;
      if (type === 'buffer') return Buffer.from('01', 'hex');
      return 1;
  }
}

Util.padHex = (hex) => {
  if (!hex) return null;
  if (Buffer.isBuffer(hex)) hex = hex.toString('hex');
  if (typeof hex !== 'string') return null;

  var pattern = /(^0x)/gi;
  if (pattern.test(hex)) {
    return hex;
  } else {
    return '0x' + hex;
  }
}

Util.unpadHex = (hex) => {
  if (!hex) return null;
  if (Buffer.isBuffer(hex)) hex = hex.toString('hex');
  if (typeof hex !== 'string') return null;

  const pattern = /(^0x)/gi;
  if (pattern.test(hex)) return hex.replace('0x', '');
  return hex;
}

Util.genRawTx = (txParams) => {
  let params = { ...txParams } // Copy params
  delete params.chainId
  const opt = { chain: Util.getNetworkId(txParams.chainId, 'string') }
  const tx = new ethTx(params, opt);
  tx.raw[6] = Buffer.from([txParams.chainId]); // v
  tx.raw[7] = Buffer.from([]); // r
  tx.raw[8] = Buffer.from([]); // s
  return { raw: tx, serialize: tx.serialize().toString('hex') };
}

Util.signRawTx = (txParams, priv) => {
  const rawTx = Util.genRawTx(txParams).raw;
  rawTx.sign(Buffer.from(priv, 'hex'));
  const signedTx = Util.padHex(rawTx.serialize().toString('hex'));
  return signedTx;
}

Util.genSignedTx = (signature) => {
  const tx = new ethTx(signature);
  return Util.padHex(tx.serialize().toString('hex'));
}

Util.addDPath = (dpath, index) => {
  if (!dpath || typeof dpath !== 'string') return null;
  dpath = dpath.trim();
  index = index || 0;
  index = index.toString();
  index = index.trim();

  let _dpath = dpath.split('');
  if (_dpath[_dpath.length - 1] === '/') {
    _dpath.pop();
    dpath = _dpath.join('');
  } else {
    dpath = _dpath.join('');
  }
  let _index = index.split('');
  if (_index[0] === '/') {
    _index.shift();
    index = _index.join('');
  } else {
    index = _index.join('');
  }

  return dpath + '/' + index;
}

Util.deriveChild = (limit, page, publicKey, chainCode) => {
  let list = [];
  const hdKey = new HDKey();
  hdKey.publicKey = Buffer.from(publicKey, 'hex');
  hdKey.chainCode = Buffer.from(chainCode, 'hex');
  for (let index = page * limit; index < page * limit + limit; index++) {
    const child = hdKey.derive('m/' + index);
    const addr = ethUtil.pubToAddress(child.publicKey, true /* multi pub-format */);
    const re = { index: index.toString(), address: Util.padHex(addr.toString('hex')) }
    list.push(re);
  }
  return list;
}

module.exports = Util;