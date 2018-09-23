import React from 'react';
import { hot } from 'react-hot-loader';
import './Progress.css';

import io from 'socket.io-client';

// Hides children until the response from progress reached 100.
class Progress extends React.Component {
  state = {
    progress: 0,
    loaded: false
  };

  componentDidMount() {
    const jobId = `${this.props.jobId}`;
    console.log(`Job ID to check against is ${this.props.jobId}`);

    const socket = io();
    this.setState({ws: socket});

    socket.emit('greet', jobId); // Announces job id to the server socket.
    socket.on(jobId, (progress) => {
      console.log(`Progress for ${jobId} is ${progress}`);
      if (progress === 'FINISHED') {
        this.setState({ loaded: true });
        this.props.onLoaded();
      } else {
        this.setState({ progress });
      }
    });
  }

  componentWillUnmount() {
    this.state.ws.disconnect();
  }

  render() {
    return this.state.loaded ? this.props.children : (
      <div className="Progress" style={{backgroundColor: `rgba(97, 53, 85, ${this.state.progress / 100}`}}>
        <div className="percentage">
          {this.state.progress}%
        </div>
      </div>
    );
  }
}

export default hot(module)(Progress);
