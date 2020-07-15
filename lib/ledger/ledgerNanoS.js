import Eth from '@ledgerhq/hw-app-eth';
import TransportU2F from '@ledgerhq/hw-transport-u2f';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
var util = require('../util');
const error = require('../constant/error');
const _default = require('../constant/default');

/**
 * Hardwallet type
 */
let LedgerNanoS = {}

LedgerNanoS.getAddress = (dpath, callback) => {
  dpath = dpath || util.addDPath(_default.ETH_DERIVATION_PATH, _default.ACCOUNT_INDEX);

  return LedgerNanoS.getCommunication((er, eth) => {
    if (er) return callback(er, null);

    return eth.getAddress(dpath, false, true).then(re => {
      if (!re || !re.address) return callback(error.CANNOT_CONNECT_HARDWARE, null);
      return callback(null, re.address);
    }).catch(er => {
      return callback(er, null);
    });
  });
}

LedgerNanoS.getPublickey = (dpath, callback) => {
  dpath = dpath || util.addDPath(_default.ETH_DERIVATION_PATH, _default.ACCOUNT_INDEX);

  return LedgerNanoS.getCommunication((er, eth) => {
    if (er) return callback(er, null);

    return eth.getAddress(dpath, false, true).then(re => {
      if (!re || !re.address) return callback(error.CANNOT_CONNECT_HARDWARE, null);
      return callback(null, re);
    }).catch(er => {
      return callback(er, null);
    });
  });
}

LedgerNanoS.signTransaction = (dpath, txParams, callback) => {
  dpath = dpath || util.addDPath(_default.ETH_DERIVATION_PATH, _default.ACCOUNT_INDEX);
  if (!txParams) return callback(error.INVALID_TX, null);
  const rawTx = util.genRawTx(txParams).serialize;
  return LedgerNanoS.getCommunication((er, eth) => {
    if (er) return callback(er, null);

    return eth.signTransaction(dpath, rawTx).then(re => {
      if (!re) return callback(error.CANNOT_CONNECT_HARDWARE, null);
      return callback(null, re);
    }).catch(er => {
      return callback(er, null);
    });
  });
}

LedgerNanoS.getCommunication = (callback) => {
  if (LedgerNanoS.eth) return callback(null, LedgerNanoS.eth);

  return LedgerNanoS.getTransport((er, transport) => {
    if (er) return callback(er, null);
    LedgerNanoS.eth = new Eth(transport);
    return callback(null, LedgerNanoS.eth);
  });
}

LedgerNanoS.getTransport = (callback) => {
  let webusbSupported = false;
  let u2fSupported = false;

  return TransportWebUSB.isSupported().then(re => {
    webusbSupported = re;
    return TransportU2F.isSupported();
  }).then(re => {
    u2fSupported = re;
    if (webusbSupported) return TransportWebUSB.create();
    if (u2fSupported) return TransportU2F.create();
    return callback(error.UNSUPPORT_HARDWARE, null);
  }).then(transport => {
    return callback(null, transport);
  }).catch(er => {
    return callback(er, null);
  });
}

LedgerNanoS.closeTransport = (transport) => {
  return transport.close();
}

module.exports = LedgerNanoS;