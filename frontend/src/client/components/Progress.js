import React from 'react';
import { hot } from 'react-hot-loader';
// import axios from 'axios'
import './Progress.css';

// TODO: Import io from socketIO
import io from 'socket.io-client';

// Hides children until the response from progress reached 100.
class Progress extends React.Component {
  constructor() {
    // TODO: Pass in job id as prop and keep it on state or props.
    super();
    this.state = {
      progress: 0,
      loaded: false,
    };
  }

  componentDidMount() {
    const socket = io();
    socket.emit('HERE');
    const that = this;

    const jobId = `${this.props.jobId}`;
    console.log(`Job ID to check against is ${that.props.jobId}`);

    function fetchProgress() {
      const socket = io();
      socket.on(jobId, (progress) => {
        console.log(`Progress for ${jobId} is ${progress}`);
        that.setState({ progress });
        if (progress === 100) {
          that.setState({ loaded: true });
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
          {this.state.progress}
        </div>
      </div>
    );
  }
}

export default hot(module)(Progress);
