import React, { Component } from 'react';
import { Ledger } from 'capsule-js';

const DEFAULT_STATE = {
  visible: false,
  network: null,
  account: null,
  balance: null,
  txId: null,
  error: null
}

class TestLedger extends Component {
  constructor() {
    super();
    this.state = DEFAULT_STATE;

    console.log(Ledger)
  }

  render() {
    return (
      <div>
        <h1>Ledger Test</h1>
      </div>
    );
  }
}

export default TestLedger;