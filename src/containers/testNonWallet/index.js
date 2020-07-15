import React, { Component } from 'react';
import { NonWallet } from 'capsule-core-js';


const DEFAULT_STATE = {
  network: null,
  account: '0x76d8B624eFDDd1e9fC4297F82a2689315ac62d82',
  balance: null,
}

class TestNonWallet extends Component {
  constructor() {
    super();
    this.state = DEFAULT_STATE;
  }

  get = (web3) => {
    web3.eth.net.getId((er, re) => {
      if (er) return console.error(er);
      return this.setState({ network: re });
    });
    web3.eth.getBalance(this.state.account, (er, re) => {
      if (er) return console.error(er);
      return this.setState({ balance: re.toString() });
    });
  }

  connectByNonWallet = () => {
    this.nonWallet = new NonWallet(4);
    this.nonWallet.init((er, web3) => {
      if (er) return console.error(er);
      return this.get(web3);
    });
  }

  render() {
    return (
      <div>
        <h1>NonWallet Test</h1>
        <button onClick={this.connectByNonWallet}>Connect by NonWallet</button>
        <p>Network: {this.state.network}</p>
        <p>Account: {this.state.account}</p>
        <p>Balance: {this.state.balance}</p>
      </div>
    );
  }
}

export default TestNonWallet;