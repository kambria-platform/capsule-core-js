import React, { Component } from 'react';
import { MEW } from 'capsule-core-js';

const DEFAULT_STATE = {
  visible: false,
  network: null,
  account: null,
  balance: null,
  txId: null,
  error: null
}

class TestMEW extends Component {
  constructor() {
    super();
    this.state = DEFAULT_STATE;

    console.log(MEW)
  }

  render() {
    return (
      <div>
        <h1>MEW Test</h1>
      </div>
    );
  }
}

export default TestMEW;