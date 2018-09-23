import React from 'react';
import { hot } from 'react-hot-loader';
import './Parameters.css';

class Parameters extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let availableModels = this.props.models.map(model => <option key={model} value={model}>{model}</option>) 
    return (
      <div id="Parameters">
        <select>
          {availableModels}
        </select>


      </div>
    );
  }
}

export default hot(module)(Parameters)
