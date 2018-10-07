import React from 'react';
import { hot } from 'react-hot-loader';
import axios from 'axios';

import './Parameters.css';

class Parameters extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    axios.get('/models')
      .then(res => {
        this.setState({ models: res.data });
        this.setState({ model: res.data[0] });
        this.onModelSelect(res.data[0]);
      })
  }

  onModelSelect(modelName) {
    axios.get(`/signature/${modelName}`)
      .then(res => {
        this.setState({ signature: res.data });
      })
      .catch(err => console.error(err));
  }

  render() {
    let availableModels = this.state.models || [];
    availableModels = availableModels.map(model => <option key={model} value={model}>{model}</option>) 
    let parameters = this.state.signature || {};
    parameters = Object.keys(parameters).map(key => {
      console.log(key);
      let x = {};
      x[key] = parameters[key];
      return JSON.stringify(x);
    })
    console.log(parameters);
    return (
      <div id="Parameters">
        <select>
          {availableModels}
        </select>
        <div id="parameters-layout">
          {parameters}
        </div>
      </div>
    );
  }
}

export default hot(module)(Parameters)
