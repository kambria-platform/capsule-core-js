import React, { Component } from 'react';
import { Isoxys } from 'capsule-core-js';
import Confirm from '../core/confirm';

const KEYSTORE = require('./UTC--2018-12-18T04:11:54.738Z--3c86f3337d94b8890b35f27de8a6b4913bc87517.json');
const PRIVATEKEY = '9c5074452915564f3aadc51dc55f6152707552f5f38090877e7819b3f43ed7b9';
const MNEMONIC = 'family exact strategy quote about step magic steel afraid cage remain vintage';

const DEFAULT_STATE = {
  visible: false,
  network: null,
  account: null,
  balance: null,
  txId: null,
}

class TestIsoxys extends Component {
  constructor() {
    super();
    this.state = { ...DEFAULT_STATE };
    this.options = {
      getPassphrase: this.getPassphrase,
      getApproval: this.getApproval
    }
  }

  getApproval = (params, callback) => {
    this.setState({
      visible: true,
      message: `From: ${params.from} / To: ${params.to} / Value: ${params.value}`,
      onCancel: () => {
        this.setState({ visible: false }, () => {
          return callback(null, false);
        });
      },
      onApprove: () => {
        this.setState({ visible: false }, () => {
          return callback(null, true);
        });
      }
    })
  }

  getPassphrase = (callback) => {
    return callback(null, 'dummy passphrase');
  }

  connectByPrivatekey = () => {
    this.isoxys = new Isoxys(4, this.options);
    this.isoxys.setAccountByPrivatekey(
      PRIVATEKEY,
      (er, web3) => {
        if (er) return console.error(er);
        this.watcher = this.isoxys.watch((er, re) => {
          if (er) return console.error(er);
          this.setState(re);
        });
      });
  }

  connectByMnemonic = () => {
    this.isoxys = new Isoxys(4, this.options);
    this.isoxys.setAccountByMnemonic(
      MNEMONIC,
      null,
      "m/44'/60'/0'/0",
      1,
      (er, web3) => {
        if (er) return console.error(er);
        this.watcher = this.isoxys.watch((er, re) => {
          if (er) return console.error(er);
          this.setState(re);
        });
      });
  }

  connectByKeystore = () => {
    this.isoxys = new Isoxys(4, this.options);
    this.isoxys.setAccountByKeystore(
      KEYSTORE,
      '123',
      (er, web3) => {
        if (er) return console.error(er);
        this.watcher = this.isoxys.watch((er, re) => {
          if (er) return console.error(er);
          this.setState(re);
        });
      });
  }

  sendTx = () => {
    if (this.isoxys) this.isoxys.web3.eth.sendTransaction({
      from: this.state.account,
      to: '0x5a926b235e992d6ba52d98415e66afe5078a1690',
      value: '1000000000000000'
    }, (er, txId) => {
      if (er) return console.error(er);
      return console.log(txId);
    });
  }

  logout = () => {
    if (this.isoxys) this.isoxys.logout();
  }

  componentWillUnmount() {
    if (this.watcher) this.watcher.stopWatching();
  }

  render() {
    return (
      <div>
        <h1>Isoxys Test</h1>
        <button onClick={this.connectByPrivatekey}>Connect by Privatekey</button>
        <button onClick={this.connectByMnemonic}>Connect by Mnemonic</button>
        <button onClick={this.connectByKeystore}>Connect by Keystore</button>
        <button onClick={this.sendTx}>Send</button>
        <button onClick={this.logout}>Logout</button>
        <p>Network: {this.state.network}</p>
        <p>Account: {this.state.account}</p>
        <p>Balance: {this.state.balance}</p>
        <Confirm
          open={this.state.visible}
          message={this.state.message}
          onClose={this.state.onCancel}
          onCancel={this.state.onCancel}
          onApprove={this.state.onApprove}
        />
      </div>
    );
  }
}

export default TestIsoxys;