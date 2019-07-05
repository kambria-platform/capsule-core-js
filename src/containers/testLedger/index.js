import React, { Component } from 'react';
import { Ledger } from 'capsule-core-js';

const DEFAULT_STATE = {
  network: null,
  account: null,
  balance: null,
  txId: null,
}

class TestLedger extends Component {
  constructor() {
    super();
    this.state = { ...DEFAULT_STATE };
  }

  connect = () => {
    this.ledger = new Ledger(4, 'hardwallet', true);
    this.ledger.setAccountByLedgerNanoS("m/44'/60'/0'/0", 0, (er, web3) => {
      if (er) return console.error(er);
      this.watcher = this.ledger.watch((er, re) => {
        if (er) return console.error(er);
        this.setState(re);
      });
    });
  }

  sendTx = () => {
    if (this.ledger) this.ledger.web3.eth.sendTransaction({
      from: this.state.account,
      to: '0x5a926b235e992d6ba52d98415e66afe5078a1690',
      value: '1000000000000000'
    }, (er, txId) => {
      if (er) return console.error(er);
      return console.log(txId);
    });
  }

  logout = () => {
    if (this.ledger) this.ledger.logout();
  }

  componentWillUnmount() {
    if (this.watcher) this.watcher.stopWatching();
  }

  render() {
    return (
      <div>
        <h1>Ledger Test</h1>
        <button onClick={this.connect}>Connect</button>
        <button onClick={this.sendTx}>Send</button>
        <button onClick={this.logout}>Logout</button>
        <p>Network: {this.state.network}</p>
        <p>Account: {this.state.account}</p>
        <p>Balance: {this.state.balance}</p>
      </div>
    );
  }
}

export default TestLedger;