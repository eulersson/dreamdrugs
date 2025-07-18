import io from "socket.io-client";
import axios from "axios";

import React from "react";
import PropTypes from "prop-types";

import "./Progress.css";

// Hides children until the response from progress reached 100.
class Progress extends React.Component {
  state = {
    progress: 0,
    image_data: ""
  };

  componentDidMount() {
    const jobId = `${this.props.jobId}`;
    console.log(`Job ID to check against is ${this.props.jobId}`);

    const socket = io();
    this.setState({ ws: socket });

    socket.emit("greet", jobId); // Announces job id to the server socket.
    socket.on(jobId, progress => {
      console.log(`Progress for ${jobId} is ${progress}`);
      if (progress === "FINISHED") {
        axios.get(`/api/result/${jobId}`).then(res => {
          this.setState({ image_data: `data:image/jpeg;base64,${res.data}`})
        });
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
    return this.state.image_data ? (
      <img alt="deep" src={this.state.image_data} />
    ) : (
      <div
        className="Progress"
        style={{
          backgroundColor: `rgba(97, 53, 85, ${this.state.progress / 100}`
        }}
      >
        <div className="percentage">{this.state.progress}%</div>
      </div>
    );
  }
}

Progress.propTypes = {
  jobId: PropTypes.number.isRequired,
  onLoaded: PropTypes.func.isRequired
};

export default Progress;
