/* global alert, navigator, document, console */

import React from 'react';
import { hot } from 'react-hot-loader';
import axios from 'axios';
import './App.css';
import Progress from './Progress';

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      // Resulting image path returned from the backend.
      impath: '',
      // State defining the moment when image is loading or loaded.
      snapped: false,
      // Job ID of the task running on the backend.
      jid: undefined
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
      alert('Oh, getUserMedia is not available :(');
    }
  }

  // Fired when the Snap / Try Again button is clicked.
  buttonClicked() {
    const snapped = !this.state.snapped;
    if (snapped) {
      this.snap();
    } else {
      this.setState({ impath: '' });
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
        console.log(res.data.body);
        this.setState({
          jid: res.data.body,
        });
        console.log('just set jidto');
        console.log(this.state.jid);
      })
      .catch(err => console.error(err));
  }

  // When using file upload dialog.
  handleUpload(ev) {
    const data = new FormData();
    data.append('file', ev.target.files[0]);
    axios.post('/upload', data).then((res) => {
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
    // const jobId = 69; // TODO: Figure out a way to access it from here.

    if (this.state.snapped && !!this.state.jid) {

      console.log('renderrrr');
      console.log(this.state.jid);

      buttonText = 'Again';
      buttonClasses = 'button again';
      result = (
        <Progress jobId={this.state.jid}>
          <img alt="deep" src={this.state.impath} />
        </Progress>
      );
    } else {
      buttonText = 'Snap';
      buttonClasses = 'button snap';
      result = '';
    }

    return (
      <div className="App">
        <div id="header">
          <button className={buttonClasses} onClick={this.buttonClicked}>
            {buttonText}
          </button>
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
