import React from 'react';
import { hot } from 'react-hot-loader';
// import axios from 'axios'
import './Progress.css';

// TODO: Import io from socketIO
import io from 'socket.io-client';

// Hides children until the response from progress reached 100.
class Progress extends React.Component {
  constructor() {
    super();
    this.state = {
      progress: 0,
      loaded: false,
    };
  }

  componentDidMount() {
    const that = this;

    const jobId = `${this.props.jobId}`;
    console.log(`Job ID to check against is ${that.props.jobId}`);

    function fetchProgress() {
      const socket = io();
      socket.on(jobId, (progress) => {
        console.log(`Progress for ${jobId} is ${progress}`);
        if (progress === 'FINISHED') {
          that.setState({ loaded: true });
        } else {
          that.setState({ progress });
        }
      });
      // TODO: Do I need to destroy the socket?
    }

    fetchProgress();
  }

  render() {
    if (this.state.loaded) {
      return this.props.children;
    }
    return (
      <div className="Progress">
        <div className="percentage">
          {this.state.progress}%
        </div>
      </div>
    );
  }
}

export default hot(module)(Progress);
