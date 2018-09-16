/* global alert, navigator, document, console */

import React from 'react';
import { hot } from 'react-hot-loader';
import axios from 'axios';
import './App.css';

import Progress from './Progress';
import Toggle from './Toggle';

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      // Resulting image path returned from the backend.
      impath: '',
      // State defining the moment when image is loading or loaded.
      snapped: false,
      // Job ID of the task running on the backend.
      jid: undefined,
      // Shows the settings for parameter tweaking.
      showSettings: false
    };

    // Method binding.
    this.buttonClicked = this.buttonClicked.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
    this.snap = this.snap.bind(this);
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
    this.state.snapped = !this.state.snapped;
    if (this.state.snapped) {
      this.snap();
    } else {
      this.setState({ jid: '' });
    }
  }

  // When using web camera.
  snap() {
    this.setState({ snapped: true });
    const video = document.querySelector('video');
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

  render() {
    let buttonText;
    let buttonClasses;
    let result;

    if (this.state.snapped && !!this.state.jid) {
      buttonText = 'Again';
      buttonClasses = 'button again';
      result = (
        <Progress jobId={this.state.jid}>
          <img alt="deep" src={`/uploads/${this.state.jid}.jpg`} />
        </Progress>
      ); // TODO that's super bad and hardcoded. Path needs to be returned from backend/result
    } else {
      buttonText = 'Snap';
      buttonClasses = 'button snap';
      result = '';
    }

    return (
      <div id="App">
        <div id="header">
          <button className={buttonClasses} onClick={this.buttonClicked}>
            {buttonText}
          </button>
          <Toggle></Toggle>
        </div>
        <div id="middle">
          <canvas style={{ display: 'none' }} />
          {result}
          <video
            style={{ display: this.state.snapped ? 'none' : 'initial' }}
            autoPlay
          />
        </div>
        <div id="footer" />
      </div>
    );
  }
}

export default hot(module)(App);
