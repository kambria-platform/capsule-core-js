import React, { Component } from 'react';
import { Isoxys } from 'capsule-core-js';

const KEYSTORE = require('./UTC--2018-12-18T04:11:54.738Z--3c86f3337d94b8890b35f27de8a6b4913bc87517.json');
const PRIVATEKEY = '9c5074452915564f3aadc51dc55f6152707552f5f38090877e7819b3f43ed7b9';
const MNEMONIC = 'family exact strategy quote about step magic steel afraid cage remain vintage';

const DEFAULT_STATE = {
  network: null,
  account: null,
  balance: null,
  txId: null,
}

class TestIsoxys extends Component {
  constructor() {
    super();
    this.state = { ...DEFAULT_STATE };
  }

  get = (web3) => {
    web3.version.getNetwork((er, re) => {
      if (er) return console.error(er);
      return this.setState({ network: re });
    });
    web3.eth.getAccounts((er, re) => {
      if (er) return console.error(er);
      this.setState({ account: re[0] });

      web3.eth.getBalance(re[0], (er, re) => {
        if (er) return console.error(er);
        return this.setState({ balance: re.toString() });
      });
    });
  }

  connectByPrivatekey = () => {
    this.isoxys = new Isoxys(4, 'softwallet', true);
    this.isoxys.setAccountByPrivatekey(
      PRIVATEKEY,
      cb => cb(null, 'dummy passphrase'),
      (er, web3) => {
        if (er) return console.error(er);
        return this.get(web3);
      });
  }

  connectByMnemonic = () => {
    this.isoxys = new Isoxys(4, 'softwallet', true);
    this.isoxys.setAccountByMnemonic(
      MNEMONIC,
      null,
      "m/44'/60'/0'/0",
      1,
      cb => cb(null, 'dummy passphrase'),
      (er, web3) => {
        if (er) return console.error(er);
        return this.get(web3);
      });
  }

  connectByKeystore = () => {
    this.isoxys = new Isoxys(4, 'softwallet', true);
    this.isoxys.setAccountByKeystore(
      KEYSTORE,
      '123',
      cb => cb(null, 'dummy passphrase'),
      (er, web3) => {
        if (er) return console.error(er);
        return this.get(web3);
      });
  }

  sendTx = () => {
    this.isoxys.web3.eth.sendTransaction({
      from: this.state.account,
      to: '0x5a926b235e992d6ba52d98415e66afe5078a1690',
      value: '1000000000000000'
    }, (er, txId) => {
      if (er) return console.error(er);
      return console.log(txId);
    });
  }

  render() {
    return (
      <div>
        <h1>Isoxys Test</h1>
        <button onClick={this.connectByPrivatekey}>Connect by Privatekey</button>
        <button onClick={this.connectByMnemonic}>Connect by Mnemonic</button>
        <button onClick={this.connectByKeystore}>Connect by Keystore</button>
        <button onClick={this.sendTx}>Send</button>
        <p>Network: {this.state.network}</p>
        <p>Account: {this.state.account}</p>
        <p>Balance: {this.state.balance}</p>
      </div>
    );
  }
}

export default TestIsoxys;