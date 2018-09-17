/* global alert, navigator, document, console */

import React from 'react';
import { hot } from 'react-hot-loader';
import axios from 'axios';
import io from 'socket.io-client';

import './App.css';

import Progress from './Progress';
import Parameters from './Parameters';
import Toggle from './Toggle';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // Resulting image path returned from the backend.
      impath: '',
      // State defining the moment when image is loading or loaded.
      snapped: false,
      // Job ID of the task running on the backend.
      jid: undefined,
      // Shows the settings for parameter tweaking.
      showSettings: false,
      // Whether to show camera view or parameters view.
      showParametersView: false,
      // When the image has finished cooking this becomes true.
      loaded: false
    };

    // Method binding.
    this.buttonClicked = this.buttonClicked.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
    this.snap = this.snap.bind(this);
    this.onToggleParametersViewChange = this.onToggleParametersViewChange.bind(this);
  }

  componentDidMount() {
    this.initializeCamera();
  }

  // Sets up HTML5 features to couple up a canvas with the webcam.
  initializeCamera() {
    function hasGetUserMedia() {
      return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }

    if (hasGetUserMedia()) {
      const constraints = {
        video: true,
      };

      const video = document.querySelector('video');

      function handleSuccess(stream) {
        video.srcObject = stream;
      }

      function handleError(error) {
        console.error('Rejected :(', error);
      }

      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(handleSuccess)
        .catch(handleError);
    } else {
      alert('Oh no, getUserMedia is not available :(');
    }
  }

  // Fired when the Snap / Try Again button is clicked.
  buttonClicked() {
    const video = document.querySelector('video');
    this.state.snapped = !this.state.snapped;
    if (this.state.snapped) {
      video.pause();
      this.snap(video);
    } else {
      this.setState({ jid: '', loaded: false });
      video.play();
    }
  }

  // When using web camera.
  snap(video) {
    this.setState({ snapped: true });
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const encodedImage = canvas.toDataURL('image/jpg');

    axios
      .post('/snap', { image: encodedImage })
      .then((res) => {
        this.setState({
          jid: res.data.body,
        });
      })
      .catch(err => console.error(err));
  }

  // When using file upload dialog.
  handleUpload(ev) {
    const data = new FormData();
    data.append('file', ev.target.files[0]);
    axios.post('/upload', data).then(res => {
      if (res.data.status === 500) {
        console.error(res.data.message);
      } else {
        this.setState({
          impath: res.data.body,
          snapped: true,
        });
      }
    });
  }

  // Swaps between the camera view and the parameters view.
  onToggleParametersViewChange() {
    this.setState({ showParametersView: !this.state.showParametersView })
  }

  render() {
    let buttonText;
    let buttonClasses;
    let result;
    let videoClasses;

    console.log(this.state.loaded);

    buttonText = 'Snap';
    buttonClasses = 'button snap';

    if (this.state.snapped && !!this.state.jid) {
      buttonText = 'Again';
      buttonClasses = 'button again';
      videoClasses = 'hide';
      result = (
        <Progress onLoaded={() => this.setState({loaded: true})} jobId={this.state.jid}>
          <img alt="deep" src={`/uploads/${this.state.jid}.jpg`} />
        </Progress>
      ); // TODO that's super bad and hardcoded. Path needs to be returned from backend/result
    } else if (this.state.showParametersView) {
      buttonClasses += ' hide';
      videoClasses = 'hide';
      result = <Parameters />
    } else {
      result = '';
      videoClasses = 'show';
    }

    return (
      <div id="App">
        <div id="header">
          <button
            className={buttonClasses}
            onClick={this.buttonClicked}
          >
            {buttonText}
          </button>
          <Toggle
            switch={this.state.showParametersView}
            onChange={this.onToggleParametersViewChange}
          />
        </div>
        <div id="middle">
          <canvas style={{ display: 'none' }} />
          {result}
          <video
            className={this.state.snapped || this.state.loaded ? 'hide' : ''}
            autoPlay
          />
        </div>
        <div id="footer" />
      </div>
    );
  }
}

export default hot(module)(App);
